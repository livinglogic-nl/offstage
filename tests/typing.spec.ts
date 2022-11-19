import fs from 'fs';

import { test, expect } from '@playwright/test';
import runVite from './run-vite';

test.describe('Typing', () => {
  test('generates a typed api', async() => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';
create('example.hello', 'POST /say-hello');
mock('example.hello', { subject:'world' }, { message: 'Hello world!' });
      `,
    }, async({ sandboxDir }) => {
        const apiSourceCode = fs.readFileSync(`${sandboxDir}/src/offstage/index.ts`).toString();
        expect(apiSourceCode).toContain('export interface ExampleHelloRequest {subject:string}');
        expect(apiSourceCode).toContain('export interface ExampleHelloResponse {message:string}');
    });
  });

  test('provides factory method for named types', async() => {

    await runVite({
      'src/offstage/mock.ts': `
import { create, mock, factory } from 'offstage';

const { HelloResult } = factory({
  message: 'default message',
  state: 'default state',
});

create('example.hello', 'POST /say-hello');
mock('example.hello', { subject:'world' }, HelloResult({ message: 'Hello world!' }));
      `,
    }, async({ sandboxDir }) => {
        const apiSourceCode = fs.readFileSync(`${sandboxDir}/src/offstage/index.ts`).toString();
        expect(apiSourceCode).toContain('export interface HelloResult {message:string,state:string}');
        expect(apiSourceCode).toContain('Promise<HelloResult>');
    });
  });

  test('allows custom typing', async() => {
    await runVite({
      'src/offstage/mock.ts': `
import { create, mock } from 'offstage';

export interface ExampleHelloRequest {
  subject:string;
}

export interface ExampleHelloResponse {
  message:string;
}

create<ExampleHelloRequest, ExampleHelloResponse>('example.hello', 'POST /say-hello');
mock('example.hello', { subject:'world' }, { message: 'Hello world!' });

create('example.bye', 'POST /say-bye');
mock('example.bye', { subject:'world' }, { message: 'Bye world!' });
      `,
    }, async({ sandboxDir }) => {
        const apiSourceCode = fs.readFileSync(`${sandboxDir}/src/offstage/index.ts`).toString();
        expect(apiSourceCode).toContain(
          `import { ExampleHelloRequest, ExampleHelloResponse } from './mock'`
        );
    });
  });
});
