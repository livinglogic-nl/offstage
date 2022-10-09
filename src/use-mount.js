const useMock = require('./use-mock');

module.exports = (services, mocks) => async(page) => {
  await page.addInitScript(() => window.offstagePlaywright = true);
  page.overrides = {};

  const useRouteHandler = (regex, method, config) => (route, request) => {
    if(request.method() !== method) { return route.continue(); }

    const { serviceMethodSignature } = config;
    const key = request.headers()['x-offstage-data'];
    const matchedMocks = {
      ...mocks[serviceMethodSignature],
      ...page.overrides[serviceMethodSignature],
    };
    let response = matchedMocks[key] ?? Object.values(matchedMocks)[0];
    if(typeof response === 'function') {
      response = response({
        defaultResponse: mocks[match.serviceMethodSignature],
      });
    }
    route.fulfill({
      body: JSON.stringify(response),
    });
  }

  await Promise.all(
    Object.entries(services._inverse).map(([signatureToMatch, config]) => {
      const [method,endpoint] = signatureToMatch.split(' ');
      const pattern = '.+' + endpoint.replace(/:([^\/]+)/g, '(?<$1>[^/]+)');
      const re = new RegExp(pattern);
      return page.route(re, useRouteHandler(re, method, config));
    })
  );
}
