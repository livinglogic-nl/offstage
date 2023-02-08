---
layout: default
title: Pact usage
nav_order: 5
---

# Pact usage

Offstage can automatically generate Pact contracts based on the mock data you have already provided! 🎉

Pact facilitates contract testing. This allows you to ensure compatability without end-to-end tests. From https://docs.pact.io :
> Pact is a code-first tool for testing HTTP and message integrations using contract tests. Contract tests assert that inter-application messages conform to a shared understanding that is documented in a contract. Without contract testing, the only way to ensure that applications will work correctly together is by using expensive and brittle integration tests.

Offstage can generate Pact files and optionally upload them to a broker.

This is takes care of most of the consumer part of Pact testing, please refer to https://pact.io/ to learn about the complete process.

# Step by step
This section assumes you already have Offstage working nicely with Playwright. If not, please follow [Playwright usage](playwright-usage.md) first.

## 1. Provide a configuration

In the root of your project, create a `offstage.config.ts` file to configure the following Pact settings:

- `consumerName` the consumer name of the contract, for example 'MyApp'
- `providerNames` Mapping of service names to provider names.
```ts
// offstage.config.ts
export default {
  pact: {
    consumerName: 'MyApp',
    providerNames: {
      exampleService: 'ExampleService',
    },
  }
}

```

## 2. Generate Pact contracts

With the configuration in place:
- run `npx playwright test`
- run `npx offstage pact`



## 3. Publish to broker

To automatically publish to a Pact broker, supply the following environment to `npx offstage pact`:
- `OFFSTAGE_PACT_BROKER_URL`: url of Pact broker
- `OFFSTAGE_PACT_COMMIT`: current git commit sha
- `OFFSTAGE_PACT_BRANCH`: current git branch
- `OFFSTAGE_PACT_BROKER_TOKEN`: username for publishing

When using pactfoundation/pact-broker Docker, you can use the following instead of a token:
- `OFFSTAGE_PACT_BROKER_USERNAME`: username for publishing
- `OFFSTAGE_PACT_BROKER_PASSWORD`: password for publishing
