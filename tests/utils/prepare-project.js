import path from 'path';
import os from 'os';
import esbuild from 'esbuild';
import child_process from 'child_process';
import fs from 'fs';

import { createServer }  from './create-server.js';

export const prepareProject = async(fileContents) => {
  const withDefaultsFileContents = {
    'package.json': JSON.stringify({ type: 'module' }),
    'index.html': `
      <!DOCTYPE html>
      <body>
        <script type="module" src="app.js"></script>
      </body>
      </html>
    `,
    'playwright.config.ts': `
      export default {}
    `,
    ...fileContents,
  };
  const dir = fs.mkdtempSync(os.tmpdir());
  child_process.execSync(`mkdir -p ${dir}/node_modules`);
  child_process.execSync(`ln -s ${process.cwd()} ${dir}/node_modules/offstage`);
  child_process.execSync(`ln -s ${process.cwd()}/node_modules/@playwright ${dir}/node_modules/@playwright`);
  child_process.execSync(`ln -s ${process.cwd()}/node_modules/playwright-core ${dir}/node_modules/playwright-core`);

  await Promise.all(Object.entries(withDefaultsFileContents).map(async([key,val]) => {
    const url = `${dir}/${key}`;
    const childDir = path.dirname(url);
    if(!fs.existsSync(childDir)) {
      await fs.promises.mkdir(childDir, { recursive:true });
    }
    await fs.promises.writeFile(url, val);
  }));


  const build = async({ prod = true }) => {
    esbuild.buildSync({
      entryPoints: [ 'src/app.ts' ],
      outfile: 'app.js',
      format: 'esm',
      platform: 'node',
      bundle: true,
      absWorkingDir:dir,
      define: {
        'process.env.NODE_ENV': prod ? '"production"' : '"development"',
      },
    });
  }
  const run = async() => new Promise(ok => {
    child_process.exec(`node app.js`, {
      cwd: dir,
    }, (e, stdout, stderr) => {
        if(stderr) {
          console.log(stderr)
        }
        ok({ e, stdout, stderr });
      });
  });

  const serve = async() => {
    const state = await createServer(async(req,res) => {
      if(req.url === '/favicon.ico') { return res.end('') }
      if(req.url === '/') {
        const cnt = await fs.promises.readFile(dir+'/index.html');
        return res.end(cnt);
      }
      const ext = path.extname(req.url);
      if(ext === '.js') {
        res.setHeader('Content-Type', 'text/javascript');
      }
      const cnt = await fs.promises.readFile(dir+req.url);
      return res.end(cnt);
    }, { port: 5173, oneShot:false });
    return async() => {
      await state.server.close();
    }
  }

  const serveAndPlay = async() => {
    const stop = await serve();
    const cmd = 'node node_modules/playwright-core/lib/cli/cli.js test';
    await new Promise((ok,fail) => {
      child_process.exec(cmd, {
        cwd: dir,
        stdio: 'inherit',
      }, (e,stdout, stderr) => {
          if(e) {
            console.log(stdout)
            console.log(stderr)
          }
          e ? fail() : ok();
        });
    });
    await stop();
  }

  return {
    dir,
    build,
    run,
    buildAndRun: async(options) => {
      await build(options);
      return run();
    },
    serve,
    serveAndPlay,
  }
}

