import fs from 'fs';
export default async(jsonlFiles) => {
  const getHash = async(object) => [
    JSON.stringify(object.requestData),
    JSON.stringify(object.responseData),
    JSON.stringify(object.serviceName),
    JSON.stringify(object.methodName),
  ].join('');

  const map = {};
  await Promise.all(jsonlFiles.map(async(jsonlFile) => {
    const lines = (await fs.promises.readFile(jsonlFile))
      .toString().trim().split('\n')

    const finalResponse = ({ responses }) => responses.overrideResponse ?? responses.defaultResponse;
    const objects = lines
      .map(line => JSON.parse(line))
      .map(obj => ({ ...obj, responseData: finalResponse(obj) }))

    await Promise.all(objects.map(async(obj) => {
      const hash = await getHash(obj);
      const { serviceName, methodName } = obj;
      let entry = map[hash];
      if(!entry) {
        entry = map[hash] = { serviceName, methodName, objects:[] }
      }
      entry.objects.push(obj);
    }));
  }));
  return Object.values(map);
}
