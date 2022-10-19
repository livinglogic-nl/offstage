import requestPredicatePromise from './request-predicate-promise';
import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe.configure({ mode: 'serial' });

test.describe('Use mount to enable playwright routing', () => {

  test('POST request', async({ page }) => {
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
    }, async({ baseURL }) => {
        const { mount } = await import(`../index.js`);

        await mount(page);
        await Promise.all([
          page.goto(baseURL),
          page.waitForRequest('**/say-hello'),
        ]);
        await page.waitForSelector('"Hello world!"');
    });
  });

  test('POST request with body', async({page}) => {
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
  document.body.innerHTML = (await example.hello({ subject:'something else' })).message
})();
      `,
    }, async({ baseURL }) => {
        const { mount } = await import(`../index.js`);

        await mount(page);

        await Promise.all([
          page.goto(baseURL),
          requestPredicatePromise(page, request => request.postDataJSON()?.subject === 'something else'),
          page.waitForSelector('"Hello something else!"'),
        ]);
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
(async() => {
  document.body.innerHTML = (await example.getFoo({ id:2 })).name
})();
      `,
    }, async({ baseURL }) => {
        const { mount } = await import(`../index.js`);

        await mount(page);

        await Promise.all([
          page.goto(baseURL),
          requestPredicatePromise(page, request => request.url().includes('/foo/2')),
          page.waitForSelector('"Baz"'),
        ]);
    });
  });

  test('GET request with url query params', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.getFoo', 'GET /foo');
mock('example.getFoo', { id: 1 }, { name: 'Bar' });
mock('example.getFoo', { id: 2 }, { name: 'Baz' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
(async() => {
  document.body.innerHTML = (await example.getFoo({ id:2 })).name
})();
      `,
    }, async({ baseURL }) => {
        const { mount } = await import(`../index.js`);

        await mount(page);
        await Promise.all([
          page.goto(baseURL),
          requestPredicatePromise(page, request => request.url().includes('?id=2')),
          page.waitForSelector('"Baz"'),
        ]);
    });
  });

  test('PATCH request with url path params, url query params and body', async({page}) => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.updateItem', 'PATCH /items/:id?responseType');
mock('example.updateItem', { id: 1, responseType:'json', name:'somename' }, { name: 'somename' });
      `,

      'src/main.ts': `
import { example } from '@/offstage';
(async() => {
  document.body.innerHTML = (await example.updateItem({ id: 1, responseType:'json', name:'somename' })).name
})();
      `,
    }, async({ baseURL }) => {
        const { mount } = await import(`../index.js`);

        await mount(page);

        await Promise.all([
          page.goto(baseURL),
          requestPredicatePromise(page, request => request.url().includes('/items/1')),
          requestPredicatePromise(page, request => request.url().includes('?responseType=json')),
          requestPredicatePromise(page, request => request.postDataJSON()?.name === 'somename'),
          page.waitForSelector('"somename"'),
        ]);
    });
  });
});
