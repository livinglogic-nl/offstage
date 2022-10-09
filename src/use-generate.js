const json5 = require('json5')
const fs = require('fs')

const header = fs.readFileSync(__dirname+'/generate/header.d.ts');

const renderMethod = (methodName, methodConfig, mocks) => {
  const [method,url] = methodConfig.endpointSignature.split(' ');
  const config = {
    method,
    url,
  }
  return '  ' + `
  async ${methodName}(request = {},options = {}) {
    const config = ${json5.stringify(config)}
    const mocks = import.meta.env.DEV ? ${json5.stringify(mocks)} : null;
    return handleRequest(config, request, options, mocks);
  },
`.trim()
}

module.exports = (services, mocks) => () => {
  return header + Object.entries(services).map(([serviceName, serviceConfig]) => {
    return [
      `export const ${serviceName} = {`,
      ...Object.entries(serviceConfig.methods).flatMap(([methodName, methodConfig]) => {
        return renderMethod(methodName, methodConfig, mocks[`${serviceName}.${methodName}`]);
      }),
      `}`,
    ].join('\n')
  }).join('\n\n');
}
