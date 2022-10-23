const json5 = require('json5')
const fs = require('fs')
const detectType = require('./detect-type.js')

const header = fs.readFileSync(__dirname+'/generate/header.d.ts');

const capitalize = s => s.substring(0,1).toUpperCase() + s.substring(1);

const responseOnly = obj => Object.entries(obj).reduce((a,v) => ({ ...a, [v[0]]: v[1].response }), {});

const renderMethod = (serviceName, methodName, methodConfig, mocks) => {
  const [method,url] = methodConfig.endpointSignature.split(' ');
  const config = { method, url }

  const requestType = detectType(...Object.values(mocks).map(m => m.request));
  const responseType = detectType(...Object.values(mocks).map(m => m.response));
  return `
async ${methodName}(request:${requestType}):Promise<${responseType}> {
    const config = ${json5.stringify(config)}
    const mocks = (import.meta as any).env.DEV ? ${json5.stringify(responseOnly(mocks))} : null;
    return handleRequest(config, request, mocks);
  },
`.trim()
}

const renderMethods = (serviceName, serviceConfig, mocks) => {
  return Object.entries(serviceConfig.methods).map(([methodName, methodConfig]) => {
    return renderMethod(serviceName, methodName, methodConfig, mocks[`${serviceName}.${methodName}`]);
  }).join('\n');
}

module.exports = (services, mocks) => () => {
  return header + Object.entries(services).map(([serviceName, serviceConfig]) => {
    return `
export const ${serviceName} = {
  ${renderMethods(serviceName, serviceConfig, mocks)}
}`
  }).join('\n\n');
}
