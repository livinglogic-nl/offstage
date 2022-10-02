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
    'src/offstage/mock.mjs': `
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

