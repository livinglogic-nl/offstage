import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });

test.describe('Use mount to enable playwright routing', () => {
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

  test('Chooses mock based on best matching request', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
mock('example.hello', { subject:'something else' }, { message: 'Hello something else!' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
document.body.innerHTML = (await example.hello({ subject:'something else' })).message
      `,
    }, async({ baseURL, sandboxDir }) => {
        await import(`${sandboxDir}/src/offstage/mock.js`);
        const { mount } = await import(`../index.js`);

        await mount(page);

        await page.goto(baseURL);
        await page.waitForSelector('"Hello something else!"');
    });
  });

  test('GET request with url path params', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.getFoo', 'GET /foo/:id');
mock('example.getFoo', { id: 1 }, { name: 'Bar' });
mock('example.getFoo', { id: 2 }, { name: 'Baz' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
document.body.innerHTML = (await example.getFoo({ id:2 })).name
      `,
    }, async({ baseURL, sandboxDir }) => {
        await import(`${sandboxDir}/src/offstage/mock.js`);
        const { mount } = await import(`../index.js`);

        await mount(page);

        await page.goto(baseURL);
        await page.waitForSelector('"Baz"');
    });
  });
});
