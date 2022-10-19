---
layout: default
title: mount()
parent: API
nav_order: 3
---

Use `mount()` to add routes for all the mocks to a Playwright page.

```ts
function mount(page:any):void;
```

- **page**  
  The playwright page that should get the routes

## Example

```ts
import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test('testing functionality', async({page}) => {
  await mount(page);
  // real network requests to your api are now intercepted by playwright
});
```
