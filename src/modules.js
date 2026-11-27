(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const root=document.querySelector('main');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const names={mainScreen:'Spielwelt',task:'Aufgabe',countdown:'Countdown',hud:'Spielstand',signal:'Ampelstatus',discoveries:'Entdeckungen',microphone:'Lautstärkeampel',round:'Spielrunde',worldPicker:'Spielwelt',sharing:'Speichern und Teilen',unlocks:'Freischaltungen',modules:'Module',screensaver:'Bildschirmschoner',fonts:'Schrift',teaching:'Unterricht',penalties:'Konsequenzen',calibration:'Mikrofonabgleich',whiteboard:'Tafel'};
  document.querySelectorAll('details').forEach((el,i)=>{
    if(!el.id)el.id=el.dataset.board?'details-'+el.dataset.board:'details-view-'+i;
  });
  const entries=Array.from(document.querySelectorAll('[data-board]'),el=>({id:el.dataset.board,el,home:null}));
  const depth=el=>{let n=0;for(let p=el.parentElement;p;p=p.parentElement)n++;return n;};
  entries.sort((a,b)=>depth(b.el)-depth(a.el));
  const layer=document.createElement('div');layer.id='moduleLayer';root.append(layer);
  let items={},appearance={},colors={},locked={},visible={},preset='world',topLayer=20,automatic=false;
  const history=[];
  const minimum={mainScreen:[320,600],microphone:[260,220],task:[240,170],countdown:[210,260],whiteboard:[320,300]};
  const minimumHeight=entry=>entry.el.tagName==='DETAILS'&&!entry.el.open?60:minimum[entry.id][1];
  const baseColors=new Map(entries.map(entry=>[entry.id,getComputedStyle(entry.el).backgroundColor]));
  const gap=12,snapDistance=18,sizeTolerance=12;
  let restoring=true;
  function canDock(id,target){
    const visited=new Set([id]);
    for(let next=target;next;next=items[next]?.dock?.target??items[next]?.parent?.target??entries.find(e=>e.id===next)?.el.parentElement?.closest('[data-board]')?.dataset.board){
      if(visited.has(next))return false;
      visited.add(next);
    }
    return true;
  }
  function edgePosition(rect,side,width,height){
    if(side==='left')return {x:rect.left-gap-width,y:rect.top};
    if(side==='right')return {x:rect.right+gap,y:rect.top};
    if(side==='top')return {x:rect.left,y:rect.top-gap-height};
    return {x:rect.left,y:rect.bottom+gap};
  }
  function areaRect(el){
    const r=el.getBoundingClientRect(),base=root.getBoundingClientRect();
    return {left:r.left-base.left,top:r.top-base.top,right:r.right-base.left,bottom:r.bottom-base.top,width:r.width,height:r.height};
  }
  function contains(a,b){
    return a.width>b.width+8&&a.height>b.height+8&&b.left>=a.left-2&&b.top>=a.top-2&&b.right<=a.right+2&&b.bottom<=a.bottom+2;
  }
  function parentFor(entry){
    if(!['task','countdown','whiteboard'].includes(entry.id))return;
    const parent=entries.find(e=>e.id==='mainScreen');
    if(parent&&parent!==entry&&contains(areaRect(parent.el.querySelector('.world')),areaRect(entry.el)))return {entry:parent,rect:areaRect(parent.el)};
  }
  function assignParent(entry){
    const p=items[entry.id];if(!p||p.dock)return;delete p.parent;
    const parent=parentFor(entry);if(!parent)return;
    const r=areaRect(entry.el);p.parent={target:parent.entry.id,x:(r.left-parent.rect.left)/parent.rect.width,y:(r.top-parent.rect.top)/parent.rect.height};
  }
  function adoptChildren(){} // Group membership is explicit; overlap never adopts unrelated modules.
  function remember(){history.push(snapshot());if(history.length>20)history.shift();$('layoutUndo').disabled=false;}
  function applyAppearance(entry){
    const opacity=1-(appearance[entry.id]||0)/100;
    entry.el.style.setProperty('--module-opacity',opacity);
    entry.el.style.setProperty('--module-accent',colors[entry.id]||'#7196ad');
    entry.el.classList.toggle('module-locked',locked[entry.id]===true);
    if(['mainScreen','microphone','whiteboard'].includes(entry.id))entry.el.hidden=visible[entry.id]===false;
    if(Object.hasOwn(appearance,entry.id)){
      const numbers=baseColors.get(entry.id).match(/[\d.]+/g);
      if(numbers?.length>=3)entry.el.style.backgroundColor='rgba('+numbers.slice(0,3).join(',')+','+opacity*(numbers[3]===undefined?1:Number(numbers[3]))+')';
    }
  }
  function snap(entry,resize){
    const p=items[entry.id],width=root.clientWidth;
    delete p.dock;
    const own={x:p.x*width,y:p.y,width:p.width*width,height:p.height};
    let best=null;
    for(const other of entries){
      if(other===entry||entry.el.contains(other.el)||other.el.hidden||getComputedStyle(other.el).display==='none'||!canDock(entry.id,other.id))continue;
      const r=areaRect(other.el);
      if(resize){
        if(Math.abs(own.width-r.width)<=sizeTolerance)p.width=r.width/width;
        if(Math.abs(own.height-r.height)<=sizeTolerance)p.height=r.height;
        continue;
      }
      for(const side of ['left','right','top','bottom']){
        const horizontal=side==='left'||side==='right';
        const ratio=horizontal?own.height/r.height:own.width/r.width;
        if(ratio<.5||ratio>2)continue;
        const candidateWidth=horizontal?own.width:r.width,candidateHeight=own.height;
        const candidate=edgePosition(r,side,candidateWidth,candidateHeight);
        const distance=Math.max(Math.abs(candidate.x-own.x),Math.abs(candidate.y-own.y));
        if(candidate.x<0||candidate.x+candidateWidth>width||candidate.y<0||distance>snapDistance)continue;
        if(!best||distance<best.distance)best={target:other.id,side,distance,width:candidateWidth,height:candidateHeight,...candidate};
      }
    }
    if(best){p.x=best.x/width;p.y=best.y;p.width=best.width/width;p.height=best.height;delete p.parent;p.dock={target:best.target,side:best.side};}
    else if(!resize){
      if(p.x*width<=snapDistance)p.x=0;
      else if(width-(p.x*width+own.width)<=snapDistance)p.x=Math.max(0,1-own.width/width);
      if(p.y<=snapDistance)p.y=0;
    }
    entry.el.classList.toggle('module-snapped',Boolean(best));
  }
  function snapshot(){return {version:2,items:structuredClone(items),appearance:{...appearance},colors:{...colors},locked:{...locked},visible:Object.fromEntries(entries.map(e=>[e.id,!e.el.hidden])),preset,automatic};}
  function persist(){
    try{localStorage.setItem('klassenampel-modules',JSON.stringify(snapshot()));}catch{}
  }
  function refresh(){
    const width=root.clientWidth;
    for(const entry of entries) {
      applyAppearance(entry);
      const p=items[entry.id];
      if(!p)continue;
      const size=Math.min(width,Math.max(Math.min(width,minimum[entry.id][0]),p.width*width));
      entry.el.style.width=size+'px';entry.el.style.height=Math.max(minimumHeight(entry),p.height)+'px';
      entry.el.style.left=clamp(p.x*width,0,Math.max(0,width-size))+'px';
      entry.el.style.top=p.y+'px';
      entry.el.style.zIndex=entry.id==='mainScreen'?1:p.z;
    }
    if(!restoring){
      const resolved=new Set();
      function place(entry){
        if(resolved.has(entry.id))return;
        resolved.add(entry.id);
        const nativeParent=entry.el.parentElement?.closest('[data-board]');
        if(nativeParent){const ancestor=entries.find(other=>other.id===nativeParent.dataset.board);if(ancestor)place(ancestor);}
        const p=items[entry.id];
        const relation=p?.dock??p?.parent;
        if(!relation)return;
        const target=entries.find(other=>other.id===relation.target);
        if(!target||!canDock(entry.id,target.id)){delete p.dock;delete p.parent;return;}
        place(target);
        const r=areaRect(target.el),own=entry.el.getBoundingClientRect();
        if(!r.width||!r.height)return;
        if(p.parent&&!p.dock){
          p.z=Math.max(p.z,Number(target.el.style.zIndex||1)+1);topLayer=Math.max(topLayer,p.z);entry.el.style.zIndex=p.z;
          const childWidth=Math.min(own.width,Math.max(80,r.width-16)),childHeight=Math.min(p.height,Math.max(60,r.height-16));
          p.width=childWidth/width;p.height=childHeight;
          p.x=(r.left+clamp(p.parent.x*r.width,0,Math.max(0,r.width-childWidth)))/width;
          p.y=r.top+clamp(p.parent.y*r.height,0,Math.max(0,r.height-childHeight));
          entry.el.style.width=childWidth+'px';entry.el.style.height=childHeight+'px';
          entry.el.style.left=p.x*width+'px';entry.el.style.top=p.y+'px';return;
        }
        if(p.dock.side==='top'||p.dock.side==='bottom'){p.width=r.width/width;entry.el.style.width=r.width+'px';}
        const current=entry.el.getBoundingClientRect();
        const position=edgePosition(r,p.dock.side,current.width,current.height);
        if(position.x<0||position.x+current.width>width||position.y<0){delete p.dock;return;}
        p.x=position.x/width;p.y=position.y;
        entry.el.style.left=position.x+'px';entry.el.style.top=position.y+'px';
      }
      entries.forEach(place);
    }
    root.classList.toggle('free-layout',Object.keys(items).length>0);
    root.style.minHeight=Object.keys(items).length?Math.max(0,...Object.values(items).map(p=>p.y+p.height+30))+'px':'';
  }
  function detach(entry){
    if(items[entry.id])return;
    const rect=entry.el.getBoundingClientRect(),area=root.getBoundingClientRect();
    const placeholder=document.createElement('span');
    placeholder.dataset.moduleHome=entry.id;
    placeholder.hidden=true;
    entry.el.before(placeholder);entry.home=placeholder;
    items[entry.id]={x:clamp((rect.left-area.left)/root.clientWidth,0,1),y:Math.max(0,rect.top-area.top),width:rect.width/root.clientWidth,height:rect.height,z:entry.id==='mainScreen'?1:++topLayer};
    entry.el.classList.add('free-module');layer.append(entry.el);
    refresh();
  }
  function restoreEntry(entry){
    if(!entry.home)return;
    entry.home.before(entry.el);entry.home.remove();entry.home=null;
    entry.el.classList.remove('free-module');
    for(const key of ['width','height','left','top','zIndex'])entry.el.style[key]='';
  }
  function reset(){
    remember();automatic=false;
    for(const entry of [...entries].reverse())restoreEntry(entry);
    items={};refresh();persist();
    window.dispatchEvent(new Event('resize'));
  }
  function autoArrange(record=true){
    if(record)remember();automatic=true;
    const roots=entries.filter(e=>!e.el.hidden&&e.el.getBoundingClientRect().width>0&&!items[e.id]?.parent&&!e.el.parentElement?.closest('[data-board]'));
    const order=preset==='board'?['whiteboard','mainScreen','microphone','task','countdown']:preset==='task'?['task','countdown','microphone','mainScreen','whiteboard']:['mainScreen','microphone','task','countdown','whiteboard'];
    roots.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
    // Fixing a group protects it and its embedded modules. Other groups stay below it.
    const width=root.clientWidth,margin=parseFloat(getComputedStyle(root).paddingLeft)||12,available=width-margin*2;
    const columns=available>1050?3:available>650?2:1,cell=(available-gap*(columns-1))/columns;
    const header=document.querySelector('.masthead').getBoundingClientRect(),base=root.getBoundingClientRect();
    const floor=Math.max(header.bottom-base.top+gap,...roots.filter(e=>locked[e.id]).map(e=>areaRect(e.el).bottom+gap));
    const heights=Array(columns).fill(floor);
    for(const entry of roots){
      if(locked[entry.id])continue;
      detach(entry);const p=items[entry.id];delete p.dock;delete p.parent;
      const span=['mainScreen','whiteboard'].includes(entry.id)?Math.min(2,columns):1;
      let column=0,y=Infinity;
      for(let start=0;start<=columns-span;start++){const top=Math.max(...heights.slice(start,start+span));if(top<y){y=top;column=start;}}
      const size=cell*span+gap*(span-1);p.width=size/width;p.x=(margin+column*(cell+gap))/width;p.y=y;
      entry.el.style.width=size+'px';entry.el.style.height='auto';
      p.height=Math.max(minimumHeight(entry),entry.el.getBoundingClientRect().height);
      for(let i=column;i<column+span;i++)heights[i]=y+p.height+gap;
    }
    refresh();persist();syncChoices();
  }
  function bind(handle,entry,resize){
    let drag=null;
    handle.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();});
    handle.onpointerdown=event=>{
      if(event.button!==0||locked[entry.id])return;
      remember();automatic=false;
      const rect=entry.el.getBoundingClientRect();
      detach(entry);
      adoptChildren(entry);
      drag={x:event.clientX,y:event.clientY,width:rect.width,height:rect.height,dx:event.clientX-rect.left,dy:event.clientY-rect.top,initial:{...items[entry.id]}};
      items[entry.id].z=entry.id==='mainScreen'?1:++topLayer;
      delete items[entry.id].parent;
      handle.setPointerCapture(event.pointerId);event.preventDefault();event.stopPropagation();refresh();
    };
    handle.onpointermove=event=>{
      if(!drag)return;
      const p=items[entry.id],rect=root.getBoundingClientRect(),width=root.clientWidth;
      if(resize){
        p.width=clamp((drag.width+event.clientX-drag.x)/width,Math.min(width,minimum[entry.id][0])/width,1);
        p.height=clamp(drag.height+event.clientY-drag.y,minimum[entry.id][1],3000);
      }else{
        p.x=clamp((event.clientX-rect.left-drag.dx)/width,0,Math.max(0,1-entry.el.offsetWidth/width));
        p.y=clamp(event.clientY-rect.top-drag.dy,0,20000);
      }
      if(!event.altKey)snap(entry,resize);
      else delete p.dock;
      document.querySelector('.world').classList.toggle('drop-target',Boolean(parentFor(entry)));
      refresh();
    };
    const end=event=>{
      if(!drag)return;
      if(event.type==='pointercancel')items[entry.id]=drag.initial;
      else assignParent(entry);
      drag=null;document.querySelector('.world').classList.remove('drop-target');entry.el.classList.remove('module-snapped');refresh();persist();
    };
    handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=end;
    handle.onkeydown=event=>{
      const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if(!d||locked[entry.id])return;
      remember();automatic=false;
      event.preventDefault();event.stopPropagation();detach(entry);
      adoptChildren(entry);
      const p=items[entry.id],step=event.shiftKey?30:10,width=root.clientWidth;
      delete p.dock;
      delete p.parent;
      if(resize){p.width=clamp(p.width+d[0]*step/width,Math.min(width,minimum[entry.id][0])/width,1);p.height=clamp(p.height+d[1]*step,minimum[entry.id][1],3000);}
      else {p.x=clamp(p.x+d[0]*step/width,0,Math.max(0,1-entry.el.offsetWidth/width));p.y=clamp(p.y+d[1]*step,0,20000);}
      p.z=entry.id==='mainScreen'?1:++topLayer;refresh();persist();
    };
  }
  for(const entry of entries){
    entry.el.classList.add('movable-module');
    const host=entry.el.tagName==='DETAILS'?entry.el.querySelector('summary'):entry.el;
    let handle=entry.el.querySelector(':scope > [data-drag]');
    if(!handle){
      handle=document.createElement('button');handle.textContent='⠿';host.prepend(handle);
    }
    handle.classList.add('move-grip');handle.type='button';
    handle.setAttribute('aria-label',(names[entry.id]||entry.id)+' verschieben');handle.title='Verschieben';
    const size=document.createElement('button');
    size.className='module-size';size.textContent='↘';size.type='button';
    size.setAttribute('aria-label',(names[entry.id]||entry.id)+' Größe ändern');size.title='Größe ändern';
    host.append(size);
    const properties=document.createElement('button');properties.type='button';properties.className='module-properties';properties.textContent='⋯';properties.setAttribute('aria-label',(names[entry.id]||entry.id)+' gestalten');
    properties.onclick=()=>{selectAppearance(entry.id);openMenu();$('appearanceSettings').open=true;$('appearanceTarget').focus();};host.append(properties);
    entry.el.addEventListener('pointerdown',()=>{entries.forEach(e=>e.el.classList.toggle('module-selected',e===entry));});
    bind(handle,entry,false);bind(size,entry,true);
  }
  function prepareExport(clone){
    for(const entry of [...entries].reverse()){
      const home=clone.querySelector('[data-module-home="'+entry.id+'"]');
      const el=clone.querySelector('[data-board="'+entry.id+'"]');
      if(home&&el){home.before(el);home.remove();}
      if(el){
        el.classList.remove('free-module','movable-module','module-snapped');
        for(const key of ['width','height','left','top','zIndex'])el.style[key]='';
        el.style.removeProperty('--module-opacity');el.style.removeProperty('--module-accent');el.style.removeProperty('background-color');el.classList.remove('module-selected','module-locked');
      }
    }
    clone.querySelector('#moduleLayer')?.remove();
    clone.querySelectorAll('.module-size').forEach(el=>el.remove());
    clone.querySelectorAll('.module-transparency,.module-appearance,.module-properties').forEach(el=>el.remove());
    clone.querySelectorAll('.move-grip:not([data-drag])').forEach(el=>el.remove());
    clone.querySelectorAll('.move-grip').forEach(el=>el.classList.remove('move-grip'));
    clone.querySelector('main').style.minHeight='';clone.querySelector('main').classList.remove('free-layout');
  }
  function load(saved){
    for(const entry of [...entries].reverse())restoreEntry(entry);items={};
    for(const entry of entries){entry.el.style.backgroundColor='';}
    appearance={};colors={};locked={};visible={};automatic=saved?.automatic===true;preset=['world','task','board'].includes(saved?.preset)?saved.preset:'world';
    for(const entry of entries){
      const id=entry.id;
      if(Number.isFinite(saved?.appearance?.[id]))appearance[id]=clamp(saved.appearance[id],0,100);
      if(/^#[0-9a-f]{6}$/i.test(saved?.colors?.[id]||''))colors[id]=saved.colors[id];
      locked[id]=saved?.locked?.[id]===true;visible[id]=saved?.visible?.[id]!==false;
      if(['task','countdown'].includes(id)&&typeof saved?.visible?.[id]==='boolean'){entry.el.hidden=!saved.visible[id];$(id==='task'?'showTask':'showCountdown').checked=saved.visible[id];}
      const p=saved?.items?.[id];
      if(![1,2].includes(saved?.version)||!p||![p.x,p.y,p.width,p.height,p.z].every(Number.isFinite))continue;
      detach(entry);items[id]={x:clamp(p.x,0,1),y:clamp(p.y,0,20000),width:clamp(p.width,.1,1),height:clamp(p.height,minimum[id][1],3000),z:clamp(p.z,1,10000)};
      if(p.dock&&entries.some(e=>e.id===p.dock.target)&&['left','right','top','bottom'].includes(p.dock.side))items[id].dock={...p.dock};
      if(p.parent?.target==='mainScreen'&&id!=='mainScreen'&&Number.isFinite(p.parent.x)&&Number.isFinite(p.parent.y))items[id].parent={target:'mainScreen',x:clamp(p.parent.x,0,1),y:clamp(p.parent.y,0,1)};
      topLayer=Math.max(topLayer,items[id].z);
    }
    $('layoutPreset').value=preset;syncFocusButton();refresh();
  }
  function openMenu(){ syncChoices();$('workspaceMenu').hidden=false;$('menuToggle').setAttribute('aria-expanded','true'); }
  function closeMenu(){ $('workspaceMenu').hidden=true;$('menuToggle').setAttribute('aria-expanded','false'); }
  $('menuToggle').onclick=()=>{if($('workspaceMenu').hidden)openMenu();else closeMenu();};
  $('menuClose').onclick=closeMenu;
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('workspaceMenu').hidden){closeMenu();$('menuToggle').focus();}});
  const checkboxes=new Map();
  for(const entry of [...entries].sort((a,b)=>['mainScreen','microphone','task','countdown','whiteboard'].indexOf(a.id)-['mainScreen','microphone','task','countdown','whiteboard'].indexOf(b.id))){
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.moduleChoice=entry.id;label.append(input,document.createTextNode(names[entry.id]));$('moduleChoices').append(label);checkboxes.set(entry.id,input);
    const option=document.createElement('option');option.value=entry.id;option.textContent=names[entry.id];$('appearanceTarget').append(option);
    input.onchange=()=>{
      remember();const old=entry.id==='task'?'showTask':entry.id==='countdown'?'showCountdown':null;
      if(old){$(old).checked=input.checked;$(old).dispatchEvent(new Event('change'));}
      else visible[entry.id]=input.checked;
      refresh();if(automatic)autoArrange(false);persist();syncChoices();
    };
  }
  function syncChoices(){for(const entry of entries)checkboxes.get(entry.id).checked=!entry.el.hidden;}
  function selectAppearance(id){$('appearanceTarget').value=id;$('moduleOpacity').value=appearance[id]||0;$('moduleColor').value=colors[id]||'#7196ad';$('moduleLocked').checked=locked[id]===true;}
  $('appearanceTarget').onchange=()=>selectAppearance($('appearanceTarget').value);
  $('moduleOpacity').oninput=()=>{const id=$('appearanceTarget').value;appearance[id]=Number($('moduleOpacity').value);refresh();persist();};
  $('moduleColor').oninput=()=>{colors[$('appearanceTarget').value]=$('moduleColor').value;refresh();persist();};
  $('moduleLocked').onchange=()=>{locked[$('appearanceTarget').value]=$('moduleLocked').checked;refresh();persist();};
  $('layoutUndo').onclick=()=>{const state=history.pop();if(state){load(state);persist();syncChoices();selectAppearance($('appearanceTarget').value);} $('layoutUndo').disabled=!history.length;};
  function syncFocusButton(){ $('swapFocus').setAttribute('aria-label',preset==='board'?'Spielwelt im Mittelpunkt anzeigen':'Tafel im Mittelpunkt anzeigen');$('swapFocus').title=preset==='board'?'Spielwelt im Mittelpunkt':'Tafel im Mittelpunkt';$('swapFocus').dataset.short=preset==='board'?'Spielwelt':'Tafel';$('swapFocus').textContent=preset==='board'?'Spielwelt im Mittelpunkt':'Tafel im Mittelpunkt';$('swapFocus').setAttribute('aria-pressed',String(preset==='board')); }
  $('swapFocus').onclick=()=>{
    remember();const toBoard=preset!=='board',game=entries.find(e=>e.id==='mainScreen'),board=entries.find(e=>e.id==='whiteboard');
    const active=toBoard?game:board,next=toBoard?board:game;
    const activeRect=areaRect(active.el),nextRect=areaRect(next.el),wasHidden=next.el.hidden;
    visible.mainScreen=true;visible.whiteboard=true;refresh();
    detach(game);detach(board);automatic=true;
    const padding=parseFloat(getComputedStyle(root).paddingLeft)||12;
    const top=document.querySelector('.masthead').offsetHeight+padding+12;
    const primary={x:clamp(activeRect.left/root.clientWidth,0,1),y:top,width:Math.max(.5,activeRect.width/root.clientWidth),height:Math.max(600,activeRect.height)};
    const secondary=wasHidden||nextRect.width<100||items[next.id]?.parent?{...primary,y:top+primary.height+12}:{x:nextRect.left/root.clientWidth,y:Math.max(top+primary.height+12,nextRect.top),width:nextRect.width/root.clientWidth,height:Math.max(300,nextRect.height)};
    for(const entry of [game,board]){delete items[entry.id].dock;delete items[entry.id].parent;}
    Object.assign(items[next.id],primary);Object.assign(items[active.id],secondary);
    preset=toBoard?'board':'world';$('layoutPreset').value=preset;syncFocusButton();refresh();persist();syncChoices();
    window.scrollTo({top:0,behavior:'instant'});
  };
  $('layoutPreset').onchange=()=>{remember();preset=$('layoutPreset').value;if(preset==='board')visible.whiteboard=true;syncFocusButton();autoArrange(false);};
  let saved=window.initialModuleLayout;if(!saved)try{saved=JSON.parse(localStorage.getItem('klassenampel-modules')||'null');}catch{}
  if(!saved)visible.whiteboard=false;
  restoring=false;
  load(saved??{version:2,visible:{whiteboard:false}});syncChoices();selectAppearance('mainScreen');
  if(saved?.version===1)$('layoutNotice').textContent='Ansicht aus 0.4 übernommen. Statusanzeigen und Einstellungen sind jetzt fest gruppiert.';
  window.moduleLayout={restore:saved=>{load(saved);history.length=0;$('layoutUndo').disabled=true;syncChoices();selectAppearance($('appearanceTarget').value);persist();},snapshot,prepareExport,isFree:id=>Boolean(items[id==='taskModule'?'task':id==='countdownModule'?'countdown':id]),reset,autoArrange};
  $('resetLayout').addEventListener('click',()=>{reset();syncChoices();});$('autoArrange').onclick=()=>autoArrange();
  let timer;window.addEventListener('resize',()=>{refresh();clearTimeout(timer);if(automatic)timer=setTimeout(()=>autoArrange(false),80);});
  // Settings are in a fixed menu; opening them must never reorder the classroom surface.
  const mic=entries.find(entry=>entry.id==='microphone');
  let lastMicOpen=mic.el.open;
  mic.el.addEventListener('toggle',()=>{
    if(lastMicOpen===mic.el.open)return;lastMicOpen=mic.el.open;
    const p=items.microphone;if(!p)return;
    mic.el.style.height='auto';p.height=Math.max(minimumHeight(mic),mic.el.getBoundingClientRect().height);
    if(automatic)autoArrange(false);else refresh();persist();
  });
  document.querySelectorAll('#showTask,#showCountdown').forEach(el=>el.addEventListener('change',()=>{syncChoices();if(automatic)autoArrange(false);}));
  let observationTimer;
  new ResizeObserver(()=>{clearTimeout(observationTimer);observationTimer=setTimeout(refresh,40);}).observe(root);
  refresh();
})();
