import { existsSync } from 'node:fs';
import { chromium, expect, test } from '@playwright/test';

const hasRemoteEndpoint = Boolean(process.env.PW_TEST_CONNECT_WS_ENDPOINT);
const chromiumExecutable = chromium.executablePath();

if (!hasRemoteEndpoint) {
  test.skip(
    !existsSync(chromiumExecutable),
    `Playwright chromium is not installed in this environment: ${chromiumExecutable}`
  );
}

test('starts game and reaches map scene', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Enter');

  await page.waitForFunction(() => window.__RPG_DEBUG__?.scene === 'map');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
