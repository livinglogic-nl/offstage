import { OffstageService } from "types";

export default () => {
  const service = <T extends OffstageService>(endpoints:T):Record<string,T> => {
    let initialized = false;
    return new Proxy({}, {
      get:function(_,key) {
        if(endpoints[key as string] !== undefined) {
          return endpoints[key as string];
        }
        if(!initialized) {
          const serviceName = key as string;
          Object.entries(endpoints).forEach(([key,val]) => {
            (val as any).serviceMethodName = `${serviceName}.${key}`;
          });
        }
        return endpoints;
      }
    });
  }
  return service;
}
