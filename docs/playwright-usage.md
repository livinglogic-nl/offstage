---
layout: default
title: Playwright usage
nav_order: 3
---

# Playwright usage


## The mount() function

Because mock data is stripped away from the production build, we need Playwright to intercept requests to our service endpoints.

Use the `mount()` function to mount your existing mock data during Playwright testing the production build.

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test.beforeEach(async({page}) => {
  await mount(page);
});
```

## endpoint.override()
Use `endpoint.override()` to return a different response during the scope of a test.
```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';
import { exampleService } from '../src/example-service';

test.beforeEach(async({page}) => {
  await mount(page);
});

test('a test with override', async({ page }) => {
  exampleService.hello.override((req,res) => ({
      ...res,
      message: 'override works!',
  }));
});

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
## endpoint.waitForTrigger()
`endpoint.waitForTrigger()` returns a trigger function. The next response is held until the trigger function is called.
```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';
import { exampleService } from '../src/example-service';

test.beforeEach(async({page}) => {
  await mount(page);
});

test('a test with waitForTrigger', async({ page }) => {
  const trigger = exampleService.hello.waitForTrigger();

  // waiting for trigger
  await expect(page.locator('.loading-state')).toBeVisible();

  trigger();

  // response was allowed to proceed, so loading state should disappear
  await expect(page.locator('.loading-state')).not.toBeVisible();
});

```
