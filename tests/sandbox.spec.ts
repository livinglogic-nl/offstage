import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });

test('Hello world in dev mode', async({ page }) => {
  await runVite({
    'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
    `,

    'src/main.ts': `
import { example } from '@/offstage';
document.body.innerHTML = (await example.hello()).message
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
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
    `,

    'src/main.ts': `
import { example } from '@/offstage';
document.body.innerHTML = (await example.hello()).message
    `,
  }, async({ baseURL, sandboxDir }) => {
      await import(`${sandboxDir}/src/offstage/mock.js`);
      const { mount } = await import(`../index.js`);
      await mount(page);
      await Promise.all([
        page.goto(baseURL),
        page.waitForRequest('**/say-hello'),
      ]);
      await page.waitForSelector('"Hello world!"');
  });
});

test('Allows override in playwright test', async({page}) => {
  await runVite({
    'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
    `,

    'src/main.ts': `
import { example } from '@/offstage';
document.body.innerHTML = (await example.hello()).message
    `,
  }, async({ baseURL, sandboxDir }) => {
      await import(`${sandboxDir}/src/offstage/mock.js`);
      const { mount } = await import(`../index.js`);

      const { override } = await mount(page);
      override('example.hello', {}, { message: 'Hello override!' });

      await page.goto(baseURL);
      await page.waitForSelector('"Hello override!"');
  });
});
test('Chooses mock based on best matching request', async({page}) => {
  // ...
});



