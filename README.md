<style>

g { fill: white; }
.shade { fill: black; }

@media (prefers-color-scheme: light) {
  g { fill: black; }
  .shade { fill: white; }
}

</style>
<svg viewBox="0 0 200 64" width="600">
<defs>
  <g id="o">
    <path d="M0,8
      a8,8 1,0,0 16,0
      a8,8 1,0,0 -16,0
      m12,0
      a4,4 1,0,1 -8,0
      a4,4 1,0,1 8,0
      " />
  </g>
  <g id="f">
    <rect width="4" height="16" />
    <rect width="10" height="4" />
    <rect y="5" width="12" height="4" />
  </g>
  <g id="s">
    <rect width="4" height="10" />
    <rect x="10" y="6" width="4" height="8" />
    <rect width="10" height="4" />
    <rect y="6" width="12" height="4" />
    <rect y="12" width="14" height="4" />
  </g>
  <g id="t">
    <rect x="4" width="4" height="16" />
    <rect width="12" height="4" />
  </g>
  <g id="a">
    <path d="M0,16L8,0 16,16 11,16 8,10 5,16" />
  </g>
  <g id="g">
    <path d="
      M16,8
      L12,8
      A4,4 1,1,1 10,4
      L15,4
      A8,8 0,1,0 16,8
      " />
    <rect x="8" y="6" width="6" height="4" />
  </g>
  <g id="e">
    <rect width="4" height="16" />
    <rect width="10" height="4" />
    <rect y="6" width="12" height="4" />
    <rect y="12" width="14" height="4" />
  </g>
</defs>
<g transform="translate(0,44)">
  <rect width="60" height="20" fill="yellow" rx="3" />
</g>
<g transform="translate(0,22)">
  <rect width="40" height="20" fill="#f60" rx="2" />
  <path class="shade" d="M0,20l0,4 42,0 -1,-4z" />
  <g transform="translate(42,2)">
    <use href="#s" x="0" />
    <use href="#t" x="13" />
    <use href="#a" x="23" />
    <use href="#g" x="38" />
    <use href="#e" x="55" />
  </g>
</g>
<g>
  <rect width="20" height="20" fill="#e00" rx="1" />
  <path class="shade" d="M0,20l0,4 22,0 -1,-4z" />
  <g transform="translate(22,2)">
    <use href="#o" x="0" />
    <use href="#f" x="17" />
    <use href="#f" x="30" />
  </g>
</g>
</svg>

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
