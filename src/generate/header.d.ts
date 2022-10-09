import axios from 'axios';

const canonical = (obj:any) => {
  const keys = new Set();
  JSON.stringify(obj, (key, value) => (keys.add(key), value));
  return JSON.stringify(obj, Array.from(keys).sort());
}

const handleRequest = async(config:any, request:any, options:any, mocks:any) => {
  const { fullResponse } = options;
  if(mocks && !('offstagePlaywright' in window)) {
    const requestSignature = JSON.stringify(request);
    const response = mocks[requestSignature] ?? Object.values(mocks)[0];
    return fullResponse ? { data:response } : response;
  }
  const params = config.method === 'GET' ? request : {};
  const data = config.method !== 'GET' ? request : {};
  const result = await axios.request({
    ...config,
    params,
    data,
  });
  return fullResponse ? result : result.data;
}
