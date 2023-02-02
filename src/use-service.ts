import { getGlobal, isProduction } from "./mode.js";
import { OffstageService } from "./types.js";


const injectDevtool = () => {
  if(getGlobal().document === undefined) { return; }

  const win = (window as any);
  if(win.offstage !== undefined) { return win.offstage; }

  const offstage = {
    forceNetwork: localStorage.getItem('offstage-force-network') ? true : false,
    services: {},
    history: [],
    onHistoryUpdate: () => {},
    addHistory: (entry:any) => {
      (offstage.history as any).unshift(entry);
      offstage.onHistoryUpdate();
    }
  };
  win.offstage = offstage;

  const script = document.createElement('script');
  script.src = 'node_modules/offstage/devtool.js';
  document.head.appendChild(script);
  return win.offstage;
}

const registerService = (serviceName:string, endpoints:any) => {
  const offstage = injectDevtool();
  if(!offstage) { return; }

  offstage.services[serviceName] = endpoints;
}

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
          initialized = true;
          if(!isProduction()) {
            registerService(serviceName, endpoints);
          }
        }
        return endpoints;
      }
    });
  }
  return service;
}
