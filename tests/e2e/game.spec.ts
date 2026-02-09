import { expect, test } from '@playwright/test';

test('starts game and reaches map scene', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Enter');

  await page.waitForFunction(() => window.__RPG_DEBUG__?.scene === 'map');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
