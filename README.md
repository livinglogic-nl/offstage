# Offstage


# Getting started

**1. install**
```bash
npm i offstage
```

**2. define service**
```ts
// src/example-service.ts
import { endpoint } from 'offstage'

interface FooRequest {
  id:number;
}

interface FooResponse {
  message:string;
}

export const exampleService {
  foo: endpoint<FooRequest, FooResponse>('GET /foo', ({ id }) => {
    return {
      message: `some mock data for id: ${id}` }
  }),
}
```

**3. use service**
```ts
// src/app.ts
import exampleService from './example-service';

const data = await exampleService.foo({ id:2 });
console.log(data); // { message:'some mock data for id: 2' }
```

# Usage with playwright

Your mock data gets stripped out of production build. To still use mock data in your tests, you can use mount. It will intercept requests and respond with your mock data.

**4. intercept requests with mount**
```ts
// tests/example.spec.ts
import { mount } from 'offstage';

test.beforeEach(async(page) => {
  await mount(page);
});
```

**5. optionally override responses**
```ts
// tests/example.spec.ts
import { mount } from 'offstage';
import { exampleService } from '../src/example-service.ts';

test.beforeEach(async(page) => {
  await mount(page);
});

test('testing with an override', async({page}) => {
  exampleService.foo.override((requestData,responseData) => {
    return { ...responseData, message: 'override works!' };
  });
});
```
# Configuration

You can use `config(configurators:[])` to configure things like `baseURL`, `headers`, `credentials` etc.

The configurators are called in turn with details of the current request. The results are then combined to form a final configuration.


**6. Configuration**
```ts
import { configure } from 'offstage';

configure([
  // every call gets the same baseURL
  () => ({ baseURL: process.env.VITE_API_URL }),

  // every call gets the same token
  () => ({ headers: { Authorization: `Bearer {token}` } }),

  // exampleService.foo gets a different baseURL
  ({ serviceMethodName }) => serviceMethodName === 'exampleService.foo'
    ? { baseURL: process.env.VITE_EXAMPLE_API_URL }
    : {}
]);
```

Offstage uses `fetch()` behind the scenes so you can refer to https://developer.mozilla.org/en-US/docs/Web/API/fetch for most of the options. 
