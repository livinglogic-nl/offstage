const useMock = require('./use-mock');

module.exports = (services, mocks) => async(page) => {
  await page.addInitScript(() => window.offstagePlaywright = true);
  page.overrides = {};

  const useRouteHandler = (method, config) => (route, request) => {
    if(request.method() !== method) { return route.continue(); }

    const { serviceMethodSignature } = config;
    const key = request.headers()['x-offstage-data'];
    const matchedMocks = {
      ...mocks[serviceMethodSignature],
      ...page.overrides[serviceMethodSignature],
    };
    let response = matchedMocks[key]?.response ?? Object.values(matchedMocks)[0].response
    if(typeof response === 'function') {
      response = response({
        defaultResponse: mocks[serviceMethodSignature].response,
      });
    }
    route.fulfill({
      body: JSON.stringify(response),
    });
  }

  await Promise.all(
    Object.entries(services._inverse).map(([signatureToMatch, config]) => {
      const [method,endpoint] = signatureToMatch.split(' ');

      const [path,query] = endpoint.split('?');
      const pattern = '.+' + path.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
      // const queryPattern = query ? '?' + query.split(',').map(name => `${name}=(?<${name}>[^&]+)`).join('&') : '';
      return page.route(new RegExp(pattern), useRouteHandler(method, config));
    })
  );
}
