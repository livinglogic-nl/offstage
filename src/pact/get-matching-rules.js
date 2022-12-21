
export const getType = (val) => {
  const type = typeof val;
  if(type !== 'object') { return type; }
  if(Array.isArray(val)) { return 'array'; }
  if(val === null) { return 'null'; }
  return 'object';
}

export const getTypeMap = (data) => {
  const map = {};
  const recurse = (obj, path) => {
    const type = getType(obj);
    let record = map[path];
    if(!record) {
      record = map[path] = { types:[], counts:[] };
    }
    record.types.push(type);
    if(type == 'array') {
      record.counts.push(obj.length);
    }

    if(type === 'array') {
      obj.forEach(sub => recurse(sub, path+'[*]'));
    }
    if(type === 'object') {
      for(let key in obj) {
        recurse(obj[key], path+'.'+key);
      }
    }
  }
  recurse(data, '$');
  return map;
}

export const getMatchingRules = (object) => {
  const data = object.responseData;
  const body = {
    $: {
      matchers: [
        { "match": "type" },
      ],
    },
  }
  const map = getTypeMap(data);
  Object.entries(map)
    .filter(([_,val]) => val.counts.length > 0)
    .forEach(([key,val]) => {
      body[key] = {
        matchers: [
          { match: "type" },
          { min: 1 },
        ],
      };
    });


  return {
    body,
  }
}
