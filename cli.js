#!/usr/bin/env node
const [,,cmd] = process.argv;
if(cmd === 'sync') {
  require('./sync.js');
}
