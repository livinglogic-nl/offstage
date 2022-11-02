import axios from 'axios';

const canonical = (obj:any) => {
  if(obj === undefined) { return '{}'; }
  const keys = new Set();
  JSON.stringify(obj, (key, value) => (keys.add(key), value));
  return JSON.stringify(obj, Array.from(keys).sort() as string[]);
}

const isPlaywright = () => ('offstagePlaywright' in window);

const mockResponse = async(requestData:any, mocks:any) => {
  const requestSignature = JSON.stringify(requestData);
  const response = mocks[requestSignature] ?? Object.values(mocks)[0];
  return response;
}

const restResponse = async(config:any, requestData:any) => {
  const restData = {...requestData};
  const [path,query] = config.url.split('?');
  let url = path.replace(/:([^\/]+)/, (_:string,match:string) => {
    const value = restData[match];
    delete restData[match]
    return value;
  });
  const params = config.method === 'GET' ? restData : {};
  const data = config.method !== 'GET' ? restData : {};

  if(query) {
    query.split(',').forEach((name:string) => {
      params[name] = requestData[name];
    });
  }

  const headers = config.headers || {};
  if(isPlaywright()) {
    headers['x-offstage-data'] = canonical(requestData);
  }
  const result = await axios.request({
    ...config,
    headers,
    url,
    params,
    data,
  });
  return result.data;
}

const jsonrpcResponse = async(config:any, requestData:any) => {
  const restData = {...requestData};
  const headers = config.headers || {};
  if(isPlaywright()) {
    headers['x-offstage-data'] = canonical(requestData);
  }
  const { url } = config;
  const [,endpoint,method] = url.match(/(.+\/)([^\/]+)$/);

  const result = await axios.request({
    ...config,
    method: 'POST',
    headers,
    url: endpoint,
    data: {
      jsonrpc: '2.0',
      method,
      params: restData,
    },
  });
  return result.data.result;
}

const handleRequest = async(config:any, requestData:any, mocks:any) => {
  if(mocks && !isPlaywright()) {
    return mockResponse(requestData, mocks);
  }
  if(config.method === 'JSONRPC') {
    return jsonrpcResponse(config, requestData);
  }
  return restResponse(config, requestData);
}
