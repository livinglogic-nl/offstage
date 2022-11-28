import { OffstageConfig, OffstageConfiguratorContext, OffstageState } from "./types";

export const getConfig = async(state:OffstageState, context:OffstageConfiguratorContext):Promise<OffstageConfig> => {
  let config = {};
  for await(let configurator of state.configurators) {
    const append = await configurator(context);
    if(append) {
      config = {
        ...config,
        ...append,
      };
    }
  }
  return config;
}
