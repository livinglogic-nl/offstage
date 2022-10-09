
export default (page, predicate) => {
  let resolve = null;
  const promise = new Promise(ok => resolve = ok);

  const handler = (request) => {
    if(predicate(request)) {
      page.off('request', handler);
      resolve();
    }
  }
  page.on('request', handler);
  return promise;

}
