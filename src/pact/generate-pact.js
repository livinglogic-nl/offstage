import { getMatchingRules, getType, getTypeMap } from "./get-matching-rules.js";

const objectToInteractionRequest = (object) => {
  const { endpoint, path } = object;
  let [method] = endpoint.split(' ');

  if(method === 'JSONRPC') {
    method = 'POST';
    const lastSlash = path.lastIndexOf('/');
    if(lastSlash !== -1) {
      path = path.substring(0,lastSlash+1);
    }
  }
  return {
    method,
    path,
    body: object.bodyParams,
    query: object.queryParams,
  }
}
const getProviderStates = (object) => {
  const providerStates = [];
  const { responses } = object;
  if(responses.overrideResponse) {
    const [a,b] = [responses.defaultResponse, responses.overrideResponse].map(getTypeMap);
    const [akeys,bkeys] = [a,b].map(Object.keys);

    akeys.filter(key => bkeys.includes(key)).forEach(key => {
      if(a[key].types.includes('array')) {
        const aEmpty = a[key].counts.includes(0);
        const bEmpty = b[key].counts.includes(0);
        if(aEmpty !== bEmpty) {
          providerStates.push({
            name: bEmpty ? `${key} is empty` : `${key} has items`,
            param: key,
          });
        }
      }
    });
  }
  return providerStates;
}


const minimizeArrays = (obj) => {
  const type = getType(obj);
  if(type === 'object') {
    return Object.entries(obj).reduce((a,v) => (
      { ...a, [v[0]]: minimizeArrays(v[1]) }
    ), {})
  }
  if(type === 'array') {
    return obj.slice(0,1).map(minimizeArrays);
  }
  return obj;
}

const objectToInteractionResponse = (object) => {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: minimizeArrays(object.responseData),
    matchingRules: getMatchingRules(object),
  }
}

const descriptorToInteraction = (descriptor) => {
  const first = descriptor.objects[0];
  const providerStates = getProviderStates(first);
  const description = first.title + ' ' + first.endpoint;
  return {
    description,
    request: objectToInteractionRequest(first),
    response: objectToInteractionResponse(first),
    providerStates,
  }
}

export default ({ consumerName, providerName, descriptors }) => {
  return {
    provider: { name: providerName },
    consumer: { name: consumerName },
    interactions: descriptors.map(descriptorToInteraction),
    metadata: {
      pactSpecification: {
        version: '3.0.0',
      },
    },
  };
}
