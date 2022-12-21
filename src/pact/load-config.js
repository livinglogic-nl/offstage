import fs from 'fs';
import esbuild from 'esbuild';

let loaded = null;

const load = async() => {
  const sourceFile = 'offstage.config.ts';
  if(!fs.existsSync(sourceFile)) {
    return {};
  }
  const result = esbuild.buildSync({
    bundle: true,
    entryPoints: [ sourceFile ],
    platform: 'neutral',
    format: 'esm',
    write: false,
    outdir: 'out',
  });
  const sourceCode = result.outputFiles[0].text
    .replace(/export [\s\S]+/, '')
    .replace(/var offstage_config_default =/, 'return');

  return (new Function(sourceCode))();
}

export default async() => {
  if(!loaded) {
    loaded = await load();
  }
  return loaded;
}

