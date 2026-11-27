const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname,'../src',name),'utf8');
const page = read('page.html')
  .replace('/* STYLE */', () => '\n'+read('page.css'))
  .replace('/* SCRIPT */', () => '\n'+read('worlds.js')+'\n\n'+read('app.js')+'\n\n'+read('classroom.js')+'\n\n'+read('modules.js')+'\n\n'+read('whiteboard.js'));
fs.writeFileSync(path.join(__dirname,'../index.html'),page);
