# ![Logo](logo.svg)
-- Acting like a blazingly fast back-end 🔥

## Coming soon!
I'm actively working on this but it is not ready yet. Please check back soon!

Things I still need to do:
- sync via npx
- vite plugin
- finish documentation
- integrate in first project
- PACT testing

# When to use

Suppose you're working on a Front-End that calls into REST backend services, you might want to have:
- ⚡️ Dev-time mocking (for playing around while developing)
- 🚀 Axios powered TypeScript API (for making the requests)
- 🎭 Playwright route mocking (for integration testing the final build)
- 🤝 Pact tests (for ensuring compatability with the backend)

Offstage generates all you need, just by specifying the mock data.

## Example

Mock file:
```ts
import { create, mock } from 'offstage';

// connect the api to the REST request
create('example.hello', 'POST /say-hello');

// mock the data transfer
mock('example.hello', {}, { message: 'Hello world!' });
mock('example.hello', { subject:'something specific' }, { message: 'Hello something specific!' });
```

Use in application:
```ts
import { example } from '@/offstage';

await example.hello(); // { message: 'Hello world!' }
await example.hello({ subject:'something specific' }); // { message: 'Hello something specific!' }
```

Use in Playwright:
```ts
import { mount } from 'offstage';

test('Clicking the button calls hello method and renders result message', async({ page }) => {
  await mount(page)
  await page.click('button');
  await page.waitForSelector('"Hello something specific!"');
});
```
