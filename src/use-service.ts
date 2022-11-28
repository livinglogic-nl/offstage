export default () => {
  const service = (endpoints:Record<string, Function>) => {
    let initialized = false;
    return new Proxy(endpoints as any, {
      get(obj, key) {
        if(obj[key]) {
          return obj[key];
        }
        if(!initialized) {
          const serviceName = key as string;
          Object.entries(endpoints).forEach(([key,val]) => {
            (val as any).serviceMethodName = `${serviceName}.${key}`;
          });
        }
        return obj;
      }
    });
  }
  return service;
}
