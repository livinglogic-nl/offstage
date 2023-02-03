import fs from 'fs';

const createPayload = (publishConfig, consumerName, providerName, contractContentJson) => ({
  pacticipantName: consumerName,
  pacticipantVersionNumber: publishConfig.commit,
  branch: publishConfig.branch,
  contracts: [{
    consumerName,
    providerName,
    specification: 'pact',
    contentType: 'application/json',
    content: contractContentJson.toString('base64'),
  }]
});

export default async(publishConfig, filesToPublish) => {
  for await(let file of filesToPublish) {
  // await Promise.all(filesToPublish.map(async(file) => {
    const [,consumerName,providerName] = file.match(/([^/]+)-([^/]+).json/);
    const contractContentJson = await fs.promises.readFile(file);
    const payload = createPayload(publishConfig, consumerName, providerName, contractContentJson);

    await fetch(publishConfig.broker.url + '/contracts/publish', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async(res) => {
        const ok = res.status === 200;
        if(ok) {
          console.log(`[offstage][pact] uploaded ${file}`);
        } else {
          console.log(`[offstage][pact] failed to upload ${file}`);
          console.log(res.status)
          console.log(await res.text())
          process.exit(1);
        }
    });
  // }));
  }
}

