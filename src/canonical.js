module.exports = (obj) => {
  const keys = new Set();
  JSON.stringify(obj, (key, value) => (keys.add(key), value));
  return JSON.stringify(obj, Array.from(keys).sort())
    .replace(/\\/g, '')
    .match(/"(.+)"/)[1]
}

