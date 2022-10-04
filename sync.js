const fs = require('fs');
const esbuild = require('esbuild');

const rootDir = process.cwd();
const sourceDir = `${rootDir}/src`;
const typescriptFile = `${rootDir}/generator.ts`;
const javascriptFile = `${rootDir}/generator.js`;

// 1. generate a typescript file that:
//  - imports the mock
//  - generates the api
const generateTypescriptFile = async() => {
  await fs.promises.writeFile(typescriptFile, `
import fs from 'fs';
import { generate } from 'offstage/index.mjs';
await import('${sourceDir}/offstage/mock.ts');
const api = generate();
fs.writeFileSync('${sourceDir}/offstage/index.ts', api);
`);

}

// 2. convert the typescript file to javascript
const convertToJavascript = async() => {
  await esbuild.build({
    entryPoints: [typescriptFile],
    platform: 'node',
    bundle: true,
    external: [ 'offstage' ],
    format: 'esm',
    outfile: javascriptFile,
  });
}

// 3. execute the javascript file
const executeJavascript = async() => {
  import(javascriptFile);
}


(async() => {
  await generateTypescriptFile();
  await convertToJavascript();
  await executeJavascript();
})();


