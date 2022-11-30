import fs from 'fs';
import http from 'http';
import child_process from 'child_process';
import serveHandler from 'serve-handler';

const shell = (command, cwd = '') => new Promise((ok,fail) => {
  console.log(process.cwd())
  console.log(cwd.length
    ? `run "${command}" in ${cwd}`
    : `run "${command}"`);
  child_process.exec(command,
    { cwd:process.cwd() + '/' + cwd, stdio:'inherit' },
    (e, stdout, stderr) => {
      console.log(stdout)
      console.log(stderr)
      if(e) {
        return fail(e)
      }
      ok();
    }
  );
});


const editPackageJson = async(file, callback) => {
  const obj = callback( JSON.parse(await fs.promises.readFile(file)) );
  await fs.promises.writeFile(file, JSON.stringify(obj, null, 2));
}


const startServe = (dir) => new Promise(ok => {
  const server = http.createServer((request, response) => {
    return serveHandler(request, response, { public:dir });
  });
  server.listen(5173, () => {
    ok(server);
  });
  return server;
});


const stopServe = (server) => new Promise(ok => {
  server.close(ok);
});

const testDemo = async(packageJsonEditor) => {
  await editPackageJson('demo/vite/package.json', packageJsonEditor);
  await shell('npm run qbuild', 'demo/vite');
  const serve = await startServe(process.cwd() + '/demo/vite/dist');
  try {
    await shell('npx playwright test', 'demo/vite');
  } catch(e) {
    process.exit(1);
  } finally {
    await stopServe(serve);
    try {
      await shell('git restore demo/vite/package.json');
    } catch(e) {
    }
  }
}

const testDemoModule = async() => {
  await testDemo((obj) => ({ ...obj, type:'module' }));
}
const testDemoCommonjs = async() => {
  await testDemo((obj) => {
    const { type, ...rest } = obj;
    return rest;
  });
}

if(!fs.existsSync('demo/vite/node_modules')) {
  await shell('npm ci', 'demo/vite');
  await shell('ln -s ../../.. ./offstage', 'demo/vite/node_modules');
}
await testDemoModule();
await testDemoCommonjs();
