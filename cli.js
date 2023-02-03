#!/usr/bin/env node

const [,,cmd] = process.argv


if(cmd === 'pact') {
  import('./dist/cjs/pact/index.js');
}

