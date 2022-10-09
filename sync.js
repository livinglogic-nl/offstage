const fs = require('fs');
const esbuild = require('esbuild');

const rootDir = process.cwd();
const sourceDir = `${rootDir}/src`;

const { generate } = require('./index.js');

const tsFile = rootDir + '/src/offstage/mock.ts';
const jsFile = rootDir + '/src/offstage/mock.js'

const convertMockToJavascript = async() => {
  await esbuild.build({
    entryPoints: [ tsFile ],
    platform: 'node',
    bundle: true,
    external: [ 'offstage' ],
    format: 'cjs',
    outfile: jsFile,
  });
}

const writeApiFile = async() => {
  Object.keys(require.cache)
    .filter(key => key.includes('/tmp/'))
    .forEach(key => delete require.cache[key])

  require(rootDir + '/src/offstage/mock.js')
  fs.writeFileSync(`${sourceDir}/offstage/index.ts`, generate());
}

if(fs.existsSync(tsFile)) {
  convertMockToJavascript().then(writeApiFile);
} else {
  console.log(`Could not find ${tsFile}.`)
}

