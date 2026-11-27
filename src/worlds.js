const worlds = {
  lava: {
    title: 'Lavalampe', cue: '', finds: [], extras: [], action: '', event: ''
  },
  neutral: {
    title: 'Neutral', cue: '', finds: [], extras: [], action: '', event: ''
  },
  aquarium: {
    title: 'Aquarium', cue: 'Ein Riff voller Leben',
    sky: ['#167fa2','#083660'], ground: ['#246b84','#12465f','#e2a66d'],
    finds: ['Clownfisch','Korallengarten','Qualle','Schildkröte','Schatztruhe','Mantarochen'],
    extras: ['Seegraswiese','Korallenbogen','Perlenpfad','Muschelbank','Riffhöhle','Leuchtplankton'],
    action: 'Fischschwarm rufen', event: 'Der Schwarm zieht in einer Runde über das Riff!'
  },
  city: {
    title: 'Städtebau', cue: 'Vom Dorf zur Stadt',
    sky: ['#4f96d5','#ffd5ad'], ground: ['#6e9b88','#4b8b80','#486761'],
    finds: ['Wohnhaus','Bäckerei','Stadtpark','Schule','Rathaus','Hochhaus'],
    extras: ['Straßenlaternen','Stadtbäume','Zebrastreifen','Marktstände','Brunnen','Lichterkette'],
    action: 'Stadtlichter einschalten', event: 'Die Fenster leuchten und die Stadt bekommt Abendverkehr.'
  },
  space: {
    title: 'Weltraum', cue: 'Aufbruch ins Sternenmeer',
    sky: ['#141838','#30245e'], ground: ['#302555','#3b3368','#524b7e'],
    finds: ['Ringplanet','Mondbasis','Satellit','Observatorium','Komet','Raumstation'],
    extras: ['Landebaken','Mondkrater','Sternbild','Eisfeld','Frachtkapseln','Nordlicht'],
    action: 'Flugmanöver starten', event: 'Das Raumschiff dreht mit einer leuchtenden Spur ab.'
  },
  fantasy: {
    title: 'Fantasy', cue: 'Das Tal der Drachen',
    sky: ['#665ac0','#f7adba'], ground: ['#7865aa','#4e637f','#334c73'],
    finds: ['Zauberturm','Pilzdorf','Kristallhain','Burg','Drache','Sternentor'],
    extras: ['Weglaternen','Pilzlichtung','Kristallbrücke','Burgbanner','Drachennest','Sternenpfad'],
    action: 'Drachenzeichen senden', event: 'Ein Drache folgt dem Zeichen aus dem Tal.'
  },
  nature: {
    title: 'Natur', cue: 'Ein Wald wächst heran',
    sky: ['#4c96a8','#ffe1a0'], ground: ['#8bb374','#4e9062','#326752'],
    finds: ['Obstbaum','Blumenwiese','Teich','Bienenstock','Fuchs','Baumhaus'],
    extras: ['Frühlingsblüten','Gewässerpflanzen','Trittsteine','Wilder Kräutergarten','Fuchsbau','Glühwürmchen'],
    action: 'Schmetterlinge locken', event: 'Schmetterlinge sammeln sich über der Lichtung.'
  }
};

function discoveryName(world,index) {
  return [...worlds[world].finds,...worlds[world].extras][index]
    ?? worlds[world].action.replace(/ (rufen|einschalten|starten|senden|locken)$/,'');
}

