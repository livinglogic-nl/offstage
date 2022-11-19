declare module "offstage" {
  function create(serviceMethodSignature:string, endpointSignature:string):void
  function create<RequestInterface, ResponseInterface>(serviceMethodSignature:string, endpointSignature:string):void
  function mock(serviceMethodSignature:string, request:any, response:any):void;
  function mount(page:any):void;

  interface OverrideHandlerArgs {
    requestData:any;
    responseData:any;
  }
  function override(
    page:any,
    serviceMethodSignature:string,
    handler:(args:OverrideHandlerArgs) => any
  ):void;

  function factory(defaultValue:any):any;

  function vitePluginOffstage():any;
}
