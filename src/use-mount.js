const useMock = require("./use-mock");

module.exports = (services, mocks) => async(page) => {
  const overrides = {};
  const override = useMock(overrides);

  // const requestToMethod = mapRequestToMethod(services);
  await page.addInitScript(() => window.offstagePlaywright = true);

  page.route('**', (route,request) => {
    const url = request.url().match(/\/\/[^/]+(\/.*)/)[1];
    const signature = `${request.method()} ${url}`;

    const match = services._inverse[signature];
    if(match) {
      const matchedMocks = {
        ...mocks[match.serviceMethodSignature],
        ...overrides[match.serviceMethodSignature],
      };
      const response = Object.values(matchedMocks)[0];
      route.fulfill({
        body: JSON.stringify(response),
      });
    } else {
      route.continue()
    }
  });
  return {
    override,
  }
}
