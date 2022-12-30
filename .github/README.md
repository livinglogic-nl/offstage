# ![](docs/logo-both.svg)
## Fake requests in dev - Real requests in prod

- 🚀 Easily define a **TypeScript Request API**
- ⚡️ **Mock data** for development (stripped out of production build)
- 🎭 **Same** mock data for Playwright (to test the production build)
- 🦄 **Override** mock data (for testing specific scenarios)
- 🤝 Automatic **Pact** tests (to verify compatability)
- 🔥 **Small** footprint (offstage adds ~2kb to your production build)


# Getting started

## 1. Install
```bash
npm i offstage
```

## 2. Define service
```ts
// src/example-service.ts
import { service, endpoint } from 'offstage'

export const { exampleService } = service({
  foo: endpoint<{id:number},{message:string}>('GET /foo',
    ({ id }) => ({ message: `some mock data for id: ${id}` }),
});
```

## 3. Use service
```ts
// src/app.ts
import exampleService from './example-service';

const data = await exampleService.foo({ id:2 });
console.log(data); // { message:'some mock data for id: 2' }
```

# Usage with playwright

Your mock data gets stripped out of production build. To still use mock data in your tests, you can use mount. It will intercept requests and respond with your mock data.

## 4. intercept requests with mount
```ts
// tests/example.spec.ts
import { mount } from 'offstage';

test.beforeEach(async(page) => {
  await mount(page);
  // requests of 'GET /foo' are now intercepted
  // using mock callback defined in step 2
});
```

## 5. optionally override responses
```ts
// tests/override.spec.ts
import { mount } from 'offstage';
import { exampleService } from '../src/example-service.ts';

test.beforeEach(async(page) => {
  await mount(page);
});

test('testing with an override', async({page}) => {
  exampleService.foo.override((requestData,responseData) => {
    return { ...responseData, message: 'override works!' };
  });
  // requests of 'GET /foo' are now intercepted
  // and responded with { message:'override works! }
});
```
# Configuration

You can use `configure(configurators:[])` to configure things like `baseURL`, `headers`, `credentials` etc.

The configurators are called in turn with details of the current request. The results are then combined to form a final configuration.


**6. Configuration**
```ts
import { configure } from 'offstage';

configure([
  // every request gets the same baseURL by default:
  () => ({ baseURL: process.env.VITE_API_URL }),

  // every request gets the same token:
  () => ({ headers: { Authorization: `Bearer {token}` } }),

  // exampleService.hello gets a different baseURL:
  ({ serviceMethodName }) => serviceMethodName === 'exampleService.hello'
    ? { baseURL: process.env.VITE_EXAMPLE_API_URL }
    : {}
]);
```

Offstage uses `fetch()` behind the scenes so you can refer to https://developer.mozilla.org/en-US/docs/Web/API/fetch for most of the options. 

# Documentation
[Read the Documentation](https://livinglogic-nl.github.io/offstage/)
