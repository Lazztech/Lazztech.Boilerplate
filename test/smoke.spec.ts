import { test, expect } from '@playwright/test';

const APP_NAME = process.env.APP_NAME || 'Boilerplate';

test('homepage loads with APP_NAME title and version', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText(APP_NAME);
});
