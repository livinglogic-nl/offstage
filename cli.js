#!/usr/bin/env node

const [,,cmd] = process.argv


if(cmd === 'pact') {
  import('./pact.js');
}

