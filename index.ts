import axios from 'axios';

const handleRestRequest = async(endpoint:string, requestData:any) => {
  const restData = {...requestData};

  const [method,pathPlusQuery] = endpoint.split(' ');
  const [path,query] = pathPlusQuery.split('?');

  let url = path.replace(/:([^\/]+)/, (_:string,match:string) => {
    const value = restData[match];
    delete restData[match]
    return value;
  });
  const params = method === 'GET' ? restData : {};
  const data = method !== 'GET' ? restData : {};
  if(query) {
    query.split(',').forEach((name:string) => {
      params[name] = requestData[name];
    });
  }
  const result = await axios.request({
    url,
    params,
    data,
  });
  return result.data;
}

const handleRequest = async(endpoint:string, requestData:any) => {
  return handleRestRequest(endpoint, requestData);
}

export const method = <ReqType, ResType>(endpoint:string, mock:(req:ReqType) => ResType) => {
  const func = async(requestData:ReqType):Promise<ResType> => {
    let allowMock = true;
    try {
      if((window as any).isOffstagePlaywright || process.env.IS_OFFSTAGE_PLAYWRIGHT) {
        allowMock = false;
      }
    } catch(e) {
    }
    if(allowMock && process.env.NODE_ENV !== 'production') {
      const summary = obj => JSON.stringify(obj).substring(0,255);
      console.info(`[offstage] mocking {endpoint}: ${summary(requestData)}`);
      const responseData = mock(requestData);
      console.debug(responseData);
      return responseData;
    }
    return handleRequest(endpoint, requestData);
  }
  func.override = (handler) => {
    (func as any).overrideHandler = handler;
  }
  return func;
}


