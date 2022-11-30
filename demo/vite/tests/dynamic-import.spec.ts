import { test, expect } from '@playwright/test';
import { mount } from 'offstage';

test.beforeEach(async({page}) => {
  await mount(page);
  await page.goto('/');
});

test('regular routes are mounted: GET', async ({ page }) => {
  await page.click('"GET 2"');
  await page.waitForSelector('"4"');
});

