import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

let viteRunningProcess:any = null;
const killVite = () => {
  if(viteRunningProcess) {
    viteRunningProcess.kill();
    viteRunningProcess = null;
  }
}
test.afterAll(killVite);

const vitePort = 5173;
const baseURL = 'http://localhost:5173';
const sandboxDir = '/tmp/offstage-sandbox';


const resetSandbox = async() => {
  child_process.execSync(`rsync -av tests/vite-sandbox/ ${sandboxDir} --exclude node_modules --delete`);
}

const addCustomFiles = async(customFiles:Record<string,string>) => {
  await Promise.all(Object.entries(customFiles).map(async([key,val]) => {
    const filePath = sandboxDir + '/' + key;
    await fs.promises.mkdir(path.dirname(filePath), { recursive:true });
    await fs.promises.writeFile(filePath, val);
  }));
}

const installNodeModulesAndLinkOffstage = async() => {
  if(!fs.existsSync(sandboxDir + '/node_modules')) {
    child_process.execSync([
      `npm i`,
      `rm -rf node_modules/offstage`,
      `ln -s ${process.cwd()} node_modules/offstage`,
      ].join(' && '), { cwd:sandboxDir });
  }
}

const runVite = async(customFiles:Record<string,string>, callback:Function) => {
  process.env.OFFSTAGE_SANDBOX_DIR = sandboxDir;
  await resetSandbox();
  await addCustomFiles(customFiles);
  await installNodeModulesAndLinkOffstage();

  viteRunningProcess = child_process.spawn('node', [ 'node_modules/.bin/vite' ], { cwd:sandboxDir });

  let listeningCallback:any = null;
  const listening = new Promise(ok => listeningCallback = ok);
  viteRunningProcess.stdout.on('data', (data:Buffer) => {
    if(listeningCallback && data.toString().includes(vitePort.toString())) {
      listeningCallback();
      listeningCallback = null;
    }
  });
  await listening;

  Object.keys(require.cache)
    .filter(key => key.includes('/tmp/'))
    .forEach(key => delete require.cache[key])
  await callback({ sandboxDir, baseURL });

  const killed = new Promise(ok => viteRunningProcess.on('exit', ok));
  killVite();
  await killed;
}

export default runVite;
