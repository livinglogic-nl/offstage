import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });


test.describe('Override', () => {
  test('Override response is preferred over default mock response', async({page}) => {
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
        const { mount, override } = await import(`../index.js`);
        await mount(page);

        override(page, 'example.hello', {}, { message: 'Hello override!' });

        await page.goto(baseURL);
        await page.waitForSelector('"Hello override!"');
    });
  });
  test('Override response function allows reuse of default mock response', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
  import { create, mock } from 'offstage';
  create('example.hello', 'POST /say-hello');
  mock('example.hello', {}, {
    message: 'Hello world!',
    otherStuff:'we dont care about in this test',
  });
      `,

      'src/main.ts': `
  import { example } from '@/offstage';
  document.body.innerHTML = (await example.hello()).message
      `,
    }, async({ baseURL, sandboxDir }) => {
        await import(`${sandboxDir}/src/offstage/mock.js`);
        const { mount, override } = await import(`../index.js`);
        await mount(page);

        override(page, 'example.hello', {}, ({ defaultResponse }) => {
          return {
            ...defaultResponse,
            message: 'Hello response function!',
          };
        });

        await page.goto(baseURL);
        await page.waitForSelector('"Hello response function!"');
    });
  });
});
