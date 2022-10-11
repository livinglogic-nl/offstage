const canonical = require('./canonical.js');
module.exports = (mocks) => (serviceMethodSignature, request, response) => {
  if(!mocks[serviceMethodSignature]) {
    mocks[serviceMethodSignature] = {};
  }
  const requestSignature = canonical(request);
  mocks[serviceMethodSignature][requestSignature] = { request, response };
}
