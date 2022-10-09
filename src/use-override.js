const useMock = require('./use-mock.js');

module.exports = () => (page, serviceMethodSignature, request, response) => {
  return useMock(page.overrides)(serviceMethodSignature, request, response);
}
