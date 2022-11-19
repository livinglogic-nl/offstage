---
layout: default
title: create()
parent: API
nav_order: 1
---

Use `create()` to describe an endpoint to your api.

```ts
function create(serviceMethodSignature:string, endpointSignature:string):void
```

- **serviceMethodSignature**
Names both the service and the method that you are creating.  
For example: `example.hello` would create the service `example` with the method `hello`.

- **endpointSignature**
Configures both the request method and the path of the url.  
For example: `GET /hello` would configure a request method `GET` and a path of `/hello`.


### How is data sent?
1. **default**
  - `GET` sends data through url query parameters.
  - `POST,PATCH,PUT and DELETE` sends data through request body. (JSON)
2. **path parameters** colon prefixed fields in the path segment will be inserted there. `/some/:id`
3. **query parameters** comma seperated fields in the query segment will be inserted there. `?limit,offset`


## Examples

```ts
import { create } from 'offstage';
create('example.hello', 'POST /hello');
```
```ts
// path params
import { create } from 'offstage';
create('example.hello', 'POST /hello/:foo/:bar');
```
```ts
// query params
import { create } from 'offstage';
create('example.hello', 'POST /hello?foo,bar');
```


### Optionally specify your own request and response interfaces
Although `mock()` can generate the request and response interfaces,
you can use `create()` in a generic fashion and specify the interfaces yourself.

**Important!**
The interfaces need to be defined in the src/offstage directory and be exported.
```ts
import { create } from 'offstage';

export interface ExampleHelloRequest {
  subject:string;
}
export interface ExampleHelloResponse {
  message:string;
}
create<ExampleHelloRequest, ExampleHelloResponse>('example.hello', 'POST /hello');
```



