export const getType = (val:any) => {
  const type = typeof val;
  if(type !== 'object') { return type; }
  if(Array.isArray(val)) { return 'array'; }
  if(val === null) { return 'null'; }
  return 'object';
}
