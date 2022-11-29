import { test, expect } from '@playwright/test';
import { exampleService } from '../src/example-service.js';

import { mount } from 'offstage';

test.beforeEach(async({page}) => {
  await mount(page);
  await page.goto('/');
});

test('regular routes are mounted: GET', async ({ page }) => {
  await page.click('"GET 2"');
  await page.waitForSelector('"4"');
});

test('regular routes are mounted: POST', async ({ page }) => {
  await page.click('"POST 3"');
  await page.waitForSelector('"9"');
});

test('regular routes are mounted: PUT', async ({ page }) => {
  await page.click('"PUT 4"');
  await page.waitForSelector('"16"');
});

test('regular routes are mounted: PATCH', async ({ page }) => {
  await page.click('"PATCH 5"');
  await page.waitForSelector('"25"');
});

test('regular routes are mounted: DELETE', async ({ page }) => {
  await page.click('"DELETE 6"');
  await page.waitForSelector('"36"');
});

test('can override request', async ({ page }) => {
  exampleService.getSquare.override(() => ({ result:999 }));

  await page.click('"GET 2"');
  await page.waitForSelector('"999"');
});

test('can configure baseURL', async ({ page }) => {
  await Promise.all([
    page.click('"config baseURL"'),
    page.waitForRequest('http://localhost:3000/foo?nr=2'),
  ]);
});
