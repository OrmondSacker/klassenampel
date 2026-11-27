(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const canvas=$('whiteboardCanvas'),g=canvas.getContext('2d');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const images=new Map();
  const textFields=new Map(),rasterLayers=new Map();
  let boardRevision=0;
  let objects=[],selected=null,gesture=null;
  const undo=[];
  const status=message=>$('whiteboardStatus').textContent=message;
  function snapshot(){return {version:1,objects:structuredClone(objects)};}
  function remember(){undo.push(structuredClone(objects));if(undo.length>30)undo.shift();}
  function persist(){
    try{localStorage.setItem('klassenampel-whiteboard',JSON.stringify(snapshot()));}
    catch{status('Der Browserspeicher ist voll oder gesperrt. Bitte die Ansicht als HTML exportieren.');}
  }
  function deleteSelected(){
    if(!selected||!objects.includes(selected))return;
    remember();objects=objects.filter(obj=>obj!==selected);selected=null;draw();persist();status('Ausgewähltes Objekt gelöscht.');
  }
  function imageFor(src){
    if(images.has(src))return images.get(src);
    const image=new Image();images.set(src,image);
    image.onload=draw;image.onerror=()=>status('Ein gespeichertes Foto konnte nicht geladen werden.');
    image.src=src;return image;
  }
  function bounds(obj){
    if(obj.type==='image')return {x:obj.x,y:obj.y,width:obj.width,height:obj.height};
    if(obj.type==='text'){
      g.font=obj.size+'px '+getComputedStyle(canvas).fontFamily;
      return {x:obj.x,y:obj.y-obj.size,width:obj.width||320,height:obj.height||Math.max(70,obj.text.split('\n').length*obj.size*1.25+24)};
    }
    const xs=obj.points.map(p=>p.x),ys=obj.points.map(p=>p.y);
    return {x:Math.min(...xs)-obj.width,y:Math.min(...ys)-obj.width,width:Math.max(...xs)-Math.min(...xs)+obj.width*2,height:Math.max(...ys)-Math.min(...ys)+obj.width*2};
  }
  function bindTextHandle(handle,obj,resize){
    let moving=null;
    handle.onpointerdown=event=>{
      if(event.button!==0)return;
      remember();selected=obj;
      moving={point:point(event),x:obj.x,y:obj.y,width:obj.width,height:obj.height};
      handle.setPointerCapture(event.pointerId);event.preventDefault();event.stopPropagation();draw();
    };
    handle.onpointermove=event=>{
      if(!moving)return;
      const p=point(event),dx=p.x-moving.point.x,dy=p.y-moving.point.y;
      if(resize){obj.width=clamp(moving.width+dx,90,1000-obj.x);obj.height=clamp(moving.height+dy,45,600-obj.y+obj.size);}
      else {obj.x=clamp(moving.x+dx,0,1000-obj.width);obj.y=clamp(moving.y+dy,obj.size,600-obj.height+obj.size);}
      draw();
    };
    const end=event=>{
      if(!moving)return;
      if(event.type==='pointercancel'){obj.x=moving.x;obj.y=moving.y;obj.width=moving.width;obj.height=moving.height;}
      moving=null;draw();persist();
    };
    handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=end;
    handle.onkeydown=event=>{
      const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!d)return;
      event.preventDefault();remember();
      if(resize){obj.width=clamp(obj.width+d[0]*10,90,1000-obj.x);obj.height=clamp(obj.height+d[1]*10,45,600-obj.y+obj.size);}
      else {obj.x=clamp(obj.x+d[0]*10,0,1000-obj.width);obj.y=clamp(obj.y+d[1]*10,obj.size,600-obj.height+obj.size);}
      draw();persist();
    };
  }
  function syncTextFields(){
    for(const [obj,box]of textFields)if(!objects.includes(obj)){box.remove();textFields.delete(obj);}
    const scale=canvas.clientWidth/1000;
    for(const obj of objects.filter(o=>o.type==='text')){
      obj.width=clamp(obj.width||320,90,1000);
      obj.height=clamp(obj.height||Math.max(75,obj.size*2.8),45,600);
      obj.x=clamp(obj.x,0,1000-obj.width);obj.y=clamp(obj.y,obj.size,600-obj.height+obj.size);
      let box=textFields.get(obj);
      if(!box){
        box=document.createElement('div');box.className='whiteboard-text-box';
        const handle=document.createElement('button');handle.textContent='⠿';handle.type='button';handle.className='text-field-grip';handle.setAttribute('aria-label','Textfeld verschieben');
        const input=document.createElement('textarea');input.className='whiteboard-text-field';input.maxLength=2000;input.placeholder='Hier schreiben …';input.setAttribute('aria-label','Text auf der Tafel');
        input.onfocus=()=>{
          remember();selected=obj;$('whiteboardFontSize').value=obj.size;$('whiteboardColor').value=obj.color;draw();
        };
        input.oninput=()=>{obj.text=input.value;persist();};
        const size=document.createElement('button');size.textContent='↘';size.type='button';size.className='text-field-size';size.setAttribute('aria-label','Textfeldgröße ändern');
        const remove=document.createElement('button');remove.textContent='×';remove.type='button';remove.className='text-field-delete';remove.setAttribute('aria-label','Textfeld löschen');
        remove.onclick=()=>{selected=obj;deleteSelected();};
        box.append(handle,input,size,remove);$('whiteboardTextLayer').append(box);
        textFields.set(obj,box);bindTextHandle(handle,obj,false);bindTextHandle(size,obj,true);
      }
      box.style.left=obj.x/10+'%';box.style.top=(obj.y-obj.size)/6+'%';
      box.style.width=obj.width/10+'%';box.style.height=obj.height/6+'%';
      box.classList.toggle('selected',selected===obj);
      const input=box.querySelector('textarea');
      if(input.value!==obj.text)input.value=obj.text;
      box.style.zIndex=objects.indexOf(obj)*2+2;box.style.pointerEvents=['select','text'].includes($('whiteboardTool').value)?'auto':'none';
      input.style.fontSize=obj.size*scale+'px';input.style.color=obj.color;input.style.fontFamily=obj.fontFamily||'inherit';input.style.fontWeight=obj.bold?'700':'400';input.style.fontStyle=obj.italic?'italic':'normal';input.style.textDecoration=obj.underline?'underline':'none';input.style.textAlign=obj.align||'left';
      input.style.opacity=obj.opacity??1;
      box.style.backgroundColor='rgba(251,246,233,'+(.92*(obj.opacity??1))+')';
    }
  }
  function paintStroke(ctx,obj){
    ctx.strokeStyle=obj.color;ctx.lineWidth=obj.width*(obj.brush==='marker'?1.8:1);ctx.lineCap=obj.brush==='marker'?'butt':'round';ctx.lineJoin='round';
    ctx.setLineDash(obj.brush==='chalk'?[Math.max(1,obj.width*.35),Math.max(1,obj.width*.3)]:[]);
    ctx.beginPath();obj.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    if(obj.points.length===1)ctx.lineTo(obj.points[0].x+.01,obj.points[0].y);ctx.stroke();
  }
  function renderRasterLayers(){
    for(const [obj,layer]of rasterLayers)if(!objects.includes(obj)){layer.remove();rasterLayers.delete(obj);}
    objects.forEach((obj,index)=>{
      if(obj.type==='text'||obj.erase)return;
      let layer=rasterLayers.get(obj);if(!layer){layer=document.createElement('canvas');layer.className='whiteboard-object-layer';layer.setAttribute('aria-hidden','true');layer.onpointerdown=event=>canvas.onpointerdown(event);$('whiteboardTextLayer').append(layer);rasterLayers.set(obj,layer);}
      const raw=bounds(obj),r={x:clamp(raw.x,0,999),y:clamp(raw.y,0,599)};r.width=Math.max(1,Math.min(1000,raw.x+raw.width)-r.x);r.height=Math.max(1,Math.min(600,raw.y+raw.height)-r.y);
      layer.style.left=r.x/10+'%';layer.style.top=r.y/6+'%';layer.style.width=r.width/10+'%';layer.style.height=r.height/6+'%';layer.style.zIndex=index*2+2;layer.classList.toggle('selected',selected===obj);
      layer.width=Math.ceil(r.width*2);layer.height=Math.ceil(r.height*2);const ctx=layer.getContext('2d');ctx.setTransform(2,0,0,2,-r.x*2,-r.y*2);ctx.globalAlpha=obj.opacity??1;
      if(obj.type==='stroke')paintStroke(ctx,obj);else{const image=imageFor(obj.src);if(image.complete&&image.naturalWidth)ctx.drawImage(image,obj.x,obj.y,obj.width,obj.height);}
      for(const erase of objects.slice(index+1).filter(o=>o.type==='stroke'&&o.erase)){ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=erase.opacity??1;paintStroke(ctx,erase);}
    });
  }
  function draw(){
    g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,1000,600);
    renderRasterLayers();
    if(selected&&selected.type!=='text'&&objects.includes(selected)){
      const r=bounds(selected);
      g.strokeStyle='#258f9b';g.lineWidth=2;g.setLineDash([6,4]);g.strokeRect(r.x-4,r.y-4,r.width+8,r.height+8);g.setLineDash([]);
      if(selected.type==='image'){g.fillStyle='#258f9b';g.fillRect(r.x+r.width-6,r.y+r.height-6,12,12);}
    }
    $('whiteboardModule').classList.toggle('object-idle',!selected);$('whiteboardModule').classList.toggle('text-selected',selected?.type==='text');
    $('whiteboardUndo').disabled=!undo.length;
    $('whiteboardDelete').disabled=!selected;
    $('whiteboardOpacity').disabled=!selected;
    $('whiteboardOpacity').value=selected?Math.round((1-(selected.opacity??1))*100):0;
    $('whiteboardPhotoControls').hidden=selected?.type!=='image';
    if(selected?.type==='image')$('whiteboardPhotoSize').value=Math.round(selected.width/10);
    for(const id of ['whiteboardBack','whiteboardFront','whiteboardShrink','whiteboardGrow'])$(id).disabled=!selected;
    $('whiteboardTextControls').hidden=selected?.type!=='text';
    if(selected?.type==='text'){
      $('whiteboardTextFont').value=selected.fontFamily||'inherit';$('whiteboardTextAlign').value=selected.align||'left';
      for(const [id,key]of [['whiteboardBold','bold'],['whiteboardItalic','italic'],['whiteboardUnderline','underline']])$(id).setAttribute('aria-pressed',String(selected[key]===true));
    }
    const choices=$('whiteboardObjects');choices.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Objekt auswählen …';choices.append(empty);
    objects.forEach((obj,index)=>{if(obj.erase)return;const option=document.createElement('option');option.value=String(index);option.textContent=obj.type==='text'?'Text: '+(obj.text.slice(0,32)||'Leer'):obj.type==='image'?(obj.sourceName||'Foto '+(index+1)):'Strich '+(index+1);choices.append(option);});
    choices.value=selected?String(objects.indexOf(selected)):'';
    syncTextFields();
  }
  function point(event){
    const r=canvas.getBoundingClientRect();
    return {x:clamp((event.clientX-r.left)/r.width*1000,0,1000),y:clamp((event.clientY-r.top)/r.height*600,0,600)};
  }
  function textAt(p){
    if(!$('whiteboardFontSize').reportValidity())return;
    remember();
    const size=Number($('whiteboardFontSize').value);
    selected={type:'text',x:clamp(p.x,0,680),y:clamp(p.y,size,500),text:'',width:320,height:Math.max(120,size*1.5+28),color:$('whiteboardColor').value,size,opacity:1};
    objects.push(selected);$('whiteboardTool').value='select';draw();persist();
    textFields.get(selected).querySelector('textarea').focus();
    status('Direkt im Textfeld schreiben. Am Griff verschieben und am Pfeil vergrößern.');
  }
  canvas.onpointerdown=event=>{
    if(event.button!==0)return;
    const p=point(event),tool=$('whiteboardTool').value;
    canvas.focus({preventScroll:true});
    if(tool==='select'&&selected?.type==='image'&&Math.abs(p.x-selected.x-selected.width)<18&&Math.abs(p.y-selected.y-selected.height)<18){
      remember();gesture={type:'image-resize',p,initial:structuredClone(selected)};
      canvas.setPointerCapture(event.pointerId);event.preventDefault();return;
    }
    if(tool==='text'){textAt(p);return;}
    if(tool==='select'){
      selected=[...objects].reverse().find(obj=>{
        if(obj.erase)return false;
        const r=bounds(obj);return p.x>=r.x&&p.x<=r.x+r.width&&p.y>=r.y&&p.y<=r.y+r.height;
      })||null;
      if(selected){
        remember();gesture={type:'move',p,initial:structuredClone(selected)};
      }
    }else{
      remember();
      selected=null;
      const stroke={type:'stroke',erase:tool==='eraser',color:$('whiteboardColor').value,width:Number($('whiteboardWidth').value)*(tool==='eraser'?4:1),points:[p],opacity:tool==='marker'?.35:1,...(['marker','chalk'].includes(tool)?{brush:tool}:{})};
      objects.push(stroke);gesture={type:'stroke',stroke};
    }
    canvas.setPointerCapture(event.pointerId);event.preventDefault();draw();
  };
  canvas.onpointermove=event=>{
    if(!gesture)return;
    const p=point(event);
    if(gesture.type==='stroke')gesture.stroke.points.push(p);
    else if(gesture.type==='image-resize'){
      const initial=gesture.initial,ratio=initial.width/initial.height;
      selected.width=clamp(initial.width+p.x-gesture.p.x,40,Math.max(40,Math.min(1000-selected.x,(600-selected.y)*ratio)));
      selected.height=selected.width/ratio;
    }
    else {
      const dx=p.x-gesture.p.x,dy=p.y-gesture.p.y,initial=gesture.initial;
      if(selected.type==='stroke')selected.points=initial.points.map(q=>({x:clamp(q.x+dx,0,1000),y:clamp(q.y+dy,0,600)}));
      else {const r=bounds(selected);selected.x=clamp(initial.x+dx,0,Math.max(0,1000-r.width));selected.y=clamp(initial.y+dy,0,Math.max(0,600-r.height));}
    }
    draw();
  };
  const finish=event=>{
    if(!gesture)return;
    if(event.type==='pointercancel'&&undo.length){objects=undo.pop();selected=null;}
    if(event.type!=='pointercancel'&&gesture?.type==='stroke'&&!gesture.stroke.erase)selected=gesture.stroke;
    gesture=null;draw();persist();
  };
  canvas.onpointerup=finish;canvas.onpointercancel=finish;canvas.onlostpointercapture=finish;
  $('whiteboardTool').onchange=()=>{selected=null;draw();};
  $('whiteboardAddText').onclick=()=>textAt({x:80,y:90});
  $('whiteboardFontSize').onchange=()=>{
    if(selected?.type!=='text'||!$('whiteboardFontSize').reportValidity())return;
    remember();const top=selected.y-selected.size;selected.size=Number($('whiteboardFontSize').value);selected.y=top+selected.size;draw();persist();
  };
  $('whiteboardColor').addEventListener('change',()=>{
    if(!selected||selected.type==='image')return;
    remember();selected.color=$('whiteboardColor').value;draw();persist();
  });
  $('whiteboardWidth').addEventListener('change',()=>{if(selected?.type!=='stroke')return;remember();selected.width=Number($('whiteboardWidth').value);draw();persist();});
  $('whiteboardObjects').onchange=()=>{selected=objects[Number($('whiteboardObjects').value)]||null;if($('whiteboardObjects').value==='')selected=null;$('whiteboardTool').value='select';if(selected?.type==='text'){$('whiteboardFontSize').value=selected.size;$('whiteboardColor').value=selected.color;}else if(selected?.type==='stroke'){$('whiteboardColor').value=selected.color;$('whiteboardWidth').value=clamp(selected.width,2,24);}draw();};
  function changeSelected(change){if(!selected)return;remember();change(selected);draw();persist();}
  for(const [id,key]of [['whiteboardBold','bold'],['whiteboardItalic','italic'],['whiteboardUnderline','underline']])$(id).onclick=()=>{if(selected?.type==='text')changeSelected(obj=>obj[key]=!obj[key]);};
  $('whiteboardTextFont').onchange=()=>{if(selected?.type==='text')changeSelected(obj=>obj.fontFamily=$('whiteboardTextFont').value);};
  $('whiteboardTextAlign').onchange=()=>{if(selected?.type==='text')changeSelected(obj=>obj.align=$('whiteboardTextAlign').value);};
  function changeLayer(front){if(!selected)return;remember();objects=objects.filter(obj=>obj!==selected);if(front)objects.push(selected);else objects.unshift(selected);draw();persist();}
  $('whiteboardFront').onclick=()=>changeLayer(true);$('whiteboardBack').onclick=()=>changeLayer(false);
  function resizeObject(factor){
    changeSelected(obj=>{const r=bounds(obj);factor=Math.min(factor,(1000-r.x)/Math.max(1,r.width),(600-r.y)/Math.max(1,r.height));
      if(obj.type==='stroke'){obj.points=obj.points.map(p=>({x:r.x+(p.x-r.x)*factor,y:r.y+(p.y-r.y)*factor}));obj.width=clamp(obj.width*factor,1,96);}
      else if(obj.type==='text'){obj.width=clamp(obj.width*factor,90,1000-obj.x);obj.height=clamp(obj.height*factor,45,600-r.y);obj.size=Math.round(clamp(obj.size*factor,12,96));obj.y=r.y+obj.size;$('whiteboardFontSize').value=Math.round(obj.size);}
      else{obj.width=Math.max(20,obj.width*factor);obj.height=obj.width/(r.width/r.height);}
    });
  }
  $('whiteboardShrink').onclick=()=>resizeObject(.9);$('whiteboardGrow').onclick=()=>resizeObject(1.1);
  document.querySelectorAll('[data-board-color]').forEach(button=>button.onclick=()=>{$('whiteboardColor').value=button.dataset.boardColor;$('whiteboardColor').dispatchEvent(new Event('change'));});
  $('whiteboardAddPhoto').onclick=()=>$('whiteboardPhoto').click();
  $('whiteboardDelete').onclick=deleteSelected;
  document.addEventListener('keydown',event=>{
    if(event.key!=='Delete'||!selected||['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)||event.target.isContentEditable)return;
    if(!$('whiteboardModule').contains(event.target))return;
    event.preventDefault();deleteSelected();
  });
  $('whiteboardOpacity').oninput=()=>{
    if(!selected)return;
    remember();selected.opacity=1-Number($('whiteboardOpacity').value)/100;draw();persist();
  };
  $('whiteboardPhotoSize').oninput=()=>{
    if(selected?.type!=='image')return;
    remember();const ratio=selected.width/selected.height;
    selected.width=clamp(Number($('whiteboardPhotoSize').value)*10,40,Math.min(1000,600*ratio));
    selected.height=selected.width/ratio;
    selected.x=clamp(selected.x,0,1000-selected.width);selected.y=clamp(selected.y,0,600-selected.height);
    draw();persist();
  };
  $('whiteboardUndo').onclick=()=>{if(!undo.length)return;objects=undo.pop();selected=null;draw();persist();};
  $('whiteboardClear').onclick=()=>{
    if(!objects.length||!confirm('Tafelinhalt leeren?'))return;
    remember();objects=[];selected=null;draw();persist();status('Tafel geleert.');
  };
  $('whiteboardPhoto').onchange=async()=>{
    const file=$('whiteboardPhoto').files?.[0];
    if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){
      status('Bitte ein PNG-, JPEG- oder WebP-Foto bis 12 MB wählen.');$('whiteboardPhoto').value='';return;
    }
    const revision=boardRevision;const url=URL.createObjectURL(file);
    try{
      const image=new Image();image.src=url;await image.decode();
      const scale=Math.min(1,1280/Math.max(image.naturalWidth,image.naturalHeight));
      const buffer=document.createElement('canvas');
      buffer.width=Math.max(1,Math.round(image.naturalWidth*scale));buffer.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const context=buffer.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,buffer.width,buffer.height);
      context.drawImage(image,0,0,buffer.width,buffer.height);
      const width=Math.min(400,360*buffer.width/buffer.height),height=width*buffer.height/buffer.width;
      if(revision!==boardRevision)return;remember();
      selected={type:'image',src:buffer.toDataURL('image/jpeg',.84),x:(1000-width)/2,y:(600-height)/2,width,height,opacity:1};
      objects.push(selected);$('whiteboardTool').value='select';draw();persist();
      status('Foto lokal eingefügt. Mit „Verschieben“ anordnen.');
    }catch{status('Das Foto konnte nicht geöffnet werden.');}
    finally{URL.revokeObjectURL(url);$('whiteboardPhoto').value='';}
  };
  let pdfRuntimePromise=null,pdfDocument=null,pdfLoading=null,pdfRender=null,pdfRevision=0,pdfPageRevision=0,pdfName='';
  function closePdf(){
    pdfRevision++;pdfPageRevision++;if(pdfRender){pdfRender.cancel();pdfRender=null;}
    if(pdfLoading){void pdfLoading.destroy().catch(()=>{});}pdfDocument=null;pdfLoading=null;
    if($('pdfDialog').open)$('pdfDialog').close();$('pdfInsert').disabled=true;
  }
  async function pdfRuntime(){
    if(!pdfRuntimePromise)pdfRuntimePromise=(async()=>{
      const bundle=JSON.parse($('pdfRuntime').textContent);
      const url=encoded=>URL.createObjectURL(new Blob([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],{type:'text/javascript'}));
      const engineUrl=url(bundle.engine),workerUrl=url(bundle.worker);
      try{const engine=await import(engineUrl);engine.GlobalWorkerOptions.workerSrc=workerUrl;return engine;}
      finally{URL.revokeObjectURL(engineUrl);}
    })();
    return pdfRuntimePromise;
  }
  async function previewPdf(){
    if(!pdfDocument)return;
    const pageRevision=++pdfPageRevision;
    $('pdfInsert').disabled=true;
    if(!$('pdfPage').reportValidity())return;
    const revision=pdfRevision,pageNumber=Number($('pdfPage').value);
    if(pdfRender){pdfRender.cancel();pdfRender=null;}
    $('pdfInsert').disabled=true;$('pdfStatus').textContent='Seite wird vorbereitet …';
    try{
      const page=await pdfDocument.getPage(pageNumber);if(revision!==pdfRevision||pageRevision!==pdfPageRevision)return;
      const size=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(2,1600/Math.max(size.width,size.height))});
      const target=$('pdfPreview');target.width=Math.ceil(viewport.width);target.height=Math.ceil(viewport.height);
      const task=page.render({canvasContext:target.getContext('2d'),viewport,background:'#ffffff',intent:'print'});pdfRender=task;await task.promise;
      if(revision!==pdfRevision||pageRevision!==pdfPageRevision||pdfRender!==task)return;pdfRender=null;
      $('pdfStatus').textContent=pdfName+' · Seite '+pageNumber+' von '+pdfDocument.numPages;$('pdfInsert').disabled=false;
    }catch(error){if(revision===pdfRevision&&pageRevision===pdfPageRevision&&error.name!=='RenderingCancelledException')$('pdfStatus').textContent='Diese PDF-Seite konnte nicht dargestellt werden.';}
  }
  $('whiteboardAddPdf').onclick=()=>$('whiteboardPdf').click();
  $('pdfClose').onclick=closePdf;$('pdfDialog').addEventListener('cancel',closePdf);$('pdfPage').onchange=previewPdf;
  $('whiteboardPdf').onchange=async()=>{
    const file=$('whiteboardPdf').files?.[0];if(!file)return;
    $('whiteboardPdf').value='';
    if(file.size>20*1024*1024||(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf')){status('Bitte eine PDF-Datei bis 20 MB wählen.');return;}
    closePdf();const revision=pdfRevision;pdfName=file.name.slice(0,120);$('pdfPage').value='1';$('pdfPageCount').textContent='';$('pdfStatus').textContent='PDF wird lokal geöffnet …';$('pdfDialog').showModal();
    try{
      const engine=await pdfRuntime();const data=new Uint8Array(await file.arrayBuffer());if(revision!==pdfRevision)return;
      const loading=engine.getDocument({data,isEvalSupported:false,useSystemFonts:true,useWorkerFetch:false});pdfLoading=loading;
      pdfLoading.onPassword=()=>{$('pdfStatus').textContent='Diese PDF ist passwortgeschützt. Bitte eine ungeschützte Kopie verwenden.';void loading.destroy().catch(()=>{});};
      const doc=await loading.promise;if(revision!==pdfRevision){void loading.destroy().catch(()=>{});return;}pdfDocument=doc;
      $('pdfPage').max=doc.numPages;$('pdfPageCount').textContent='von '+doc.numPages;await previewPdf();
    }catch(error){if(revision===pdfRevision&&!$('pdfStatus').textContent.includes('passwortgeschützt'))$('pdfStatus').textContent='Die PDF konnte nicht geöffnet werden. Bitte eine gültige, ungeschützte PDF wählen.';}
  };
  $('pdfInsert').onclick=()=>{
    if($('pdfInsert').disabled||!pdfDocument)return;
    const target=$('pdfPreview'),ratio=target.width/target.height,width=Math.min(800,500*ratio),height=width/ratio;
    remember();selected={type:'image',src:target.toDataURL('image/jpeg',.9),sourceName:pdfName+' · Seite '+$('pdfPage').value,x:(1000-width)/2,y:(600-height)/2,width,height,opacity:1};
    objects.push(selected);$('whiteboardTool').value='select';draw();persist();status('PDF-Seite eingefügt. Weitere Seiten können einzeln ergänzt werden.');
  };
  let saved=window.initialWhiteboardState;
  if(!saved)try{saved=JSON.parse(localStorage.getItem('klassenampel-whiteboard')||'null');}catch{}
  function restore(saved){
    boardRevision++;closePdf();objects=[];selected=null;gesture=null;undo.length=0;images.clear();
  if(saved?.version===1&&Array.isArray(saved.objects)){
    for(const obj of saved.objects){
      if(obj.type==='stroke'&&Array.isArray(obj.points)&&Number.isFinite(obj.width)&&/^#[0-9a-f]{6}$/i.test(obj.color)){
        const points=obj.points.filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y)).map(p=>({x:clamp(p.x,0,1000),y:clamp(p.y,0,600)}));
        if(points.length)objects.push({type:'stroke',points,width:clamp(obj.width,1,96),color:obj.color,erase:obj.erase===true,...(['marker','chalk'].includes(obj.brush)?{brush:obj.brush}:{}),opacity:Number.isFinite(obj.opacity)?clamp(obj.opacity,0,1):1});
      }else if(obj.type==='text'&&typeof obj.text==='string'&&[obj.x,obj.y,obj.size].every(Number.isFinite)&&/^#[0-9a-f]{6}$/i.test(obj.color)){
        objects.push({type:'text',text:obj.text.slice(0,2000),x:clamp(obj.x,0,1000),y:clamp(obj.y,0,600),size:clamp(obj.size,12,96),color:obj.color,...(['inherit','Arial','Georgia','Consolas'].includes(obj.fontFamily)?{fontFamily:obj.fontFamily}:{}),...(['left','center','right'].includes(obj.align)?{align:obj.align}:{}),...Object.fromEntries(['bold','italic','underline'].filter(key=>typeof obj[key]==='boolean').map(key=>[key,obj[key]])),width:Number.isFinite(obj.width)?clamp(obj.width,90,1000):320,height:Number.isFinite(obj.height)?clamp(obj.height,45,600):100,opacity:Number.isFinite(obj.opacity)?clamp(obj.opacity,0,1):1});
      }else if(obj.type==='image'&&typeof obj.src==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(obj.src)&&[obj.x,obj.y,obj.width,obj.height].every(Number.isFinite)){
        objects.push({type:'image',src:obj.src,...(typeof obj.sourceName==='string'?{sourceName:obj.sourceName.slice(0,140)}:{}),x:clamp(obj.x,0,1000),y:clamp(obj.y,0,600),width:clamp(obj.width,1,1000),height:clamp(obj.height,1,600),opacity:Number.isFinite(obj.opacity)?clamp(obj.opacity,0,1):1});
      }
    }
  }
    draw();
  }
  restore(saved);
  window.whiteboard={
    restore:state=>{restore(state);persist();},snapshot,
    prepareExport:clone=>{clone.querySelector('#whiteboardTextLayer')?.replaceChildren();clone.querySelector('#pdfDialog')?.removeAttribute('open');clone.querySelector('#whiteboardObjects')?.replaceChildren();clone.querySelector('#pdfStatus').textContent='';clone.querySelector('#pdfPageCount').textContent='';clone.querySelector('#pdfInsert').disabled=true;}
  };
  new MutationObserver(draw).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
  new ResizeObserver(syncTextFields).observe(canvas);
  draw();
})();
