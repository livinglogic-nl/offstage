const json5 = require('json5')

const services = {};

const create = (serviceMethodSignature, endpointSignature) => {
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

const mock = (serviceMethodSignature, request, response) => {
  const [ service, method ] = serviceMethodSignature.split('.');

  const requestSignature = JSON.stringify(request);
  services[service].methods[method].mocks[requestSignature] = response;
}

const tab = '  ';


const renderMethod = ([methodName, methodConfig]) => {
  const [method,url] = methodConfig.endpointSignature.split(' ');
  const config = {
    method,
    url,
  }

  return tab + `
  async ${methodName}(request,options = {}) {
    const config = ${json5.stringify(config)}
    const mocks = import.meta.env.DEV ? ${json5.stringify(methodConfig.mocks)} : null;
    return handleRequest(config, request, options, mocks);
  },
`.trim()
}


const generate = () => {
  return Object.entries(services).map(([serviceName, serviceConfig]) => {
    return [
      `import axios from 'axios';`,
`

const handleRequest = async(config, request, options, mocks) => {
  if(mocks && !('offstagePlaywright' in window)) {
    const requestSignature = JSON.stringify(request);
    const response = mocks[requestSignature] ?? Object.values(mocks)[0];
    if(options.returnAxios) {
      return { data:response }
    }
    return response;
  }
  const result = await axios.request({
    ...config,
    params: request,
  });
  if(options.returnAxios) {
    return result;
  }
  return result.data;
}

`,
      `export const ${serviceName} = {`,
      ...Object.entries(serviceConfig.methods).flatMap(renderMethod),
      `}`,
    ].join('\n')
  }).join('\n\n');
}


const mapRequestToMethod = (services) => {
  const map = {};
  Object.entries(services).forEach(([serviceName, serviceConfig]) => {
      Object.entries(serviceConfig.methods).forEach(([methodName, methodConfig]) => {
        map[methodConfig.endpointSignature] = methodConfig;
      });
  });
  return map;
}


const mount = async(page) => {
  const requestToMethod = mapRequestToMethod(services);
  await page.addInitScript(() => window.offstagePlaywright = true);
  page.route('**', (route,request) => {
    const url = request.url().match(/\/\/[^/]+(\/.*)/)[1];
    const signature = `${request.method()} ${url}`;
    if(requestToMethod[signature]) {
      // TODO:
      route.fulfill({
        body: JSON.stringify({
          message: 'Hello world!',
        }),
      });
    } else {
      route.continue()
    }
  });
}
module.exports = {
  create,
  mock,
  generate,
  mount,
}
