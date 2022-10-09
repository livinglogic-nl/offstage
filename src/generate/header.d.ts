import axios from 'axios';

const canonical = (obj:any) => {
  const keys = new Set();
  JSON.stringify(obj, (key, value) => (keys.add(key), value));
  return JSON.stringify(obj, Array.from(keys).sort());
}

const handleRequest = async(config:any, requestData:any, options:any, mocks:any) => {
  const isPlaywright = ('offstagePlaywright' in window);
  if(mocks && !isPlaywright) {
    const requestSignature = JSON.stringify(requestData);
    const response = mocks[requestSignature] ?? Object.values(mocks)[0];
    return options.fullResponse ? { data:response } : response;
  }

  const restData = {...requestData};

  const [path,query] = config.url.split('?');
  let url = path.replace(/:([^\/]+)/, (_,match) => {
    const value = restData[match];
    delete restData[match]
    return value;
  });
  const params = config.method === 'GET' ? restData : {};
  const data = config.method !== 'GET' ? restData : {};

  if(query) {
    query.split(',').forEach(name => {
      params[name] = requestData[name];
    });
  }


  const headers = config.headers || {};
  if(isPlaywright) {
    headers['x-offstage-data'] = canonical(requestData);
  }
  const result = await axios.request({
    ...config,
    headers,
    url,
    params,
    data,
  });
  return options.fullResponse ? result : result.data;
}
