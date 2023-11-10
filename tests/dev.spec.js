import { test, expect } from '@playwright/test';
import { prepareProject }  from './utils/prepare-project.js';

test('DEV: calling an endpoint returns the mock data', async() => {
  const { build, run } = await prepareProject({
    'src/app.ts': `
      import { mathService } from './math-service';
      console.log(await mathService.sum({ a:1, b:2 }));
    `,
    'src/math-service.ts': `
      import { service, endpoint } from 'offstage/core';
      export const { mathService } = service({
        sum: endpoint<
          {a:number, b:number},
          number
        >('GET /sum', ({ a, b }) => a + b)
      })
    `
  });
  await build({ prod:false });
  const { stdout } = await run();
  expect(stdout).toMatch(/3/);

});

test('DEV: commonjs calling an endpoint returns the mock data', async() => {
  const { build, run } = await prepareProject({
    'package.json': JSON.stringify({}),
    'src/app.ts': `
      import { mathService } from './math-service';
      mathService.sum({ a:1, b:2 }).then(console.log);
    `,
    'src/math-service.ts': `
      import { service, endpoint } from 'offstage/core';
      export const { mathService } = service({
        sum: endpoint<
          {a:number, b:number},
          number
        >('GET /sum', ({ a, b }) => a + b)
      })
    `
  });
  await build({ prod:false });
  const { stdout } = await run();
  expect(stdout).toMatch(/3/);

});
