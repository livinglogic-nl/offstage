import { test, expect } from '@playwright/test';

import jsonTypeSignature from '../src/json-type-signature.js';


test('Works with a simple string', async({}) => {
  expect(jsonTypeSignature('hello')).toEqual([
    '$.string',
  ]);
});

test('Works with a simple boolean', async({}) => {
  expect(jsonTypeSignature(true)).toEqual([
    '$.boolean',
  ]);
});

test('Works with a simple number', async({}) => {
  expect(jsonTypeSignature(1)).toEqual([
    '$.number',
  ]);
});

test('Works with a simple null', async({}) => {
  expect(jsonTypeSignature(null)).toEqual([
    '$.null',
  ]);
});

test('Works with an array of strings', async({}) => {
  expect(jsonTypeSignature([ 'a', 'b' ])).toEqual([
    '$[].string',
  ]);
});

test('Works with an array of differing types (sorted by type name)', async({}) => {
  expect(jsonTypeSignature([ 'a', 5 ])).toEqual([
    '$[].number',
    '$[].string',
  ]);
});

test('Works with a simple object', async({}) => {
  expect(jsonTypeSignature(
    {
      name:'joe',
      shoes:2
    }
  )).toEqual([
    '$.name.string',
    '$.shoes.number',
  ]);
});

test('Works with a complex object', async({}) => {
  expect(jsonTypeSignature(
    {
      name:'joe',
      shoes: [
        { size: 10, },
        { size: 11, },
      ]
    }
  )).toEqual([
    '$.name.string',
    '$.shoes[].size.number',
  ]);
});

test('Works with a combination of simple and complex objects', async({}) => {
  expect(jsonTypeSignature([
    {
      name:'joe',
      shoes:2
    },
    {
      name:'joe',
      shoes: [
        { size: 10, },
        { size: 11, },
      ]
    }
  ])).toEqual([
      '$[].name.string',
      '$[].shoes.number',
      '$[].shoes[].size.number',
  ]);
});
