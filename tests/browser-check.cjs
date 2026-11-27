const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const html = fs.readFileSync(path.join(__dirname,'../index.html'));
const server = http.createServer((req,res) => {
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(html);
});
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function verify() {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url = 'http://127.0.0.1:'+server.address().port+'/';
  const profile = fs.mkdtempSync(path.join(__dirname,'edge-'));
  const toneFile = path.join(profile,'tone.wav');
  const samples=48000*2, wave=Buffer.alloc(44+samples*2);
  wave.write('RIFF',0); wave.writeUInt32LE(wave.length-8,4); wave.write('WAVEfmt ',8);
  wave.writeUInt32LE(16,16); wave.writeUInt16LE(1,20); wave.writeUInt16LE(1,22);
  wave.writeUInt32LE(48000,24); wave.writeUInt32LE(96000,28);
  wave.writeUInt16LE(2,32); wave.writeUInt16LE(16,34);
  wave.write('data',36); wave.writeUInt32LE(samples*2,40);
  for(let i=0;i<samples;i++) wave.writeInt16LE(Math.round(8192*Math.sin(i*2*Math.PI*440/48000)),44+i*2);
  fs.writeFileSync(toneFile,wave);
  const browser = spawn(edge,[
    '--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run',
    '--no-default-browser-check','--disable-background-networking','--no-proxy-server',
    '--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',
    '--use-file-for-fake-audio-capture='+toneFile,'about:blank'
  ],{stdio:'ignore',windowsHide:true});
  let ws;
  try {
    let port;
    for(let i=0;i<80&&!port;i++) {
      await sleep(200);
      try { port=fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split(/\r?\n/)[0]; } catch {}
    }
    assert(port,'Edge DevTools did not start');
    const targets=await fetch('http://127.0.0.1:'+port+'/json/list').then(response=>response.json());
    ws=new WebSocket(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{
      ws.onopen=resolve; ws.onerror=reject;
    });
    let id=0;
    const pending=new Map(), errors=[];
    ws.onmessage=event=>{
      const packet=JSON.parse(event.data);
      if (packet.method==='Runtime.exceptionThrown') errors.push(packet.params.exceptionDetails);
      const done=pending.get(packet.id);
      if (done) {
        pending.delete(packet.id);
        if (packet.error) done.reject(new Error(JSON.stringify(packet.error)));
        else done.resolve(packet.result);
      }
    };
    function send(method,params={}) {
      id++;
      ws.send(JSON.stringify({id,method,params}));
      return new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
    }
    async function evaluate(expression) {
      const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    async function shot(name) {
      const {data}=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(data,'base64'));
    }
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:`
      let virtualNow=0, nextFrame;
      Object.defineProperty(performance,'now',{value:()=>virtualNow});
      requestAnimationFrame=fn=>{nextFrame=fn; return 1;};
      window.step=(seconds)=>{
        for(let ms=0;ms<seconds*1000;ms+=100){virtualNow+=100; nextFrame(virtualNow);}
      };
      window.jump=(seconds)=>{virtualNow+=seconds*1000;};
      if(location.protocol==='http:'&&!localStorage.getItem('klassenampel-v02')){
        localStorage.setItem('klassenampel-v02',JSON.stringify({score:29,world:'aquarium',age:'primary',work:'pair'}));
      }
      window.confirm=()=>true;
    `});
    await send('Page.navigate',{url});
    await sleep(800);
    const value = id=>evaluate(`document.getElementById('${id}').value`);
    const label = id=>evaluate(`document.getElementById('${id}').textContent`);
    const click = selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const step = seconds=>evaluate(`step(${seconds})`);
    const score = async()=>Number(await label('score'));
    const change = (id,field,v)=>evaluate(`{const el=document.getElementById('${id}'); el.${field}=${JSON.stringify(v)}; el.dispatchEvent(new Event('change'));}`);
    async function dragModule(id,outside) {
      const start=await evaluate(`(()=>{const r=document.querySelector('[data-drag=${id}]').getBoundingClientRect();return {x:r.x+12,y:r.y+12}})()`);
      await send('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',clickCount:1});
      const target=outside?{x:30,y:55}:await evaluate("(()=>{const r=document.querySelector('.world').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.4}})()");
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...target,button:'left',buttons:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',...target,button:'left',clickCount:1});
    }
    assert.equal(await score(),29);
    assert.equal(await value('threshold'),'48');
    assert.equal(await value('penDelay'),'5');
    assert.equal(await value('penStrength'),'medium');
    assert.equal(await value('penCooldown'),'20');
    if(process.env.LIBRARY_ONLY) {
      await click('[data-module-choice=whiteboard]');await click('#whiteboardAddText');
      await evaluate("document.querySelector('.whiteboard-text-field').value='Tafel A';document.querySelector('.whiteboard-text-field').dispatchEvent(new Event('input'));document.getElementById('taskText').value='Aufgabe A';document.getElementById('viewName').value='Mathematik'");
      await evaluate("{const c=document.createElement('canvas');c.width=20;c.height=10;c.getContext('2d').fillRect(0,0,20,10);const saved=whiteboard.snapshot();saved.objects.push({type:'image',src:c.toDataURL(),x:400,y:200,width:200,height:100,opacity:.6});whiteboard.restore(saved);}");
      await click('#autoArrange');await click('#saveView');
      const first=await evaluate("document.getElementById('savedViews').value"),snapA=await evaluate('classroomView.snapshot()');
      await evaluate("document.getElementById('taskText').value='Aufgabe B';document.querySelector('.whiteboard-text-field').value='Tafel B';document.querySelector('.whiteboard-text-field').dispatchEvent(new Event('input'));document.getElementById('viewName').value='Deutsch'");
      await change('countdownMinutes','value','2');await click('[data-world=space]');await click('#saveView');
      const second=await value('savedViews');assert.notEqual(first,second);
      assert.equal(await evaluate("document.getElementById('savedViews').options.length"),3);
      await change('savedViews','value',first);await click('#countdownStart');await click('#loadView');
      assert.equal(await value('taskText'),'Aufgabe A');assert.equal(await evaluate("whiteboard.snapshot().objects[0].text"),'Tafel A');assert.equal(await label('countdownDisplay'),'05:00');
      assert.deepEqual(await evaluate('whiteboard.snapshot()'),snapA.whiteboard);
      assert.equal(await evaluate('klassenampel.snapshot().world'),'aquarium');assert.deepEqual(await evaluate('moduleLayout.snapshot()'),snapA.moduleLayout);
      await click('#undoLoadView');assert.equal(await value('taskText'),'Aufgabe B');assert.equal(await evaluate('klassenampel.snapshot().world'),'space');
      await click('#loadView');await evaluate("document.getElementById('viewName').value='Mathematik neu'");await click('#renameView');
      assert.equal(await evaluate("document.getElementById('savedViews').selectedOptions[0].textContent"),'Mathematik neu');
      await evaluate("document.getElementById('taskText').value='Aufgabe A ersetzt'");await click('#replaceView');
      await change('savedViews','value',second);await click('#loadView');assert.equal(await value('taskText'),'Aufgabe B');
      await change('savedViews','value',first);await click('#loadView');assert.equal(await value('taskText'),'Aufgabe A ersetzt');
      // A failed write must not remove existing entries or report success.
      await evaluate("window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='klassenampel-view-library')throw new DOMException('Full','QuotaExceededError');return originalStorageSet.call(this,key,value)}");
      await click('#saveView');assert.match(await label('viewStatus'),/voll oder gesperrt/);assert.equal(await evaluate("document.getElementById('savedViews').options.length"),3);
      await evaluate("Storage.prototype.setItem=originalStorageSet");
      const html=await evaluate('classroomView.exportHtml()');assert(!html.includes('<option value="'+second+'"'));
      fs.writeFileSync(path.join(__dirname,'library-test.html'),html);
      await send('Page.reload');await sleep(600);assert.equal(await evaluate("document.getElementById('savedViews').options.length"),3);
      await change('savedViews','value',second);await click('#deleteView');assert.equal(await value('taskText'),'Aufgabe A ersetzt');assert.equal(await evaluate("document.getElementById('savedViews').options.length"),2);
      await click('#menuToggle');await evaluate("document.getElementById('details-sharing').open=true");await shot('saved-library');
      await evaluate("localStorage.removeItem('klassenampel-view-library')");await send('Page.reload');await sleep(600);
      assert.equal(await evaluate("document.getElementById('savedViews').options[1].textContent"),'Bisher gespeicherte Ansicht');
      assert.deepEqual(errors,[]);console.log('Bibliothek: mehrere Ansichten, direktes Öffnen mit Tafel/Layout/Timer, Rückgängig, Umbenennen/Ersetzen/Löschen, Speicherfehler, Neustart und Altdatenübernahme geprüft.');return;
    }
    if(process.env.VERSION5_ONLY) {
      assert.equal(await evaluate("document.title"),'KlassenAmpel 0.5.1');
      assert.equal(await evaluate("document.querySelectorAll('[data-board]').length"),5);
      assert(await evaluate("document.querySelector('[data-board=mainScreen]').contains(document.getElementById('roundSettings'))"));
      assert(await evaluate("document.querySelector('[data-board=mainScreen]').contains(document.querySelector('.discovery'))"));
      assert(await evaluate("document.getElementById('workspaceMenu').hidden"));
      await step(.2);await shot('v05-desktop');
      await click('#menuToggle');await click('[data-module-choice=whiteboard]');
      assert.equal(await evaluate("document.getElementById('workspaceMenu').hidden"),false);
      assert.equal(await evaluate("document.getElementById('whiteboardModule').hidden"),false);
      await click('#autoArrange');await sleep(100);
      const arranged=await evaluate('moduleLayout.snapshot()');
      await evaluate("document.getElementById('details-fonts').open=true;document.getElementById('details-calibration').open=true");await sleep(150);
      assert.deepEqual(await evaluate('moduleLayout.snapshot().items'),arranged.items,'Menu settings never move the workspace');
      await shot('v05-menu');
      const boxes=await evaluate("[...document.querySelectorAll('#moduleLayer > [data-board]')].filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.board,x:r.x,y:r.y,right:r.right,bottom:r.bottom}})");
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert(a.right<=b.x+1||b.right<=a.x+1||a.bottom<=b.y+1||b.bottom<=a.y+1,'Automatic group layout overlap');}
      await change('appearanceTarget','value','mainScreen');
      await evaluate("document.getElementById('moduleColor').value='#9673b6';document.getElementById('moduleColor').dispatchEvent(new Event('input'));document.getElementById('moduleOpacity').value=30;document.getElementById('moduleOpacity').dispatchEvent(new Event('input'));document.getElementById('moduleLocked').checked=true;document.getElementById('moduleLocked').dispatchEvent(new Event('change'))");
      const fixed=await evaluate('moduleLayout.snapshot().items.mainScreen');
      await evaluate("document.querySelector('[data-board=mainScreen] > .move-grip').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}))");
      assert.deepEqual(await evaluate('moduleLayout.snapshot().items.mainScreen'),fixed);
      await change('moduleLocked','checked',false);await click('#menuClose');
      // Move the task into the explicit game scene target using real mouse input.
      await evaluate("document.querySelector('[data-board=mainScreen]').scrollIntoView({block:'start'})");
      const rect=selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
      const t=await rect('#taskModule'),w=await rect('.world');
      const start={x:t.x+14,y:t.y+14},end={x:w.x+40,y:w.y+80};
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...start});await send('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',...end,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...end,button:'left',clickCount:1});
      assert.equal(await evaluate('moduleLayout.snapshot().items.task.parent.target'),'mainScreen');
      const childBefore=await rect('#taskModule');
      await evaluate("document.querySelector('[data-board=mainScreen] > .move-grip').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',shiftKey:true,bubbles:true}))");
      const childAfter=await rect('#taskModule');assert(Math.abs(childAfter.y-childBefore.y-30)<1);
      await click('#whiteboardAddText');await evaluate("document.querySelector('.whiteboard-text-field').value='Version 0.5';document.querySelector('.whiteboard-text-field').dispatchEvent(new Event('input'))");
      const snap=await evaluate('classroomView.snapshot()');
      await click('#saveView');await click('#shareView');const shared=await value('shareLink');
      fs.writeFileSync(path.join(__dirname,'v05-test.html'),await evaluate('classroomView.exportHtml()'));
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'v05-test.html')).href});await sleep(600);
      assert.deepEqual(await evaluate('moduleLayout.snapshot()'),snap.moduleLayout);assert.deepEqual(await evaluate('whiteboard.snapshot()'),snap.whiteboard);
      assert.equal(await evaluate("document.querySelectorAll('.module-size').length"),5);
      await send('Page.navigate',{url:shared});await sleep(600);assert.deepEqual(await evaluate('moduleLayout.snapshot()'),snap.moduleLayout);
      // Old 18-part layouts only restore supported groups; settings remain in the menu.
      const legacy=structuredClone(snap);legacy.moduleLayout={version:1,items:{task:{x:.1,y:100,width:.25,height:180,z:22},fonts:{x:.5,y:100,width:.2,height:100,z:23}},appearance:{task:40}};
      await send('Page.navigate',{url:'about:blank'});await send('Page.navigate',{url:url+'#ansicht='+encodeURIComponent(JSON.stringify(legacy))});await sleep(600);
      assert.equal(await evaluate('moduleLayout.snapshot().version'),2);assert.equal(await evaluate('moduleLayout.snapshot().items.fonts'),undefined);assert.equal(await evaluate('moduleLayout.snapshot().appearance.task'),40);
      await click('#autoArrange');await click('#layoutUndo');assert.equal(await evaluate('moduleLayout.snapshot().automatic'),false);
      await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await click('#autoArrange');await sleep(150);await step(.1);await shot('v05-mobile');
      assert((await evaluate('document.documentElement.scrollWidth'))<=390);
      await click('#menuToggle');await shot('v05-menu-mobile');await click('#menuClose');
      assert.deepEqual(errors,[]);console.log('0.5.0: five semantic modules, fixed settings menu, grouping, automatic layout, locking, colors, undo, 0.4 migration, HTML/link and mobile verified.');return;
    }
    if(process.env.TEXT_INPUT_ONLY) {
      await click('[data-module-choice=whiteboard]');
      await evaluate("document.getElementById('whiteboardAddText').scrollIntoView({block:'center'})");
      const button=await evaluate("(()=>{const r=document.getElementById('whiteboardAddText').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
      await send('Input.dispatchMouseEvent',{type:'mousePressed',...button,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',...button,button:'left',clickCount:1});
      await sleep(150);
      assert.equal(await evaluate("document.querySelectorAll('.whiteboard-text-field').length"),1);
      const field=await evaluate("(()=>{const r=document.querySelector('.whiteboard-text-field').getBoundingClientRect();return {x:r.x+35,y:r.y+40,width:r.width,height:r.height}})()");
      assert(field.width>100&&field.height>50);
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x:field.x,y:field.y,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:field.x,y:field.y,button:'left',clickCount:1});
      assert.equal(await evaluate("document.activeElement.className"),'whiteboard-text-field');
      await send('Input.insertText',{text:'Dies ist ein echter Tastaturtest.'});
      assert.equal(await evaluate("document.querySelector('.whiteboard-text-field').value"),'Dies ist ein echter Tastaturtest.');
      assert.equal(await evaluate('whiteboard.snapshot().objects[0].text'),'Dies ist ein echter Tastaturtest.');
      await shot('text-input-real');
      assert.deepEqual(errors,[]);
      console.log('Textfeld über echten Mausklick erzeugt, fokussiert und per Tastatureingabe beschrieben.');
      return;
    }
    if(process.env.DOCK_TEXT_ONLY) {
      const config=await evaluate('classroomView.snapshot()');
      config.moduleLayout={version:1,items:{
        task:{x:.04,y:160,width:.22,height:220,z:22},
        countdown:{x:.62,y:160,width:.22,height:220,z:21}
      }};
      await send('Page.navigate',{url:'about:blank'});await send('Page.navigate',{url:url+'#ansicht='+encodeURIComponent(JSON.stringify(config))});await sleep(800);
      const rect=selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right}})()`);
      const a=await rect('#taskModule'),b=await rect('#countdownModule'),grip=await rect('#taskModule .move-grip');
      const start={x:grip.x+12,y:grip.y+12},end={x:b.x-a.width-12+7+(start.x-a.x),y:b.y+6+(start.y-a.y)};
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...start});
      await send('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',...end,button:'left',buttons:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',...end,button:'left',clickCount:1});
      assert.deepEqual(await evaluate('moduleLayout.snapshot().items.task.dock'),{target:'countdown',side:'left'});
      let first=await rect('#taskModule'),second=await rect('#countdownModule');
      assert(Math.abs(first.right+12-second.x)<1);assert(Math.abs(first.y-second.y)<1);
      await evaluate("document.querySelector('#countdownModule .move-grip').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))");
      first=await rect('#taskModule');second=await rect('#countdownModule');
      assert(Math.abs(first.right+12-second.x)<1);
      assert.equal(await evaluate("document.getElementById('whiteboardText')"),null);
      await click('#whiteboardAddText');
      await evaluate("{const field=document.querySelector('.whiteboard-text-field');field.value="+JSON.stringify('Direkt auf der Tafel\nZweite Zeile')+";field.dispatchEvent(new Event('input'));}");
      await evaluate("document.querySelector('.text-field-grip').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));document.querySelector('.text-field-size').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));");
      assert.equal(await evaluate('whiteboard.snapshot().objects[0].width'),330);
      const snapshot=await evaluate('classroomView.snapshot()');
      const html=await evaluate('classroomView.exportHtml()');
      assert(await evaluate("new DOMParser().parseFromString(classroomView.exportHtml(),'text/html').querySelectorAll('.whiteboard-text-field').length===0"));
      fs.writeFileSync(path.join(__dirname,'dock-text-test.html'),html);
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'dock-text-test.html')).href});await sleep(500);
      assert.equal(await evaluate('document.querySelectorAll(".whiteboard-text-field").length'),1);
      assert.equal(await evaluate("document.querySelector('.whiteboard-text-field').value"),'Direkt auf der Tafel\nZweite Zeile');
      assert.deepEqual(await evaluate('moduleLayout.snapshot().items.task.dock'),snapshot.moduleLayout.items.task.dock);
      first=await rect('#taskModule');second=await rect('#countdownModule');
      assert(Math.abs(first.right+12-second.x)<1);
      await evaluate("document.querySelector('#countdownModule .module-size').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',shiftKey:true,bubbles:true}))");
      assert.equal(await evaluate('Boolean(moduleLayout.snapshot().items.task.dock)'),true);
      await evaluate("document.querySelector('#countdownModule .module-size').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',shiftKey:true,bubbles:true}))");
      first=await rect('#taskModule');second=await rect('#countdownModule');
      assert(first.height<second.height); // Shared edges do not stretch unrelated content heights in 0.5.
      await evaluate("document.getElementById('whiteboardModule').scrollIntoView({block:'center'})");
      await shot('inline-text-fields');
      assert.deepEqual(errors,[]);
      console.log('Magnetisches Andocken außen, feste Nachbarbindung, automatische Größenanpassung, Textfelder auf der Tafel und Export-Wiederherstellung geprüft.');
      return;
    }
    if(process.env.MODULES_ONLY) {
      await click('[data-module-choice=whiteboard]');
      assert.equal(await evaluate("document.getElementById('boardToggle')"),null);
      assert.equal(await evaluate("document.querySelectorAll('[data-board]').length"),await evaluate("document.querySelectorAll('.module-size').length"));
      const rect=selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
      const mic=await rect('[data-board=microphone] .move-grip');
      const world=await rect('.world');
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x:mic.x+12,y:mic.y+12,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:world.x+world.width*.4,y:world.y+world.height*.45,button:'left',buttons:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:world.x+world.width*.4,y:world.y+world.height*.45,button:'left',clickCount:1});
      assert.equal(await evaluate("document.querySelector('[data-board=microphone]').parentElement.id"),'moduleLayer');
      assert(await evaluate("document.querySelector('[data-module-home=microphone]').hidden"));
      assert.equal(await evaluate("document.querySelector('[data-module-home=microphone]').getBoundingClientRect().height"),0);
      await evaluate("document.querySelector('[data-board=whiteboard] .module-size').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))");
      assert(await evaluate("moduleLayout.isFree('whiteboard')"));
      await evaluate("document.getElementById('whiteboardModule').scrollIntoView({block:'center'})");
      await click('#whiteboardAddText');
      await evaluate("const field=document.querySelector('.whiteboard-text-field');field.value='Gemeinsam lernen';field.dispatchEvent(new Event('input'))");
      assert.equal(await evaluate("whiteboard.snapshot().objects[0].text"),'Gemeinsam lernen');
      await change('whiteboardTool','value','pen');
      const area=await rect('#whiteboardCanvas');
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x:area.x+area.width*.1,y:area.y+area.height*.4,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:area.x+area.width*.3,y:area.y+area.height*.6,button:'left',buttons:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:area.x+area.width*.3,y:area.y+area.height*.6,button:'left',clickCount:1});
      assert.equal(await evaluate("whiteboard.snapshot().objects.filter(o=>o.type==='stroke').length"),1);
      const photo=await evaluate("(()=>{const c=document.createElement('canvas');c.width=80;c.height=50;const g=c.getContext('2d');g.fillStyle='orange';g.fillRect(0,0,80,50);return c.toDataURL()})()");
      const photoPath=path.join(__dirname,'whiteboard-photo.png');
      fs.writeFileSync(photoPath,Buffer.from(photo.split(',')[1],'base64'));
      const doc=await send('DOM.getDocument');
      const input=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#whiteboardPhoto'});
      await send('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[photoPath]});
      await sleep(300);
      assert.equal(await evaluate("whiteboard.snapshot().objects.filter(o=>o.type==='image').length"),1);
      const photoArea=await rect('#whiteboardCanvas');
      const oldPhotoX=await evaluate("whiteboard.snapshot().objects.find(o=>o.type==='image').x");
      await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:photoArea.x+photoArea.width*.5,y:photoArea.y+photoArea.height*.5,id:1}]});
      await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:photoArea.x+photoArea.width*.55,y:photoArea.y+photoArea.height*.53,id:1}]});
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await send('Emulation.setTouchEmulationEnabled',{enabled:false});
      assert((await evaluate("whiteboard.snapshot().objects.find(o=>o.type==='image').x"))>oldPhotoX);
      const snapshot=await evaluate('classroomView.snapshot()');
      await click('#saveView');await click('#shareView');
      const shared=await value('shareLink');
      const html=await evaluate('classroomView.exportHtml()');
      fs.writeFileSync(path.join(__dirname,'modules-test.html'),html);
      await shot('modules-whiteboard');
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'modules-test.html')).href});await sleep(500);
      assert.deepEqual(await evaluate('whiteboard.snapshot()'),snapshot.whiteboard);
      assert.deepEqual(await evaluate('moduleLayout.snapshot()'),snapshot.moduleLayout);
      assert.equal(await evaluate("document.querySelectorAll('.module-size').length"),5);
      await click('#whiteboardUndo');
      await send('Page.navigate',{url:shared});await sleep(500);
      assert.deepEqual(await evaluate('whiteboard.snapshot()'),snapshot.whiteboard);
      await click('#resetLayout');
      assert.equal(await evaluate('Object.keys(moduleLayout.snapshot().items).length'),0);
      await click('#whiteboardClear');
      assert.equal(await evaluate('whiteboard.snapshot().objects.length'),0);
      await click('#whiteboardUndo');
      assert.equal(await evaluate('whiteboard.snapshot().objects.length'),3);
      assert.deepEqual(errors,[]);
      console.log('Normale Ansicht: alle Module verschiebbar und skalierbar; Tafel mit Text, Zeichnung, lokalem Foto, Undo, Speichern, HTML und Ansichtslink geprüft.');
      return;
    }

    if(process.env.ALARM_ONLY) {
      await evaluate("window.alarmStarts=0;const original=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){const node=original.call(this),start=node.start.bind(node);node.start=(...args)=>{alarmStarts++;return start(...args)};return node}");
      await click('#countdownStart');await sleep(250);
      await evaluate("window.clock=Date.now();Date.now=()=>clock+301000");
      await sleep(350);
      assert.equal(await label('countdownDisplay'),'00:00');
      assert.equal(await evaluate('alarmStarts'),3);
      await sleep(450);
      assert.equal(await evaluate('alarmStarts'),3);
      await change('countdownSound','checked',false);
      await click('#countdownReset');await click('#countdownStart');
      await evaluate("clock+=301000");await sleep(350);
      assert.equal(await evaluate('alarmStarts'),3);
      assert.equal(await label('countdownDisplay'),'00:00');
      await click('#countdownReset');await click('#countdownStart');await click('#countdownStart');
      await evaluate("clock+=301000");await sleep(350);
      assert.equal(await evaluate('alarmStarts'),3);
      assert.equal(await label('countdownDisplay'),'05:00');
      const html=await evaluate('classroomView.exportHtml()');
      fs.writeFileSync(path.join(__dirname,'alarm-test.html'),html);
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'alarm-test.html')).href});
      await sleep(350);
      assert.equal(await evaluate("document.getElementById('countdownSound').checked"),false);
      assert.deepEqual(errors,[]);
      console.log('Countdown-Signal: drei Töne einmalig bei Ablauf, stumm ohne Ton, Pause ohne Auslösung und Export der Einstellung geprüft.');
      return;
    }
    if(process.env.LAVA_ONLY) {
      await click('[data-world=lava]');
      await step(.1);
      assert(await evaluate("document.getElementById('unlockPreview').disabled"));
      const average=()=>evaluate("(()=>{const c=document.getElementById('scene'),ctx=c.getContext('2d'),scale=Math.min(c.clientWidth/340,c.clientHeight/590),dpr=c.width/c.clientWidth,x=c.width/2-35*scale*dpr,y=c.height/2+125*scale*dpr,d=ctx.getImageData(x,y,70*scale*dpr,25*scale*dpr).data,s=[0,0,0];for(let i=0;i<d.length;i+=4){s[0]+=d[i];s[1]+=d[i+1];s[2]+=d[i+2]}return s})()");
      await click('#demo');
      await step(2);
      const green=await average();assert(green[1]>green[0]);
      const first=await evaluate("document.getElementById('scene').toDataURL()");
      await step(3);
      assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),first);
      await click('[data-demo=yellow]');await step(2);
      const yellow=await average();assert(yellow[0]>yellow[1]&&yellow[1]>yellow[2]);
      await click('[data-demo=red]');await step(2);
      const red=await average();assert(red[0]>red[1]*1.5);
      const preview=await evaluate("document.getElementById('scene').toDataURL()");
      fs.writeFileSync(path.join(__dirname,'lavalampe.png'),Buffer.from(preview.split(',')[1],'base64'));
      assert.equal(await score(),29);
      const exported=await evaluate('classroomView.exportHtml()');
      fs.writeFileSync(path.join(__dirname,'lava-test.html'),exported);
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'lava-test.html')).href});
      await sleep(350);
      assert.equal(await evaluate('klassenampel.snapshot().world'),'lava');
      await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
      await step(.1);
      await sleep(180);
    assert.equal(await evaluate('document.documentElement.scrollWidth'),360);
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await step(8);
      const still=await evaluate("document.getElementById('scene').toDataURL()");
      await step(2);
      assert.equal(await evaluate("document.getElementById('scene').toDataURL()"),still);
      assert.deepEqual(errors,[]);
      console.log('Lavalampe: Bewegung, Grün/Gelb/Rot über Demo, unveränderter Punktestand, Export, Mobilansicht und reduzierte Bewegung geprüft.');
      return;
    }
    if(process.env.SCREENSAVER_ONLY) {
      assert.equal(await evaluate("document.getElementById('details-screensaver')"),null);
      assert(await evaluate("document.getElementById('neutralOptions').hidden"));
      await click('[data-world=neutral]');
      assert.equal(await evaluate("document.getElementById('neutralOptions').hidden"),false);
      await click('[data-world=lava]');
      assert(await evaluate("document.getElementById('neutralOptions').hidden"));
      await click('[data-world=neutral]');
      await click('#startScreensaver');await step(.1);
      assert(await evaluate("document.body.classList.contains('screensaver')"));
      assert.equal(await evaluate('klassenampel.snapshot().world'),'neutral');
      const before=await evaluate("document.getElementById('scene').toDataURL()");
      await step(12);
      assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),before);
      assert.equal(await evaluate("document.querySelector('[data-board=microphone]').getBoundingClientRect().width"),0);
      assert(await evaluate("document.getElementById('exitScreensaver').getBoundingClientRect().width>0"));
      await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await step(.1);
      const still=await evaluate("document.getElementById('scene').toDataURL()");
      await step(12);
      assert.equal(await evaluate("document.getElementById('scene').toDataURL()"),still);
      const exported=await evaluate('classroomView.exportHtml()');
      fs.writeFileSync(path.join(__dirname,'screensaver-test.html'),exported);
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'screensaver-test.html')).href});
      await sleep(350);
      assert(await evaluate("document.body.classList.contains('screensaver')"));
      assert(await evaluate("document.getElementById('neutralAnimation').checked"));
      await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))");
      assert.equal(await evaluate("document.body.classList.contains('screensaver')"),false);
      await click('#startScreensaver');await click('#exitScreensaver');
      assert.equal(await evaluate("document.body.classList.contains('screensaver')"),false);
      assert.deepEqual(errors,[]);
      console.log('Neutraler Bildschirmschoner: Animation, reduzierte Bewegung, Bedienansicht, HTML-Export und beide Rückwege geprüft.');
      return;
    }
    if(process.env.PREVIEW_ONLY) {
      for(const world of ['aquarium','city','space','fantasy','nature']) {
        await click(`[data-world=${world}]`);
        assert.equal(await evaluate("document.getElementById('unlockPreview').options.length"),14);
        for(const count of [0,1,6,12]) {
          await change('unlockPreview','value',String(count));await step(.1);
          assert.equal(await score(),29);
          assert.equal(await evaluate('klassenampel.snapshot().previewCount'),count);
          assert.match(await label('worldDesc'),/Vorschau/);
        }
      }
      const exported=await evaluate('classroomView.exportHtml()');
      fs.writeFileSync(path.join(__dirname,'preview-test.html'),exported);
      await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'preview-test.html')).href});
      await sleep(350);
      assert.equal(await value('unlockPreview'),'12');
      assert.equal(await score(),29);
      await change('unlockPreview','value','live');await step(.1);
      assert.equal(await evaluate('klassenampel.snapshot().previewCount'),null);
      await click('[data-world=neutral]');
      assert(await evaluate("document.getElementById('unlockPreview').disabled"));
      assert.deepEqual(errors,[]);
      console.log('Manuelle Freischaltungsvorschau in fünf Welten: alle Ausbaustufen ohne Punkteänderung, HTML-Export und Rückkehr zum Spielstand geprüft.');
      return;
    }
    if(process.env.WORLDS_ONLY) {
      const previews=[];
      for(const mode of ['primary','college']) {
        await change('age','value',mode);
        for(const world of ['aquarium','space','fantasy','nature']) {
          const frames=[];
          for(const points of [0,30,60,90,120,150,180,210,240,270,300,330,360]) {
            await evaluate(`klassenampel.restore({world:'${world}',score:${points},remaining:900})`);
            await step(.1);
            frames.push(await evaluate("document.getElementById('scene').toDataURL()"));
          }
          assert.equal(new Set(frames).size,13);
          const scene=frames.at(-1);
          fs.writeFileSync(path.join(__dirname,'refined-'+world+'-'+mode+'.png'),Buffer.from(scene.split(',')[1],'base64'));
          if(mode==='primary')previews.push({world,src:scene});
          await step(1);
          assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),scene);
          await click('#worldAction');await step(.1);
          assert((await label('actionStatus')).length>10);
          assert.equal(await score(),360);
          await step(7);
        }
      }
      const sheet=await evaluate(`(async()=>{
        const scenes=${JSON.stringify(previews)};
        const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=840;
        const ctx=canvas.getContext('2d');
        for(let i=0;i<scenes.length;i++){
          const img=new Image();img.src=scenes[i].src;await img.decode();
          const x=i%2*600,y=Math.floor(i/2)*420;
          ctx.drawImage(img,x,y,600,420);
          ctx.fillStyle='#102337dd';ctx.fillRect(x+15,y+15,150,35);
          ctx.fillStyle='#f0eee4';ctx.font='20px system-ui';
          ctx.fillText({aquarium:'Aquarium',space:'Weltraum',fantasy:'Fantasy',nature:'Natur'}[scenes[i].world],x+27,y+39);
        }
        return canvas.toDataURL();
      })()`);
      fs.writeFileSync(path.join(__dirname,'refined-worlds.png'),Buffer.from(sheet.split(',')[1],'base64'));
      await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
      for(const world of ['aquarium','space','fantasy','nature']) {
        await click(`[data-world=${world}]`);await step(.1);
        assert.equal(await evaluate('document.documentElement.scrollWidth'),360);
      }
      assert.deepEqual(errors,[]);
      console.log('Vier Welten, 13 Fortschrittsstände, beide Grafikstile, Animationen, Aktionen und 360-px-Ansicht geprüft.');
      return;
    }
    if(process.env.CITY_ONLY) {
      const frames=[];
      await click('[data-world=city]');
      for(const mode of ['primary','college']) {
        await change('age','value',mode);
        for(const points of [0,30,90,180,360]) {
          await evaluate(`klassenampel.restore({world:'city',score:${points},remaining:900})`);
          await step(.1);
          frames.push(await evaluate("document.getElementById('scene').toDataURL()"));
        }
        const city=await evaluate("document.getElementById('scene').toDataURL()");
        fs.writeFileSync(path.join(__dirname,'bauhaus-'+mode+'.png'),Buffer.from(city.split(',')[1],'base64'));
        await click('#worldAction');await step(.1);
        assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),city);
        await step(7);
      }
      assert.equal(new Set(frames).size,10);
      await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
      await step(.1);
      assert.equal(await evaluate('document.documentElement.scrollWidth'),360);
      await shot('bauhaus-mobile');
      for(const world of ['aquarium','space','fantasy','nature','neutral']) {
        await click(`[data-world=${world}]`);await step(.1);
      }
      assert.deepEqual(errors,[]);
      console.log('Bauhaus-Stadt: fünf Ausbaustufen in beiden Grafikstilen, Abendlicht, 360-px-Ansicht und Wechsel zwischen allen Welten geprüft.');
      return;
    }
    if(process.env.BACKGROUND_ONLY) {
      await click('#demo');await click('#play');
      await evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))");
      assert.equal(await label('play'),'Pause');
      await evaluate("jump(1)");
      await sleep(350);
      assert.equal(await score(),30);
      assert.equal(await label('timeLeft'),'14:59');
      await evaluate("jump(60)");
      await sleep(350);
      assert.equal(await score(),90);
      assert.equal(await label('timeLeft'),'13:59');
      await click('#play');
      await evaluate("jump(10)");
      await sleep(350);
      assert.equal(await score(),90);
      assert.equal(await label('timeLeft'),'13:59');
      await click('#countdownStart');
      await evaluate("Date.now=()=>9999999999999");
      await sleep(350);
      assert.equal(await label('countdownDisplay'),'00:00');
      assert.deepEqual(errors,[]);
      console.log('Hintergrund ohne Animationsframes: Spielzeit und Punkte laufen weiter, Pause bleibt wirksam, Countdown endet korrekt.');
      return;
    }
    await evaluate("document.getElementById('taskText').value='Lest Seite 12.\\nBearbeitet die Aufgaben 1 bis 3.'; document.getElementById('taskText').dispatchEvent(new Event('input'))");
    await change('countdownMinutes','value','1');
    await click('#countdownStart');
    await evaluate("Date.now=()=>9999999999999");
    await sleep(300);
    assert.equal(await label('countdownDisplay'),'00:00');
    assert.match(await label('countdownStatus'),/abgelaufen/);
    await click('#countdownReset');
    assert.equal(await label('countdownDisplay'),'01:00');
    assert(await evaluate("document.getElementById('worldTitle').hidden"));
    assert(await evaluate("document.getElementById('moduleDock').contains(document.getElementById('taskModule'))"));
    await evaluate("document.querySelector('[data-drag=taskModule]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))");
    const moved=await evaluate("document.getElementById('taskModule').offsetLeft");
    const handle=await evaluate("(()=>{const r=document.querySelector('[data-drag=taskModule]').getBoundingClientRect();return {x:r.x+20,y:r.y+12}})()");
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...handle});
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...handle,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:handle.x-35,y:handle.y+20,button:'left',buttons:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:handle.x+35,y:handle.y+20,button:'left',clickCount:1});
    assert((await evaluate("document.getElementById('taskModule').offsetLeft"))<moved-25);
    await evaluate("document.querySelector('[data-drag=taskModule]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}))");
    const finalLeft=await evaluate("document.getElementById('taskModule').offsetLeft");
    await change('fontFamily','value','Georgia');
    await evaluate("document.getElementById('fontFamily').dispatchEvent(new Event('input'))");
    for(const [id,size] of [['uiFontSize','19'],['taskFontSize','28'],['clockFontSize','60']]) {
      await change(id,'value',size);
      await evaluate(`document.getElementById('${id}').dispatchEvent(new Event('input'))`);
    }
    assert.equal(await evaluate("getComputedStyle(document.getElementById('taskText')).fontSize"),'28px');
    assert.equal(await evaluate("getComputedStyle(document.getElementById('countdownDisplay')).fontSize"),'60px');
    await dragModule('countdownModule',true);
    assert.equal(await evaluate("document.getElementById('countdownModule').parentElement.id"),'moduleLayer');
    await click('[data-collapse=countdownModule]');
    assert(await evaluate("document.querySelector('#countdownModule .module-body').hidden"));
    await click('[data-collapse=taskModule]');
    assert(await evaluate("document.querySelector('#taskModule .module-body').hidden"));
    await click('[data-collapse=taskModule]');
    await click('#saveView');
    await click('#shareView');
    const shared=await value('shareLink');
    assert(shared.includes('#ansicht='));
    const exported=await evaluate("classroomView.exportHtml()");
    assert(exported.includes('id="viewConfig"'));
    fs.writeFileSync(path.join(__dirname,'export-test.html'),exported);
    await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'export-test.html')).href});
    await sleep(400);
    assert.match(await value('taskText'),/Seite 12/);
    assert.equal(await label('countdownDisplay'),'01:00');
    assert(Math.abs((await evaluate("document.getElementById('taskModule').offsetLeft"))-finalLeft)<2);
    assert.equal(await value('fontFamily'),'Georgia');
    assert.equal(await evaluate("getComputedStyle(document.getElementById('taskText')).fontSize"),'28px');
    assert.equal(await score(),29);
    assert.equal(await evaluate("document.getElementById('countdownModule').parentElement.id"),'moduleLayer');
    assert.equal(await value('uiFontSize'),'19');
    assert.equal(await value('clockFontSize'),'60');
    await click('#resetFonts');
    assert.equal(await evaluate("getComputedStyle(document.getElementById('taskText')).fontSize"),'20px');
    if(process.env.FONTS_ONLY) {
      assert.deepEqual(errors,[]);
      console.log('Schriftart, drei Schriftgrößen, Zurücksetzen und Wiederherstellung über HTML und Link erfolgreich.');
      return;
    }
    assert(await evaluate("document.querySelector('#countdownModule .module-body').hidden"));
    await click('[data-collapse=countdownModule]');
    await dragModule('countdownModule',false);
    assert(await evaluate("document.getElementById('moduleLayer').contains(document.getElementById('countdownModule'))"));
    await send('Page.navigate',{url:shared});
    await sleep(400);
    assert.match(await value('taskText'),/Seite 12/);
    assert.equal(await label('countdownDisplay'),'01:00');
    assert.equal(await evaluate("document.getElementById('countdownModule').parentElement.id"),'moduleLayer');
    await evaluate("localStorage.removeItem('klassenampel-view')");
    await send('Page.navigate',{url});
    await sleep(400);
    await click('#play');
    assert.match(await label('announcement'),/Mikrofon oder Demo/);
    await click('#demo');
    await click('#play');
    await step(1);
    assert.equal(await score(),30);
    assert.equal(await label('items'),'1');
    assert.equal(await label('timeLeft'),'14:59');
    assert.match(await label('announcement'),/Clownfisch/);
    await step(15);
    assert.equal(await score(),45);
    await click('[data-demo=yellow]');
    await step(2);
    assert.equal(await score(),45);
    await click('[data-demo=red]');
    await step(4.9);
    assert.equal(await score(),45);
    await step(.1);
    assert.equal(await score(),29);
    assert.equal(await label('items'),'0');
    assert.match(await label('penStatus'),/20 s/);
    await step(19.9);
    assert.equal(await score(),29);
    await step(.1);
    assert.equal(await score(),14);
    await click('[data-demo=green]');
    await step(2);
    await click('#undoPenalty');
    assert.equal(await score(),31);
    await click('#play');
    const paused = await label('timeLeft');
    await step(2);
    assert.equal(await label('timeLeft'),paused);
    await change('penEnabled','checked',false);
    await change('age','value','college');
    assert.equal(await value('age'),'college');
    assert.equal(await evaluate("document.getElementById('penEnabled').checked"),true);
    await change('age','value','primary');
    assert.equal(await evaluate("document.getElementById('penEnabled').checked"),false);
    await click('#play');
    await click('[data-demo=red]');
    await step(25);
    assert.equal(await score(),31);

    // Seed the older save format with enough points to display all six landmarks.
    await evaluate("localStorage.setItem('klassenampel-v02', JSON.stringify({score:180,world:'aquarium',age:'primary',work:'silent'}))");
    await send('Page.reload');
    await sleep(400);
    assert.equal(await score(),180);
    const signatures=[];
    for(const mode of ['primary','college']) {
      await change('age','value',mode);
      for(const world of ['aquarium','city','space','fantasy','nature']) {
        await click(`[data-world=${world}]`);
        await step(.1);
        assert.equal(await evaluate("document.querySelector('[data-world][aria-pressed=true]').dataset.world"),world);
        const frame=await evaluate("document.getElementById('scene').toDataURL()");
        assert(frame.length>4000);
        signatures.push(frame);
        await step(1);
        assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),frame);
        if(world==='aquarium'&&mode==='primary') await shot('cartoon-desktop');
        const beforeAction=await evaluate("document.getElementById('scene').toDataURL()");
        await click('#worldAction');
        await step(.1);
        assert.notEqual(await evaluate("document.getElementById('scene').toDataURL()"),beforeAction);
        assert((await label('actionStatus')).length>15);
        assert.equal(await score(),180);
        if(world==='city'&&mode==='primary') await shot('city-event');
        await step(6.2);
        assert.equal(await label('actionStatus'),'');
      }
    }
    assert.equal(new Set(signatures).size,10);
    await click('[data-world=neutral]');
    await step(.1);
    const neutralFrame=await evaluate("document.getElementById('scene').toDataURL()");
    await step(3);
    assert.equal(await evaluate("document.getElementById('scene').toDataURL()"),neutralFrame);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.discovery')).display"),'none');
    assert.equal(await evaluate("getComputedStyle(document.getElementById('pointsBadge').parentElement).display"),'none');
    assert(await evaluate("classroomView.snapshot().game.world==='neutral'"));
    await click('[data-world=nature]');
    await step(.1);
    assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.discovery')).display"),'none');
    const fullWidth=await evaluate("document.getElementById('scene').width");
    await change('age','value','primary');
    await step(.1);
    assert(await evaluate("document.getElementById('scene').width") > fullWidth*2);
    await click('#projector');
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-board=microphone]')).display"),'none');
    await click('#projector');
    await send('Emulation.setDeviceMetricsOverride',{width:360,height:800,deviceScaleFactor:1,mobile:true});
    await change('age','value','college');
    await click('[data-world=fantasy]');
    await step(.1);
    assert.equal(await evaluate('document.documentElement.scrollWidth'),360);
    await shot('pixel-mobile');
    await change('duration','value','5');
    await click('#demo'); await click('#play');
    await step(180);
    assert.equal(await score(),360);
    assert.match(await label('actionStatus'),/Drache/);
    await step(120);
    assert.equal(await label('timeLeft'),'00:00');
    assert.equal(await label('play'),'Neue Runde');
    assert.equal(await score(),480);
    assert.match(await label('announcement'),/Runde beendet/);
    await click('#play');
    assert.equal(await label('timeLeft'),'05:00');
    await click('#reset');
    assert.equal(await score(),0);
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
    await send('Page.reload');
    await sleep(350);
    assert.equal(await score(),0);
    await click('#start');
    for(let i=0;i<30&&!((await label('micState')).includes('Mikrofon aktiv'));i++) await sleep(150);
    assert.match(await label('micState'),/Mikrofon aktiv/);
    assert.equal(await label('start'),'Mikrofon stoppen');
    await sleep(750);
    assert.match(await label('status'),/^Rot/);
    await change('sensitivity','value','1');
    await sleep(650);
    assert.match(await label('status'),/^Grün/);
    await click('#play');
    await sleep(1250);
    assert(await score()>=1);
    await click('#calibrate'); await sleep(5150);
    assert.match(await label('calibration'),/Grundpegel ermittelt/);
    await click('#start');
    assert.match(await label('micState'),/Mikrofon aus/);
    await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'../index.html')).href});
    await sleep(350);
    assert.equal(await label('play'),'Runde starten');
    await click('#demo'); await click('#play');
    await sleep(1300);
    assert(await score()>=1);
    assert.deepEqual(errors,[]);
    console.log('Edge: 10 animierte Szenen, 360 px, alte Spielstände, Timer, Demo, Probe-Mikrofon, Kalibrierung, Punkte, Konsequenzen und Reset erfolgreich.');
  } finally {
    ws?.close();
    browser.kill();
    server.closeAllConnections();
    server.close();
  }
}
verify().catch(error=>{ console.error(error); process.exitCode=1; });
