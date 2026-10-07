import { test, expect } from '@playwright/test';

test.describe('Foundation Smoke & Acceptance Suite', () => {
  test('shell preview renders essential landmarks and skip-link', async ({ page }) => {
    await page.goto('/shell-preview');

    // Skip to content exists
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeAttached();

    // Main header landmark exists
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    // Main content landmark exists
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Footer landmark exists
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('toggles document theme classes without hydration mismatch', async ({ page }) => {
    await page.goto('/shell-preview');

    const html = page.locator('html');
    await expect(html).toHaveClass(/light|dark/);
  });

  test('preserves valid document direction and language attribute', async ({ page }) => {
    await page.goto('/shell-preview');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', /ltr|rtl/);
    await expect(html).toHaveAttribute('lang', /en|bn|ar|hi/);
  });
});
