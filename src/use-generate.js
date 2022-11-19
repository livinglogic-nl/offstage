const json5 = require('json5')
const fs = require('fs')
const detectType = require('./detect-type.js');

const header = fs.readFileSync(__dirname+'/generate/header.d.ts');

const capitalize = s => s.substring(0,1).toUpperCase() + s.substring(1);

const responseOnly = obj => Object.entries(obj).reduce((a,v) => ({ ...a, [v[0]]: v[1].response }), {});

const renderMethod = (methodName, requestType, responseType, method, url, mocks) => `
  async ${methodName}(request:${requestType}):Promise<${responseType}> {
    const config = ${json5.stringify({method,url})}
    const mocks = (import.meta as any).env.DEV ? ${json5.stringify(responseOnly(mocks))} : null;
    return handleRequest(config, request, mocks);
  },`

const factoryInterfaces = factorySamples =>
  Object.entries(factorySamples).map(([typeName, samples]) => {
      return `export interface ${typeName} ${detectType(samples, true)}`;
  });



const collectNameAndCode = (defaultName, samples) => {
  const type = detectType(samples);
  if(type.includes('{')) {
    return {
      name: defaultName,
      code: `export interface ${defaultName} ${type}`,
    }
  }
  return { name: type }
}

const createRequestResponseMap = (serviceMethods, mocks) => 
  Object.fromEntries(serviceMethods.map(({ prefix, signature }) => {
    const methodMocks = mocks[signature];
    return [signature, {
      request: collectNameAndCode(prefix + 'Request', Object.values(methodMocks).map(m => m.request)),
      response: collectNameAndCode(prefix + 'Response', Object.values(methodMocks).map(m => m.response)),
    }];
  }));

const signature = (serviceName, methodName) => `${serviceName}.${methodName}`;

module.exports = (services, mocks, factorySamples) => (customRequestResponses) => {
  const serviceMethods = Object.entries(services).flatMap(([serviceName, serviceConfig]) =>
    Object.entries(serviceConfig.methods).map(([methodName, methodConfig]) => ({
          serviceName, serviceConfig,
          methodName, methodConfig,
          signature: `${serviceName}.${methodName}`,
          prefix: `${capitalize(serviceName)}${capitalize(methodName)}`,
    }))
  )

  const imports = Object.entries(customRequestResponses.imports).map(([path,names]) => {
    return `import { ${names.join(', ')} } from '${path}';`;
  }).join('\n');

  const requestResponseMap = Object.assign(
    createRequestResponseMap(serviceMethods, mocks),
    customRequestResponses.map
  );

  return [
    imports,
    header,
    factoryInterfaces(factorySamples).join('\n\n'),
    Object.values(requestResponseMap).map(val => [
      val.request.code,
      val.response.code,
    ].filter(s => s).join('\n')).join('\n\n'),

    Object.entries(services).map(([serviceName, serviceConfig]) => {
      return `
export const ${serviceName} = {
  ${Object.entries(serviceConfig.methods).map(([methodName, methodConfig]) => {
    const [method,url] = methodConfig.endpointSignature.split(' ');
    const sig = signature(serviceName,methodName);
    const { request, response } = requestResponseMap[sig];
    const methodMocks = mocks[sig];
    return renderMethod(methodName, request.name, response.name, method, url, methodMocks);
  }).join('\n')}
}`
    }).join('\n\n'),
  ].join('\n');
}
