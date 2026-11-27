(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const DISCOVERY = 30;
  const profiles = {silent:[35,65],pair:[48,78],group:[60,88]};
  const levels = ['green','yellow','red'];
  const modes = ['primary','college'];
  const penaltyIds = ['penEnabled','penPoints','penWorld','penDelay','penStrength','penCooldown'];
  const defaults = {enabled:true,points:true,world:true,delay:5,strength:'medium',cooldown:20};
  const strength = {mild:5,medium:15,strong:30};
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  }
  function write(key,value) {
    try { localStorage.setItem(key,JSON.stringify(value)); } catch {}
  }
  const saved = read('klassenampel-v02');
  const penaltyProfiles = {...read('klassenampel-penalties-v03')};
  const state = {
    world:Object.hasOwn(worlds,saved.world)?saved.world:'aquarium',
    age:modes.includes(saved.age)?saved.age:'primary',
    work:Object.hasOwn(profiles,saved.work)?saved.work:'silent',
    score:Number.isFinite(saved.score)?Math.floor(clamp(saved.score,0,999999)):0,
    remaining:900, elapsed:0, green:0, fraction:0, phase:'ready',
    level:0, signal:'idle', red:0, cooldown:0, lastPenalty:0, penaltyText:'',previewCount:null
  };
  let pen = {...defaults};
  let audio = null, pending = false, base = 0, calibration = null, demo = '';
  let worldEvent = null;
  let last=performance.now(), lastUpdate=-1000;
  const render = createWorldRenderer($('scene'));
  const format = n => String(n).padStart(2,'0');
  const discoveries = () => Math.floor(state.score/DISCOVERY);
  const hasDiscoveries = (world=state.world) => worlds[world].finds.length>0;
  const hasInput = () => Boolean(demo || (audio?.ctx.state==='running' && !audio.track.muted && audio.track.readyState==='live'));

  function save() {
    const {world,age,work,score}=state;
    write('klassenampel-v02',{world,age,work,score});
  }
  function announce(message) { $('announcement').textContent=message; }
  function update() {
    const total=discoveries(), mod=state.score%DISCOVERY, time=Math.ceil(state.remaining);
    const label={idle:'Bereit',green:'Grün · passende Lautstärke',yellow:'Gelb · etwas leiser',red:'Rot · zu laut'}[state.signal];
    const findName=i=>discoveryName(state.world,i);
    $('worldProgress').textContent=state.previewCount===null?total+' Entdeckungen':'Vorschau · '+state.previewCount+' Entdeckungen';
    $('worldDesc').textContent=!hasDiscoveries()?'':state.previewCount!==null?'Vorschau · '+(state.previewCount?findName(state.previewCount-1):'Leere Welt'):total?'Zuletzt entdeckt · '+findName(total-1):worlds[state.world].cue;
    $('timeLeft').textContent=format(Math.floor(time/60))+':'+format(time%60);
    $('pointsBadge').textContent=state.score+' Punkte';
    $('score').textContent=state.score;
    $('items').textContent=total;
    $('greenPct').textContent=state.elapsed?Math.round(state.green/state.elapsed*100)+' %':'–';
    $('next').textContent=mod+' / '+DISCOVERY;
    $('nextItem').textContent=findName(total);
    $('progress').value=mod;
    $('level').textContent=Math.round(state.level)+' %';
    $('meter').value=state.level;
    $('meter').dataset.signal=state.signal;
    levels.forEach(c=>$(c).classList.toggle('active',state.signal===c));
    if ($('status').textContent!==label) $('status').textContent=label;
    $('worldSignal').textContent={green:'Grün',yellow:'Gelb',red:'Rot',idle:'Ampel bereit'}[state.signal];
    $('worldSignal').dataset.signal=state.signal;
    $('play').textContent={ready:'Runde starten',running:'Pause',paused:'Fortsetzen',done:'Neue Runde'}[state.phase];
    $('duration').disabled=state.phase==='running'||state.phase==='paused';
    const penaltyLabel=!pen.enabled?'Konsequenzen ausgeschaltet.'
      : !pen.points&&!pen.world?'Wähle eine Konsequenz aus.'
      : state.cooldown>0?(state.penaltyText?state.penaltyText+' · ':'')+'Schutzpause '+Math.ceil(state.cooldown)+' s'
      : state.red>0?'Rot seit '+state.red.toFixed(1)+' / '+pen.delay+' s'
      : 'Auslösung nach '+pen.delay+' Sekunden durchgehend Rot.';
    $('penStatus').textContent=penaltyLabel;
    $('undoPenalty').disabled=!state.lastPenalty;
  }
  function setWorld(world) {
    if (state.world!==world) {
      worldEvent=null;
      $('actionStatus').textContent='';
    }
    state.world=world;
    state.previewCount=null;
    $('unlockPreview').replaceChildren(new Option('Aktueller Spielstand','live'));
    $('unlockPreview').add(new Option('Leere Welt','0'));
    if(hasDiscoveries(world)) for(let i=1;i<=12;i++) $('unlockPreview').add(new Option(i+' · '+discoveryName(world,i-1),String(i)));
    $('unlockPreview').disabled=!hasDiscoveries(world);
    $('previewStatus').textContent=!hasDiscoveries(world)?'Diese Ansicht hat keine Freischaltungen.':'Die Vorschau verändert den Punktestand nicht.';
    document.body.classList.toggle('neutral',!hasDiscoveries(world));
    document.body.classList.toggle('city-view',world==='city');
    $('worldTitle').textContent=worlds[world].title;
    $('worldAction').textContent=worlds[world].action;
    document.querySelectorAll('[data-world]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.world===world));
    });
    save();
    update();
  }
  function worldAction() {
    if(!hasDiscoveries()) return;
    worldEvent={key:state.world,at:performance.now()};
    $('actionStatus').textContent=worlds[state.world].event;
  }
  function loadPenalty() {
    const p={...defaults,...penaltyProfiles[state.age]};
    $('penEnabled').checked=Boolean(p.enabled);
    $('penPoints').checked=Boolean(p.points);
    $('penWorld').checked=Boolean(p.world);
    $('penDelay').value=[3,5,10].includes(p.delay)?p.delay:5;
    $('penStrength').value=Object.hasOwn(strength,p.strength)?p.strength:'medium';
    $('penCooldown').value=[10,20,30].includes(p.cooldown)?p.cooldown:20;
    syncPenalty();
  }
  function syncPenalty() {
    pen={
      enabled:$('penEnabled').checked,points:$('penPoints').checked,world:$('penWorld').checked,
      delay:+$('penDelay').value,strength:$('penStrength').value,cooldown:+$('penCooldown').value
    };
    state.red=0;
    update();
  }
  function applyPenalty() {
    const old=state.score, before=discoveries();
    const pointLoss=pen.points?strength[pen.strength]:0;
    const worldLoss=pen.world&&before>0?old-(before*DISCOVERY-1):0;
    state.score=Math.max(0,old-Math.max(pointLoss,worldLoss));
    state.red=0;
    state.cooldown=pen.cooldown;
    const loss=old-state.score, lost=before-discoveries();
    state.penaltyText=loss?'−'+loss+' Punkte'+(lost?' · −'+lost+' Entdeckung':''):'Kein Fortschritt verloren';
    if (loss) {
      state.lastPenalty=loss;
      save();
    }
    announce(state.penaltyText);
  }
  function advance(dt, sampled) {
    const seconds=Math.min(dt,state.remaining);
    state.remaining=state.remaining-seconds<1e-8?0:state.remaining-seconds;
    state.elapsed+=seconds;
    state.cooldown=Math.max(0,state.cooldown-seconds);
    if (sampled&&pen.enabled&&(pen.points||pen.world)&&state.signal==='red') {
      state.red+=seconds;
      if (state.red+1e-8>=pen.delay&&state.cooldown<=1e-8) applyPenalty();
    } else state.red=0;
    if (sampled&&state.signal==='green') {
      state.green+=seconds;
      state.fraction+=seconds;
      if (state.fraction+1e-8>=1) {
        const before=discoveries();
        const earned=Math.floor(state.fraction+1e-8);
        state.score=Math.min(999999,state.score+earned);
        state.fraction=Math.max(0,state.fraction-earned);
        save();
        if (discoveries()>before&&hasDiscoveries()) {
          announce((before<12?'Neu entdeckt · ':'Weltereignis · ')+discoveryName(state.world,before));
          if (before===5||before>=11) worldAction();
        }
      }
    }
    if (!state.remaining) {
      state.phase='done';
      announce('Runde beendet. '+state.score+' Punkte.');
      update();
    }
  }
  function readLevel(dt) {
    if (demo) {
      state.level={green:12,yellow:50,red:100}[demo];
      state.signal=demo;
      return;
    }
    if (!hasInput()) {
      state.level=0;
      state.signal='idle';
      return;
    }
    const {analyser,buffer}=audio;
    analyser.getByteTimeDomainData(buffer);
    let sum=0;
    for (const sample of buffer) sum+=((sample-128)/128)**2;
    const rms=Math.sqrt(sum/buffer.length);
    if (calibration) { calibration.sum+=rms; calibration.count++; }
    const relative=clamp(Math.max(0,rms-base)*100*(+$('sensitivity').value),0,100);
    state.level+=(relative-state.level)*(1-Math.exp(-dt*14));
    state.signal=state.level<+$('threshold').value?'green':state.level<+$('yellowLimit').value?'yellow':'red';
  }
  function stepGame(now=performance.now()) {
    const dt=Math.max(0,(now-last)/1000);
    last=now;
    if(!dt) return;
    readLevel(dt);
    // A live microphone needs recent samples. Demo colors are deterministic.
    if (state.phase==='running') advance(dt,Boolean(demo)||dt<=2);
    if (worldEvent&&now-worldEvent.at>=6200) {
      worldEvent=null;
      $('actionStatus').textContent='';
    }
    if (now-lastUpdate>=100) { lastUpdate=now; update(); }
  }
  function tick(now) {
    stepGame(now);
    render(now,state.world,state.age==='college',state.previewCount??discoveries(),worldEvent,$('neutralAnimation').checked,state.signal);
    requestAnimationFrame(tick);
  }
  function cancelCalibration() {
    if (!calibration) return;
    clearTimeout(calibration.timer);
    calibration=null;
    $('calibrate').disabled=false;
    $('calibration').textContent='Messung des Grundpegels abgebrochen.';
  }
  function stopMic(message='Mikrofon aus. Du kannst die Demo verwenden.') {
    const active=audio;
    audio=null;
    if (active) {
      active.stream.getTracks().forEach(track=>track.stop());
      active.ctx.close().catch(()=>{});
    }
    cancelCalibration();
    base=0;
    state.red=0;
    state.level=0;
    state.signal='idle';
    $('start').textContent='Mikrofon starten';
    $('micState').textContent=message;
  }
  function setDemo(value) {
    if (demo!==value) state.red=0;
    demo=value;
    $('demo').textContent=demo?'Demo beenden':'Demo';
    $('demo').setAttribute('aria-pressed',String(Boolean(demo)));
    $('demoControls').hidden=!demo;
    document.querySelectorAll('[data-demo]').forEach(button=>{
      button.setAttribute('aria-pressed',String(button.dataset.demo===demo));
    });
  }
  async function startMic() {
    if (pending) return;
    if (audio) { stopMic(); return; }
    pending=true;
    $('start').disabled=$('demo').disabled=true;
    $('micState').textContent='Warte auf die Mikrofonfreigabe …';
    let stream,ctx;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Bitte die Seite über HTTPS oder localhost öffnen.');
      const Audio=window.AudioContext||window.webkitAudioContext;
      if (!Audio) throw new Error('Dieser Browser unterstützt die Pegelmessung nicht.');
      ctx=new Audio();
      const resumed=ctx.resume().catch(()=>{});
      stream=await navigator.mediaDevices.getUserMedia({
        audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}, video:false
      });
      await resumed;
      if (ctx.state!=='running') {
        throw new Error('Audio wurde vom Browser nicht gestartet. Bitte erneut versuchen.');
      }
      const track=stream.getAudioTracks()[0];
      if (!track || track.readyState!=='live') throw new Error('Kein aktives Mikrofon gefunden.');
      const source=ctx.createMediaStreamSource(stream), analyser=ctx.createAnalyser();
      analyser.fftSize=2048;
      source.connect(analyser);
      audio={stream,ctx,track,source,analyser,buffer:new Uint8Array(analyser.fftSize)};
      track.addEventListener('ended',()=>{ if (audio?.track===track) stopMic('Mikrofonverbindung beendet.'); });
      track.addEventListener('mute',()=>{ if (audio?.track===track) $('micState').textContent='Mikrofon vorübergehend stumm.'; });
      track.addEventListener('unmute',()=>{ if (audio?.track===track) $('micState').textContent='Mikrofon aktiv · Messung auf diesem Gerät.'; });
      setDemo('');
      $('start').textContent='Mikrofon stoppen';
      $('micState').textContent='Mikrofon aktiv · Messung auf diesem Gerät.';
    } catch (error) {
      stream?.getTracks().forEach(track=>track.stop());
      ctx?.close().catch(()=>{});
      const reason=error.name==='NotAllowedError'?'Bitte erlaube den Zugriff in den Website-Einstellungen.'
        :error.name==='NotFoundError'?'Kein Mikrofon gefunden.':error.message;
      $('micState').textContent='Mikrofon nicht verfügbar. '+reason;
    } finally {
      pending=false;
      $('start').disabled=$('demo').disabled=false;
    }
  }
  function resetClock() {
    state.remaining=+$('duration').value*60;
    state.elapsed=state.green=state.fraction=state.red=state.cooldown=0;
    state.lastPenalty=0;
    state.penaltyText='';
  }
  function play() {
    stepGame();
    if (state.phase==='running') {
      state.phase='paused';
      state.red=0;
      announce('Runde pausiert.');
    } else {
      if (!hasInput()) { announce('Bitte zuerst Mikrofon oder Demo starten.'); return; }
      if (state.phase==='done') resetClock();
      state.phase='running';
      announce('Runde läuft.');
    }
    last=performance.now();
    update();
  }
  function sliders() {
    $('sensVal').textContent=$('sensitivity').value+'×';
    $('thVal').textContent=$('threshold').value+' %';
    $('yellowVal').textContent=$('yellowLimit').value+' %';
  }
  function applyWorkProfile() {
    const [green,yellow]=profiles[state.work];
    $('threshold').value=green;
    $('yellowLimit').value=yellow;
    sliders();
  }
  function setMode() {
    document.body.classList.toggle('pixel',$('age').value==='college');
    $('styleName').textContent=state.age==='college'?'Pixel-Art':'Cartoon';
  }
  $('age').value=state.age;
  $('work').value=state.work;
  $('age').onchange=()=>{
    state.age=$('age').value;
    loadPenalty(); setMode(); save();
  };
  $('work').onchange=()=>{ state.work=$('work').value; applyWorkProfile(); save(); };
  $('sensitivity').oninput=sliders;
  $('threshold').oninput=()=>{
    if (+$('threshold').value>=+$('yellowLimit').value) $('yellowLimit').value=+$('threshold').value+1;
    sliders();
  };
  $('yellowLimit').oninput=()=>{
    if (+$('yellowLimit').value<=+$('threshold').value) $('threshold').value=+$('yellowLimit').value-1;
    sliders();
  };
  penaltyIds.forEach(id=>$(id).onchange=()=>{
    syncPenalty();
    penaltyProfiles[state.age]=pen;
    write('klassenampel-penalties-v03',penaltyProfiles);
  });
  $('undoPenalty').onclick=()=>{
    if (!state.lastPenalty) return;
    state.score=Math.min(999999,state.score+state.lastPenalty);
    state.lastPenalty=state.red=0;
    state.cooldown=pen.cooldown;
    state.penaltyText='';
    save();
    announce('Letzte Konsequenz rückgängig gemacht.');
    update();
  };
  $('calibrate').onclick=()=>{
    if (!hasInput()||!audio) { $('calibration').textContent='Bitte zuerst das Mikrofon aktivieren.'; return; }
    $('calibrate').disabled=true;
    $('calibration').textContent='Fünf Sekunden lang den normalen Grundpegel im Raum messen …';
    calibration={sum:0,count:0,timer:setTimeout(()=>{
      if (calibration.count) {
        base=calibration.sum/calibration.count*.65;
        $('calibration').textContent='Grundpegel ermittelt. Du kannst die Grenzen bei Bedarf nachjustieren.';
      } else $('calibration').textContent='Kein Grundpegel verfügbar. Bitte erneut messen.';
      calibration=null;
      $('calibrate').disabled=false;
    },5000)};
  };
  $('start').onclick=startMic;
  $('demo').onclick=()=>{
    if (demo) {
      setDemo('');
      $('micState').textContent='Demo aus. Starte das Mikrofon für eine echte Messung.';
    } else {
      if (audio) stopMic();
      setDemo('green');
      $('micState').textContent='Demo aktiv. Wähle eine Ampelfarbe zum Testen.';
    }
    readLevel(0);
    update();
  };
  document.querySelectorAll('[data-demo]').forEach(button=>button.onclick=()=>{
    if (!demo) return;
    setDemo(button.dataset.demo);
    readLevel(0);
    update();
  });
  document.querySelectorAll('[data-world]').forEach(button=>button.onclick=()=>setWorld(button.dataset.world));
  $('play').onclick=play;
  $('worldAction').onclick=worldAction;
  $('unlockPreview').onchange=()=>{
    state.previewCount=$('unlockPreview').value==='live'?null:Number($('unlockPreview').value);
    $('previewStatus').textContent=state.previewCount===null?'Aktueller Spielstand wird angezeigt.':'Vorschau aktiv. Punkte und laufende Runde werden weiterhin regulär berechnet.';
    update();
  };
  $('duration').onchange=()=>{
    resetClock();
    state.phase='ready';
    announce('');
    update();
  };
  $('reset').onclick=()=>{
    if (!confirm('Runde, Punkte und Entdeckungen zurücksetzen?')) return;
    resetClock();
    state.score=0;
    state.phase='ready';
    worldEvent=null;
    state.previewCount=null;
    $('unlockPreview').value='live';
    $('actionStatus').textContent='';
    save(); announce('Runde zurückgesetzt.'); update();
  };
  $('fullscreen').hidden=!document.fullscreenEnabled;
  $('fullscreen').onclick=async()=>{
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { announce('Vollbild ist momentan nicht verfügbar.'); }
  };
  $('projector').onclick=()=>{
    const active=document.body.classList.toggle('projector');
    $('projector').setAttribute('aria-pressed',String(active));
    $('projector').textContent=active?'Bedienansicht':'Präsentation';
  };
  window.addEventListener('pagehide',()=>{
    if (audio) stopMic();
    if (state.phase==='running') play();
  });
  document.addEventListener('visibilitychange',()=>{
    stepGame();
    update();
  });
  setMode();
  applyWorkProfile();
  setWorld(state.world);
  loadPenalty();
  window.klassenampel={
    snapshot:()=>({world:state.world,score:state.score,remaining:state.remaining,elapsed:state.elapsed,green:state.green,previewCount:state.previewCount}),
    restore:game=>{
      if(Object.hasOwn(worlds,game.world)) setWorld(game.world);
      if(Number.isFinite(game.score)) state.score=Math.floor(clamp(game.score,0,999999));
      if(Number.isFinite(game.remaining)) state.remaining=clamp(game.remaining,0,3600);
      if(Number.isFinite(game.elapsed)) state.elapsed=Math.max(0,game.elapsed);
      if(Number.isFinite(game.green)) state.green=clamp(game.green,0,state.elapsed);
      state.previewCount=null;$('unlockPreview').value='live';
      if(hasDiscoveries()&&Number.isInteger(game.previewCount)&&game.previewCount>=0&&game.previewCount<=12) {
        state.previewCount=game.previewCount;
        $('unlockPreview').value=String(game.previewCount);
      }
      state.phase=state.remaining>0?'paused':'done';
      save();update();
    }
  };
  setInterval(stepGame,100);
  requestAnimationFrame(tick);
})();
