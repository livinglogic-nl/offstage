import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

let viteRunningProcess = null;
const killVite = () => {
  if(viteRunningProcess) {
    viteRunningProcess.kill();
    viteRunningProcess = null;
  }
}
test.afterAll(killVite);

const vitePort = 5173;
const baseURL = 'http://localhost:5173';


const execWithOutput = async(cmd:string, args:string[], options:any) => {
  const proc = child_process.spawn(cmd, args, options);
  proc.stdout.on('data', data => console.log(`${data}`));
  proc.stderr.on('data', data => console.log(`${data}`));
  let resolve = null;
  const p = new Promise(ok => resolve = ok);
  proc.on('exit', resolve);
  await p;
}

const runVite = async(fileOverrides:Record<string,string>, callback:Function) => {
  const dir = '/tmp/offstage-sandbox';
  child_process.execSync(`rsync -av tests/vite-sandbox/ ${dir} --delete`);

  await Promise.all(Object.entries(fileOverrides).map(async([key,val]) => {
    const filePath = dir + '/' + key;
    await fs.promises.mkdir(path.dirname(filePath), { recursive:true });
    await fs.promises.writeFile(filePath, val);
  }));
  if(!fs.existsSync(dir + '/node_modules')) {
    child_process.execSync(`npm i`, { cwd:dir });
  }
  child_process.execSync(`rm -rf ${dir}/node_modules/offstage`);
  child_process.execSync(`ln -s ${process.cwd()} ${dir}/node_modules/offstage`);


  await execWithOutput('node', ['node_modules/offstage/sync.mjs'], { cwd:dir });
  viteRunningProcess = child_process.spawn('node', [ 'node_modules/.bin/vite' ], { cwd:dir });

  let listeningCallback = null;
  const listening = new Promise(ok => listeningCallback = ok);
  viteRunningProcess.stdout.on('data', (data:Buffer) => {
    if(listeningCallback && data.toString().includes(vitePort.toString())) {
      listeningCallback();
      listeningCallback = null;
    }
  });
  await listening;
  await callback({ baseURL });

  const killed = new Promise(ok => viteRunningProcess.on('exit', ok));
  killVite();
  await killed;
}

export default runVite;
