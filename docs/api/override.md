---
layout: default
title: override()
parent: API
nav_order: 5
---

Use `override()` to override a response for a specific Playwright test.

```ts
function override(page:any, serviceMethodSignature:string, request:any, response:any):void;
```

- **page**  
  The playwright page that should get the routes

- **serviceMethodSignature**  
  Should match a `serviceMethodSignature` that was used in `create()`.

- **request**
Sample of the request data

- **response**
Sample of the response data

## Example

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test('testing functionality', async({page}) => {
  await mount(page);
  await override(page, 'example.hello', {}, { message:'bye world?' });
});
```
