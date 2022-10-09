const useMock = require('./use-mock');
const canonical = require('./canonical');

module.exports = (services, mocks, overrides) => async(page) => {
  page.overrides = {};
  await page.addInitScript(() => window.offstagePlaywright = true);
  page.route('**', (route,request) => {
    const url = request.url().match(/\/\/[^/]+(\/.*)/)[1];
    const signature = `${request.method()} ${url}`;
    const match = services._inverse[signature];
    if(match) {
      const key = canonical(request.postData());
      const matchedMocks = {
        ...mocks[match.serviceMethodSignature],
        ...page.overrides[match.serviceMethodSignature],
      };
      const response = matchedMocks[key] ?? Object.values(matchedMocks)[0];
      route.fulfill({
        body: JSON.stringify(response),
      });
    } else {
      route.continue()
    }
  });
}
