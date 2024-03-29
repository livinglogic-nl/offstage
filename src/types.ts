export interface OffstageConfiguratorContext {
  serviceMethodName:string;
}

interface RequestInit {
    /** A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    /** A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: RequestCache;
    /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
    credentials?: RequestCredentials;
    /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: HeadersInit;
    /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /** A boolean to set request's keepalive. */
    keepalive?: boolean;
    /** A string to set request's method. */
    method?: string;
    /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
    mode?: RequestMode;
    /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: RequestRedirect;
    /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
    referrer?: string;
    /** A referrer policy to set request's referrerPolicy. */
    referrerPolicy?: ReferrerPolicy;
    /** An AbortSignal to set request's signal. */
    signal?: AbortSignal | null;
}

export interface OffstageConfig extends RequestInit {
  baseURL?:string;
  cacheSeconds?:number;
  validateStatus?:(status:number) => boolean;
  onError?:(e:Error) => any;
}

export type OffstageConfiguratorAsync = (context:OffstageConfiguratorContext) => Promise<OffstageConfig|undefined>;
export type OffstageConfiguratorSync = (context:OffstageConfiguratorContext) => OffstageConfig|undefined;

export type OffstageConfigurator = OffstageConfiguratorSync|OffstageConfiguratorAsync;

export interface OffstageState {
  configurators:OffstageConfigurator[];
  rootConfig?:any;
  currentContext?:any;
  activeRequests:Set<any>;
}


interface OverrideUtils {
  responseStatus: (status:number) => void;
}

export type OffstageOverrideHandler = (requestData:any, responseData:any, overrideUtils:OverrideUtils) => any;

export interface OffstageEndpoint {
  override:(handler:OffstageOverrideHandler) => void;
  waitForTrigger:() => () => void;
  serviceMethodName?:string;
}

export type OffstageService = Record<string,OffstageEndpoint>;

export interface OffstageResponseError extends Error {
  requestData: any;
  responseData: any;
  responseStatus: number;
}

type EndpointMethod = 'GET'| 'POST'| 'PATCH'| 'PUT'| 'DELETE'| 'JSONRPC'
export type EndpointSignature = `${EndpointMethod} /${string}`;
