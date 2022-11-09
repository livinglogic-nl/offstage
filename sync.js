const fs = require('fs');
const esbuild = require('esbuild');

const rootDir = process.cwd();

const { generate } = require('./index.js');

const tsFile = `${rootDir}/src/offstage/mock.ts`;
const apiFile = `${rootDir}/src/offstage/index.ts`;
const jsFile = `${rootDir}/node_modules/offstage/mock.cjs`;

const convertMockToJavascript = async() => {
  await esbuild.build({
    entryPoints: [ tsFile ],
    platform: 'node',
    bundle: true,
    external: [ 'offstage' ],
    format: 'cjs',
    outfile: jsFile,
  });

  let result = (await fs.promises.readFile(jsFile)).toString();
  result = result.replace('"offstage"', '"."');
  await fs.promises.writeFile(jsFile, result);
}

const writeApiFile = async() => {
  delete require.cache[jsFile];
  require(jsFile)
  fs.writeFileSync(apiFile, generate());
}

if(fs.existsSync(tsFile)) {
  convertMockToJavascript().then(writeApiFile);
} else {
  console.log(`Could not find ${tsFile}.`)
}

