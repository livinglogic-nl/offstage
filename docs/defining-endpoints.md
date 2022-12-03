---
layout: default
title: Defining endpoints
nav_order: 2
---

# Defining endpoints


Use the `endpoint()` and `service()` functions to define a service with endpoints.
```ts
import { service, endpoint } from 'offstage';

export const { exampleService } = service({
  hello: endpoint<
    { subject:string }, // request data interface
    { message:string }, // response data interface
  >(
  'GET /hello', // real life endpoint signature
  () => ({ message:'Hello world' }), // mock data
});

```
## The **endpoint** function:
- expects a request data interface (as a generic)
- expects a response data interface (as a generic)
- expects an endpoint signature (see below)
- expects a mock data function (see below)

### Endpoint signature

An endpoint signature looks like this:  
`${method} ${path}`
- `GET|POST|PATCH|PUT|DELETE`
- path is the part after the baseURL. Can optionally describe placholders and query params.

Endpoint signtare examples:
- `POST /houses`
- `PATCH /houses/:id`
  - The `:id` describes a placeholder (the`id` property of your request data would be inserted here)
- `GET /houses?search,max_results`
  - The comma separated fields after the `?` describe query params (the `search` and `max_results` property of your request data w

### Mock data function
This function is called each time Offstage wants to resolve this endpoint without network (during development)

- It receives the request data and should respond with mock response data

## The **service** function:
- expects an object with one or more endpoints
- uses destructuring (the `{ exampleService }` part) so Offstage can know the full name of endpoints like `exampleService.hello`.

