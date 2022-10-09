const useMock = require('./use-mock');
const canonical = require('./canonical');

module.exports = (services, mocks) => async(page) => {
  await page.addInitScript(() => window.offstagePlaywright = true);
  page.overrides = {};

  const handlePossibleRoute = (route, request) => {
    const url = request.url().match(/\/\/[^/]+(\/.*)/)[1];
    const signature = `${request.method()} ${url}`;
    const match = services._inverse[signature];
    if(match) {
      const key = canonical(request.postData());
      const matchedMocks = {
        ...mocks[match.serviceMethodSignature],
        ...page.overrides[match.serviceMethodSignature],
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
    } else {
      route.continue()
    }
  }

  await Promise.all(
    Object.entries(services._inverse).map(([signatureToMatch, config]) => {
      const [method,endpoint] = signatureToMatch.split(' ');
      return page.route('**'+endpoint, handlePossibleRoute);
    })
  );
}
