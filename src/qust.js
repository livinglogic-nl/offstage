
const getType = (val) => {
  const type = typeof val;
  if(type !== 'object') { return type; }
  if(Array.isArray(val)) { return 'array'; }
  if(val === null) { return 'null'; }
  return 'object';
}

export const stringify = (obj) => {
  const records = [];
  const recurse = (any, path) => {
    const type = getType(any);
    if(type === 'object') {
      Object.entries(any).forEach(([key,val]) => {
        recurse(val, path === '' ? key : path+'['+key+']');
      });
    } else if(type === 'array') {
      any.forEach((val,i) => {
        recurse(val, path+'['+i+']');
      });
    } else {
      records.push(encodeURIComponent(path)+'='+encodeURIComponent(any));
    }
  }
  recurse(obj, '');
  return records.join('&');
}

export const parse = (str) => {
  const records = str.split('&');
  const obj = {};
  records.forEach(record => {
    const [path, val] = record.split('=').map(decodeURIComponent);
    const components = path.replace(/]/g, '').split('[');
    let node = obj;
    components.slice(0,components.length-1).forEach((comp,i) => {
      let sub = node[comp];
      if(sub === undefined) {
        if(components[i+1].match(/^[0-9]/)) {
          sub = node[comp] = [];
        } else {
          sub = node[comp] = {};
        }
      }
      node = sub;
    });
    node[components.pop()] = val;
  });
  return obj;
}

export default {
  stringify,
  parse,
}
