# Offstage 🔦
-- Acting like the back-end is there

## Coming soon!
I'm actively working on this but it is not ready yet. Please check back soon!

# When to use

Suppose you're working on a Front-End that calls into REST backend services, you might want to have:
- ⚡️ Dev-time mocking (for playing around while developing)
- 🚀 Axios powered TypeScript API (for making the requests)
- 🎭 Playwright route mocking (for integration testing the final build)
- 🤝 Pact tests (for ensuring compatability with the backend)

Offstage generates all you need, just by specifying the mock data.

## Example

The following mock data:
```ts
import { create, mock } from 'offstage';

// create connects the api to the REST request
create('service.hello', 'POST /say-hello');

// mock mocks the data transfer
mock('service.hello', {}, { message: 'Hello world!' });
mock('service.hello', { subject:'something specific' }, { message: 'Hello something specific!' });
```

Would generate:

1. an Axios powered TypeScript api (that also works offline)
```ts
import { service } from '@/offstage';
await service.hello(); // returns { message: 'Hello world!' }
await service.hello({ subject:'something specific' }); // returns { message: 'Hello something specific!' }

```

2. pluggable Playwright routes:
```ts
import { mount } from 'offstage';

test.beforeEach(async({ page }) => {
  await mount(page)
  await page.click('button.specific');
  await page.waitForSelector('"Hello something specific!'");
});
```
3. PACT-test files for backend:
```
// TODO: summary of a pact file

```

