import qs from './qust.js';
import { getConfig } from "./get-config.js";
import { OffstageConfig, OffstageEndpoint, EndpointSignature, OffstageOverrideHandler, OffstageResponseError, OffstageState } from "./types";
import { getGlobal, isMockAllowed, isPlaywright, isProduction } from './mode.js';

const validateStatus = (config:OffstageConfig, response:Response) => {
  const defaultFunc = (status:number) => status >= 200 && status < 300;
  const func = config.validateStatus ?? defaultFunc;
  return func(response.status);
}

const tryParseJSON = (text:string) => {
  if(text === '') { return undefined; }
  try {
    return JSON.parse(text);
  } catch(e:any){
    console.error(e.message);
  }
}

export default (state:OffstageState) => {
  const createFetchRequest = async(url:string, options:any) => {
    const controller = new AbortController();
    const obj = {
      cancelGroup: options.cancelGroup ?? 'default',
      cancel: () => {
        controller.abort();
      },
    }
    state.activeRequests.add(obj);
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      state.activeRequests.delete(obj);
    });
  }

  const handleRestRequest = async(endpoint:string, requestData:any, config:OffstageConfig) => {
    const restData = {...requestData};
    const [method,pathPlusQuery] = endpoint.split(' ');
    const [path,query] = pathPlusQuery.split('?');

    let url = path.replace(/:([^\/]+)/g, (_:string,match:string) => {
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
    if(isPlaywright()) {
      config.headers = { ...config.headers, 'x-offstage-request': JSON.stringify(requestData) };
    }

    const getHeader = (config:any, name:string) => {
      if(!config.headers) { return undefined; }
      const key = Object.keys(config.headers).find(key => key.match(new RegExp(name,'i')));
      return key ? config.headers[key] : undefined;
    }
    if(getHeader(config, 'Content-Type') === undefined) {
      config.headers = { ...config.headers, 'Content-Type': 'application/json' };
    }

    const getParams = params ? '?' + qs.stringify(params) : '';
    const finalUrl = `${config.baseURL ?? ''}${url}${getParams}`;

    const response = await createFetchRequest(finalUrl, config);

    const resultData = tryParseJSON(await response.text());
    if(!validateStatus(config, response)) {
      const e = new Error('Response status was considered an error') as OffstageResponseError;
      e.requestData = requestData;
      e.responseData = resultData;
      e.responseStatus = response.status;
      throw e;
    }
    return [ resultData, response ];
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
    const response = await createFetchRequest(finalUrl, config);
    const resultData = tryParseJSON(await response.text());
    if(!validateStatus(config, response)) {
      const e = new Error('Response status was considered an error') as OffstageResponseError;
      e.requestData = requestData;
      e.responseData = resultData;
      throw e;
    }
    if(resultData === undefined) {
      throw Error('A JSONRPC response must either have a result or an error');
    }

    if(resultData.error) {
      const e = Error('RPC error');
      Object.assign(e, resultData.error);
      throw e;
    }
    return [ resultData.result, response ];
  }

  const calculateKey = async(serviceMethodName:string, requestData:any) => {
    return 'offstage-' + JSON.stringify({
      requestData,
      offstageServiceMethod: serviceMethodName,
    });
  }

  const loadCache = async(config:OffstageConfig, serviceMethodName:string, requestData:any) => {
    if(config.cacheSeconds === undefined) { return null; }

    const key = await calculateKey(serviceMethodName, requestData);
    const entry = sessionStorage.getItem(key);
    if(!entry) { return null; }

    const colon = entry.indexOf(':');
    const time = parseInt(entry.substring(0, colon));
    const elapsedSeconds = (Date.now() - time) / 1000;
    if(elapsedSeconds > config.cacheSeconds) {
      return null;
    }
    try {
      const response = JSON.parse(entry.substring(colon+1));
      return response;
    } catch(e) {
      return undefined;
    }
  }

  const saveCache = async(config:OffstageConfig, serviceMethodName:string, requestData:any, responseData:any) => {
    if(config.cacheSeconds === undefined) { return; }
    const key = await calculateKey(serviceMethodName, requestData);
    const time = Date.now()
    const json = JSON.stringify(responseData);
    const entry = `${time}:${json}`;
    sessionStorage.setItem(key, entry);
  }

  const endpoint = <ReqType, ResType>(endpoint:EndpointSignature, mock:(req:ReqType) => ResType):((args:ReqType, oneShotConfig?:OffstageConfig) => Promise<ResType>) & OffstageEndpoint => {
    const func = async(requestData:ReqType = {} as ReqType, oneShotConfig:OffstageConfig = {}):Promise<ResType> => {
      const { serviceMethodName } = (func as any);
      const config = await getConfig(state, { serviceMethodName }, oneShotConfig);

      const cachedResponse = await loadCache(config, serviceMethodName, requestData);
      if(cachedResponse !== null) {
        return cachedResponse;
      }
      if(isMockAllowed() && !isProduction()) {
        const responseData = mock(requestData);
        const { addHistory } = getGlobal()?.offstage ?? {};
        if(addHistory) {
          addHistory({ date:new Date(), serviceMethodName, endpoint, requestData, responseData });
        }
        saveCache(config, serviceMethodName, requestData, responseData);
        return responseData;
      }

      const handleFunc = endpoint.startsWith('JSONRPC') ? handleJsonRpcRequest : handleRestRequest;
      try {
        const [ responseData, response ] = await handleFunc(endpoint, requestData, config);
        if(response.headers.get('x-offstage-no-cache') !== '1') {
          saveCache(config, serviceMethodName, requestData, responseData);
        }
        return responseData;
      } catch(e) {
        if(config.onError) {
          return config.onError(e as Error);
        } else {
          throw e;
        }
      }
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
