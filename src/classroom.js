(() => {
  'use strict';
  const $=id=>document.getElementById(id), world=document.querySelector('.world'), task=$('taskText');
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const defaults={taskModule:{x:.03,y:.14},countdownModule:{x:.72,y:.14}};
  const moduleState={taskModule:{collapsed:false,outside:true},countdownModule:{collapsed:false,outside:true}};
  let layout=structuredClone(defaults), remaining=300, countdownTotal=300, deadline=0, running=false, draggingId=null;
  const controls=['age','penaltyProfile','work','duration','sensitivity','threshold','yellowLimit','penEnabled','penPoints','penWorld','penDelay','penStrength','penCooldown','showTask','showCountdown','showHud','showDiscovery','fontFamily','uiFontSize','taskFontSize','clockFontSize','neutralAnimation','countdownSound','showWorkMode','showFollowUp','showCountdownProgress'];
  let alarmContext=null,alarmVersion=0,alarmNodes=[];
  try {
    const savedSound=localStorage.getItem('klassenampel-countdown-sound');
    if(savedSound!==null) $('countdownSound').checked=savedSound==='true';
  } catch {}
  function stopAlarm() {
    alarmVersion++;
    for(const oscillator of alarmNodes) {
      try{oscillator.stop();}catch{}
      oscillator.disconnect();
    }
    alarmNodes=[];
  }
  async function prepareAlarm() {
    if(!$('countdownSound').checked) return false;
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio) return false;
      if(!alarmContext||alarmContext.state==='closed') alarmContext=new Audio();
      if(alarmContext.state!=='running') await alarmContext.resume();
      return alarmContext.state==='running';
    }catch{return false;}
  }
  async function soundAlarm() {
    if(!$('countdownSound').checked) return;
    const version=alarmVersion;
    if(!await prepareAlarm()) {
      if(version===alarmVersion) $('countdownStatus').textContent='Die Aufgabenzeit ist abgelaufen. Signalton im Browser nicht verfügbar.';
      return;
    }
    if(version!==alarmVersion||!$('countdownSound').checked) return;
    const start=alarmContext.currentTime;
    [659.25,830.61,987.77].forEach((frequency,index)=>{
      const oscillator=alarmContext.createOscillator(),gain=alarmContext.createGain();
      const at=start+index*.26;
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0,at);
      gain.gain.linearRampToValueAtTime(.16,at+.015);
      gain.gain.exponentialRampToValueAtTime(.001,at+.24);
      oscillator.connect(gain);gain.connect(alarmContext.destination);
      alarmNodes.push(oscillator);
      oscillator.onended=()=>{
        oscillator.disconnect();gain.disconnect();
        alarmNodes=alarmNodes.filter(node=>node!==oscillator);
      };
      oscillator.start(at);oscillator.stop(at+.25);
    });
  }
  $('countdownSound').onchange=()=>{
    stopAlarm();
    try{localStorage.setItem('klassenampel-countdown-sound',String($('countdownSound').checked));}catch{}
    if($('countdownSound').checked) void prepareAlarm();
  };
  function screensaver(active) {
    document.body.classList.toggle('screensaver',active);
    $('exitScreensaver').hidden=!active;
    if(active) $('exitScreensaver').focus();
  }
  function syncNeutralOptions(){ $('neutralOptions').hidden=window.klassenampel.snapshot().world!=='neutral'; }
  document.querySelectorAll('[data-world]').forEach(button=>button.addEventListener('click',syncNeutralOptions));
  $('startScreensaver').onclick=()=>{
    if(window.klassenampel.snapshot().world!=='neutral')return;
    $('neutralAnimation').checked=true;
    screensaver(true);
  };
  $('exitScreensaver').onclick=()=>screensaver(false);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&document.body.classList.contains('screensaver')) {
      screensaver(false);$('startScreensaver').focus();
    }
  });
  const fontDefaults={fontFamily:'system-ui',uiFontSize:16,taskFontSize:20,clockFontSize:48};
  function applyFonts() {
    document.documentElement.style.setProperty('--view-font',$('fontFamily').value);
    for(const [id,property] of [['uiFontSize','--ui-font-size'],['taskFontSize','--task-font-size'],['clockFontSize','--clock-font-size']]) {
      document.documentElement.style.setProperty(property,$(id).value+'px');
      $(id+'Value').textContent=$(id).value+' px';
    }
    positions();
  }
  function saveFonts() {
    applyFonts();
    try{localStorage.setItem('klassenampel-fonts',JSON.stringify(Object.fromEntries(Object.keys(fontDefaults).map(id=>[id,$(id).value]))));}catch{}
  }
  for(const id of Object.keys(fontDefaults)) $(id).addEventListener('input',saveFonts);
  $('resetFonts').onclick=()=>{
    for(const [id,value] of Object.entries(fontDefaults)) $(id).value=value;
    saveFonts();
  };
  const modules={showTask:$('taskModule'),showCountdown:$('countdownModule'),showHud:document.querySelector('.hud'),showDiscovery:document.querySelector('.discovery')};
  function notice(text) { $('viewStatus').textContent=text; }
  function countdown() {
    if(running) {
      remaining=Math.max(0,(deadline-Date.now())/1000);
      if(!remaining) {
        running=false;
        $('countdownStatus').textContent='Die Aufgabenzeit ist abgelaufen.';
        void soundAlarm();
      }
    }
    const n=Math.ceil(remaining);
    $('countdownDisplay').textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
    $('countdownStart').textContent=running?'Countdown pausieren':remaining===0?'Erneut starten':'Countdown starten';
    $('countdownMinutes').disabled=running;
    $('countdownMinus').disabled=remaining<=0;
    $('countdownPlus').disabled=remaining>=10800;
    document.querySelectorAll('[data-countdown-preset]').forEach(button=>button.disabled=running);
    $('countdownProgress').hidden=!$('showCountdownProgress').checked;
    $('countdownProgress').max=Math.max(1,countdownTotal);
    $('countdownProgress').value=remaining;
    $('countdownProgress').setAttribute('aria-valuetext',$('countdownDisplay').textContent+' verbleibend');
    $('countdownModule').classList.toggle('finished',remaining===0);
  }
  function resetCountdown() {
    if(!$('countdownMinutes').reportValidity()) return false;
    stopAlarm();
    remaining=Number($('countdownMinutes').value)*60;countdownTotal=remaining;running=false;
    $('countdownStatus').textContent='Bereit'; countdown(); return true;
  }
  $('countdownStart').onclick=()=>{
    if(running) {countdown();running=false;$('countdownStatus').textContent='Pausiert';}
    else {
      if(!remaining&&!resetCountdown()) return;
      stopAlarm();void prepareAlarm();
      deadline=Date.now()+remaining*1000;running=true;$('countdownStatus').textContent='Aufgabenzeit läuft';
    }
    countdown();
  };
  function adjustCountdown(seconds){
    countdown();const wasRunning=running,before=remaining,next=clamp(before+seconds,0,10800);
    if(next===before)return;
    stopAlarm();countdownTotal=before>0?clamp(countdownTotal+next-before,Math.max(1,next),10800):Math.max(1,next);
    remaining=next;
    if(wasRunning){deadline=Date.now()+remaining*1000;running=true;}
    else $('countdownStatus').textContent=remaining?'Aufgabenzeit angepasst · pausiert':'Bereit';
    countdown();
  }
  $('countdownMinus').onclick=()=>adjustCountdown(-60);
  $('countdownPlus').onclick=()=>adjustCountdown(60);
  document.querySelectorAll('[data-countdown-preset]').forEach(button=>button.onclick=()=>{
    if(running)return;$('countdownMinutes').value=button.dataset.countdownPreset;resetCountdown();
  });
  $('countdownReset').onclick=resetCountdown;
  $('countdownMinutes').onchange=resetCountdown;
  setInterval(countdown,200);
  document.addEventListener('visibilitychange',countdown);
  function position(id) {
    if(moduleState[id].outside||draggingId===id||window.moduleLayout?.isFree(id)) return;
    const el=$(id), p=layout[id];
    el.style.left=clamp(p.x*world.clientWidth,0,Math.max(0,world.clientWidth-el.offsetWidth))+'px';
    el.style.top=clamp(p.y*world.clientHeight,0,Math.max(0,world.clientHeight-el.offsetHeight))+'px';
  }
  function positions() {Object.keys(layout).forEach(position);}
  function persistLayout() {try{localStorage.setItem('klassenampel-layout',JSON.stringify(layout));}catch{}}
  function applyModule(id) {
    const el=$(id), prefs=moduleState[id];
    const parent=prefs.outside?$('moduleDock'):world;
    if(!window.moduleLayout?.isFree(id)&&el.parentElement!==parent) parent.append(el);
    el.classList.toggle('outside-module',prefs.outside);
    el.querySelector('.module-body').hidden=prefs.collapsed;
    const collapse=el.querySelector('[data-collapse]');
    collapse.textContent=prefs.collapsed?'▸':'▾';
    collapse.setAttribute('aria-expanded',String(!prefs.collapsed));
    const handle=el.querySelector('[data-drag]');
    handle.hidden=false;
    handle.textContent='⠿';
    handle.setAttribute('aria-label',(id==='taskModule'?'Aufgabe':'Uhr')+' ziehen, innerhalb oder außerhalb der Spielwelt');
    handle.title='Ziehen';
    collapse.title=prefs.collapsed?'Ausklappen':'Einklappen';
    el.querySelector('[data-place]')?.remove();
    if(prefs.outside&&!window.moduleLayout?.isFree(id)) {el.style.left='';el.style.top='';}
    else position(id);
  }
  function saveModules() {
    try{localStorage.setItem('klassenampel-module-state',JSON.stringify(moduleState));}catch{}
  }
  for(const id of Object.keys(moduleState)) {
    const el=$(id);
    if(!el.querySelector('.module-body')) {
      const body=document.createElement('div');body.className='module-body';body.id=id+'Body';
      const handle=el.querySelector('[data-drag]');
      Array.from(el.children).filter(child=>child!==handle).forEach(child=>body.append(child));
      const tools=document.createElement('div');tools.className='module-tools';
      const collapse=document.createElement('button');
      collapse.type='button';collapse.dataset.collapse=id;collapse.setAttribute('aria-controls',body.id);
      collapse.setAttribute('aria-label',(id==='taskModule'?'Aufgabe':'Uhr')+' ein- oder ausklappen');
      tools.append(collapse);el.append(tools,body);
    }
    el.querySelector('[data-collapse]').onclick=()=>{
      moduleState[id].collapsed=!moduleState[id].collapsed;applyModule(id);saveModules();
    };
    applyModule(id);
  }
  const observer=new ResizeObserver(positions);observer.observe(world);
  window.addEventListener('resize',positions);
  Object.keys(layout).forEach(id=>observer.observe($(id)));
  document.querySelectorAll('[data-drag]').forEach(handle=>{
    const id=handle.dataset.drag, el=$(id);
    let drag=null;
    handle.onpointerdown=event=>{
      if(event.button!==0) return;
      const rect=el.getBoundingClientRect();
      drag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,outside:moduleState[id].outside};
      draggingId=id;
      document.body.classList.add('module-dragging');
      document.body.append(el);
      el.classList.add('dragging-module');
      el.style.position='fixed';el.style.width=rect.width+'px';
      el.style.left=rect.left+'px';el.style.top=rect.top+'px';
      handle.setPointerCapture(event.pointerId);event.preventDefault();
    };
    handle.onpointermove=event=>{
      if(!drag) return;
      el.style.left=drag.left+event.clientX-drag.x+'px';
      el.style.top=drag.top+event.clientY-drag.y+'px';
      const rect=world.getBoundingClientRect();
      world.classList.toggle('drop-target',event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom);
    };
    const end=event=>{
      if(!drag) return;
      const rect=world.getBoundingClientRect();
      const cancelled=event.type!=='pointerup';
      const inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      moduleState[id].outside=cancelled?drag.outside:!inside;
      if(!cancelled&&inside) layout[id]={
        x:clamp(parseFloat(el.style.left)-rect.left,0,Math.max(0,world.clientWidth-el.offsetWidth))/world.clientWidth,
        y:clamp(parseFloat(el.style.top)-rect.top,0,Math.max(0,world.clientHeight-el.offsetHeight))/world.clientHeight
      };
      drag=null;draggingId=null;
      el.classList.remove('dragging-module');
      el.style.position='';el.style.width='';
      document.body.classList.remove('module-dragging');world.classList.remove('drop-target');
      applyModule(id);persistLayout();saveModules();
    };
    handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=end;
    handle.onkeydown=event=>{
      if(moduleState[id].outside) return;
      const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!d) return;
      event.preventDefault();
      layout[id]={x:clamp((el.offsetLeft+d[0]*10)/world.clientWidth,0,1),y:clamp((el.offsetTop+d[1]*10)/world.clientHeight,0,1)};
      position(id);persistLayout();
    };
  });
  function taskExtras(){
    const modes={silent:['✎','Stillarbeit'],pair:['👥','Partnerarbeit'],group:['👥','Gruppenarbeit']};
    const [icon,label]=modes[$('work').value]||modes.silent;
    $('workModeIcon').textContent=icon;$('workModeLabel').textContent=label;
    $('workModeBadge').setAttribute('aria-label','Arbeitsform: '+label+'. Klicken zum Wechseln.');
    $('workModeBadge').hidden=!$('showWorkMode').checked;
    $('taskFollowUp').hidden=!$('showFollowUp').checked;
    $('countdownProgress').hidden=!$('showCountdownProgress').checked;
  }
  function saveTaskExtras(){
    taskExtras();try{localStorage.setItem('klassenampel-task-extras',JSON.stringify({text:$('followUpTask').value,showFollowUp:$('showFollowUp').checked,showWorkMode:$('showWorkMode').checked,showCountdownProgress:$('showCountdownProgress').checked}));}catch{}
  }
  $('work').addEventListener('change',taskExtras);
  $('workModeBadge').onclick=()=>{const modes=['silent','pair','group'];$('work').value=modes[(modes.indexOf($('work').value)+1)%modes.length];$('work').dispatchEvent(new Event('change'));};
  $('followUpTask').oninput=saveTaskExtras;
  for(const id of ['showWorkMode','showFollowUp','showCountdownProgress'])$(id).addEventListener('change',saveTaskExtras);
  function visibility() {
    taskExtras();
    for(const [id,el] of Object.entries(modules)) el.hidden=!$(id).checked;
    positions();
  }
  Object.keys(modules).forEach(id=>$(id).onchange=visibility);
  $('resetLayout').onclick=()=>{layout=structuredClone(defaults);positions();persistLayout();};
  task.oninput=()=>{try{localStorage.setItem('klassenampel-task',task.value);}catch{}};
  function snapshot() {
    countdown();
    return {
      version:1,appVersion:'0.6.0',task:task.value,followUpTask:$('followUpTask').value,layout,moduleState,countdownMinutes:Number($('countdownMinutes').value),remaining,countdownTotal,
      game:window.klassenampel.snapshot(),
      controls:Object.fromEntries(controls.map(id=>[id,$(id).type==='checkbox'?$(id).checked:$(id).value])),
      projector:document.body.classList.contains('projector'),
      screensaver:document.body.classList.contains('screensaver'),
      moduleLayout:window.moduleLayout?.snapshot()??null,
      whiteboard:window.whiteboard?.snapshot()??null,
      detailsOpen:Object.fromEntries(Array.from(document.querySelectorAll('details[id]'),el=>[el.id,el.open])),
      expanded:Array.from(document.querySelectorAll('details'),el=>el.open)
    };
  }
  function restore(config) {
    if(!config||config.version!==1) return;
    stopAlarm();
    window.initialModuleLayout=config.moduleLayout??(config.board?.active?config.board:{version:1,items:{}});
    window.initialWhiteboardState=config.whiteboard??{version:1,objects:[]};
    $('followUpTask').value=typeof config.followUpTask==='string'?config.followUpTask.slice(0,2000):'';
    $('showWorkMode').checked=config.controls?.showWorkMode!==false;
    $('showFollowUp').checked=config.controls?.showFollowUp===true;
    $('showCountdownProgress').checked=config.controls?.showCountdownProgress!==false;
    if(typeof config.task==='string') task.value=config.task.slice(0,2000);
    if(!config.controls?.penaltyProfile&&['primary','college'].includes(config.controls?.age)){$('penaltyProfile').value=config.controls.age;$('penaltyProfile').dispatchEvent(new Event('change'));}
    for(const id of controls) {
      const el=$(id),val=config.controls?.[id];
      if(val===undefined) continue;
      if(el.type==='checkbox') el.checked=val===true;
      else {
        const old=el.value;el.value=String(val);
        if(!el.value||!el.checkValidity()) el.value=old;
      }
      el.dispatchEvent(new Event('change'));el.dispatchEvent(new Event('input'));
    }
    for(const id of Object.keys(layout)) {
      const p=config.layout?.[id];
      if(Number.isFinite(p?.x)&&Number.isFinite(p?.y)) layout[id]={x:clamp(p.x,0,1),y:clamp(p.y,0,1)};
    }
    for(const id of Object.keys(moduleState)) {
      moduleState[id].collapsed=config.moduleState?.[id]?.collapsed===true;
      moduleState[id].outside=config.moduleState?.[id]?.outside===true;
      applyModule(id);
    }
    const minutes=Number(config.countdownMinutes);
    $('countdownMinutes').value=Number.isInteger(minutes)&&minutes>=1&&minutes<=180?minutes:5;
    remaining=Number.isFinite(config.remaining)?clamp(config.remaining,0,10800):300;running=false;
    countdownTotal=Number.isFinite(config.countdownTotal)?clamp(config.countdownTotal,Math.max(1,remaining),10800):Math.max(remaining,Number($('countdownMinutes').value)*60);
    if(config.game) window.klassenampel.restore(config.game);
    document.body.classList.toggle('projector',config.projector===true);
    $('projector').textContent=config.projector?'Bedienansicht':'Präsentation';
    $('projector').setAttribute('aria-pressed',String(config.projector===true));
    screensaver(config.screensaver===true&&window.klassenampel.snapshot().world==='neutral');
    if(Array.isArray(config.expanded)&&!config.detailsOpen) document.querySelectorAll('details').forEach((el,i)=>el.open=config.expanded[i]===true);
    if(config.detailsOpen&&typeof config.detailsOpen==='object') for(const el of document.querySelectorAll('details[id]')) {
      if(Object.hasOwn(config.detailsOpen,el.id)) el.open=config.detailsOpen[el.id]===true;
    }
    visibility();countdown();syncNeutralOptions();
    window.moduleLayout?.restore(window.initialModuleLayout);
    window.whiteboard?.restore(window.initialWhiteboardState);
  }
  const libraryKey='klassenampel-view-library';
  let library=[],undoOpen=null;
  const validView=value=>value&&value.version===1&&typeof value.task==='string'&&value.controls&&typeof value.controls==='object';
  function renderLibrary(selected=$('savedViews').value){
    const list=$('savedViews');list.replaceChildren();
    const empty=document.createElement('option');empty.value='';empty.textContent=library.length?'Ansicht auswählen …':'Noch keine gespeicherten Ansichten';list.append(empty);
    for(const entry of library){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;list.append(option);}
    list.value=selected;
    const disabled=!library.some(entry=>entry.id===list.value);
    for(const id of ['loadView','replaceView','renameView','deleteView'])$(id).disabled=disabled;
  }
  function saveLibrary(next,selected,message){
    try{localStorage.setItem(libraryKey,JSON.stringify({version:1,entries:next}));}
    catch{notice('Speichern nicht möglich: Browserspeicher voll oder gesperrt. Bestehende Ansichten bleiben erhalten. Bitte HTML exportieren.');return false;}
    library=next;renderLibrary(selected);notice(message);return true;
  }
  function viewName(){return $('viewName').value.trim().slice(0,80);}
  function rememberCurrent(config){try{localStorage.setItem('klassenampel-view',JSON.stringify(config));}catch{}}
  function selectedView(){return library.find(entry=>entry.id===$('savedViews').value);}
  function initializeLibrary(){
    try{
      const saved=JSON.parse(localStorage.getItem(libraryKey)||'null');
      if(saved?.version===1&&Array.isArray(saved.entries))library=saved.entries.filter(entry=>typeof entry?.id==='string'&&typeof entry.name==='string'&&validView(entry.config));
      else if(!saved){
        const legacy=JSON.parse(localStorage.getItem('klassenampel-view')||'null');
        if(validView(legacy)){
          const entry={id:'previous-view',name:'Bisher gespeicherte Ansicht',config:legacy};
          if(saveLibrary([entry],entry.id,'Die bisher gespeicherte Ansicht ist jetzt in deiner Sammlung verfügbar.'))library=[entry];
        }
      }
    }catch{notice('Die Sammlung konnte nicht gelesen werden. Vorhandene Daten wurden nicht überschrieben.');}
    renderLibrary();
  }
  $('savedViews').onchange=()=>{renderLibrary();const entry=selectedView();if(entry)$('viewName').value=entry.name;};
  $('saveView').onclick=()=>{
    const name=viewName()||'Ansicht '+(library.length+1),config=snapshot();
    const entry={id:crypto.randomUUID?.()??Date.now().toString(36)+Math.random().toString(36).slice(2),name,config};
    if(saveLibrary([...library,entry],entry.id,'„'+name+'“ gespeichert. Über „Ansicht öffnen“ jederzeit wieder aufrufen.')){$('viewName').value=name;rememberCurrent(config);}
  };
  $('loadView').onclick=()=>{
    const entry=selectedView();if(!entry)return;
    undoOpen=structuredClone(snapshot());restore(structuredClone(entry.config));rememberCurrent(snapshot());
    $('undoLoadView').disabled=false;notice('„'+entry.name+'“ geöffnet. Spielrunde und Countdown sind pausiert.');
  };
  $('undoLoadView').onclick=()=>{if(!undoOpen)return;restore(undoOpen);undoOpen=null;$('undoLoadView').disabled=true;rememberCurrent(snapshot());notice('Die vorherige Arbeitsansicht wurde wiederhergestellt.');};
  $('replaceView').onclick=()=>{
    const entry=selectedView();if(!entry||!confirm('„'+entry.name+'“ mit der aktuellen Ansicht ersetzen?'))return;
    const config=snapshot();if(saveLibrary(library.map(item=>item.id===entry.id?{...item,config}:item),entry.id,'Gespeicherte Ansicht aktualisiert.'))rememberCurrent(config);
  };
  $('renameView').onclick=()=>{
    const entry=selectedView(),name=viewName();if(!entry)return;if(!name){notice('Bitte oben einen Namen eingeben.');return;}
    saveLibrary(library.map(item=>item.id===entry.id?{...item,name}:item),entry.id,'Ansicht umbenannt.');
  };
  $('deleteView').onclick=()=>{
    const entry=selectedView();if(!entry||!confirm('„'+entry.name+'“ aus der Sammlung löschen?'))return;
    saveLibrary(library.filter(item=>item.id!==entry.id),'','Ansicht aus der Sammlung gelöscht. Die aktuelle Arbeitsfläche bleibt erhalten.');
  };
  initializeLibrary();
  function exportHtml() {
    const clone=document.documentElement.cloneNode(true);
    window.moduleLayout?.prepareExport(clone);
    window.whiteboard?.prepareExport(clone);
    clone.querySelector('#viewConfig')?.remove();
    const data=document.createElement('script');data.id='viewConfig';data.type='application/json';
    data.textContent=JSON.stringify(snapshot()).replaceAll('<','\\u003c');
    clone.querySelector('head').append(data);
    clone.querySelector('#savedViews').replaceChildren();clone.querySelector('#viewName').value='';
    for(const id of ['loadView','replaceView','renameView','deleteView','undoLoadView'])clone.querySelector('#'+id).disabled=true;
    clone.querySelector('#shareLink').value='';clone.querySelector('#shareLink').hidden=true;
    return '<!doctype html>\n'+clone.outerHTML;
  }
  $('exportView').onclick=()=>{
    const url=URL.createObjectURL(new Blob([exportHtml()],{type:'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='klassenampel-ansicht.html';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    notice('HTML exportiert. Auf dem anderen Gerät öffnen oder als index.html online veröffentlichen.');
  };
  $('shareView').onclick=()=>{
    if(!['http:','https:'].includes(location.protocol)){
      notice('Für einen Online-Link zuerst die exportierte HTML als index.html auf GitHub Pages veröffentlichen und dort öffnen.');return;
    }
    const url=new URL(location.href);url.hash='ansicht='+encodeURIComponent(JSON.stringify(snapshot()));
    $('shareLink').hidden=false;$('shareLink').value=url.href;$('shareLink').select();
    notice(url.href.length>30000?'Der Link ist durch eingebettete Tafelbilder sehr lang. Für die Übertragung dieser Ansicht bitte den HTML-Export verwenden.':'Link kopieren und auf dem anderen Gerät öffnen. Er enthält Aufgabe, Positionen, Einstellungen, Tafelinhalt und Spielstand.');
  };
  window.classroomView={snapshot,exportHtml};
  let config=null;
  try{
    if(location.hash.startsWith('#ansicht=')) config=JSON.parse(decodeURIComponent(location.hash.slice(9)));
    else if($('viewConfig')) config=JSON.parse($('viewConfig').textContent);
    else config=JSON.parse(localStorage.getItem('klassenampel-view')||'null');
  }catch{notice('Gespeicherte Ansicht konnte nicht geladen werden.');}
  if(config) restore(config);
  else {
    try{
      task.value=localStorage.getItem('klassenampel-task')||'';
      const extras=JSON.parse(localStorage.getItem('klassenampel-task-extras')||'null');
      $('followUpTask').value=typeof extras?.text==='string'?extras.text.slice(0,2000):'';
      $('showFollowUp').checked=extras?.showFollowUp===true;
      $('showWorkMode').checked=extras?.showWorkMode!==false;
      $('showCountdownProgress').checked=extras?.showCountdownProgress!==false;
      const stored=JSON.parse(localStorage.getItem('klassenampel-layout')||'null');
      for(const id of Object.keys(layout)) if(Number.isFinite(stored?.[id]?.x)&&Number.isFinite(stored?.[id]?.y)) layout[id]=stored[id];
      const prefs=JSON.parse(localStorage.getItem('klassenampel-module-state')||'null');
      for(const id of Object.keys(moduleState)) {
        moduleState[id].collapsed=prefs?.[id]?.collapsed===true;
        if(typeof prefs?.[id]?.outside==='boolean')moduleState[id].outside=prefs[id].outside;
        applyModule(id);
      }
      const fonts=JSON.parse(localStorage.getItem('klassenampel-fonts')||'null');
      for(const id of Object.keys(fontDefaults)) {
        if(fonts?.[id]===undefined) continue;
        $(id).value=fonts[id];
        if(!$(id).value||!$(id).checkValidity()) $(id).value=fontDefaults[id];
      }
    }catch{}
  }
  applyFonts();visibility();countdown();syncNeutralOptions();
})();
