const useMock = require('./use-mock');

module.exports = (services, mocks) => async(page) => {
  const workdir = process.env.OFFSTAGE_SANDBOX_DIR ?? process.cwd();
  require(workdir + '/node_modules/offstage/mock.cjs');

  await page.addInitScript(() => window.offstagePlaywright = true);
  page.overrides = {};

  const bestResponse = (request, mocks, serviceMethodSignature) => {
    const key = request.headers()['x-offstage-data'];
    const matchedMocks = {
      ...mocks[serviceMethodSignature],
    };
    let response = matchedMocks[key]?.response ?? Object.values(matchedMocks)[0].response
    const overrideHandler = page.overrides[serviceMethodSignature];
    if(overrideHandler) {
      response = overrideHandler({
        requestData: JSON.parse(key),
        responseData: response,
      });
    }
    return response;
  }

  const useRouteHandler = (method, config) => (route, request) => {
    if(request.method() !== method) { return route.continue(); }
    const response = bestResponse(request, mocks, config.serviceMethodSignature);
    route.fulfill({
      body: JSON.stringify(response),
    });
  }

  const rpcEndpoints = {}

  const handleRPC = (url, config) => {
    const [,endpoint,method] = url.match(/(.+\/)([^\/]+)$/);
    let map = rpcEndpoints[endpoint];
    if(map) {
      map[method] = config;
    } else {
      map = rpcEndpoints[endpoint] = {};
      map[method] = config;
      return page.route(new RegExp(`.+${endpoint}`), (route,request) => {
        const response = bestResponse(request, mocks, config.serviceMethodSignature);
        route.fulfill({
          body: JSON.stringify({
            jsonrpc: '2.0',
            result: response,
          }),
        });
      });
    }
  }

  await Promise.all(
    Object.entries(services._inverse).map(([signatureToMatch, config]) => {
      const [method,url] = signatureToMatch.split(' ');

      if(method !== 'JSONRPC') {
        const [path] = url.split('?');
        const pattern = '.+' + path.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
        return page.route(new RegExp(pattern), useRouteHandler(method, config));
      } else {
        return handleRPC(url, config);
      }
    })
  );
}
