---
layout: default
title: Configuration
nav_order: 4
---

# Configuration

You can use `config(configurators:[])` to configure things like `baseURL`, `headers`, `credentials` etc.


The configurators are called in turn with details of the current request. The results are then combined to form the final configuration.

## The configure() function

```ts
import { configure } from 'offstage';

configure([
  // every request gets the same baseURL by default:
  () => ({ baseURL: process.env.VITE_API_URL }),

  // every request gets the same token:
  () => ({ headers: { Authorization: `Bearer {token}` } }),

  // exampleService.hello gets a different baseURL:
  ({ serviceMethodName }) => serviceMethodName === 'exampleService.hello'
    ? { baseURL: process.env.VITE_EXAMPLE_API_URL }
    : {}
]);
```


## Configurator

A configurator is a user-defined function that optionally takes a OffstageConfiguratorContext and returns an OffstageConfig.

### OffstageConfiguratorContext

- `serviceMethodName:string` the full endpoint name, for example `exampleService.hello`


### OffstageConfig

```ts
{
  /** The final endpoint url is prefixed with the baseURL **/
  baseURL?:string; 

  // ... optional fetch() options
}
```

The OffstageConfig extends the options object of the HTML5 `fetch()` method.

Please refer to
[https://developer.mozilla.org/en-US/docs/Web/API/fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch)
for details.

Note: setting `method` and or `body` has no effect as Offstage already takes care of these.

A small summary of the `fetch()` options is given below.
```ts
{
  /** A BodyInit object or null to set request's body. */
  body?: BodyInit | null;

  /** A string indicating how the request will interact with the browser's cache to set request's cache. */
  cache?: RequestCache;

  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials;

  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers?: HeadersInit;

  /** A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
  integrity?: string;

  /** A boolean to set request's keepalive. */
  keepalive?: boolean;

  /** A string to set request's method. */
  method?: string;

  /** A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode. */
  mode?: RequestMode;

  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  redirect?: RequestRedirect;

  /** A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer. */
  referrer?: string;

  /** A referrer policy to set request's referrerPolicy. */
  referrerPolicy?: ReferrerPolicy;

  /** An AbortSignal to set request's signal. */
  signal?: AbortSignal | null;
}
```


