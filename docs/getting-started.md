---
layout: default
title: Getting started
nav_order: 2
---
# Getting started

## Install
Install the package using npm.
```
npm i offstage
```

Create the src/offstage directory. It will contain your mocks, as well as the generated API.

```
mkdir src/offstage
```

### Optional Vite plugin
Update `vite.config.ts` to automatically sync on mock changes:
```
import { offstageVitePlugin } from 'offstage'

export default defineConfig({
  ...
  plugins: [
    offstageVitePlugin(),
  ],
})

```

## Mock

Create a `src/offstage/mock.ts` file:

```
import { create, mock } from 'offstage';

// connect the api to the REST request
create('service.hello', 'POST /say-hello');

// mock the data transfer
mock('service.hello', {}, { message: 'Hello world!' });
```

## Sync
Run this everytime you change mock data (not needed when using vite plugin)
```
npx offstage sync
```

Sync generates the `src/offstage/index.ts` file that can be imported in application code.

## Use in application
```
import { service } from '@/offstage';

await service.hello(); // { message: 'Hello world!' }
```

## Use with Playwright
```
import { mount } from 'offstage';

test('Hello world method works', async({ page }) => {
  await mount(page)
  await page.goto('/');
  await page.waitForSelector('"Hello world!');
});
```


