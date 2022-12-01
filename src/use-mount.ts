import fs from 'fs';

export default (state:any) => {
  const getParamsObject = async(request:any) => {
    const { URLSearchParams } = await import('url');
    const query = request.url().split('?').pop();
    return Object.fromEntries( new URLSearchParams(query).entries() );
  }

  const injectOffstageProxy = (str:string):string => {
    return str.replace(/var (.*) = require\("offstage"\);/g, (_,symbol) => `
var ${symbol} = {
  service: (eps) => new Proxy(eps, { get: (obj, key) => obj[key] ?? obj }),
  endpoint: (_,mockFunction) => mockFunction,
  factory: (defaultObject) => (override = {}) => ({...defaultObject, ...override}),
}`.trim());
  }

  const loadModule = async(file:string) => {
    try {
      const loaded = await import(/* @vite-ignore */file);
      return loaded;
    } catch(e) {
      const esbuild = await import('esbuild');
      const result = esbuild.buildSync({
        bundle: true,
        entryPoints: [ file ],
        external: [ 'offstage' ],
        platform: 'neutral',
        format: 'cjs',
        write: false,
        outdir: 'out',
      });
      const outFile = result.outputFiles[0];

      const exportsRegex = /module.exports = __toCommonJS\((.+?)\);/
      let sourceCode = injectOffstageProxy(outFile.text);
      const match = sourceCode.match(exportsRegex);
      if(!match) {
        throw Error('Could not find module exports line.');
      }

      const [,returnSymbol] = match;
      sourceCode = sourceCode.replace(exportsRegex, '')
        + `return __toCommonJS(${returnSymbol})`;
      return (new Function(sourceCode))();
    }
  }

  const getCallResult = async(config:any, requestData:any, overrides:any) => {
    const loaded = await loadModule(config.file);
    const serviceMethod = loaded[config.serviceName][config.methodName];
    let result = await serviceMethod(requestData);

    const override = overrides[serviceMethod.serviceMethodName];
    if(override) {
      result = await override(requestData, result);
    }
    return result;
  }

  const mount = async(page:any) => {
    page._offstageOverride = {};
    state.currentContext = page;

    const findMountableRoutes = (await import('./find-mountable-routes.js')).default;
    await page.addInitScript(() => {
      (window as any).isOffstagePlaywright = true;
    });
    process.env.OFFSTAGE_IMPORT_FROM_TEST = '1';

    const mountable = await findMountableRoutes();

    const map:any = {};
    await Promise.all(mountable.map(async(config) => {
      const [method, url] = config.endpoint.split(' ');
      if(method !== 'JSONRPC') {
        const [path] = url.split('?');
        if(!map[path]) {
          map[path] = {};
          const pattern = '.+' + path.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
          await page.route(new RegExp(pattern), async(route:any, request:any) => {
            const config = map[path][request.method()];
            if(!config) { return route.continue(); }

            const requestData = request.method() === 'GET'
              ? await getParamsObject(request)
              : request.postDataJSON();

            const result = await getCallResult(config, requestData, page._offstageOverride);
            route.fulfill({ body: JSON.stringify(result) });
          });
        }
        map[path][method] = config;
      } else {
        const [,path, rpcMethod] = url.match(/(.+?)([^\/]+)$/);
        if(!map[path]) {
          map[path] = {};
          await page.route('**'+path, async(route:any, request:any) => {
            if(request.method() !== 'POST') { return route.continue(); }

            const requestData = request.postDataJSON();
            if(requestData.jsonrpc !== '2.0') { return route.continue(); }

            const config = map[path][requestData.method];
            if(config?.file === undefined) { return route.continue(); }

            let result = await getCallResult(config, requestData.params, page._offstageOverride);
            let error = undefined;
            if(result.error) {
              error = result.error;
              result = undefined;
            }

            route.fulfill({
              body: JSON.stringify({
                jsonrpc: '2.0',
                result,
                error,
                id: requestData.id,
              })
            });
          });
        }
        map[path][rpcMethod] = config;
      }
    }));
  }
  return mount;

}
