import { getType } from './get-type.js';

const recurse = (obj:any, path:string):string[] => {
  const type = getType(obj);
  if(type === 'array') {
    return obj.map((sub:any) => recurse(sub, `${path}[]`)).flat();
  }

  if(type === 'object') {
    return Object.entries(obj).map(([k,v]) => {
      return recurse(v, `${path}.${k}`);
    }).flat()
  }
  return [ `${path}.${type}` ];
}


export default (obj:any) => {
  const result = recurse(obj, '$').flat();
  return [...new Set(result)].sort();
}
