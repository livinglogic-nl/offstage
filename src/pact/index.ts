import child_process from 'child_process';
import fs from 'fs';
import fg from 'fast-glob';

import getUniqueInteractions from './get-unique-interactions.js';
import publishPacts from './publish-pacts.js';
import generatePact from './generate-pact.js';
import loadConfig from './load-config.js';

const exitError = (str:string) => {
  console.log(str)
  process.exit(1);
}

(async() => {
  const pactConfig = (await loadConfig()).pact;
  if(pactConfig === undefined) {
      exitError(`
  Could not find pact config
  Please configure pact in offstage.config.ts
      `);
  }

  const { consumerName, providerNames } = pactConfig;
  if(!consumerName) {
      exitError(`
  Could not find consumer name
  Please set pact.consumerName in offstage.config.ts
      `);
  }

  if(!providerNames) {
      exitError(`
  Could not find provider names
  Please set pact.providerNames in offstage.config.ts
      `);
  }


  const jsonlFiles = await fg([ 'test-results/**/*.jsonl' ]);

  const serviceMap:Record<string,any> = {};
  const unique = await getUniqueInteractions(jsonlFiles);

  unique.forEach(interaction => {
    const { serviceName } = interaction;
    const providerName = providerNames[serviceName];

    if(!providerName) {
      exitError(`
  Could not find provider name for '${serviceName}'
  Please add a provider name in pact.providers of offstage.config.ts
      `);
    }

    let service = serviceMap[serviceName];
    if(!service) {
      service = serviceMap[serviceName] = {
        consumerName,
        providerName,
        serviceName,
        descriptors: []
      };
    }
    service.descriptors.push( interaction );
  });

  const pactsDir = 'pacts';
  child_process.execSync(`rm -rf ${pactsDir} && mkdir ${pactsDir}`);

  const paths = await Promise.all(Object.values(serviceMap).map(async(service) => {
    const { consumerName, providerName } = service;

    const pact = generatePact(service);
    const path = `${pactsDir}/${consumerName}-${providerName}.json`;
    await fs.promises.writeFile(path, JSON.stringify(pact,null,2));
    console.log(`Pact generated at ${path}`)
    return path;
  }))

  const {
    OFFSTAGE_PACT_BROKER_URL,
    OFFSTAGE_PACT_BROKER_USERNAME,
    OFFSTAGE_PACT_BROKER_PASSWORD,
    OFFSTAGE_PACT_COMMIT,
    OFFSTAGE_PACT_BRANCH,
  } = process.env;

  const publishConfig = {
    broker: {
      url: OFFSTAGE_PACT_BROKER_URL,
      username: OFFSTAGE_PACT_BROKER_USERNAME,
      password: OFFSTAGE_PACT_BROKER_PASSWORD,
    },
    commit: OFFSTAGE_PACT_COMMIT,
    branch: OFFSTAGE_PACT_BRANCH,
  }

  if(publishConfig.broker.url) {
    await publishPacts(publishConfig, paths);
  } else {
    console.log('Publish to Pact broker skipped because OFFSTAGE_PACT_BROKER_URL was not defined.');
  }

})();
