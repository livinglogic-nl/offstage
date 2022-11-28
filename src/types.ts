export interface OffstageConfiguratorContext {
  serviceMethodName:string;
}

export interface OffstageConfig {
  baseURL?:string;
  method?:string;
  body?:string;
}

export type OffstageConfiguratorAsync = (context:OffstageConfiguratorContext) => Promise<OffstageConfig|undefined>;
export type OffstageConfiguratorSync = (context:OffstageConfiguratorContext) => OffstageConfig|undefined;

export type OffstageConfigurator = OffstageConfiguratorSync|OffstageConfiguratorAsync;

export interface OffstageState {
  configurators:OffstageConfigurator[];
}

