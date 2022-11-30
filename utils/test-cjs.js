import fs from 'fs';
import { testDemoCommonjs } from './shared.js';

if(!fs.existsSync('demo/vite/node_modules')) {
  await shell('npm ci', 'demo/vite');
  await shell('ln -s ../../.. ./offstage', 'demo/vite/node_modules');
}
await testDemoCommonjs();
