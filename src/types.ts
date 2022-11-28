export interface OffstageConfiguratorContext {
  serviceMethodName:string;
}

export interface OffstageConfig {
  baseURL?:string;
  method?:string;
  body?:string;
}

export type OffstageConfigurator = (context?:OffstageConfiguratorContext) => Promise<OffstageConfig>;

export interface OffstageState {
  configurators:OffstageConfigurator[];
}

