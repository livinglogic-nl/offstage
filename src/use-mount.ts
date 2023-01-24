import fs from 'fs';
import loadModule from './load-module.js';
import qs from './qust.js';

export default (state:any) => {
  const getQueryParams = (url:string) => {
    if(!url.includes('?')) { return {}; }
    return qs.parse(url.split('?').pop() as string);
  }

  const getCallResponses = async(config:any, requestData:any, mods:any) => {
    const loaded = await loadModule(config.file);
    const serviceMethod = loaded[config.serviceName][config.methodName];
    const promise = mods.trigger[serviceMethod.serviceMethodName];
    if(promise) {
      await promise;
    }
    const defaultResponse = await serviceMethod(requestData);
    const override = mods.override[serviceMethod.serviceMethodName];
    return {
      defaultResponse,
      ...(override
        ? { overrideResponse: await override(requestData, defaultResponse) }
        : {}
      ),
    };
  }

  const useHandlePact = (pactConfig:any, testInfo:any) => {
    if(pactConfig === undefined) { return () => {} }
    if(testInfo === undefined) {
      console.log('WARNING: Offstage Pact is configured but no testInfo is provided with the mount() call.');
      return () => {}
    }
    return (config:any, path:string, queryParams:any, bodyParams:any, responses:any) => {
      const { outputDir } = testInfo;
      if(!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive:true });
      }
      const title = testInfo.title;
      const jsonlFile = `${outputDir}/offstage-pact.jsonl`;
      fs.promises.appendFile(jsonlFile, JSON.stringify({
        title,
        path,
        queryParams,
        bodyParams,
        responses,
        ...config,
      })+'\n');
    }
  }
  
  const packJSONRPC = (id:any, result:any) => {
    let error = undefined;
    if(result.error) {
      error = result.error;
      result = undefined;
    }
    return {
      jsonrpc: '2.0',
      result,
      error,
      id,
    }
  }
  const finalResponse = (responses:any) => responses.overrideResponse ?? responses.defaultResponse;

  const mount = async(pageObject:any, testInfo?:any) => {
    const page = pageObject.page ?? pageObject;
    const loadConfig = (await import('./pact/load-config.js')).default;
    const offstageConfig = await loadConfig();
    const handlePact = useHandlePact(offstageConfig.pact, testInfo);

    page._offstage = {
      override: {},
      trigger: {},
    };
    state.currentContext = page;

    const findMountableRoutes = (await import('./find-mountable-routes.js')).default;
    await page.evaluate(() => {
      (window as any).isOffstagePlaywright = true;
    });
    await page.addInitScript(() => {
      (window as any).isOffstagePlaywright = true;
    });
    process.env.OFFSTAGE_IMPORT_FROM_TEST = '1';

    const mountable = await findMountableRoutes();
    if(mountable.length === 0) {
      console.log('[offstage] no services found in src/ directory.');
    }

    const map:any = {};
    await Promise.all(mountable.map(async(config) => {
      const [method, url] = config.endpoint.split(' ');
      if(method !== 'JSONRPC') {
        const [path] = url.split('?');
        if(!map[path]) {
          map[path] = {};
          const pathPattern = path.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
          const urlPattern = '.+' + pathPattern;
          await page.route(new RegExp(urlPattern), async(route:any, request:any) => {
            const url = request.url();
            const beforeQuery = url.split('?').shift();
            if(!beforeQuery.match(new RegExp(pathPattern + '$'))) {
              return route.continue();
            }
            const config = map[path][request.method()];
            if(!config) { return route.continue(); }

            const urlMatch = new RegExp(pathPattern).exec(url);
            const queryParams = getQueryParams(url);
            const bodyParams = request.postDataJSON();

            const requestData = JSON.parse(request.headers()['x-offstage-request']);
            const responses = await getCallResponses(config, requestData, page._offstage);
            handlePact(config, urlMatch![0], queryParams, bodyParams, responses);
            route.fulfill({ body: JSON.stringify(finalResponse(responses)) });
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

            const responses = await getCallResponses(config, requestData.params, page._offstage);
            const packedResponses = Object.entries(responses).reduce(
              (a,[key,val]) => (
                { ...a, [key]: packJSONRPC(requestData.id, val)})
            ,{} as any);

            handlePact(config, path, {}, requestData, packedResponses);
            route.fulfill({
              body: JSON.stringify(finalResponse(packedResponses))
            });
          });
        }
        map[path][rpcMethod] = config;
      }
    }));
  }
  return mount;

}
