---
layout: default
title: Getting started
nav_order: 2
---
# Getting started

## Install
Install the package using npm.
```bash
npm i offstage
```

Create the src/offstage directory. It will contain your mocks, as well as the generated API.

```bash
mkdir src/offstage
```

### Optional Vite plugin
Update `vite.config.ts` to automatically sync on mock changes:
```ts
import { vitePluginOffstage } from 'offstage';

export default defineConfig({
  ...
  plugins: [
    ...
    vitePluginOffstage(),
  ],
})

```

## Mock

Create a `src/offstage/mock.ts` file:

```ts
import { create, mock } from 'offstage';

// connect the api to the REST request
create('example.hello', 'POST /say-hello');

// mock the data transfer
mock('example.hello', {}, { message: 'Hello world!' });
```

## Sync
Run this everytime you change mock data (not needed when using vite plugin)
```bash
npx offstage sync
```

Sync generates the `src/offstage/index.ts` file that can be imported in application code.

## Use in application
```ts
import { example } from '@/offstage';

await example.hello(); // { message: 'Hello world!' }
```

## Use with Playwright
```ts
import { mount } from 'offstage';

test('Hello world method works', async({ page }) => {
  await mount(page)
  await page.goto('/');
  await page.waitForSelector('"Hello world!');
});
```


