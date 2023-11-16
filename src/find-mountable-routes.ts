interface FileContent {
  file:string;
  content:string;
}

const entriesWithOffstage = async() => {
  const fs = (await import('fs')).default;
  const fg = (await import('fast-glob')).default;
  let dir = process.cwd() + '/libs';
  if(!fs.existsSync(dir)) {
      dir = process.cwd() + '/src';
  }
  const entries = await fg([ dir + '/**/*.ts' ]);
  return (await Promise.all(entries.map(async(file) => {
    const content = (await fs.promises.readFile(file)).toString();
    return {
      file,
      content,
    }
  }))).filter((obj:any) => obj.content.includes(`from 'offstage/`));
}


const rewind = (str:string, index:number, startDelimit:string, endDelimit:string) => {
  const endIndex = str.lastIndexOf(endDelimit, index);
  const startIndex = str.lastIndexOf(startDelimit, endIndex);
  return str.substring(startIndex + startDelimit.length, endIndex);

}

export default async() => {
  const result:any[] = [];
  (await entriesWithOffstage()).forEach(async(fc:FileContent) => {
    const { content } = fc;

    for(let m of content.matchAll(/endpoint</g)) {
      const methodName = rewind(content, m.index!, ' ', ':');
      const exportConst = content.lastIndexOf('export const {', m.index);
      const closing = content.indexOf('}', exportConst);
      const serviceName = content.substring(
        exportConst + 'export const {'.length,
        closing,
      ).trim();

      const endpointMatch = content.substring(m.index!).match(/['"`](.+?)['"`]/);
      if(!endpointMatch) {
        throw Error('Could not find endpoint signature in source code');
      }
      result.push({
        serviceName,
        methodName,
        endpoint: endpointMatch[1],
        file: fc.file,
      });
    }
  });
  return result;
}
