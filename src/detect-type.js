const detectSingleType = (sample) => {
  if(sample === null) { return 'null' }
  if(typeof(sample) === 'boolean') { return 'boolean' }
  if(typeof(sample) === 'string') { return 'string' }
  if(typeof(sample) === 'number') { return 'number' }
  if(Array.isArray(sample)) { return 'array' }
  return 'object';
}

const detectComplexType = (sample) => {
  const type = detectSingleType(sample);
  if(type === 'array') { return detectType(...sample)+'[]' }
  if(type === 'object') {
    return '{' +
      Object.entries(sample)
        .map(([key,val]) =>
          `${key}:${detectType(val)}`
        ).join(',')
      + '}';
  }
  return type;
}

const subNode = (node, key) => {
  if(node[key] === undefined) { node[key] = { _hits:0 }; }
  return node[key];
}
const nodeAtoms = (node) => {
  if(node._atoms === undefined) { node._atoms = new Set() };
  return node._atoms;
}

const detectVariants = (sample, node) => {
  node._hits++;
  const type = detectSingleType(sample);
  if(type === 'array') {
    const n = subNode(node, '_arr');
    sample.forEach(subSample => detectVariants(subSample,n));
  } else if(type === 'object') {
    const n = subNode(node, '_obj');
    n._hits++;
    for(let key in sample) {
      detectVariants(sample[key], subNode(n, key));
    }
  } else {
    nodeAtoms(node).add(type);
  }
}

const collectTypes = (node) => {
  const result = [];
  if(node._obj) {
    result.push('{' + Object.entries(node._obj)
      .filter(([k]) => !k.startsWith('_'))
      .map(([k,v]) => {
        const optional = node._obj._hits > v._hits ? '?' : '';
        return `${k}${optional}:${collectTypes(v).join('|')}`;
    }) + '}');
  }
  if(node._arr) {
    const types = collectTypes(node._arr);
    result.push(types.length === 1 ? types[0]+'[]' : '('+types.join('|')+')[]');
  }
  if(node._atoms) {
    result.push(...node._atoms);
  }
  return result;
}

const detectType = (...samples) => {
  const root = { _hits:0 }
  samples.forEach(sample => detectVariants(sample, root));
  return collectTypes(root).join('|')
}

export default detectType;