function createWorldRenderer(canvas) {
  const g = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const lavaCanvas=document.createElement('canvas'), lavaContext=lavaCanvas.getContext('2d');
  let lavaTime=-Infinity,lavaColor=[92,125,151];
  function lavaLamp(now,t,w,h,signal) {
    const target={green:[75,225,157],yellow:[255,195,70],red:[245,77,101],idle:[92,125,151]}[signal]||[92,125,151];
    const dt=Math.max(0,now-lavaTime);
    if(dt>=33) {
      const blend=1-Math.exp(-Math.min(dt,1000)/450);
      lavaColor=lavaColor.map((value,i)=>value+(target[i]-value)*blend);
      lavaTime=now;
      const width=160,height=320;
      lavaCanvas.width=width;lavaCanvas.height=height;
      const data=lavaContext.createImageData(width,height), pixels=data.data;
      const fluidity=.5+.5*Math.sin(t*.035);
      const blobs=[];
      for(let i=0;i<5;i++) {
        const phase=t*(.068+i*.006)+i*1.37;
        const travel=.5-.5*Math.cos(phase);
        const stretch=Math.abs(Math.sin(phase))*(1-fluidity*.55);
        const radius=.055+(i%3)*.014;
        const blob={
          x:Math.sin(phase*.71+i)*(.07+i*.012),
          y:.99-travel*.94,
          rx:radius*(1-stretch*.26),
          ry:radius*(1+stretch*1.3)
        };
        blobs.push(blob);
        // A narrow neck holds the warm wax to the pool before it pinches off.
        if(blob.y>.71) {
          const attachment=Math.max(0,(blob.y-.71)/.28);
          for(let j=1;j<4;j++) {
            const fraction=j/4;
            blobs.push({
              x:blob.x*fraction,
              y:1-(1-blob.y)*fraction,
              rx:.018+attachment*.025,
              ry:.045
            });
          }
        }
      }
      blobs.push({x:0,y:1.035,rx:.21,ry:.082},{x:.015,y:-.065,rx:.13,ry:.065});
      for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
        const px=(x/width-.5)*.62,py=y/height;
        let field=0;
        for(const blob of blobs) field+=1/(((px-blob.x)/blob.rx)**2+((py-blob.y)/blob.ry)**2+.15);
        const edge=Math.max(0,Math.min(1,(field-1.05)*9));
        const intensity=Math.min(1,edge*(.59+.10*Math.min(field,3))+.045*Math.min(field,1)**2);
        const index=(y*width+x)*4;
        pixels[index]=7+lavaColor[0]*intensity;
        pixels[index+1]=14+lavaColor[1]*intensity;
        pixels[index+2]=20+lavaColor[2]*intensity;
        pixels[index+3]=255;
      }
      lavaContext.putImageData(data,0,0);
    }
    box(0,0,w,h,'#101c29');
    const size=Math.min(w/340,h/590);
    const color=lavaColor.map(Math.round);
    const halo=g.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,Math.min(w,h)*.53);
    halo.addColorStop(0,'rgba('+color.join(',')+',0.12)');halo.addColorStop(1,'rgba('+color.join(',')+',0)');
    box(0,0,w,h,halo);
    g.save();g.translate(w*.5,h*.5);g.scale(size,size);
    oval(0,268,105,13,'#060b12a0');
    const metal=g.createLinearGradient(-95,0,95,0);
    metal.addColorStop(0,'#34424c');metal.addColorStop(.18,'#a5b0b3');
    metal.addColorStop(.38,'#e1e4dd');metal.addColorStop(.55,'#8d999f');
    metal.addColorStop(.8,'#53636c');metal.addColorStop(1,'#293a47');
    function glassPath() {
      g.beginPath();g.moveTo(-50,-180);
      g.bezierCurveTo(-62,-122,-90,20,-95,83);
      g.bezierCurveTo(-99,122,-93,150,-78,166);
      g.bezierCurveTo(-30,181,30,181,78,166);
      g.bezierCurveTo(93,150,99,122,95,83);
      g.bezierCurveTo(90,20,62,-122,50,-180);g.closePath();
    }
    g.save();glassPath();g.clip();
    g.imageSmoothingEnabled=true;g.drawImage(lavaCanvas,-104,-185,208,370);
    const liquid=g.createLinearGradient(-100,0,100,0);
    liquid.addColorStop(0,'#d2f1ed21');liquid.addColorStop(.25,'#d2f1ed00');
    liquid.addColorStop(.7,'#05131e00');liquid.addColorStop(1,'#020c1a88');
    box(-105,-185,210,370,liquid);
    g.beginPath();g.moveTo(-43,-164);g.bezierCurveTo(-54,-92,-78,50,-76,127);
    g.strokeStyle='#e3f7ed38';g.lineWidth=7;g.lineCap='round';g.stroke();
    g.beginPath();g.moveTo(48,-137);g.bezierCurveTo(56,-75,76,26,78,62);
    g.strokeStyle='#b7d9d01a';g.lineWidth=3;g.stroke();
    g.restore();
    glassPath();g.strokeStyle='#9db2ba65';g.lineWidth=1.5;g.stroke();
    g.beginPath();g.moveTo(-52,-178);
    g.bezierCurveTo(-45,-218,-22,-250,0,-267);
    g.bezierCurveTo(22,-250,45,-218,52,-178);
    g.closePath();g.fillStyle=metal;g.fill();
    oval(0,-179,52,7,'#9caaae');oval(0,-177,50,3,'#384c59');
    g.beginPath();g.moveTo(-79,166);
    g.bezierCurveTo(-70,188,-45,212,-45,226);
    g.bezierCurveTo(-46,240,-70,250,-91,259);
    g.quadraticCurveTo(0,280,91,259);
    g.bezierCurveTo(70,250,46,240,45,226);
    g.bezierCurveTo(45,212,70,188,79,166);
    g.closePath();g.fillStyle=metal;g.fill();
    oval(0,166,79,10,'#a5b4b7');oval(0,166,69,5,'#425763');
    oval(0,263,90,8,'#293c4a');
    oval(0,210,3,3,'rgb('+color.join(',')+')');
    g.restore();
  }
  let pixel = false;
  const ink = '#162b46';
  const rnd = i => ((Math.sin(i * 127.1 + 34.2) * 43758.5453) % 1 + 1) % 1;
  function box(x,y,w,h,color,r=0) {
    g.fillStyle=color;
    if (!r || pixel) { g.fillRect(x,y,w,h); return; }
    g.beginPath(); g.roundRect(x,y,w,h,Math.min(r,w/2,h/2)); g.fill();
  }
  function shape(points,color,outline=false) {
    g.beginPath();
    points.forEach(([x,y],i)=>i ? g.lineTo(x,y) : g.moveTo(x,y));
    g.closePath(); g.fillStyle=color; g.fill();
    if (outline && !pixel) { g.strokeStyle=ink; g.lineWidth=2; g.lineJoin='round'; g.stroke(); }
  }
  function oval(x,y,rx,ry,color,outline=false) {
    if (pixel) {
      shape([[x-rx,y-ry*.45],[x-rx*.55,y-ry],[x+rx*.55,y-ry],[x+rx,y-ry*.45],
        [x+rx,y+ry*.45],[x+rx*.55,y+ry],[x-rx*.55,y+ry],[x-rx,y+ry*.45]],color);
      return;
    }
    g.beginPath(); g.ellipse(x,y,rx,ry,0,0,Math.PI*2); g.fillStyle=color; g.fill();
    if (outline) { g.strokeStyle=ink; g.lineWidth=2; g.stroke(); }
  }
  function star(x,y,r,color) {
    shape([[x,y-r],[x+r*.25,y-r*.24],[x+r,y],[x+r*.25,y+r*.24],
      [x,y+r],[x-r*.25,y+r*.24],[x-r,y],[x-r*.25,y-r*.24]],color);
  }
  function trail(points,color,width,dash=[]) {
    g.beginPath();
    for (const [i,[x,y]] of points.entries()) {
      if (i) g.lineTo(x,y);
      else g.moveTo(x,y);
    }
    g.strokeStyle=color; g.lineWidth=width; g.lineCap='round'; g.lineJoin='round';
    g.setLineDash(dash); g.stroke(); g.setLineDash([]);
  }
  function cast(x,y,size,draw) {
    g.save(); g.translate(x,y); g.scale(size,size); draw(); g.restore();
  }
  function eye(x,y) {
    if (pixel) { box(x-2,y-2,4,4,ink); return; }
    oval(x,y,3.5,4,ink); oval(x+1,y-1.4,1.2,1.2,'#fff');
  }
  function fish(type,t,c) {
    const tail = 4*Math.sin(t*7);
    if (type===2) {
      for (let i=0;i<4;i++) {
        shape([[-12+i*8,3],[-8+i*8,3],[-11+i*8+tail,25],[-15+i*8+tail,23]],c);
      }
      oval(0,-4,23,17,c,true); box(-22,1,44,7,c,3);
      eye(-7,-6); eye(7,-6); return;
    }
    if (type===5) {
      shape([[-40,5+tail],[-23,-12],[0,-17],[23,-12],[40,5-tail],[12,9],[0,18],[-12,9]],c,true);
      shape([[-3,10],[3,11],[-8,36],[-13,38]],c);
      eye(-7,-9); eye(7,-9); return;
    }
    if (type===3) {
      oval(22,-4,12,9,'#8fe1a6',true);
      oval(-13,12+tail,6,11,'#8fe1a6'); oval(12,12-tail,6,11,'#8fe1a6');
      oval(-4,-2,24,15,'#277b6a',true);
      oval(-5,-4,16,11,'#9cbf64'); eye(25,-6); return;
    }
    shape([[-16,0],[-35,-14+tail],[-31,0],[-35,14+tail]],c,true);
    oval(0,0,24,15,c,true);
    oval(-7,0,4,12,'#fff3d4');
    shape([[-6,4],[-18,8],[-5,13],[5,8]],'#ef835e');
    eye(13,-3);
    if (!pixel) oval(17,4,3.6,2,'#f38b86');
  }
  function plant(t,c,coral=false) {
    for (let i=-2;i<=2;i++) {
      const sway = Math.sin(t*2+i)*5;
      const tip = -20-18*(1-Math.abs(i)/3);
      shape([[i*5-3,0],[i*10+sway-3,tip*.65],[i*15+sway,tip],
        [i*10+sway+4,tip*.57],[i*5+4,0]],c);
      if (coral) oval(i*15+sway,tip,5,6,c);
    }
  }
  function building(type,c,lit=false) {
    const height=[35,30,40,48,58,84][type];
    const width=[43,55,52,64,60,42][type];
    box(-width/2,-height,width,height,'#fff0cc',4);
    box(width/2-8,-height,8,height,'#ddaa94');
    if (type===0 || type===4) {
      shape([[-width/2-7,-height], [0,-height-24], [width/2+7,-height]],c,true);
    } else {
      box(-width/2-3,-height-5,width+6,7,c,3);
    }
    for(let y=-height+9;y<-12;y+=13) {
      for(let x=-width/2+7;x<width/2-8;x+=14) {
        box(x,y,8,8,lit?'#fbd685':'#376d91',2); box(x+1,y+1,5,2,lit?'#fff3c4':'#8ee0e8');
      }
    }
    box(-5,-14,10,14,c,2);
    if (type===1) {
      for (let i=0;i<7;i++) box(-28+i*8,-19,8,7,i%2 ? '#fff3db' : c,2);
    }
    if (type===3 || type===4) {
      box(0,-height-22,2,19,ink);
      shape([[2,-height-22],[18,-height-20],[2,-height-14]],c);
    }
  }
  function tree(t,c,fruit=false) {
    box(-4,-32,8,32,'#845847',3);
    const sway=Math.sin(t*1.7)*2;
    oval(-10+sway,-29,15,15,'#34776f',true);
    oval(10+sway,-32,15,17,'#34776f',true);
    oval(sway,-43,19,20,c,true);
    oval(-6+sway,-48,9,7,'#ffffff24');
    if (fruit) for (let i=0;i<5;i++) oval((i-2)*7+sway,-32-i%2*11,3.2,3.2,'#ff8a71');
  }
  function craft(t,c,station=false) {
    if (station) {
      box(-48,-8,96,16,'#85a6cb',4);
      for (const x of [-52,31]) {
        box(x,-18,22,35,'#4e68ae',3);
        for(let i=0;i<3;i++) box(x+2,-15+i*11,18,2,'#9faffc');
      }
      oval(0,0,21,16,c,true); oval(0,0,10,8,'#393774'); oval(-2,-2,4,3,'#a4e9ee');
      return;
    }
    shape([[-15,-2],[-40,-9-Math.sin(t*17)*4],[-33,0],[-43,9],[-15,3]],'#f7a45c');
    shape([[-15,-7],[-24,-19],[8,-10],[16,4],[-22,15]],c,true);
    oval(1,0,23,11,'#f4e8d9',true);
    oval(8,-2,8,6,'#63b8ec'); oval(10,-4,3,2,'#c5fbff');
  }
  function turret(h,c) {
    box(-16,-h,32,h,'#dfb9cb',3); box(8,-h,8,h,'#b382a6');
    shape([[-21,-h+3],[0,-h-25],[21,-h+3]],c,true);
    box(-5,-h+10,10,14,'#594169',4);
    box(-4,-12,8,12,'#7a5480',3);
  }
  function dragon(t,c) {
    const wings=Math.sin(t*6)*14;
    shape([[-2,2],[-11,-18-wings],[-37,-22-wings],[-27,-7],[-15,-8],[-9,5]],'#da76ab',true);
    shape([[-12,6],[-28,14],[-44,4],[-37,16],[-18,19],[0,7]],c,true);
    oval(0,4,18,11,c,true); oval(18,-5,13,11,c,true);
    shape([[10,-13],[8,-24],[17,-15],[21,-22],[25,-12]],'#f7d786');
    eye(22,-8);
  }
  function fox(t,c) {
    const step=Math.sin(t*10)*3;
    oval(-24,0+step,15,8,c,true); oval(-34,-1+step,6,5,'#ffeed2');
    box(-11,4,5,12+step,ink,2); box(8,4,5,12-step,ink,2);
    oval(0,1,20,9,c,true);
    shape([[11,-5],[12,-22],[20,-14],[27,-22],[29,-8],[35,-3],[23,4]],c,true);
    shape([[21,-6],[33,-3],[24,3]],'#ffeed2'); eye(24,-9);
  }
  function object(key,type,t,c,active) {
    if (key==='aquarium') {
      if (type===1) plant(t,c,true);
      else if (type===4) {
        box(-22,-20,44,20,'#935a53',6); box(-23,-23,46,8,c,3);
        box(-4,-15,8,9,'#ffe78a',2); star(0,-29+Math.sin(t*4)*4,6,'#ffe78a');
      } else fish(type,t,c);
    } else if (key==='city') {
      if (type===2) {
        box(-33,-5,66,8,'#9fce7d',5); tree(t,'#8cce83');
        box(11,-12,20,4,c,2); box(12,-8,3,5,ink); box(26,-8,3,5,ink);
      } else building(type,c,active);
    } else if (key==='space') {
      if (type===0) {
        oval(0,0,25,25,c,true);
        g.save(); g.rotate(-.32); oval(0,3,41,7,'#ecb8c6'); oval(0,1,34,3,'#6e5088');
        g.restore();
        oval(0,-8,20,12,c); oval(-9,-12,7,4,'#ffffff4d');
      } else if (type===1 || type===3) {
        box(-32,0,64,5,'#b983d1',3);
        oval(0,-6,24,17,type===1?'#7dc4d8':c,true);
        box(-24,-7,48,9,'#e9d8ee',4);
        if (type===3) shape([[0,-15],[-9,-28],[12,-37],[16,-31],[6,-16]],'#eae3fa',true);
      } else if (type===4) {
        shape([[-39,10],[-4,-7],[22,-7],[11,9]],'#8d83e5');
        oval(12,0,11,9,c); star(14,-1,6,'#fff5d6');
      } else craft(t,c,true);
    } else if (key==='fantasy') {
      if (type===0) turret(62,c);
      if (type===1) {
        box(-11,-28,22,28,'#efc6ab',6);
        oval(0,-30,28,15,c,true); box(-27,-29,54,6,c,3);
        oval(-9,-33,4,3,'#fff1d5'); oval(9,-38,5,3,'#fff1d5'); box(-4,-14,8,14,ink,4);
      }
      if (type===2) {
        for(let i=-2;i<=2;i++) {
          const h=30-Math.abs(i)*8;
          shape([[i*12-6,0],[i*12-8,-h*.55],[i*12,-h],[i*12+7,-h*.5],[i*12+5,0]],c,true);
          shape([[i*12-1,0],[i*12,-h],[i*12+7,-h*.5],[i*12+5,0]],'#ffffff55');
        }
      }
      if (type===3) {
        box(-30,-42,60,42,'#dab7c5',3); turret(56,c);
        g.save(); g.translate(-24,0); turret(34,c); g.translate(48,0); turret(34,c); g.restore();
      }
      if (type===4) dragon(t,c);
      if (type===5) {
        oval(0,-24,25,31,'#f4d19a',true); oval(0,-24,18,24,'#6766b5');
        for(let i=0;i<4;i++) star(Math.cos(t*2+i*2)*12,-24+Math.sin(t*2+i*2)*18,3,c);
      }
    } else {
      if (type===0) tree(t,'#7fc185',true);
      if (type===1) for(let i=0;i<7;i++) {
        const x=(i-3)*9, y=-8-i%3*7;
        box(x,y,2,-y,'#9dd589'); oval(x,y,5,5,i%2?c:'#ffbba4'); oval(x,y,2,2,'#ffe396');
      }
      if (type===2) {
        oval(0,-2,35,12,'#83cee0',true);
        oval(-8,-4,11,1.5,'#dcf8ee'); oval(17,2,8,1.5,'#dcf8ee');
        plant(t,'#90be78');
      }
      if (type===3) {
        tree(t,'#8dc777');
        oval(11,-19,10,12,'#f5c180',true);
        box(4,-19,14,3,'#cf9257',1);
        oval(22+Math.cos(t*5)*13,-22+Math.sin(t*5)*8,4,2,'#ffe38e');
      }
      if (type===4) fox(t,'#ef9266');
      if (type===5) {
        tree(t,'#84c389');
        box(-20,-27,36,23,'#dfae7a',4);
        shape([[-25,-27],[-2,-45],[21,-27]],c,true); box(-6,-22,11,9,'#634b65',2);
        for(let i=0;i<6;i++) box(10,-15+i*4,8,1,'#fef2ca');
      }
    }
  }

  function butterfly(t,c) {
    const flap=4+Math.abs(Math.sin(t*12))*10;
    oval(-flap*.65,-3,flap,8,c); oval(flap*.65,-3,flap,8,'#f7ac9c');
    box(-2,-7,4,14,ink,2);
  }
  function bauhausCity(w,h,t,count,night) {
    g.save();
    g.scale(w/1000,h/600);
    const paper=night?'#253646':'#e9e4d8';
    const cream=night?'#c7c6b6':'#f8f2e4';
    const blue='#285981', red='#b94737', yellow='#d5a545', charcoal='#293d48';
    box(0,0,1000,600,paper);
    // Architectural planes give the district one shared ground and horizon.
    oval(835,130,52,52,night?'#e8d6a2':'#d7a44a');
    box(0,238,1000,362,night?'#344550':'#d4d7cc');
    box(0,258,1000,15,night?'#3c4c55':'#c0c8c0');
    for(let i=0;i<11;i++) {
      const x=i*99-20, height=24+(i%4)*16;
      box(x,258-height,72,height,night?'#40535e':'#bcc6c2');
      box(x+51,258-height,21,height,night?'#344651':'#abbab8');
    }
    shape([[0,320],[1000,320],[1000,600],[0,600]],night?'#48524f':'#c8ccb9');
    // Keep the boulevard above the fixed HUD area at the foot of the scene.
    g.save();g.translate(0,-38);
    box(0,463,1000,58,night?'#222f39':'#45545c');
    box(0,456,1000,7,cream);
    box(0,521,1000,7,cream);
      box(620,348,38,108,night?'#263640':'#5b6969');
    for(let x=0;x<1000;x+=55) box(x,491,26,2,'#e7d2a0');
    // Paving and garden beds frame the same blocks as the buildings.
    box(70,403,500,53,night?'#737366':'#e4d9bf');
    box(672,379,278,77,night?'#737366':'#e4d9bf');
    box(435,331,167,38,night?'#737366':'#e4d9bf');
    for(let x=80;x<950;x+=34) {
      box(x,448,1,8,'#9a9e8b');
      box(x,529,1,26,'#9a9e8b');
    }
    function diskTree(x,y,size=1) {
      cast(x,y,size,()=>{
        oval(11,5,20,5,'#24383b25');
        box(-2,-33,4,33,'#555341');
        oval(0,-43,17,20,night?'#61786b':'#688c79');
        shape([[0,-63],[0,-23],[17,-30],[17,-53]],night?'#506b61':'#507868');
      });
    }
    function windows(x,y,width,rows,columns,spacing=18) {
      const cell=(width-12)/columns;
      for(let row=0;row<rows;row++) for(let col=0;col<columns;col++) {
        box(x+6+col*cell,y+row*spacing,cell-5,10,night?'#efce7a':'#406979');
        box(x+8+col*cell,y+row*spacing+1,cell-9,3,night?'#ffe5a3':'#91afb2');
      }
    }
    function block(x,base,width,height,depth,accent,kind) {
      const top=base-height, rise=depth*.53;
      shape([[x+7,base],[x+width,base],[x+width+depth+30,base-rise+17],[x+depth+27,base-rise+17]],'#24373b25');
      box(x,top,width,height,cream);
      shape([[x+width,top],[x+width+depth,top-rise],[x+width+depth,base-rise],[x+width,base]],night?'#839490':'#a6b4ae');
      shape([[x,top],[x+depth,top-rise],[x+width+depth,top-rise],[x+width,top]],night?'#b4b9aa':'#fff9e9');
      box(x,top,width,5,charcoal);
      box(x,base-7,width,7,'#738383');
      if(kind===0) {
        box(x+8,top+12,24,height-23,accent);
        windows(x+38,top+17,width-43,3,3,22);
        box(x+49,base-25,17,25,charcoal);
        for(let i=0;i<3;i++) {
          box(x+37,top+30+i*22,width-39,3,'#f8f1dd');
          box(x+37,top+33+i*22,width-39,2,'#647a7f');
        }
      } else if(kind===1) {
        box(x,top+6,width,13,accent);
        box(x+9,top+26,width-18,25,blue);
        for(let i=0;i<4;i++) box(x+14+i*23,top+27,2,23,'#e1d7be');
        box(x-5,top+22,width+10,5,yellow);
        box(x+width-27,base-27,19,27,charcoal);
        for(let i=0;i<3;i++) oval(x+20+i*23,top+43,6,3,'#e9b665');
      } else if(kind===3) {
        box(x,top+8,width,18,blue);
        windows(x,top+11,width,1,7);
        windows(x+4,top+40,width-8,2,7,18);
        box(x+width-27,top+30,18,height-36,accent);
        box(x-12,base-24,56,5,yellow);
        box(x-7,base-19,3,19,charcoal);
      } else if(kind===4) {
        box(x+8,top+8,27,height-12,red);
        oval(x+21,top+28,8,8,cream);
        trail([[x+21,top+28],[x+21,top+22]],charcoal,1.5);
        trail([[x+21,top+28],[x+26,top+31]],charcoal,1.5);
        windows(x+41,top+13,width-46,2,4,22);
        for(let i=0;i<4;i++) {
          box(x+46+i*20,base-25,12,25,blue);
          oval(x+52+i*20,base-25,6,6,blue);
        }
        box(x-4,base, width+10,4,'#b0b2a0');
        box(x-8,base+4,width+18,4,'#bdc0ad');
      } else {
        box(x,top,width*.27,height,accent);
        windows(x+width*.28,top+13,width*.71,7,3,17);
        for(let row=0;row<7;row++) {
          box(x+width-2,top+12+row*17,2,11,charcoal);
          shape([[x+width,top+12+row*17],[x+width+depth-5,top-rise+14+row*17],
            [x+width+depth-5,top-rise+24+row*17],[x+width,top+23+row*17]],night?'#d2b573':'#4c7580');
        }
        box(x+width*.4,top-16,3,16,charcoal);
      }
    }
    if(count>=5) block(455,359,130,97,24,yellow,4);
    if(count>=6) block(805,390,69,151,33,blue,5);
    if(count>=4) {
      block(681,442,115,73,29,red,3);
      block(775,442,38,103,23,yellow,0);
    }
    if(count>=1) block(103,438,128,93,24,red,0);
    if(count>=2) block(278,446,126,61,24,red,1);
    if(count>=3) {
      box(438,400,156,49,night?'#4f6b58':'#8ba07b');
      box(444,424,144,7,'#e6d8b8');
      box(512,401,7,46,'#e6d8b8');
      diskTree(467,428,.82);diskTree(563,423,.95);
      box(487,437,22,4,yellow);box(489,441,2,5,charcoal);box(505,441,2,5,charcoal);
    }
    const extra=Math.min(6,Math.max(0,count-6));
    if(extra>=1) for(const x of [76,242,420,602,846,959]) {
      box(x,433,3,29,charcoal);box(x-7,431,17,3,charcoal);
      oval(x+8,436,5,3,night?'#ffe4a2':'#e1c58c');
      if(night) oval(x+8,437,12,9,'#ffd78c26');
    }
    if(extra>=2) for(const x of [55,255,921,975]) diskTree(x,451,.84);
    if(extra>=3) for(let i=0;i<7;i++) box(623,466+i*7,32,4,'#eee6d1');
    if(extra>=4) for(let i=0;i<3;i++) {
      const x=693+i*32;
      box(x,445,27,3,cream);box(x+2,431,23,13,i%2?yellow:red);
      box(x,428,27,5,cream);box(x+2,448,2,6,charcoal);box(x+23,448,2,6,charcoal);
    }
    if(extra>=5) {
      oval(559,443,19,7,'#d0d8c6');oval(559,441,14,4,blue);
      box(557,428,4,13,'#a8c4c4');oval(559,428,8,2,'#c1dedd');
    }
    if(extra>=6) {
      const cable=Array.from({length:15},(_,i)=>[255+i*29,325+Math.sin(i/14*Math.PI)*22]);
      trail(cable,charcoal,1);
      for(let i=0;i<cable.length;i+=2) oval(cable[i][0],cable[i][1]+4,3,4,night?'#ffe2a3':yellow);
    }
    function vehicle(phase,color,back=false) {
      const x=back?1030-phase*1090:phase*1090-50;
      cast(x,back?479:509,1,()=>{
        if(back) g.scale(-1,1);
        box(-19,-14,38,13,color,2);
        box(-10,-22,21,9,color,2);
        box(-7,-20,14,6,'#c4d6d3');
        oval(-11,0,5,5,charcoal);oval(11,0,5,5,charcoal);
        if(night) shape([[20,-9],[65,-18],[65,1],[20,-5]],'#f5d78523');
      });
    }
    vehicle((t*.045+.21)%1,red);
    if(count>=4||night) vehicle((t*.035+.68)%1,yellow,true);
    if(count>=4) for(let i=0;i<4;i++) {
      const x=(t*(9+i)+i*183)%950+20;
      oval(x,445,2.3,2.3,charcoal);box(x-2,448,4,6,i%2?blue:red);
      const stride=Math.sin(t*7+i)*2;
      trail([[x,454],[x-2,459+stride]],charcoal,1.5);
      trail([[x,454],[x+2,459-stride]],charcoal,1.5);
    }
    g.restore();g.restore();
  }

  function sculptedWorld(key,w,h,t,count,active) {
    g.save();g.scale(w/1000,h/600);
    const at=(x,y,size,draw)=>cast(x,y,size,draw);
    const extra=Math.max(0,Math.min(6,count-6));
    function ridge(y,color,seed) {
      g.beginPath();g.moveTo(0,y);
      for(let i=0;i<5;i++) g.bezierCurveTo(i*200+65,y-40-rnd(i+seed)*60,i*200+110,y+15,(i+1)*200,y-20+Math.sin(i+seed)*25);
      g.lineTo(1000,600);g.lineTo(0,600);g.closePath();g.fillStyle=color;g.fill();
    }
    function glow(x,y,r,color) {
      const gradient=g.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,color);gradient.addColorStop(1,'#ffffff00');
      oval(x,y,r,r,gradient);
    }
    function reeds(x,y,color,scale=1) {
      at(x,y,scale,()=>plant(t*.45,color));
    }
    function stars(color,number=40) {
      for(let i=0;i<number;i++) {
        const x=rnd(i+4)*1000,y=65+rnd(i+75)*410;
        const r=.9+rnd(i+31)*1.9;
        g.globalAlpha=.5+Math.sin(t*.7+i)*.18;
        if(i%8===0) star(x,y,r+2,color);
        else oval(x,y,r,r,color);
      }
      g.globalAlpha=1;
    }
    function island(x,y,width) {
      oval(x+9,y+5,width,16,'#142f3d20');
      oval(x,y,width,14,'#b7a995');oval(x,y-5,width,11,'#e8d6af');
    }
    if(key==='aquarium') {
      const water=g.createLinearGradient(0,0,0,600);
      water.addColorStop(0,'#286d82');water.addColorStop(.65,'#16465d');water.addColorStop(1,'#133747');
      box(0,0,1000,600,water);
      for(let i=0;i<4;i++) {
        const x=110+i*255+Math.sin(t*.15+i)*18;
        shape([[x-38,0],[x+15,0],[x+255,540],[x+85,540]],'#bbefdc09');
      }
      ridge(354,'#255e6b',3);ridge(415,'#28626a',8);
      ridge(481,'#baaa87',5);ridge(520,'#e0c49a',1);
      trail([[0,554],[160,535],[350,560],[560,544],[780,561],[1000,540]],'#f8dfb35c',2);
      for(const [x,y,rx,ry] of [[120,480,77,29],[190,466,43,37],[733,484,91,32],[804,459,44,50],[666,500,35,21]]) {
        oval(x,y,rx,ry,'#496d6c');oval(x-10,y-ry*.35,rx*.75,ry*.4,'#719487');
      }
      for(let i=0;i<13;i++) {
        const x=40+rnd(i+45)*930,y=600-(rnd(i+22)*600+t*(9+i%3))%600;
        oval(x,y,2+i%3,2+i%3,'#aadbd433');
      }
      for(const x of [55,91,866,909,950]) reeds(x,511+(x%17),'#4a9184',1.3);
      if(count>=2) for(const [x,y,s,c] of [[180,490,1.4,'#d78376'],[236,501,.85,'#e3ab79'],[713,500,1.15,'#b37b91'],[820,500,.95,'#d78a74']]) {
        at(x,y,s,()=>plant(t*.4,c,true));
      }
      if(count>=5) at(490,513,1.2,()=>{
        box(-27,-26,54,28,'#885f4b',3);box(-29,-28,58,10,'#b68755',3);
        box(-21,-27,5,29,'#e8c47c');box(16,-27,5,29,'#e8c47c');box(-4,-17,8,9,'#e8c47c');
        glow(0,-32,38,'#f0cb7a33');
      });
      if(extra>=1) for(let i=0;i<8;i++) reeds(300+i*26,526+rnd(i)*15,'#608b6b',.6);
      if(extra>=2) {
        g.beginPath();g.ellipse(720,487,51,48,0,Math.PI,Math.PI*2);
        g.strokeStyle='#ad7e81';g.lineWidth=16;g.stroke();
        for(let i=0;i<9;i++) oval(720+Math.cos(Math.PI+i*Math.PI/8)*51,487+Math.sin(Math.PI+i*Math.PI/8)*48,4,4,'#d1a398');
      }
      if(extra>=3) for(let i=0;i<11;i++) oval(400+i*17,524+Math.sin(i*.5)*8,3,3,'#f8dfb5');
      if(extra>=4) for(let i=0;i<5;i++) {
        const x=585+i*17,y=530+Math.sin(i)*5;
        oval(x,y,9,5,'#c78c87');trail([[x-6,y],[x,y-4],[x+6,y]],'#edc9ac',1);
      }
      if(extra>=5) {oval(785,472,34,27,'#31525a');oval(785,480,23,20,'#112f3e');}
      if(extra>=6) for(let i=0;i<18;i++) glow(140+rnd(i+8)*720,368+rnd(i+90)*115,5,'#bdeacb66');
      const residents=[];
      if(count>=1) residents.push({type:0,x:358+Math.sin(t*.48)*105,y:392+Math.sin(t)*14,s:1.1,c:'#e7a66c'});
      if(count>=3) residents.push({type:2,x:646+Math.sin(t*.28)*45,y:313+Math.sin(t*.7)*19,s:1,c:'#d5b7bb'});
      if(count>=4) residents.push({type:3,x:563+Math.sin(t*.30)*130,y:415+Math.sin(t*.6)*22,s:1.1,c:'#86a98b'});
      if(count>=6) residents.push({type:5,x:798+Math.sin(t*.24)*100,y:349+Math.sin(t*.55)*22,s:1.35,c:'#7eacae'});
      for(const animal of residents) at(animal.x,animal.y,animal.s,()=>{
        if(Math.cos(t*.3)<0&&animal.type!==2) g.scale(-1,1);
        fish(animal.type,t*.7,animal.c);
      });
      for(let i=0;i<(active?13:3);i++) {
        const a=t*.55+i*.15;
        at(310+Math.sin(a)*180+i*8,370+Math.cos(a)*35+i*5,.42,()=>{
          if(Math.cos(a)<0)g.scale(-1,1);
          fish(0,t,'#d6c593');
        });
      }
    }
    if(key==='space') {
      box(0,0,1000,600,'#1b2941');
      glow(710,250,340,'#59678536');stars('#d6cfba',60);
      if(count>=1) {
        g.save();g.translate(762,237);g.rotate(-.3);
        oval(0,0,124,27,'#ad9581');oval(0,0,103,16,'#24364b');
        oval(0,-5,71,71,'#c89976');
        g.save();g.beginPath();g.arc(0,-5,71,0,Math.PI*2);g.clip();
        box(-80,0,160,15,'#b3836e');box(-80,-43,160,9,'#e1b28a');box(-80,32,160,7,'#dbad85');g.restore();
        g.beginPath();g.ellipse(0,0,124,27,0,0,Math.PI);g.strokeStyle='#c4ac90';g.lineWidth=8;g.stroke();
        g.restore();
      }
      ridge(460,'#566177',1);ridge(515,'#7a8090',4);
      for(let i=0;i<8;i++) {
        const x=50+rnd(i+60)*920,y=510+rnd(i+81)*70,r=9+rnd(i)*22;
        oval(x,y,r,r*.28,'#505d73');trail([[x-r*.6,y+3],[x+r*.6,y+3]],'#a0a2a44d',1);
      }
      function dome(x,y,size) {
        at(x,y,size,()=>{
          box(-38,-2,76,10,'#d5cec1',2);
          g.beginPath();g.arc(0,-2,32,Math.PI,Math.PI*2);g.fillStyle='#92afb1';g.fill();
          trail([[0,-33],[0,-2]],'#dde2cc',2);
          box(-32,-4,64,6,'#dfd6bd');box(-10,-2,20,10,'#40536a');
        });
      }
      if(count>=2) {island(291,513,107);dome(291,504,1.5);}
      if(count>=3) at(483+Math.sin(t*.35)*67,274+Math.cos(t*.35)*30,.85,()=>craft(t,'#c4a16c',true));
      if(count>=4) {
        trail([[313,514],[430,534],[553,510]],'#cec3aa',7);
        dome(552,502,1);
        at(552,464,1.1,()=>{
          box(-3,-33,6,34,'#c3bca9');
          shape([[-25,-31],[0,-16],[25,-31],[12,-45]],'#e0d7c3');
          trail([[0,-24],[15,-54]],'#af865f',3);
        });
      }
      if(count>=5) {
        const x=(t*23+160)%1200-100,y=155+x*.08;
        trail([[x-76,y-16],[x-24,y-5],[x,y]],'#bc9e7a66',5);star(x,y,7,'#f2d39c');
      }
      if(count>=6) at(817+Math.cos(t*.18)*40,386+Math.sin(t*.18)*20,1.3,()=>craft(t,'#d9c6a1',true));
      if(extra>=1) for(let i=0;i<6;i++) {box(180+i*40,514,2,10,'#dad2b4');oval(181+i*40,513,3,2,'#e4b878');}
      if(extra>=2) oval(408,548,30,9,'#46566e');
      if(extra>=3) {
        const pts=[[151,205],[199,174],[241,214],[208,258]];
        trail(pts,'#aaa58f55',1);for(const [x,y]of pts)star(x,y,5,'#d5c6a5');
      }
      if(extra>=4) shape([[665,552],[694,522],[727,552],[715,560]],'#a3bdc4');
      if(extra>=5) for(let i=0;i<3;i++){box(375+i*22,493,17,17,'#c7b697');box(380+i*22,496,7,4,'#4e6775');}
      if(extra>=6) for(let i=0;i<6;i++) trail([[55+i*25,295],[180+i*18,267],[335+i*20,290]],'#87bcb512',8);
      const a=t*.43,x=420+Math.cos(a)*180,y=362+Math.sin(a)*48;
      if(active) trail(Array.from({length:15},(_,i)=>[420+Math.cos(a-i*.04)*180,362+Math.sin(a-i*.04)*48]),'#b7d6ce99',3);
      at(x,y,.9,()=>{if(Math.sin(a)>0)g.scale(-1,1);craft(t,'#c6846c');});
    }
    if(key==='fantasy') {
      box(0,0,1000,600,'#43415c');glow(760,173,160,'#c5acaa23');
      oval(760,173,48,48,'#e2cbb0');
      ridge(340,'#646079',3);
      shape([[0,376],[112,301],[188,344],[278,318],[368,373],[450,409],[525,361],[610,333],[706,289],[805,363],[922,325],[1000,348],[1000,600],[0,600]],'#626d76');
      shape([[0,463],[112,424],[233,452],[347,424],[450,409],[536,444],[619,471],[738,452],[873,415],[1000,460],[1000,600],[0,600]],'#45616a');
      // The river starts in the mountain saddle and widens down the valley.
      g.beginPath();g.moveTo(447,409);
      g.bezierCurveTo(455,436,445,453,486,476);
      g.bezierCurveTo(536,506,621,538,660,600);
      g.lineTo(770,600);
      g.bezierCurveTo(731,545,582,496,510,466);
      g.bezierCurveTo(471,449,460,429,453,409);
      g.closePath();g.fillStyle='#89aaa7';g.fill();
      trail([[450,415],[461,450],[499,477],[574,515],[640,550]],'#c4d4bd66',2);
      trail([[120,520],[284,495],[370,485],[440,500]],'#c5ad91',9);
      function tower(x,y,height,width,color) {
        at(x,y,1,()=>{
          box(-width/2,-height,width,height,'#d3c3b9');
          box(width*.16,-height,width*.34,height,'#aaa7ae');
          box(-width/2-4,-height-4,width+8,7,color);
          shape([[-width/2-7,-height-3],[0,-height-32],[width/2+7,-height-3]],color);
          for(let yy=-height+17;yy<-48;yy+=26) {box(-6,yy,12,15,'#46526b');oval(0,yy,6,6,'#46526b');}
          box(-10,-22,20,22,'#5b5a6e');oval(0,-22,10,10,'#5b5a6e');
          box(-width/2-4,0,width+8,5,'#aeaa9d');
        });
      }
      if(count>=1) {island(220,486,48);tower(220,480,106,43,'#9e727d');}
      if(count>=2) for(const [x,y,s]of [[300,498,.8],[365,482,.55],[345,532,.45]])at(x,y,s,()=>{
        box(-12,-27,24,27,'#d5c7b2');oval(0,-29,29,13,'#c18a7b');
        box(-4,-15,8,15,'#545b6a');oval(-11,-32,4,3,'#ead3b0');
      });
      if(count>=3) for(let i=0;i<5;i++) {
        const x=750+i*19,y=548+Math.sin(i)*4,height=[22,35,27,41,24][i];
        shape([[x-6,y],[x-8,y-height*.56],[x,y-height],[x+8,y-height*.56],[x+5,y]],'#9ebfc2');
        shape([[x,y],[x,y-height],[x+8,y-height*.56],[x+5,y]],'#cee0d2');
      }
      if(count>=4) {
        trail([[410,466],[450,457],[494,468],[532,474]],'#b0a594',22);
        trail([[410,453],[450,444],[494,455],[532,461]],'#d4c5ac',4);
        island(600,434,92);
        box(550,391,101,30,'#b9a9a6');
        for(let i=0;i<6;i++)box(550+i*18,385,10,8,'#d8c6b6');
        for(const [x,y]of [[551,413],[600,426],[650,413]]) tower(x,y,x===600?125:91,x===600?56:30,x===600?'#9c7d8e':'#637d91');
      }
      if(count>=6) {
        oval(838,459,38,53,'#c1ab91');oval(838,456,28,42,'#5c7483');
        for(let i=0;i<6;i++)star(838+Math.cos(t*.4+i)*18,457+Math.sin(t*.4+i)*30,3,'#e8d0a5');
      }
      if(extra>=1)for(const [x,y]of [[142,502],[244,487],[391,480]]){box(x,y,2,22,'#374657');oval(x+1,y-3,5,8,'#edc695');}
      if(extra>=2)for(let i=0;i<4;i++)at(245+i*20,553,.25,()=>object('fantasy',1,t,'#b7979e'));
      if(extra>=3)trail([[664,525],[695,508],[730,526]],'#9abdc4',7);
      if(extra>=4){box(603,267,2,29,'#cfc1ae');shape([[605,268],[631,276],[605,284]],'#b78679');}
      if(extra>=5){oval(904,542,29,10,'#8f7a78');oval(901,534,8,12,'#e4c6a2');}
      if(extra>=6)for(let i=0;i<7;i++)star(839+i*8,526-i*5,3,'#ebd4a9');
      for(let i=0;i<13;i++)glow(90+rnd(i)*820,420+rnd(i+3)*105+Math.sin(t+i)*4,4,'#e7cf9544');
      if(count>=5||active) {
        const a=t*.32;
        at(475+Math.sin(a)*215,181+Math.cos(a)*18,active?1.35:1.1,()=>{
          if(Math.cos(a)<0)g.scale(-1,1);dragon(t*.65,active?'#d7b393':'#92aaa8');
        });
      }
    }
    if(key==='nature') {
      box(0,0,1000,600,'#d9dccb');oval(766,157,47,47,'#e9bc6c');
      ridge(328,'#b2c1ae',4);ridge(390,'#8da89a',7);ridge(460,'#5c8677',2);ridge(529,'#7f9a78',1);
      function canopy(x,y,s,color) {
        at(x,y,s,()=>{
          box(-4,-62,8,62,'#746d58');trail([[0,-25],[-17,-49]],'#746d58',3);
          oval(0,-78,30,43,color);oval(-19,-65,20,27,color);oval(20,-72,21,29,color);
          oval(-8,-94,13,18,'#d9e0b921');
        });
      }
      for(const [x,y,s,c]of [[35,455,1.7,'#638b7e'],[105,460,1.35,'#729788'],[908,460,1.8,'#467668'],[975,478,1.4,'#4c7967']])canopy(x,y,s,c);
      trail([[44,557],[198,531],[354,539],[472,516],[593,529],[750,515],[1000,553]],'#d9c6a0',17);
      if(count>=1) {
        canopy(258,487,1.5,'#749468');
        for(const [x,y]of [[237,371],[275,393],[251,416],[281,366],[226,402]])oval(x,y,5,5,'#d7a66d');
      }
      if(count>=2)for(let i=0;i<22;i++) {
        const x=309+rnd(i+5)*131,y=485+rnd(i+25)*40;
        box(x,y-8,1,9,'#55785a');oval(x,y-9,3.8,3.8,i%3?'#ead3a0':'#d79a89');
      }
      if(count>=3) {
        trail([[516,412],[496,453],[557,487],[633,528],[677,600]],'#80aaa8',20);
        oval(561,497,89,26,'#94b8af');oval(566,497,73,19,'#769e9b');
        trail([[524,495],[543,492],[571,494]],'#ccddbf',2);
        oval(588,500,13,5,'#a7ba82');
      }
      if(count>=4) {
        canopy(422,435,1.2,'#87a279');
        at(444,403,.85,()=>{oval(0,0,14,18,'#dcb57b');for(let j=0;j<4;j++)box(-11,-11+j*7,22,2,'#b58d61');oval(0,6,4,4,'#75674f');});
        for(let i=0;i<3;i++)oval(454+Math.sin(t*2+i)*16,393+Math.cos(t*2+i)*12,3,2,'#d9bc6d');
      }
      if(count>=6) {
        canopy(795,478,1.8,'#507c67');
        box(770,382,60,42,'#c9af83');shape([[761,382],[800,355],[840,382]],'#7b7560');
        box(790,391,14,16,'#4b7069');box(765,425,74,5,'#aa9271');
        for(let j=0;j<8;j++){box(816,429+j*9,14,3,'#d4bf99');}
      }
      if(extra>=1)for(let i=0;i<8;i++)oval(238+rnd(i)*46,359+rnd(i+5)*68,4,4,'#e8ccb5');
      if(extra>=2)for(let i=0;i<5;i++)reeds(494+i*17,508+Math.sin(i)*9,'#6f8d68',.6);
      if(extra>=3)for(let i=0;i<5;i++)oval(614+i*9,524+i*4,9,4,'#c0c1a5');
      if(extra>=4)for(let i=0;i<9;i++)reeds(357+i*12,526+rnd(i)*8,'#9baf86',.35);
      if(extra>=5){oval(715,529,30,15,'#9a866d');oval(715,529,16,11,'#495d52');}
      if(extra>=6)for(let i=0;i<16;i++)glow(280+rnd(i)*540,429+rnd(i+6)*98+Math.sin(t+i)*4,4,'#f8df9a55');
      if(count>=5)at(650+Math.sin(t*.3)*66,535,.85,()=>{
        if(Math.cos(t*.3)<0)g.scale(-1,1);fox(t*.65,'#c28e64');
      });
      for(let i=0;i<(active?9:2);i++)at(360+Math.sin(t*.6+i*.7)*160+i*15,448+Math.cos(t*.8+i)*29,.45,()=>butterfly(t+i,i%2?'#e6c48a':'#d6b6a1'));
    }
    g.restore();
  }

  return function render(now,key,isPixel,count,worldEvent,neutralAnimation=false,signal='idle') {
    const cssWidth=canvas.clientWidth, cssHeight=canvas.clientHeight;
    if (!cssWidth || !cssHeight) return;
    pixel=isPixel&&key!=='lava';
    const density=pixel ? .34 : Math.min(devicePixelRatio||1,2);
    const width=Math.max(1,Math.round(cssWidth*density));
    const height=Math.max(1,Math.round(cssHeight*density));
    if (canvas.width!==width || canvas.height!==height) {
      canvas.width=width; canvas.height=height;
    }
    const t=reduced.matches?0:now/1000;
    const w=cssWidth,h=cssHeight;
    g.setTransform(width/w,0,0,height/h,0,0);
    if(key==='lava') {lavaLamp(now,t,w,h,signal);return;}
    if(key==='neutral') {
      box(0,0,w,h,'#203446');
      if(neutralAnimation) {
        const radius=Math.min(w,h)*.26;
        for(let i=0;i<3;i++) {
          const phase=t*.018+i*2.1;
          const x=w*(.5+.25*Math.sin(phase)),y=h*(.5+.20*Math.cos(phase*.83));
          const color=['#658a8d18','#b4a98712','#728ca319'][i];
          oval(x,y,radius*(1+i*.12),radius*(1+i*.12),color);
        }
      }
      return;
    }
    if(key==='city') {
      const night=worldEvent?.key===key&&now-worldEvent.at<6200;
      bauhausCity(w,h,t,count,night);
      return;
    }
    const actionAge=worldEvent?.key===key?now-worldEvent.at:Infinity;
    const active=actionAge>=0&&actionAge<6200;
    sculptedWorld(key,w,h,t,count,active);
  };
}
