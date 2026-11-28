// Independently composed pixel scenes. No playful-world geometry or downsampling.
function createRetroWorldRenderer(canvas) {
  'use strict';
  const frame=document.createElement('canvas');frame.width=480;frame.height=270;
  const p=frame.getContext('2d'),screen=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const palettes={
    aquarium:['#071c35','#103651','#185776','#287c8c','#69b4ad','#a6dbcc','#d4ca98'],
    city:['#10162e','#202847','#343b59','#617183','#dfb997','#ffd77e','#9be3d1'],
    space:['#0c1229','#202841','#36405a','#62758b','#a0b1c0','#f1dcb0','#73d9c3'],
    fantasy:['#202c3d','#344755','#506959','#79915b','#b9b37a','#e2d7a0','#8dc5bc'],
    nature:['#203c41','#315950','#4a7555','#78965d','#b6bd7e','#e7d6a0','#82b7b3']
  };
  const rect=(x,y,w,h,c)=>{p.fillStyle=c;p.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function poly(points,c){
    p.fillStyle=c;
    const lo=Math.ceil(Math.min(...points.map(q=>q[1]))),hi=Math.floor(Math.max(...points.map(q=>q[1])));
    for(let y=lo;y<=hi;y++){
      const xs=[];
      for(let i=0,j=points.length-1;i<points.length;j=i++){
        const a=points[j],b=points[i];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)p.fillRect(Math.ceil(xs[i]),y,Math.max(1,Math.floor(xs[i+1])-Math.ceil(xs[i])),1);
    }
  }
  const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  function sprite(rows,x,y,colors,scale=1,flip=false){
    rows.forEach((row,j)=>[...row].forEach((c,i)=>{if(colors[c])rect(x+(flip?row.length-1-i:i)*scale,y+j*scale,scale,scale,colors[c]);}));
  }
  const fish=['.....11.......','...112211..3..','.112222211333.','11222242211333','.112222211333.','...112211..3..','.....11.......'];
  const fox=['.11.....11....','.121...121....','..1222221.....','.122422421....','12222222221...','.12233322111..','..11...11..11.'];
  const dragon=['......11........11..','...111221......1221.','111222221....112221.','.11222221111122221..','...12222222222221...','....1122222222211...','..111122222211221...','.122111222211..11...','..11...111121.......','.........111........'];
  const tree=(x,y,size=1,fruit=false)=>{
    rect(x+10*size,y+22*size,5*size,18*size,'#624d44');
    poly([[x,y+20*size],[x+4*size,y+5*size],[x+13*size,y],[x+24*size,y+8*size],[x+27*size,y+24*size],[x+11*size,y+30*size]],'#31564b');
    rect(x+5*size,y+7*size,14*size,13*size,'#668a52');rect(x+8*size,y+5*size,7*size,5*size,'#8fa65c');
    if(fruit)for(const [dx,dy]of [[7,16],[19,13],[13,24]])rect(x+dx*size,y+dy*size,3*size,3*size,'#dc8864');
  };
  function stars(t,color='#a0b1c0',n=65){for(let i=0;i<n;i++)rect(hash(i)*480,hash(i+80)*200,i%13?1:2,1,(Math.floor(t/2)+i)%7?color:'#f1dcb0');}
  function water(y,bottom,t,c){
    rect(0,y,480,bottom-y,c);for(let i=0;i<28;i++){const x=(i*37+Math.floor(t*3))%480;rect(x,y+3+(i*13)%Math.max(1,bottom-y-5),5+i%8,1,i%3?'#357889':'#72b8b1');}
  }
  function bubble(x,y,t){const yy=(y-Math.floor(t*7)+550)%230;rect(x,yy,2,4,'#77bec0');rect(x-1,yy+1,4,2,'#77bec0');rect(x,yy+1,2,2,'#174b68');}
  function aquarium(t,n,active,c){
    rect(0,0,480,270,c[0]);rect(0,24,480,220,c[1]);rect(0,71,480,173,c[2]);
    for(let i=0;i<6;i++)poly([[30+i*83,0],[42+i*83,0],[92+i*76,211],[76+i*76,211]],i%2?'#1b5a74':'#1b5270');
    for(let i=0;i<14;i++){const x=i*39-16,y=175+Math.floor(hash(i+1)*32);poly([[x,y+32],[x+10,y],[x+27,y-5],[x+39,y+32]],'#123e54');}
    // The submerged station is a backdrop; discovery objects occupy clear lanes.
    rect(44,161,105,42,'#153c4f');rect(51,155,91,5,'#397280');rect(56,169,79,25,'#24566a');
    for(let i=0;i<4;i++){rect(62+i*19,174,13,14,'#497f87');rect(65+i*19,177,7,8,'#0b2b40');}
    rect(32,204,145,9,'#225064');rect(0,230,480,40,c[6]);rect(0,238,480,32,'#8f9d80');
    for(let i=0;i<90;i++)rect(hash(i+45)*480,232+hash(i+185)*34,2,1,i%2?'#c1bd8f':'#748a79');
    for(let i=0;i<6;i++)bubble(52+i*73,40+i*29,t);
    if(n>=1)sprite(fish,180+Math.sin(t*.38)*65,95+Math.sin(t*.8)*7,{1:'#dc8b56',2:'#f1d5a0',3:'#bf654e',4:'#142d42'},2,Math.cos(t*.38)>0);
    if(n>=2)for(const [x,h]of [[326,24],[343,37],[361,29]]){rect(x,228-h,5,h,'#ce7e86');rect(x-7,235-h,9,4,'#d9a3a3');rect(x+3,244-h,10,4,'#945d80');}
    if(n>=3){const x=272+Math.sin(t*.27)*26,y=68+Math.cos(t*.4)*8;poly([[x-12,y],[x-8,y-8],[x+7,y-8],[x+13,y],[x+13,y+5],[x-12,y+5]],'#a5c9d4');rect(x-7,y-5,13,5,'#d9e4d4');for(let j=0;j<3;j++)rect(x-8+j*7+Math.sin(t+j)*2,y+6,2,14+j%2*4,'#799eb9');}
    if(n>=4){const x=165+Math.sin(t*.18)*58,y=169;poly([[x-12,y],[x-5,y-9],[x+9,y-7],[x+15,y],[x+9,y+9],[x-8,y+8]],'#749d77');rect(x-6,y-4,12,8,'#476f62');rect(x+15,y-2,8,5,'#b5c79a');rect(x-10,y+8,5,4,'#a0b884');rect(x+7,y+8,5,4,'#a0b884');}
    if(n>=5){rect(215,211,28,19,'#6d584f');rect(213,207,32,6,'#b8975c');rect(218,211,3,19,'#e2c779');rect(237,211,3,19,'#e2c779');rect(227,217,5,5,'#ead896');rect(228,218,2,2,'#273b48');}
    if(n>=6){const x=345+Math.sin(t*.17)*75,y=124+Math.cos(t*.4)*7;poly([[x-36,y-1],[x-14,y-4],[x,y-12],[x+12,y-4],[x+37,y-1],[x+11,y+9],[x,y+7],[x-13,y+9]],'#6096a5');rect(x-4,y-6,8,12,'#90bdc1');rect(x,y+7,2,24,'#528494');}
    if(n>=7)for(let i=0;i<9;i++)poly([[277+i*4,231],[276+i*4,212-i%3*7],[280+i*4,225],[281+i*4,231]],i%2?'#528b75':'#7bab83');
    if(n>=8){for(let i=0;i<7;i++)rect(7+i*7,208-Math.sin(i/6*Math.PI)*30,9,13,'#4a7d80');rect(8,221,8,10,'#346575');rect(48,221,8,10,'#346575');}
    if(n>=9)for(let i=0;i<8;i++)rect(159+i*9,233+Math.sin(i)*3,3,2,'#eee3bc');
    if(n>=10)for(let i=0;i<4;i++){rect(20+i*11,225,9,4,'#b3a4ad');rect(22+i*11,223,5,2,'#e5d3c9');}
    if(n>=11){poly([[398,220],[403,179],[426,161],[457,177],[474,220]],'#285366');poly([[414,220],[417,195],[430,186],[447,197],[452,220]],'#0b293e');rect(409,183,13,4,'#4d7f86');}
    if(n>=12)for(let i=0;i<24;i++)rect(hash(i+220)*470,75+hash(i+260)*125,1,2,(i+Math.floor(t))%4?'#4fa0ab':'#b7ead1');
    if(active)for(let i=0;i<9;i++)sprite(fish,(t*40+i*37)%530-30,30+i%3*16,{1:'#deab68',2:'#f1db9c',3:'#b77b59',4:'#153e56'},1,true);
  }
  function city(t,n,active,c){
    rect(0,0,480,270,c[0]);stars(t,'#8793b3',30);rect(354,27,21,21,'#e4caa2');rect(349,23,20,19,c[0]);
    for(let i=0;i<16;i++){const x=i*33-7,h=27+hash(i+5)*51;rect(x,198-h,27,h,c[1]);for(let j=0;j<3;j++)rect(x+5+j*7,211-h,2,2,'#566177');}
    rect(0,211,480,13,'#4e5d6b');rect(0,224,480,24,'#242b43');rect(0,224,480,2,'#a3a292');for(let i=0;i<16;i++)rect(i*33,237,13,1,'#9ca69e');
    water(251,270,t,'#203f58');rect(0,248,480,3,'#728a91');
    const building=(x,w,h,body,roof,windows=true)=>{rect(x,211-h,w,h,'#121c32');rect(x+3,214-h,w-6,h-3,body);rect(x-2,208-h,w+4,5,roof);if(windows)for(let y=224-h;y<201;y+=13)for(let xx=x+9;xx<x+w-6;xx+=11){rect(xx,y,5,7,active||hash(xx+y)>.45?'#e8c888':'#7391a0');rect(xx,y+6,5,1,'#303e53');}};
    if(n>=1){building(23,42,53,'#6a6f80','#a4a6a1');rect(39,195,10,16,'#283a50');}
    if(n>=2){building(85,43,45,'#a26c6a','#db9c7f',false);rect(91,188,31,15,'#b8d1c1');for(let i=0;i<5;i++)rect(89+i*7,184,7,5,i%2?'#f1cfac':'#b86666');rect(99,194,11,17,'#3b5266');}
    if(n>=3){rect(147,196,54,15,'#5d806d');rect(168,196,7,15,'#c0b28e');tree(145,173,.65);tree(182,177,.6);rect(153,206,10,2,'#c7b38b');}
    if(n>=4){building(220,62,65,'#6c8190','#b6b4a2');rect(242,193,18,18,'#d5ba81');rect(249,198,4,13,'#253c51');rect(237,163,27,7,'#344c66');rect(242,165,17,2,'#e5ca8d');}
    if(n>=5){building(310,49,76,'#8b7a85','#c1a58f');rect(328,128,13,13,'#d7c9ac');rect(334,130,1,6,'#3e4358');rect(334,135,4,1,'#3e4358');rect(325,193,19,18,'#34475e');}
    if(n>=6){building(394,53,133,'#405c76','#7da3b4');rect(416,59,6,17,'#779ba9');rect(419,48,1,11,'#e6c48e');rect(400,86,40,3,'#a7d5cb');}
    if(n>=7)for(const x of [73,207,293,381]){rect(x,189,2,33,'#809b9f');rect(x-4,187,11,3,'#c6bc9d');rect(x+2,190,5,2,'#e6c989');}
    if(n>=8){tree(5,186,.55);tree(455,184,.65);}
    if(n>=9)for(let i=0;i<5;i++)rect(179,227+i*4,11,2,'#d5d4bc');
    if(n>=10)for(const x of [286,366]){rect(x,201,14,3,'#d0ac85');rect(x+1,204,12,7,'#755c5a');rect(x+2,208,2,4,'#d3b58b');rect(x+10,208,2,4,'#d3b58b');}
    if(n>=11){rect(166,204,13,5,'#99b2ac');rect(170,199,4,6,'#82cbd0');rect(172,196,1,5,'#d4f1d9');}
    if(n>=12)for(let i=0;i<25;i++)rect(i*20,246+i%2,2,2,i%3?'#ddc588':'#a6d8ca');
    const x=Math.floor(t*(active?39:17))%540-30;rect(x,230,22,8,active?'#c78b9e':'#80abae');rect(x+5,227,11,4,'#7293a6');rect(x+3,238,4,3,'#111c30');rect(x+17,238,4,3,'#111c30');
    if(active){rect(x-15,234,11,1,'#c78b9e');rect(x-25,236,7,1,'#7f839b');}
  }
  function space(t,n,active,c){
    rect(0,0,480,270,c[0]);stars(t,c[4],100);
    // Top-down dock, rather than the playful moon landscape.
    poly([[188,108],[261,108],[284,131],[284,170],[261,193],[188,193],[165,170],[165,131]],c[1]);
    rect(187,130,75,40,c[2]);rect(204,139,41,23,'#52657c');rect(218,146,14,9,'#86c8ba');
    rect(222,92,5,42,'#62758b');rect(222,170,5,46,'#62758b');rect(140,149,47,5,'#62758b');rect(260,149,46,5,'#62758b');
    for(let i=0;i<4;i++)rect(182+i*28,184,12,2,c[3]);
    if(n>=1){poly([[381,49],[385,31],[408,23],[427,33],[434,49],[426,67],[403,73],[385,64]],'#727d9d');poly([[367,65],[386,57],[445,37],[454,39],[433,52],[379,72]],'#c8b39f');rect(390,37,23,4,'#95a1b0');}
    if(n>=2){rect(85,185,75,28,c[2]);rect(90,180,65,6,c[4]);for(let i=0;i<3;i++){rect(95+i*20,189,13,13,'#273e5b');rect(98+i*20,191,7,4,'#80bcb5');}rect(117,172,4,9,'#d5be94');}
    if(n>=3){rect(326,95,12,18,c[4]);rect(305,100,19,12,'#365878');rect(340,100,19,12,'#365878');for(let i=0;i<3;i++){rect(307+i*5,101,1,10,'#7fa9b2');rect(342+i*5,101,1,10,'#7fa9b2');}rect(330,88,2,7,'#dac78f');}
    if(n>=4){rect(102,90,35,17,c[3]);poly([[100,91],[104,80],[118,75],[132,80],[139,91]],c[4]);rect(113,77,4,14,'#61768a');rect(106,106,28,6,c[1]);}
    if(n>=5){const x=60+(t*20)%225,y=37;poly([[x-45,y-5],[x+2,y],[x-45,y+5],[x-25,y]],'#3d536e');rect(x-5,y-2,8,5,'#e5d6af');rect(x-10,y-1,4,2,'#a5c4cc');}
    if(n>=6){poly([[187,102],[263,102],[290,130],[290,172],[263,199],[187,199],[159,172],[159,130]],'#7b8c9b');poly([[190,111],[259,111],[281,133],[281,168],[259,190],[190,190],[168,168],[168,133]],'#283a54');rect(187,130,75,40,c[2]);rect(204,139,41,23,'#52657c');rect(218,146,14,9,'#b5dac6');for(const x of [171,271])for(let y=128;y<178;y+=12)rect(x,y,8,5,'#5f92aa');}
    if(n>=7)for(const [x,y]of [[195,116],[254,116],[195,184],[254,184]])rect(x,y,2,3,'#c9d69a');
    if(n>=8)for(let i=0;i<5;i++){const x=45+i*13,y=218+hash(i)*12;rect(x,y,10,4,'#46536d');rect(x+2,y,5,2,'#1a283f');}
    if(n>=9){for(let i=0;i<6;i++){const x=41+i*13,y=51+Math.sin(i*1.5)*13;rect(x,y,2,2,'#c6d4cc');if(i)poly([[x-13,51+Math.sin((i-1)*1.5)*13],[x,y],[x,y+1],[x-13,52+Math.sin((i-1)*1.5)*13]],'#394d66');}}
    if(n>=10)for(let i=0;i<6;i++)poly([[377+i*5,207],[389+i*5,189-i%2*4],[393+i*5,212]],i%2?'#5d9faf':'#9bbfc5');
    if(n>=11)for(let i=0;i<4;i++){rect(273+i*12,221,9,8,'#7b7a79');rect(276+i*12,222,3,5,'#b7b393');}
    if(n>=12)for(let i=0;i<48;i++)rect(13+i*10,20+Math.sin(i*.15+t*.08)*6,7,2,i%2?'#396573':'#4f7b82');
    const angle=t*(active?.8:.12),x=225+Math.cos(angle)*102,y=151+Math.sin(angle)*68;
    poly([[x-6,y+5],[x,y-8],[x+6,y+5],[x,y+2]],'#d6d7c5');rect(x-2,y-2,4,4,'#57889d');if(active)rect(x-1,y+6,2,10,'#e6b67c');
  }
  function fantasy(t,n,active,c){
    rect(0,0,480,270,c[2]);
    for(let y=0;y<270;y+=8)for(let x=0;x<480;x+=8){const k=hash(x+y*480);if(k>.77)rect(x+2,y+3,2,1,k>.9?'#91a168':'#3e5d50');}
    for(let i=0;i<14;i++){const x=i*38-9;if(x>235&&x<293)continue;poly([[x,62],[x+20,3],[x+42,62]],'#3a4c58');poly([[x+14,21],[x+20,3],[x+27,21]],'#b8c0b0');}
    // The river originates in the north mountain pass and stays in its valley.
    poly([[261,0],[281,0],[285,64],[269,122],[296,172],[284,270],[257,270],[270,177],[248,124],[264,63]],'#467b85');
    poly([[269,0],[275,0],[277,63],[258,124],[285,175],[274,270],[267,270],[277,175],[255,124],[270,62]],'#76a6a1');
    for(let i=0;i<14;i++)rect(265+Math.sin(i*.7)*9,Math.floor(t*5+i*19)%270,5,1,'#a9c3ad');
    for(const [x,y,w,h]of [[97,140,135,6],[116,140,6,75],[229,140,5,27],[230,163,150,6],[373,166,6,47]])rect(x,y,w,h,'#b1a476');
    for(const [x,y]of [[10,80],[37,101],[9,133],[42,169],[60,63]])tree(x,y,.75);
    for(const [x,y]of [[412,87],[442,97],[426,121],[452,132],[441,162],[460,184]])tree(x,y,.7);
    if(n>=1){rect(91,88,22,51,'#7e8193');rect(95,91,4,47,'#a7a6aa');poly([[85,90],[102,62],[119,90]],'#7f6096');rect(99,108,6,13,'#d1c595');rect(98,128,8,11,'#3a4658');}
    if(n>=2)for(const [x,y]of [[319,106],[366,110],[344,144]]){rect(x,y,19,18,'#d2bc99');poly([[x-6,y],[x-2,y-11],[x+10,y-16],[x+23,y-10],[x+26,y]],'#ad737e');rect(x+5,y+8,7,10,'#664c5d');rect(x+3,y-10,4,3,'#e2c5a3');}
    if(n>=3)for(const [x,y,h]of [[173,92,22],[191,87,31],[208,97,17]]){poly([[x-6,y],[x-4,y-h],[x,y-h-6],[x+6,y-h],[x+7,y]],'#9da8be');poly([[x,y],[x,y-h-6],[x+6,y-h],[x+7,y]],'#688ca8');}
    if(n>=4){rect(83,192,68,28,'#9c9b9d');rect(87,195,61,5,'#bcb9ac');for(const x of [77,139]){rect(x,174,18,46,'#7d8791');poly([[x-3,174],[x+9,158],[x+21,174]],'#656586');}rect(108,203,16,17,'#3a4855');for(let x=95;x<137;x+=10)rect(x,188,6,7,'#9c9b9d');}
    if(n>=5||active){const x=225+Math.sin(t*(active?.8:.18))*155,y=43+Math.cos(t*.3)*7;sprite(dragon,x-20,y-10,{1:'#375357',2:'#9bb37d'},2,Math.cos(t*.18)<0);}
    if(n>=6){rect(390,189,6,39,'#858799');rect(419,189,6,39,'#858799');rect(390,184,35,7,'#b2a5ac');rect(399,191,17,35,'#415b71');for(let i=0;i<5;i++)rect(402+i%2*7,196+i*6,2,2,'#adc9ca');}
    if(n>=7)for(const [x,y]of [[133,143],[199,143],[232,178],[354,168]]){rect(x,y-9,2,10,'#655a57');rect(x-1,y-12,4,4,'#dfc98b');}
    if(n>=8)for(let i=0;i<5;i++){rect(27+i*9,232-i%2*4,2,5,'#c5b59c');rect(24+i*9,230-i%2*4,8,3,'#aa818a');}
    if(n>=9){rect(257,160,36,12,'#a0b3b8');rect(257,158,36,3,'#c8d4bd');for(let i=0;i<4;i++)rect(262+i*8,165,4,6,'#5d8497');}
    else {rect(253,162,42,8,'#806d59');for(let i=0;i<6;i++)rect(257+i*6,162,1,8,'#b5a17c');}
    if(n>=10){rect(89,178,2,16,'#d0c9a5');rect(91,178,9,6,'#a66d82');rect(145,178,2,16,'#d0c9a5');rect(147,178,9,6,'#a66d82');}
    if(n>=11){poly([[406,61],[411,51],[431,48],[444,56],[441,64]],'#827b69');rect(421,50,7,9,'#c5b7a1');}
    if(n>=12)for(let i=0;i<8;i++)rect(377+i*4,211+i%3*7,2,2,'#cccf9d');
    if(active){rect(96,56,13,2,'#dfc98b');rect(101,51,2,13,'#dfc98b');}
  }
  function nature(t,n,active,c){
    rect(0,0,480,270,c[1]);rect(46,47,390,211,c[2]);rect(72,81,327,177,'#6d8b59');
    for(let i=0;i<85;i++)rect(67+hash(i)*335,64+hash(i+250)*193,2,1,i%3?'#82965d':'#a5ac70');
    // A top-down forest clearing, with a brook joining the pond from the north.
    poly([[317,0],[337,0],[330,66],[345,117],[336,172],[363,191],[391,229],[435,270],[409,270],[378,239],[346,210],[316,183],[323,119],[311,65]],'#467b7b');
    for(let i=0;i<20;i++){tree(i*28-15,5+hash(i)*28,1.1);if(i<9)tree(i%2?438:8,58+i*23,.9);}
    rect(93,151,221,7,'#b8ab7a');rect(213,151,7,99,'#b8ab7a');rect(313,141,107,7,'#b8ab7a');
    if(n>=1)tree(112,97,1.15,true);
    if(n>=2){rect(163,192,72,32,'#536e4d');for(let y=198;y<222;y+=9)for(let x=170;x<230;x+=10){rect(x,y,3,4,'#86a272');rect(x-1,y-2,5,3,(x+y)%3?'#d8bc8e':'#c88b82');}}
    if(n>=3){poly([[341,161],[370,154],[397,167],[407,190],[390,210],[356,213],[334,194]],'#527f83');poly([[350,170],[373,163],[392,174],[396,191],[382,202],[357,202],[344,190]],'#88b2a3');}
    if(n>=4){tree(181,57,.9);rect(199,92,14,14,'#c1a16b');rect(197,97,18,3,'#e2bc78');rect(202,103,6,4,'#665c4a');for(let i=0;i<3;i++)rect(215+Math.sin(t+i)*8,84+i*7,2,2,'#e3ce8f');}
    if(n>=5)sprite(fox,134+(Math.sin(t*.2)+1)*54,232+Math.sin(t*.7)*2,{1:'#a66751',2:'#d29b6c',3:'#e3d4ad',4:'#263f41'},2,Math.cos(t*.2)>0);
    if(n>=6){tree(409,66,1.4);rect(404,99,36,25,'#97765c');poly([[398,100],[422,85],[446,100]],'#b3946c');rect(416,106,10,12,'#304f4b');rect(428,126,2,27,'#c8b185');for(let i=0;i<5;i++)rect(424,128+i*5,10,1,'#c8b185');}
    if(n>=7)for(const [x,y]of [[118,110],[131,104],[139,120],[123,126]])rect(x,y,4,3,'#e3c7a3');
    if(n>=8)for(const [x,y]of [[340,169],[395,190],[372,208]]){rect(x,y,2,10,'#4a6e50');rect(x-3,y+3,8,2,'#7f9c64');}
    if(n>=9)for(let i=0;i<4;i++)rect(316+i*6,139+i%2*4,5,4,'#c4bfa4');
    if(n>=10){rect(74,211,34,18,'#526947');for(let i=0;i<6;i++){rect(77+i*5,214,2,10,'#8caa70');rect(76+i*5,218,4,2,'#c9c48b');}}
    if(n>=11){poly([[34,182],[35,163],[44,155],[58,159],[65,182]],'#757a65');rect(43,167,12,15,'#2d4a43');}
    if(n>=12)for(let i=0;i<18;i++)rect(65+hash(i+80)*355,74+hash(i+140)*139+Math.sin(t*.5+i)*4,1,2,(i+Math.floor(t))%3?'#7c9b66':'#d1d39b');
    if(active)for(let i=0;i<9;i++){const x=185+Math.sin(t*.8+i)*48,y=167+Math.cos(t*.6+i)*18;rect(x-3,y,2,3,'#d4b4a6');rect(x+1,y-1,2,3,'#e7ce91');}
  }
  const scenes={aquarium,city,space,fantasy,nature};
  return function renderRetro(now,key,count,event){
    const cssWidth=canvas.clientWidth,cssHeight=canvas.clientHeight;if(!cssWidth||!cssHeight)return;
    const t=reduced.matches?0:Math.floor(now/140)/7,n=Math.max(0,Math.min(12,Math.floor(count))),c=palettes[key];
    const active=event?.key===key&&now-event.at>=0&&now-event.at<6200;
    p.setTransform(1,0,0,1,0,0);p.imageSmoothingEnabled=false;scenes[key](t,n,active,c);
    const width=480,height=Math.max(1,Math.round(480*cssHeight/cssWidth));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    screen.setTransform(1,0,0,1,0,0);screen.imageSmoothingEnabled=false;screen.fillStyle=c[0];screen.fillRect(0,0,width,height);
    const hud=canvas.parentElement.querySelector('.hud'),reserve=hud&&!hud.hidden?hud.getBoundingClientRect().height+24:24;
    const safe=Math.ceil(reserve*width/cssWidth),scale=Math.min(1,Math.max(1,height-safe)/248),dw=Math.round(480*scale),dh=Math.round(270*scale);
    const x=Math.floor((width-dw)/2),y=Math.max(0,height-safe-Math.round(248*scale));
    screen.fillStyle=key==='aquarium'?c[1]:key==='nature'||key==='fantasy'?c[2]:c[0];screen.fillRect(0,0,width,height);
    screen.drawImage(frame,x,y,dw,dh);
    screen.fillStyle=key==='aquarium'?'#8f9d80':key==='city'?'#203f58':key==='fantasy'?c[2]:key==='nature'?c[1]:c[0];screen.fillRect(0,y+dh,width,height-y-dh);
    canvas.dataset.renderer='retro';
  };
}
