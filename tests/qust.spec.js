import qust from '../src/qust.js';
import { test, expect } from '@playwright/test';

test('Can stringify a complex object', async() => {
  const complex = { a:1, b:2, c: [ 3, 4 ], d: { e: [ 5, 6 ] } };
  expect( qust.stringify(complex) )
    .toEqual('a=1&b=2&c%5B0%5D=3&c%5B1%5D=4&d%5Be%5D%5B0%5D=5&d%5Be%5D%5B1%5D=6');
  expect( decodeURIComponent( qust.stringify(complex) ) )
    .toEqual('a=1&b=2&c[0]=3&c[1]=4&d[e][0]=5&d[e][1]=6');

});

test('Can parse a complex object', async() => {
  const complex = { a:1, b:2, c: [ 3, 4 ], d: { e: [ 5, 6 ] } };
  const query = qust.stringify(complex);
  const parsed = qust.parse(query);
  expect(parsed).toEqual({ a:'1', b:'2', c: [ '3', '4' ], d: { e: [ '5', '6' ] } });
});

