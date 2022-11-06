import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });

const importMockCJS = async(sandboxDir) => import(`${sandboxDir}/node_modules/offstage/mock.cjs`);

test.describe('Override', () => {
  test('Override overrides the default response', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
(async() => {
  document.body.innerHTML = (await example.hello()).message
})();
      `,
    }, async({ baseURL, sandboxDir }) => {
        await importMockCJS(sandboxDir);
        const { mount, override } = await import(`../index.js`);
        await mount(page);

        override(page, 'example.hello', () => ({ message: 'Hello override!' }));

        await page.goto(baseURL);
        await page.waitForSelector('"Hello override!"');
    });
  });

  test('Override allows reuse of default mock response', async({page}) => {
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
(async() => {
  document.body.innerHTML = (await example.hello()).message
})();
      `,
    }, async({ baseURL, sandboxDir }) => {
        await importMockCJS(sandboxDir);
        const { mount, override } = await import(`../index.js`);
        await mount(page);

        override(page, 'example.hello', ({ responseData }) => ({
            ...responseData,
            message: 'Hello response function!',
        }));

        await page.goto(baseURL);
        await page.waitForSelector('"Hello response function!"');
    });
  });

  test('Override can use requestData to finetune response', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', {}, { message: 'Hello world!' });
mock('example.hello', { subject:'something else' }, { message: 'Hello something else!' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
(async() => {
  if(location.href.includes('/alpha')) {
    document.body.innerHTML = (await example.hello({})).message
  }
  if(location.href.includes('/bravo')) {
    document.body.innerHTML = (await example.hello({ subject:'something else' })).message
  }
})();
      `,
    }, async({ baseURL, sandboxDir }) => {
        await importMockCJS(sandboxDir);
        const { mount, override } = await import(`../index.js`);
        await mount(page);

        override(page, 'example.hello', ({ requestData, responseData }) => {
          if(requestData.subject !== undefined) {
            return {
              message: 'nice, you passed a subject!',
            }
          }
          return responseData;
        });
        await page.goto(`${baseURL}/alpha`);
        await page.waitForSelector('"Hello world!"');

        await page.goto(`${baseURL}/bravo`);
        await page.waitForSelector('"nice, you passed a subject!"');
    });
  });
});
