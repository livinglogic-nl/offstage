import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test('Basic endpoint usage', async({ page }) => {
  await runVite({
    'src/example-service.ts': `
import { method } from 'offstage'

interface FooRequest {
  id:number;
}

interface FooResponse {
  message:string;
}

export const exampleService {
  foo: endpoint<FooRequest, FooResponse>('GET /foo', ({ id }) => {
    return {
      message: \`some mock data for id: \${id}\` }
  }),
}`,

    'src/main.ts': `

import { exampleService } from './example-service';
(async() => {
console.log('hi')
  document.body.innerHTML = 'Hello world!';
})();
    `,
  }, async({ baseURL }) => {
      await page.goto(baseURL);
      await page.waitForSelector('"Hello world!"');
  });
});


