const fs = require('fs');
const esbuild = require('esbuild');

const rootDir = process.cwd();
const sourceDir = `${rootDir}/src`;

const { generate } = require('./index.js');

const convertMockToJavascript = async() => {
  await esbuild.build({
    entryPoints: ['src/offstage/mock.ts'],
    platform: 'node',
    bundle: true,
    external: [ 'offstage' ],
    format: 'cjs',
    outfile: 'src/offstage/mock.js',
  });
}

const writeApiFile = async() => {
  await import(rootDir + '/src/offstage/mock.js')
  fs.writeFileSync(`${sourceDir}/offstage/index.ts`, generate());
}

convertMockToJavascript().then(writeApiFile);

