export interface OffstageConfiguratorContext {
  serviceMethodName:string;
}

export interface OffstageConfig {
  baseURL?:string;
  method?:string;
  body?:string;
  headers?:Record<string,string>;
}

export type OffstageConfiguratorAsync = (context:OffstageConfiguratorContext) => Promise<OffstageConfig|undefined>;
export type OffstageConfiguratorSync = (context:OffstageConfiguratorContext) => OffstageConfig|undefined;

export type OffstageConfigurator = OffstageConfiguratorSync|OffstageConfiguratorAsync;

export interface OffstageState {
  configurators:OffstageConfigurator[];
  currentContext?:any;
}


export type OffstageOverrideHandler = (requestData:any, responseData:any) => any;

export interface OffstageEndpoint {
  (requestData:any):Promise<any>;
  override:(handler:OffstageOverrideHandler) => void;
  waitForTrigger:() => () => void;
  serviceMethodName?:string;
}

export type OffstageService = Record<string,OffstageEndpoint>;


