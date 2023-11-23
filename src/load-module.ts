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
  const format = 'cjs';
  esbuild.buildSync({
    bundle: true,
    entryPoints: [ file ],
    external: [ 'offstage' ],
    platform: 'node',
    format,
    outfile: transFile,
  });
}


const fileIsNewer = async(a:string,b:string) => {
  const [as,bs] = await Promise.all([ fs.promises.stat(a), fs.promises.stat(b) ]);
  return new Date(as.mtime) > new Date(bs.mtime);
}

export default async(file:string) => {
  let result = transformed[file];
  if(!result) {
    const hash = await getFileHash(file);
    const transFile = `${process.cwd()}/node_modules/.offstage/${hash}.js`;
    if(!fs.existsSync(transFile) || await fileIsNewer(file, transFile)) {
      await transformFile(file, transFile);
    }
    result = transformed[file] = transFile;
  }
  const ff = await import(result);
  return ff.default ?? ff;
}
