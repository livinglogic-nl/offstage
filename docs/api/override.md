---
layout: default
title: override()
parent: API
nav_order: 5
---

Use `override()` to override a response for a specific Playwright test.

```ts
function override(
  page:any, // The playwright page that should get the routes
  serviceMethodSignature:string, // The `serviceMethodSignature` to override
  handler:(args:OverrideHandlerArgs) => any // the override handler (see below)
):void;
```
```ts
interface OverrideHandlerArgs {
  requestData:any; // the data sent with this request
  responseData:any; // the response data that would have been returned normally
}
```

## Examples

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test('Just override the response', async({page}) => {
  await mount(page);
  await override(page, 'example.hello', () => ({ message:'bye world?' }));
});
```

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test('Reuse response data', async({page}) => {
  await mount(page);
  await override(page, 'example.hello', ({ responseData }) => ({
    ...responseData,
    message:'bye world?'
  }));
});
```

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test('Act on request data', async({page}) => {
  await mount(page);
  await override(page, 'example.hello', ({ requestData, responseData }) => {
    if(requestData.someFlag) {
      return {
        ...responseData,
        message:'bye world?'
      }
    }
    return responseData;
  });
  }));
});
```
