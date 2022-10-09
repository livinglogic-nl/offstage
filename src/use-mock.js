module.exports = (mocks) => (serviceMethodSignature, request, response) => {
  if(!mocks[serviceMethodSignature]) {
    mocks[serviceMethodSignature] = {};
  }
  const requestSignature = JSON.stringify(request);
  mocks[serviceMethodSignature][requestSignature] = response;
}
