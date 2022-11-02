const useMock = require('./use-mock.js');

module.exports = () => (page, serviceMethodSignature, handler) => {
  page.overrides[serviceMethodSignature] = handler;
}
