import fs from 'fs';
import fg from 'fast-glob';
import { URLSearchParams } from 'url';

interface FileContent {
  file:string;
  content:string;
}
const entriesWithOffstage = async() => {
  const dir = process.cwd() + '/src';
  const entries = await fg([ dir + '/**/*.ts' ]);
  return (await Promise.all(entries.map(async(file) => {
    const content = (await fs.promises.readFile(file)).toString();
    return {
      file,
      content,
    }
  }))).filter((obj:any) => obj.content.includes(`from 'os3'`));
}

const mountableRoutes = async() => {
  const result:any[] = [];
  (await entriesWithOffstage()).forEach(async(fc:FileContent) => {
    const { content } = fc;
    const lines = content.split('\n');
    lines.forEach((line,idx) => {
      const m = line.match(/method<.+?,.+?>\(['"`](.+?)['"`]/);
      if(!m) { return; }

      const [,endpoint] = m;
      const methodNameMatch = line.match(/([A-z0-9_]+?):/);
      if(!methodNameMatch) {
        throw Error(`A method name was expected in: ${line}`);
      }
      const methodName = methodNameMatch[1];

      const serviceLine = lines.slice(0,idx).reverse().find(line => line.startsWith('export const'));
      if(!serviceLine) {
        throw Error(`A service was expected before: ${line}`);
      }
      const serviceMatch = serviceLine.match(/export const ([^ ]+)/);
      if(!serviceMatch) {
        throw Error(`A service name was expected in: ${serviceLine}`);
      }
      const serviceName = serviceMatch[1];
      result.push({
        endpoint,
        serviceName,
        methodName,
        file: fc.file,
      });
    });
  });
  return result;
}

const getParamsObject = (request:any) => {
  const query = request.url().split('?').pop();
  return Object.fromEntries( new URLSearchParams(query).entries() );
}

const useRouteHandler = (method:string, config:any) => async(route:any, request:any) => {
  if(route.request().method() !== method) {
    return route.fallback();
  }
  const loaded = await import(config.file);
  const serviceMethod = loaded[config.serviceName][config.methodName];
  const requestData = method === 'GET'
    ? getParamsObject(request)
    : request.postDataJSON();

  let result = await serviceMethod(requestData);
  if(serviceMethod.overrideHandler) {
    result = await serviceMethod.overrideHandler(requestData, result);

  }
  route.fulfill({ body: JSON.stringify(result) });
}


export const mount = async(page:any) => {
  await page.addInitScript(() => {
    (window as any).isOffstagePlaywright = true;
  });
  process.env.IS_OFFSTAGE_PLAYWRIGHT = '1';

  const mountable = await mountableRoutes();
  await Promise.all(mountable.map(async(config) => {
    const [method, url] = config.endpoint.split(' ');
    if(method !== 'JSONRPC') {
      const [path] = url.split('?');
      const pattern = '.+' + path.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
      return page.route(new RegExp(pattern), useRouteHandler(method, config));
    } else {
      console.log('TODO RPC')
      // return handleRPC(url, config);
    }
  }));
}
