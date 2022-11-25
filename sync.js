const path = require('path');
const fastGlob = require('fast-glob');
const fs = require('fs');
const esbuild = require('esbuild');

const rootDir = process.cwd();
const offstageDir = `${rootDir}/src/offstage`;

const { generate } = require('./index.js');

const tsFile = `${offstageDir}/mock.ts`;
const apiFile = `${offstageDir}/index.ts`;
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


const relative = (file) => {
  const result = path.relative(offstageDir, file).replace(/.ts$/,'');
  return result.startsWith('.') ? result : './'+result;
}

const getCustomRequestResponses = async() => {
  const tsFilesInOffstageFolder = (await fastGlob(`${offstageDir}/**/*.ts`))
      .filter(file => file != apiFile)
  const tsFileContents = await Promise.all(tsFilesInOffstageFolder.map(async(file) => {
    const content = (await fs.promises.readFile(file)).toString();
    return { file, content};
  }));

  const findImport = (name) => {
    const needle = `export interface ${name}`;
    const result = tsFileContents.find(record => record.content.includes(needle));
    if(!result) {
      throw Error(`Import not found for ${name}.`);
    }
    return { name, file:relative(result.file) };
  }

  const nameToImports = [];
  const map = {};
  const allContents = tsFileContents.map(obj => obj.content).join('\n');
  for(let m of allContents.matchAll(/create<(.+),(.+)>.*?['"`](.+?)['"`]/g)) {
    const [,requestName,responseName, signature] = [...m].map(s => s.trim());
    nameToImports.push( findImport(requestName), findImport(responseName) );
    map[signature] = {
      request: { name: requestName },
      response: { name: responseName },
    };
  }

  const imports = {};
  nameToImports.forEach(({name,file}) => {
    let record = imports[file];
    if(!record) {
      record = imports[file] = [];
    }
    record.push(name);
  });
  return {
    imports,
    map,
  }
}

const writeApiFile = async() => {
  delete require.cache[jsFile];
  require(jsFile)
  fs.writeFileSync(apiFile, generate( await getCustomRequestResponses() ));
}

const sync = async() => {
  if(!fs.existsSync(tsFile)) {
    console.log(`Could not find ${tsFile}.`)
    process.exit(1);
  }
  await convertMockToJavascript();
  await writeApiFile();
}

if (require.main === module) {
  sync();
} else {
  module.exports = sync;
}
