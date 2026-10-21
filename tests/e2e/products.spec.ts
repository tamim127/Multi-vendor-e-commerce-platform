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

  test('submits desktop search, displays results, and shows search chip in active filters', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop search bar is tested on desktop viewports');

    await page.goto('/products');

    const searchInput = page.getByPlaceholder(/Search millions of products/i);
    await expect(searchInput).toBeVisible();

    await searchInput.fill('macbook');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/q=macbook/, { timeout: 10000 });

    // Header displays search results heading
    const searchHeading = page.getByRole('heading', { level: 1, name: /Search results for/i });
    await expect(searchHeading).toBeVisible();

    // Active filters display search chip
    const searchChip = page.getByText(/Search:.*macbook/i);
    await expect(searchChip).toBeVisible();

    // Dismiss search chip clears query
    const removeChipBtn = page.getByLabel(/Remove search query: macbook/i);
    await removeChipBtn.click();
    await expect(page).not.toHaveURL(/q=macbook/, { timeout: 10000 });
  });

  test('enforces explicit sort precedence over default relevance sort', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Sort controls tested on desktop viewports');

    // Load with search query and no explicit sort
    await page.goto('/products?q=Electronics');

    const sortSelect = page.getByLabel(/Sort By/i);
    // Effective sort is relevance
    await expect(sortSelect).toHaveValue('relevance');

    // Explicitly change sort to newest
    await sortSelect.selectOption('newest');
    await expect(page).toHaveURL(/sort=newest/, { timeout: 10000 });
    await expect(sortSelect).toHaveValue('newest');

    // Explicitly change sort to bestselling
    await sortSelect.selectOption('bestselling');
    await expect(page).toHaveURL(/sort=bestselling/, { timeout: 10000 });
    await expect(sortSelect).toHaveValue('bestselling');
  });

  test('executes mobile search on 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');

    // Open mobile search toggle
    const searchToggle = page.getByLabel(/Open mobile search/i);
    await expect(searchToggle).toBeVisible();
    await searchToggle.click();

    // Fill mobile search input and submit
    const mobileSearchInput = page.locator('input[type="search"]:visible').first();
    await expect(mobileSearchInput).toBeVisible();
    await mobileSearchInput.fill('sony');
    await mobileSearchInput.press('Enter');

    await expect(page).toHaveURL(/q=sony/, { timeout: 10000 });
  });

  test('recovers from inverted price bounds with empty state and filter reset', async ({
    page,
  }) => {
    // Navigate directly to inverted price bounds URL
    await page.goto('/products?minPrice=250000&maxPrice=100000');

    // Zero-results empty state is displayed
    const emptyHeading = page.getByRole('heading', { name: /No products found/i });
    await expect(emptyHeading).toBeVisible();

    // Reset filters restores valid catalog listing
    const resetBtn = page.getByRole('button', { name: /Reset all filters/i });
    await resetBtn.click();

    await expect(page).toHaveURL(/\/products$/, { timeout: 10000 });
    const productArticles = page.locator('article');
    await expect(productArticles.first()).toBeVisible();
  });

  test('handles browser back and forward navigation correctly', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Back/forward history tested on desktop');

    await page.goto('/products');
    await expect(page).toHaveURL(/\/products$/);

    // Search for macbook
    const searchInput = page.getByPlaceholder(/Search millions of products/i);
    await searchInput.fill('macbook');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/q=macbook/, { timeout: 10000 });

    // Press browser back
    await page.goBack();
    await expect(page).toHaveURL(/\/products$/, { timeout: 10000 });

    // Press browser forward
    await page.goForward();
    await expect(page).toHaveURL(/q=macbook/, { timeout: 10000 });
  });
});
