import { expect, test } from '@playwright/test';

test.describe('Catalog Discovery / Products PLP Page', () => {
  test('renders products page with shell, title, toolbar, and products', async ({ page }) => {
    await page.goto('/products');

    // Page title and header
    await expect(page).toHaveTitle(/Products \| Marketplace/i);
    const mainHeading = page.getByRole('heading', { level: 1, name: /Marketplace Products/i });
    await expect(mainHeading).toBeVisible();

    // Results toolbar
    await expect(page.getByText(/Showing \d+ products/i)).toBeVisible();

    // Products grid contains product cards
    const productArticles = page.locator('article');
    await expect(productArticles.first()).toBeVisible();
    const count = await productArticles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('updates sorting via toolbar dropdown and syncs to URL', async ({ page }) => {
    await page.goto('/products');

    const sortSelect = page.getByLabel(/Sort By/i);
    await sortSelect.selectOption('price_asc');

    await expect(page).toHaveURL(/sort=price_asc/, { timeout: 10000 });
  });

  test('filters by category via desktop sidebar and displays active filter chip', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop sidebar is hidden on mobile viewports');

    await page.goto('/products');

    // Click on a category in the sidebar (e.g. Laptops or Computers & Laptops)
    const categoryButton = page.getByRole('button', { name: /Laptops/i }).first();
    await categoryButton.click();

    await expect(page).toHaveURL(/category=/, { timeout: 10000 });

    // Active filter chip appears
    const activeFilters = page.getByText(/Filters:/i);
    await expect(activeFilters).toBeVisible();

    // Clear all filters resets URL
    const clearAll = page.getByRole('button', { name: /Clear all/i }).first();
    await clearAll.click();
    await expect(page).toHaveURL(/\/products$/, { timeout: 10000 });
  });

  test('opens mobile filter drawer on smaller viewports and applies draft filter', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');

    // Open mobile filter drawer
    const filterTrigger = page.getByRole('button', { name: /Filters/i }).first();
    await expect(filterTrigger).toBeVisible();
    await filterTrigger.click();

    // Drawer is visible
    const drawerTitle = page.getByRole('heading', { name: /Filters/i });
    await expect(drawerTitle).toBeVisible();

    // Apply filters
    const applyButton = page.getByRole('button', { name: /Apply Filters/i });
    await applyButton.click({ force: true });

    // Drawer closes
    await expect(drawerTitle).not.toBeVisible();
  });
});
