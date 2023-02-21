---
layout: default
title: Playwright usage
nav_order: 3
---

# Playwright usage


## The attach() function

Because mock data is stripped away from the production build, we need Playwright to intercept requests to our service endpoints.

Use the `attach()` function to mount your existing mock data during Playwright testing the production build.

```ts
import { test } from '@playwright/test';
import { attach } from 'offstage/playwright';
attach(test);
```

## endpoint.override()
Use `endpoint.override()` in your playwright test to return a different response during the scope of a test.

The override callback has the following signature:
- `req` the request data
- `res` the response data that would have normally been returned
- `utils` an object with utilities:
  - `responseStatus` can be used to respond with a different status


### Using req and res
```ts
import { test, expect } from '@playwright/test';
import { attach } from 'offstage/playwright';
import { exampleService } from '../src/example-service';
attach(test);

test('a test with conditional override', async({ page }) => {
  exampleService.hello.override((req,res) => {
    if(req.subject === 'world') {
      ...res,
      message: 'hello world is on a break!',
    }
    return res;
  });
});
```

### Using responseStatus

```ts
test('a test with alternative response status', async({ page }) => {
  exampleService.hello.override((req,res, { responseStatus }) => {
    responseStatus(401);
    return res;
  });
});
```


## endpoint.waitForTrigger()
`endpoint.waitForTrigger()` returns a trigger function. The next response is held until the trigger function is called.
```ts
import { test, expect } from '@playwright/test';
import { attach } from 'offstage/playwright';
import { exampleService } from '../src/example-service';
attach(test);

test('a test with waitForTrigger', async({ page }) => {
  const trigger = exampleService.hello.waitForTrigger();

  // waiting for trigger
  await expect(page.locator('.loading-state')).toBeVisible();

  trigger();

  // response was allowed to proceed, so loading state should disappear
  await expect(page.locator('.loading-state')).not.toBeVisible();
});

```
