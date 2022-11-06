const OBJ = 'x-os-obj'; // for detecting an object
const TYPE = 'x-os-type'; // for detecting a typed object

const ARR = 'x-os-arr'; // for detecting an array
const ATOMS = 'x-os-atoms'; // for detecting atom values (string, number, boolean, null)
const HITS = 'x-os-hits'; // for detecting optional values

const detectSingleType = (sample) => {
  if(sample === null) { return 'null' }
  if(typeof(sample) === 'boolean') { return 'boolean' }
  if(typeof(sample) === 'string') { return 'string' }
  if(typeof(sample) === 'number') { return 'number' }
  if(Array.isArray(sample)) { return 'array' }
  return 'object';
}

const subNode = (node, key) => {
  if(node[key] === undefined) { node[key] = { [HITS]:0 }; }
  return node[key];
}
const nodeAtoms = (node) => {
  if(node[ATOMS] === undefined) { node[ATOMS] = new Set() };
  return node[ATOMS];
}

const detectVariants = (sample, node, forceExplicit) => {
  node[HITS]++;
  const type = detectSingleType(sample);
  if(type === 'array') {
    const n = subNode(node, ARR);
    sample.forEach(subSample => detectVariants(subSample, n, forceExplicit));
  } else if(type === 'object') {
    const n = subNode(node, OBJ);
    if(!forceExplicit && sample[TYPE]) {
      n[TYPE] = sample[TYPE];
      return;
    }
    n[HITS]++;
    for(let key in sample) {
      detectVariants(sample[key], subNode(n, key), forceExplicit);
    }
  } else {
    nodeAtoms(node).add(type);
  }
}

const collectTypes = (node) => {
  const result = [];
  if(node[OBJ]) {
    if(node[OBJ][TYPE]) {
      result.push(node[OBJ][TYPE]);
    } else {
      result.push('{' + Object.entries(node[OBJ])
        .filter(([k]) => !k.startsWith('x-os'))
        .map(([k,v]) => {
          const optional = node[OBJ][HITS] > v[HITS] ? '?' : '';
          return `${k}${optional}:${collectTypes(v).join('|')}`;
      }) + '}');
    }
  }
  if(node[ARR]) {
    const types = collectTypes(node[ARR]);
    result.push(types.length === 1 ? types[0]+'[]' : '('+types.join('|')+')[]');
  }
  if(node[ATOMS]) {
    result.push(...node[ATOMS]);
  }
  return result;
}

const detectType = (samples, forceExplicit = false) => {
  const root = { [HITS]:0 }
  samples.forEach(sample => detectVariants(sample, root, forceExplicit));
  return collectTypes(root).join('|')
}


module.exports = detectType;
