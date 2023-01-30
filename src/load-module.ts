import fs from 'fs';
import { createHash } from 'node:crypto';
import esbuild from 'esbuild';

const transformed:Record<string,string> = {};

const getFileHash = async(file:string) => {
  const hash = createHash('sha256');
  hash.update(await fs.promises.readFile(file));
  return hash.digest('hex');
}

const transformFile = async(file:string, transFile:string) => {
  // const format = global['require'] === undefined ? 'esm' : 'cjs';
  const format = 'cjs';
  esbuild.buildSync({
    bundle: true,
    entryPoints: [ file ],
    external: [ 'offstage' ],
    platform: 'neutral',
    format,
    outfile: transFile,
  });
}

export default async(file:string) => {
  let result = transformed[file];
  if(!result) {
    const hash = await getFileHash(file);
    const transFile = `${process.cwd()}/node_modules/.offstage/${hash}.js`;
    if(!fs.existsSync(transFile)) {
      await transformFile(file, transFile);
    }
    result = transformed[file] = transFile;
  }
  const ff = await import(result);
  return ff.default ?? ff;
}
