const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
const vendor=name=>fs.readFileSync(path.join(__dirname,'../vendor/pdfjs',name));
const pdfRuntime={version:'6.5.438',engine:vendor('pdf.min.mjs').toString('base64'),worker:vendor('pdf.worker.min.mjs').toString('base64'),license:vendor('LICENSE').toString('utf8')};
const page = read('page.html')
  .replace('/* PDF_RUNTIME */',()=>JSON.stringify(pdfRuntime))
  .replace('/* STYLE */', () => '\n'+read('page.css'))
  .replace('/* SCRIPT */', () => '\n'+read('retro.js')+'\n\n'+read('worlds.js')+'\n\n'+read('app.js')+'\n\n'+read('classroom.js')+'\n\n'+read('modules.js')+'\n\n'+read('whiteboard.js'));
fs.writeFileSync(path.join(__dirname,'../index.html'),page);
