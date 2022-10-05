const json5 = require('json5')

const renderMethod = (methodName, methodConfig, mocks) => {
  const tab = '  ';
  const [method,url] = methodConfig.endpointSignature.split(' ');
  const config = {
    method,
    url,
  }

  return tab + `
  async ${methodName}(request,options = {}) {
    const config = ${json5.stringify(config)}
    const mocks = import.meta.env.DEV ? ${json5.stringify(mocks)} : null;
    return handleRequest(config, request, options, mocks);
  },
`.trim()
}

module.exports = (services, mocks) => () => {
  return Object.entries(services).map(([serviceName, serviceConfig]) => {
    return [
      `import axios from 'axios';`,
`
const handleRequest = async(config, request, options, mocks) => {
  const { fullResponse } = options;
  if(mocks && !('offstagePlaywright' in window)) {
    const requestSignature = JSON.stringify(request);
    const response = mocks[requestSignature] ?? Object.values(mocks)[0];
    return fullResponse ? { data:response } : response;
  }
  const result = await axios.request({
    ...config,
    params: request,
  });
  return fullResponse ? result : result.data;
}

`,
      `export const ${serviceName} = {`,
      ...Object.entries(serviceConfig.methods).flatMap(([methodName, methodConfig]) => {
        return renderMethod(methodName, methodConfig, mocks[`${serviceName}.${methodName}`]);
      }),
      `}`,
    ].join('\n')
  }).join('\n\n');
}
