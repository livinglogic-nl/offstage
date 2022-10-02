import json5 from 'json5';

const services = {};

export const create = (serviceMethodSignature, endpointSignature) => {
  const [ service, method ] = serviceMethodSignature.split('.');
  if(!services[service]) {
    services[service]= {
      methods: {},
    }
  }
  services[service].methods[method] = {
    endpointSignature,
    mocks: {},
  }
}

export const mock = (serviceMethodSignature, request, response) => {
  const [ service, method ] = serviceMethodSignature.split('.');

  const requestSignature = JSON.stringify(request);
  services[service].methods[method].mocks[requestSignature] = response;
}

const tab = '  ';

const renderMethodLines = ([methodName, methodConfig]) => tab + `
  ${methodName}: async(request) => {
    const requestSignature = JSON.stringify(request);
    const mocks = ${json5.stringify(methodConfig.mocks)}
    if(mocks[requestSignature]) { return mocks[requestSignature]; }
    return Object.values(mocks)[0];
  }
`.trim()


export const generate = () => {
  return Object.entries(services).map(([serviceName, serviceConfig]) => {
    return [
      `export const ${serviceName} = {`,
      ...Object.entries(serviceConfig.methods).flatMap(renderMethodLines),
      `}`,
    ].join('\n')
  }).join('\n\n');

}
