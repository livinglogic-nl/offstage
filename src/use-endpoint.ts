import qs from 'qs';
import { getConfig } from "./get-config.js";
import { OffstageConfig, OffstageEndpoint, OffstageOverrideHandler, OffstageResponseError, OffstageState } from "./types";

const allowMock = () => {
  try {
    if((window as any).isOffstagePlaywright) {
      return false;
    }
  } catch(_) {}
  return true;
}

const isImportFromTest = () => {
  try {
    if(process.env.OFFSTAGE_IMPORT_FROM_TEST !== undefined) {
      return true;
    }
  } catch(_) {}
  return false;
}

const isProduction = () => {
  try {
    if(process.env.NODE_ENV === 'production') {
      return true;
    }
  } catch(_) {}
  return false;
}

const validateStatus = (config:OffstageConfig, response:Response) => {
  const defaultFunc = (status:number) => status >= 200 && status < 300;
  const func = config.validateStatus ?? defaultFunc;
  return func(response.status);
}

export default (state:OffstageState) => {
  const handleRestRequest = async(endpoint:string, requestData:any, config:OffstageConfig) => {
    const restData = {...requestData};
    const [method,pathPlusQuery] = endpoint.split(' ');
    const [path,query] = pathPlusQuery.split('?');

    let url = path.replace(/:([^\/]+)/, (_:string,match:string) => {
      const value = restData[match];
      delete restData[match]
      return value;
    });

    const params = method === 'GET' ? restData : null;
    if(query) {
      query.split(',').forEach((name:string) => {
        params[name] = requestData[name];
      });
    }

    config.method = method;
    if(method !== 'GET') {
      config.body = JSON.stringify(restData);
    }

    const getParams = params ? '?' + qs.stringify(params) : '';
    const finalUrl = `${config.baseURL ?? ''}${url}${getParams}`;

    const response = await fetch(finalUrl, config);
    const resultData = await response.json();
    if(!validateStatus(config, response)) {
      const e = new Error('Response status was considered an error') as OffstageResponseError;
      e.responseData = resultData;
      throw e;
    }
    return resultData;
  }

  const handleJsonRpcRequest = async(endpoint:string, requestData:any, config:OffstageConfig) => {
    const restData = {...requestData};
    const [_,url] = endpoint.split(' ');

    const [,path,method] = url.match(/(.*\/)([^\/]+)$/)!;
    config.method = 'POST';
    config.body = JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: restData,
    });

    const finalUrl = `${config.baseURL ?? ''}${path}`;
    const result = await fetch(finalUrl, config);
    const resultData = await result.json();
    if(resultData === undefined) {
      throw Error('A JSONRPC response must either have a result or an error');
    }

    if(resultData.error) {
      const e = Error('RPC error');
      Object.assign(e, resultData.error);
      throw e;
    }
    return resultData.result;
  }

  const calculateKey = async(requestData:any) => {
    const encoded = (new TextEncoder()).encode(JSON.stringify(requestData));
    return 'offstage-' + crypto.subtle.digest('sha-1', encoded);
  }

  const loadCache = async(config:OffstageConfig, requestData:any) => {
    if(config.cacheSeconds === undefined) { return null; }

    const key = await calculateKey(requestData);
    const entry = sessionStorage.getItem(key);
    if(!entry) { return null; }

    const colon = entry.indexOf(':');
    const time = parseInt(entry.substring(0, colon));
    const elapsedSeconds = (Date.now() - time) / 1000;
    if(elapsedSeconds > config.cacheSeconds) {
      return null;
    }
    const response = JSON.parse(entry.substring(colon+1));
    return response;
  }

  const saveCache = async(config:OffstageConfig, requestData:any, responseData:any) => {
    if(config.cacheSeconds === undefined) { return; }
    const key = await calculateKey(requestData);
    const time = Date.now()
    const json = JSON.stringify(responseData);
    const entry = `${time}:${json}`;
    sessionStorage.setItem(key, entry);
  }

  const endpoint = <ReqType, ResType>(endpoint:string, mock:(req:ReqType) => ResType):((args:ReqType) => Promise<ResType>) & OffstageEndpoint => {
    const func = async(requestData:ReqType = {} as ReqType, oneShotConfig:OffstageConfig = {}):Promise<ResType> => {
      const config = await getConfig(state, {
        serviceMethodName: (func as any).serviceMethodName,
      }, oneShotConfig);

      const cachedResponse = await loadCache(config, requestData);
      if(cachedResponse) {
        return cachedResponse;
      }
      if(allowMock() && !isProduction()) {
        const responseData = mock(requestData);
        if(!isImportFromTest()) {
          console.debug(`[offstage]`, endpoint, requestData, responseData);
        }
        saveCache(config, requestData, responseData);
        return responseData;
      }

      const handleFunc = endpoint.startsWith('JSONRPC') ? handleJsonRpcRequest : handleRestRequest;
      const responseData = await handleFunc(endpoint, requestData, config);
      saveCache(config, requestData, responseData);
      return responseData;
    }
    func.override = (handler:OffstageOverrideHandler) => {
      state.currentContext!._offstage.override[(func as any).serviceMethodName] = handler;
    }
    func.waitForTrigger = () => {
      let triggerFunction = null;
      const promise = new Promise(ok => {
        triggerFunction = ok;
      });

      state.currentContext!._offstage.trigger[(func as any).serviceMethodName] = promise;
      return triggerFunction as unknown as () => void;
    }
    return func;
  }
  return endpoint;
}
