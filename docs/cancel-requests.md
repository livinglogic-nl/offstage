---
layout: default
title: Cancel requests
nav_order: 5
---

# Cancel requests

At times it is useful to cancel a request, for instance when the user navigates away and data being loaded is not needed anymore.

## cancelRequestsByGroup(cancelGroup:string)

One can provide a `cancelGroup` for requests in 2 ways:
1. at the time of making a request
2. from a configurator passed to the `configure()` call

This `cancelGroup` can then be used to cancel all requests matching the cancelGroup.

### Example 1: cancelGroup at the time of making a request

```ts
// example-usage.ts
import { cancelRequestsByGroup } from 'offstage/core';

fooService.bar({ some:'data' }, { cancelGroup:'overview' });

cancelRequestsByGroup('overview');

```

### Example 2: cancelGroup from configurator

```ts
// example-config.ts
configure([
  ({ serviceMethodName }) => serviceMethodName === 'fooService.bar' ? { cancelGroup:'overview' } : {}
]);
```

```ts
// example-usage.ts
import { cancelRequestsByGroup } from 'offstage/core';

fooService.bar({ some:'data' });

cancelRequestsByGroup('overview');

```



