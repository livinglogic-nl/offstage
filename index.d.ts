declare module "offstage" {
  function create(serviceMethodSignature:string, endpointSignature:string):void
  function mock(serviceMethodSignature:string, request:any, response:any):void;
  function mount(page:any):void;
  function override(page:any, serviceMethodSignature:string, request:any, response:any):void;

  function vitePluginOffstage():any;
}
