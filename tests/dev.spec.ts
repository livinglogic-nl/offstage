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
(async() => {
  document.body.innerHTML = (await example.hello()).message
})();
    `,
  }, async({ baseURL }) => {
      await page.goto(baseURL);
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
(async() => {
  document.body.innerHTML = (await example.hello({ subject:'something else' })).message
})();
    `,
  }, async({ baseURL, sandboxDir }) => {
      await page.goto(baseURL);
      await page.waitForSelector('"Hello something else!"');
  });
});



