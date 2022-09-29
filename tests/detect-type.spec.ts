import { test, expect } from '@playwright/test';

import detectType from '../src/detect-type.js';

test('detects a null', async({}) => {
  expect(detectType(null)).toBe('null');
});

test('detects a boolean', async({}) => {
  expect(detectType(true)).toBe('boolean');
});

test('detects a string', async({}) => {
  expect(detectType('hello')).toBe('string');
});

test('detects a number', async({}) => {
  expect(detectType(123)).toBe('number');
});

test('detects an array of numbers', async({}) => {
  expect(detectType([123,456])).toBe('number[]');
});

test('detects a simple object', async({}) => {
  expect(detectType({ hello:'world' })).toBe('{hello:string}');
});

test('detects an optional property', async({}) => {
  expect(detectType(
    { hello:'world' },
    {}
  )).toBe('{hello?:string}');
});

test('detects an array of mixed types (number and string)', async({}) => {
  expect(detectType([123, 'world'])).toBe('(number|string)[]');
});

test('detects an array of mixed types (number and null)', async({}) => {
  expect(detectType([123, null])).toBe('(number|null)[]');
});

test('detects an array of mixed types (object and number)', async({}) => {
  expect(detectType([{ name:'jack' }, 123])).toBe('({name:string}|number)[]');
});

test('supports a named type', async({}) => {
  expect(detectType({ 'x-os-type': 'Person', name:'jack' })).toBe('Person');
});

test('supports an array of named types', async({}) => {
  expect(detectType([ { 'x-os-type': 'Person', name:'jack' } ])).toBe('Person[]');
});
