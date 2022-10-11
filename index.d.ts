// TODO: finish declaration
declare module "offstage" {
  function create(serviceMethodSignature:string, endpointSignature:string):void
  function mock(serviceMethodSignature:string, request:any, response:any):void;
}
