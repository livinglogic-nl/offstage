
export default () => {
  const getParamsObject = async(request:any) => {
    const { URLSearchParams } = await import('url');
    const query = request.url().split('?').pop();
    return Object.fromEntries( new URLSearchParams(query).entries() );
  }

  const mount = async(page:any) => {
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
            if(!config) {
              return route.continue();
            }
            const loaded = await import(/* @vite-ignore */config.file);
            const serviceMethod = loaded[config.serviceName][config.methodName];
            const requestData = request.method() === 'GET'
              ? await getParamsObject(request)
              : request.postDataJSON();

            let result = await serviceMethod(requestData);
            if(serviceMethod.overrideHandler) {
              result = await serviceMethod.overrideHandler(requestData, result);
            }
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

            const loaded = await import(/* @vite-ignore */config.file);
          });
        }
        map[path][rpcMethod] = config;
        // console.log({path, rpcMethod, method,url})

      }
    }));
  }
  return mount;

}
