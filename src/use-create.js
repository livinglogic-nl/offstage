
module.exports = (services) => {
  const create = (serviceMethodSignature, endpointSignature) => {
    const [ service, method ] = serviceMethodSignature.split('.');
    if(!services[service]) {
      services[service]= {
        methods: {},
      }
    }
    const entry = {
      endpointSignature,
      serviceMethodSignature,
    }
    services[service].methods[method] = entry;

    if(!services._inverse) {
      Object.defineProperty(services, '_inverse', {
        enumerable: false,
        writable: true
      });
      services._inverse = {};
    }
    services._inverse[endpointSignature] = entry;
  }
  return create;
}
