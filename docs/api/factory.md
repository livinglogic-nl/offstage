---
layout: default
title: factory()
parent: API
nav_order: 2
---

Use `factory()` to create a factory function that returns typed objects.

By use of destructuring, you both name the type, and the factory function.
An object created by a factory that is used in a mock, will have its type reflected in the api.


## Example

```ts
// src/offstage/mock.ts
import { factory } from 'offstage';
const { TodoItem } = factory({ id:1, text:'todo text' });

mock('example.getTodos', {}, [
   TodoItem({}),
   TodoItem({ text:'buy cheese' }),
]);
```
```ts
// src/main.ts
import { example, TodoItem } from '@offstage';
const todos:TodoItem[] = await example.getTodos();
// [ { id:1, text:'todo text' }, { id:1, text:'buy cheese' } ]
```
