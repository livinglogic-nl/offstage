import { test, expect } from '@playwright/test';

import { prepareProject }  from '../utils/prepare-project.js';

const defaultApp = {
  'src/app.ts': `
    import { configure } from 'offstage/core';
    import { mathService } from './math-service';
    configure([
      () => ({ baseURL:'http://localhost:3000' })
    ]);
    const method = location.hash.substring(2);
    const result = await mathService[method]({ a:1, b:2 });
    document.body.innerHTML = '<div class="result">'+result+'</div>';
  `,

  'src/math-service.ts': `
    import { service, endpoint } from 'offstage/core';
    export const { mathService } = service({
      sum: endpoint<{a:number, b:number}, number>
        ('GET /sum', ({ a, b }) => a + b),
      subtract: endpoint<{a:number, b:number}, number>
        ('POST /subtract', ({ a, b }) => a - b),
      multiply: endpoint<{a:number, b:number}, number>
        ('PATCH /multiply', ({ a, b }) => a * b),
      divide: endpoint<{a:number, b:number}, number>
        ('PUT /divide', ({ a, b }) => a / b),
      modulus: endpoint<{a:number, b:number}, number>
        ('DELETE /modulus', ({ a, b }) => a % b),
    })
  `,
};

test('PLAY: mounts endpoints using existing mock functions', async() => {
  const { build, serveAndPlay } = await prepareProject({
    ...defaultApp,
    'tests/app.spec.ts': `
      import { test, expect } from '@playwright/test';
      import { mount } from 'offstage/playwright';
      test('GET works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"3"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      test('POST works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/subtract');
        const request = await page.waitForRequest(req => req.url().includes('subtract'));
        await expect(page.locator('"-1"')).toBeVisible();
        expect(request.method()).toBe('POST');
      });
      test('PATCH works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/multiply');
        const request = await page.waitForRequest(req => req.url().includes('multiply'));
        await expect(page.locator('"2"')).toBeVisible();
        expect(request.method()).toBe('PATCH');
      });
      test('PUT works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/divide');
        const request = await page.waitForRequest(req => req.url().includes('divide'));
        await expect(page.locator('"0.5"')).toBeVisible();
        expect(request.method()).toBe('PUT');
      });
      test('DELETE works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/modulus');
        const request = await page.waitForRequest(req => req.url().includes('modulus'));
        await expect(page.locator('"1"')).toBeVisible();
        expect(request.method()).toBe('DELETE');
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
      import { mount } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      test('GET override works', async({ page }) => {
        await mount(page);
        mathService.sum.override(() => 4);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"4"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });

      test('GET works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"3"')).toBeVisible();
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
      import { mount } from 'offstage/playwright';
      test('GET works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"3"')).toBeVisible();
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
      import { mount } from 'offstage/playwright';
      import { mathService } from '../src/math-service.js';
      test('GET override works', async({ page }) => {
        await mount(page);
        mathService.sum.override(() => 4);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"4"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });

      test('GET works', async({ page }) => {
        await mount(page);
        await page.goto('http://localhost:5173/#/sum');
        const request = await page.waitForRequest(req => req.url().includes('sum'));
        await expect(page.locator('"3"')).toBeVisible();
        expect(request.method()).toBe('GET');
      });
      `,
  });
  await build({ prod:true });
  await serveAndPlay();
});
/*
test('can configure baseURL', async ({ page }) => {
  await Promise.all([
    page.click('"config baseURL"'),
    page.waitForRequest('http://localhost:3000/foo?nr=2'),
  ]);
});

test('can cache responses', async ({ page }) => {
  let count = 0;
  page.on('request', (req) => {
    if(req.url().includes('/foo')) {
      count++;
    }
  });
  await page.click('"config cache"'),

  await Promise.all([
    page.click('"GET 2"'),
    page.waitForRequest('http://localhost:5173/foo?nr=2')
  ]);
  await page.click('"GET 2"');
  await page.waitForTimeout(100);
  expect(count).toBe(1);
});

test('can properly merge configurations', async ({ page }) => {
  const [request] = await Promise.all([
    page.waitForRequest(req => req.url().includes('/foo')),
    page.click('"config headers"'),
  ]);
  const headers = request.headers();
  expect(headers.authorization).toBe('Bearer foo');
  expect(headers['x-foo-bar']).toBe('Bar');
});

test('can supply options at method invocation', async ({ page }) => {
  await Promise.all([
    page.click('"GET with options"'),
    page.waitForRequest('http://localhost:3000/foo?nr=2'),
  ]);
});


test('factory works', () => {
  const user = makeUser();
  expect(user).toEqual({
    email: 'user@company.org',
    firstname: 'John',
    lastname: 'Doe',
    birthdate: '1990-01-01'
  });

  const youngOne = makeUser({
    birthdate: '2022-01-01',
  });
  expect(youngOne).toEqual({
    email: 'user@company.org',
    firstname: 'John',
    lastname: 'Doe',
    birthdate: '2022-01-01',
  });
});

test('untyped factory works', () => {
  expect(makeUntyped()).toEqual({
    email: 'user@company.org',
    firstname: 'John',
    lastname: 'Doe',
    birthdate: '1990-01-01'
  });
});
*/
