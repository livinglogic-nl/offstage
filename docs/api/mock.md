---
layout: default
title: mock()
parent: API
nav_order: 2
---

Use `mock()` to sample different requests and responses for your api.

```ts
function mock(serviceMethodSignature:string, request:any, response:any):void;
```

- **serviceMethodSignature**  
  Should match a `serviceMethodSignature` that was used in `create()`.

- **request**
Sample of the request data

- **response**
Sample of the response data


## What to mock
The mocking with `mock()` is used for:
- navigation of your application while developing
- fallback responses  while playwright testing
- determine types for typed API / PACT tests

For testing specific scenarios, using `override()` in a playwright test might make more sense.

## Multiple mocks

By using multiple mocks for the same api, you can sample optionality and differentiating types in requests and responses.
Offstage will try to match a mock based on the request, and falls back to the first mock.


## Examples

```ts
// mock with empty request
import { mock } from 'offstage';
mock('example.hello', {}, { message:'Hello world!' })
```

```ts
// multiple mocks
import { mock } from 'offstage';
mock('example.hello', {}, { message:'Hello world!' })
mock('example.hello', { subject:'something else' }, { message:'Hello something else!' })
```

