---
layout: default
title: Factory
nav_order: 4
---

# The factory function:

You can use the `factory()` function to quickly create objects with default values:
```ts

import { factory } from 'offstage';
import { User } from './types.ts';

const makeUser = factory<User>({
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
});

const john = makeUser();
// { id: 1, firstname: 'John', lastname: 'Doe' }

const dodo = makeUser({ firstname: 'Doe' });
// { id: 1, firstname: 'Doe', lastname: 'Doe' }

```

