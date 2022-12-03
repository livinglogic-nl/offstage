---
layout: default
title: Playwright usage
nav_order: 2
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
