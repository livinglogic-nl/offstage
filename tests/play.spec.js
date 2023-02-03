import fs from 'fs';
import child_process from 'child_process';
import { test, expect } from '@playwright/test';

import { prepareProject }  from './utils/prepare-project.js';

const defaultApp = {
  'src/app.ts': `
    import { configure } from 'offstage/core';
    import { mathService } from './math-service';
    configure([
      () => ({ baseURL:'http://localhost:3000' })
    ]);
    const method = location.hash.substring(2);
    const result = await mathService[method]({ a:5, b:2 });
    document.body.innerHTML = '<div class="result">'+result+'</div>';
  `,

  'src/math-service.ts': `
    import { service, endpoint } from 'offstage/core';
    export const { mathService } = service({
      sum: endpoint<{a:number, b:number}, number>
        ('GET /sum', ({ a, b }) => a + b),
      postSum: endpoint<{a:number, b:number}, number>
        ('POST /sum', ({ a, b }) => a + b),
      subtract: endpoint<{a:number, b:number}, number>
        ('POST /subtract', ({ a, b }) => a - b),
      multiply: endpoint<{a:number, b:number}, number>
        ('PATCH /multiply', ({ a, b }) => a * b),
      divide: endpoint<{a:number, b:number}, number>
        ('PUT /divide', ({ a, b }) => a / b),
      modulus: endpoint<{a:number, b:number}, number>
        ('DELETE /modulus', ({ a, b }) => a % b),
      power: endpoint<{a:number, b:number}, number>
        ('JSONRPC /jsonrpc/calculatePower', ({ a, b }) => Math.pow(a,b)),
      jsonSum: endpoint<{a:number, b:number}, number>
        ('JSONRPC /jsonrpc/calculateSum', ({ a, b }) => a + b),
    })
  `,
};

test('PLAY: mounts endpoints using existing mock functions', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      attach(test);

      test('GET works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      test('POST works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('subtract')),
          page.goto('http://localhost:5173/#/subtract'),
        ]);
        await expect(page.locator('"3"')).toBeVisible();
        expect(request.method()).toBe('POST');
      });
      test('PATCH works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('multiply')),
          page.goto('http://localhost:5173/#/multiply'),
        ]);
        await expect(page.locator('"10"')).toBeVisible();
        expect(request.method()).toBe('PATCH');
      });
      test('PUT works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('divide')),
          page.goto('http://localhost:5173/#/divide'),
        ]);
        await expect(page.locator('"2.5"')).toBeVisible();
        expect(request.method()).toBe('PUT');
      });
      test('DELETE works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('modulus')),
          page.goto('http://localhost:5173/#/modulus'),
        ]);
        await expect(page.locator('"1"')).toBeVisible();
        expect(request.method()).toBe('DELETE');
      });
      test('same path multiple methods works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/postSum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('POST');
      });
      test('JSONRPC works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('jsonrpc')),
          page.goto('http://localhost:5173/#/power'),
        ]);
        await expect(page.locator('"25"')).toBeVisible();
        expect(request.method()).toBe('POST');
        expect(request.postDataJSON()).toEqual({
          jsonrpc: '2.0',
          method: 'calculatePower',
          params: { a: 5, b: 2 }
        });
      });
      test('JSONRPC works multiple methods', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('jsonrpc')),
          page.goto('http://localhost:5173/#/jsonSum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('POST');
        expect(request.postDataJSON()).toEqual({
          jsonrpc: '2.0',
          method: 'calculateSum',
          params: { a: 5, b: 2 }
        });
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PLAY: can override an endpoint for a single test', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      attach(test);

      test('GET override works', async({ page }) => {
        mathService.sum.override(() => 4);
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"4"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });

      test('GET works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PLAY: mounts endpoints using existing mock functions commonjs', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'package.json': JSON.stringify({}),
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      attach(test);

      test('GET works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PLAY: can override an endpoint for a single test commonjs', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'package.json': JSON.stringify({}),
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      attach(test);

      test('GET override works', async({ page }) => {
        mathService.sum.override(() => 4);
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"4"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });

      test('GET works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PLAY: can cache responses', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'src/app.ts': `
      import { configure } from 'offstage/core';
      import { mathService } from './math-service';
      configure([
        () => ({ baseURL:'http://localhost:3000' }),
        () => ({ cacheSeconds:0.1 }),
      ]);

      const wait = (ms) => new Promise(ok => {
        setTimeout(ok,ms);
      });

      (async() => {
        await wait(50);

        await mathService.sum({ a:1, b:2 });
        await wait(50);

        await mathService.sum({ a:1, b:2 });
        await wait(50);

        await mathService.sum({ a:1, b:2 });
      })();
      
    `,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      attach(test);

      test('Because of caching, only 2 of the 3 requests make it to playwright', async({ page }) => {
        let total = 0;
        let hasTwoTrigger;
        const hasTwoPromise = new Promise(ok => {
          hasTwoTrigger = ok;
        });
        page.on('request', req => {
          if(req.url().includes('sum')) {
            total++;
            if(total == 2) {
              hasTwoTrigger();
            }
          }
        });
        await page.goto('http://localhost:5173');
        await hasTwoPromise;
        await page.waitForTimeout(200);
        expect(total).toBe(2);
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PLAY: override responses are never cached', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'src/app.ts': `
      import { configure } from 'offstage/core';
      import { mathService } from './math-service';
      configure([
        () => ({ baseURL:'http://localhost:3000' }),
        () => ({ cacheSeconds:0.1 }),
      ]);

      const wait = (ms) => new Promise(ok => {
        setTimeout(ok,ms);
      });

      (async() => {
        await wait(50);

        await mathService.sum({ a:1, b:2 });
        await wait(50);

        await mathService.sum({ a:1, b:2 });
        await wait(50);

        await mathService.sum({ a:1, b:2 });
      })();
      
    `,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      attach(test);

      test('Because of override, caching is disabled', async({ page }) => {
        mathService.sum.override(() => 4);

        let total = 0;
        let hasThreeTrigger;
        const hasThreePromise = new Promise(ok => {
          hasThreeTrigger = ok;
        });
        page.on('request', req => {
          if(req.url().includes('sum')) {
            total++;
            if(total == 3) {
              hasThreeTrigger();
            }
          }
        });
        await page.goto('http://localhost:5173');
        await hasThreePromise;
        expect(total).toBe(3);
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});

test('PACT: generates Pact files', async() => {
  const { dir, build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { attach } from 'offstage/playwright';
      attach(test);

      test('GET works', async({ page }) => {
        const [request] = await Promise.all([
          page.waitForRequest(req => req.url().includes('sum')),
          page.goto('http://localhost:5173/#/sum'),
        ]);
        await expect(page.locator('"7"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      `,
    'offstage.config.ts': `
      export default {
        pact: {
          consumerName: 'OffstageDemo',
          providerNames: {
            mathService: 'MathService',
          },
        }
      }
      `,
  });
  await build({ prod:true });
  await serveAndPlay();

  child_process.execSync(`mkdir -p node_modules/.bin`, { cwd:dir });
  child_process.execSync(`ln -s ../offstage/cli.js ./offstage`, { cwd:`${dir}/node_modules/.bin` });

  child_process.execSync(`npx offstage pact`, { cwd:dir });
  expect(fs.existsSync(`${dir}/pacts/OffstageDemo-MathService.json`)).toBe(true);

});

