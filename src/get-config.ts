import { OffstageConfig, OffstageConfiguratorContext, OffstageState } from "./types";


const mutateMerge = (target:any, add:any) => {
  for(let i in add) {
    const t = typeof(add[i]);
    if(t === 'object') {
      if(!target[i]) {
        target[i] = {};
      }
      mutateMerge(target[i], add[i]);
    } else if(t === 'string') {
      target[i] = add[i];
    }
  }
}

export const getConfig = async(state:OffstageState, context:OffstageConfiguratorContext):Promise<OffstageConfig> => {
  const config = {};
  for await(let configurator of state.configurators) {
    const add = await configurator(context);
    if(add) {
      mutateMerge(config, add);
    }
  }
  return config;
}
