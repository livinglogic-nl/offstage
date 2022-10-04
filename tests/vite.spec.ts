import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });

test('vite test', async({ page }) => {
  await runVite({
    'src/main.ts': `document.body.innerHTML = 'vite works'`,
  }, async({ baseURL }) => {
      await page.goto(baseURL);
      await page.waitForSelector('"vite works"');
  });
});

test('Hello world in dev mode', async({ page }) => {
  await runVite({
    'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('service.hello', 'POST /say-hello');
mock('service.hello', {}, { message: 'Hello world!' });
    `,

    'src/main.ts': `
import { service } from '@/offstage';
console.log(await service.hello())
document.body.innerHTML = (await service.hello()).message
    `,
  }, async({ baseURL }) => {
      await page.goto(baseURL);
      await page.waitForSelector('"Hello world!"');
  });
});

test('Hello world in release mode', async({ page }) => {
  await runVite({
    'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('service.hello', 'POST /say-hello');
mock('service.hello', {}, { message: 'Hello world!' });
    `,

    'src/main.ts': `
import { service } from '@/offstage';
console.log(await service.hello())
document.body.innerHTML = (await service.hello()).message
    `,
  }, async({ baseURL, sandboxDir }) => {
      await import(`${sandboxDir}/src/offstage/mock.js`);
      const { mount } = await import(`../index.js`);
      await mount(page);
      await page.goto(baseURL);
      await page.waitForSelector('"Hello world!"');
  });
});

