
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
        console.log('TODO RPC')
      }
    }));
  }
  return mount;

}
