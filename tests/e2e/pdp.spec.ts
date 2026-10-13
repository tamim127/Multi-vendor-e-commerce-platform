import { expect, test } from '@playwright/test';

test.describe('Phase 2D: Product Detail Page (PDP)', () => {
  const pdpUrl = '/products/apple-macbook-pro-16-m3-max';

  test('renders PDP with title, breadcrumbs, gallery, price, and specs', async ({ page }) => {
    await page.goto(pdpUrl);

    // Title & Heading
    await expect(page).toHaveTitle(/Apple MacBook Pro 16" with M3 Max Chip \| Marketplace/i);
    const mainHeading = page.getByRole('heading', {
      level: 1,
      name: /Apple MacBook Pro 16" with M3 Max Chip/i,
    });
    await expect(mainHeading).toBeVisible();

    // Breadcrumbs
    const breadcrumbNav = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumbNav).toBeVisible();
    await expect(breadcrumbNav.getByText('Home')).toBeVisible();
    await expect(breadcrumbNav.getByText('Products')).toBeVisible();

    // Price display
    await expect(page.getByText('$2,499.00').first()).toBeVisible();

    // Stock availability
    await expect(page.getByText(/In Stock/i).first()).toBeVisible();

    // Seller offers & disclaimer
    await expect(page.getByText(/Other Sellers on Marketplace/i)).toBeVisible();
    await expect(
      page.getByText(/Merchant profiles, ratings, and tags are demonstration fixture data/i)
    ).toBeVisible();

    // Tabs
    await expect(page.getByRole('tab', { name: /Overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Specifications/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Reviews/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Questions & Answers/i })).toBeVisible();
  });

  test('switches tabs and reveals specification table and demo reviews', async ({ page }) => {
    await page.goto(pdpUrl);

    // Click Specifications tab
    const specsTab = page.getByRole('tab', { name: /Specifications/i });
    await specsTab.click();
    await expect(page.getByRole('table')).toBeVisible();

    // Click Reviews tab
    const reviewsTab = page.getByRole('tab', { name: /Reviews/i });
    await reviewsTab.click();
    await expect(
      page.getByText(/Customer reviews and Q&A shown are demonstration fixtures/i)
    ).toBeVisible();
  });

  test('captures purchase intent via modal without cart persistence', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Mobile uses sticky bottom bar');

    await page.goto(pdpUrl);

    // Click Add to Cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await addToCartBtn.click();

    // Intent modal appears
    const modalHeading = page.getByRole('heading', { name: /Purchase Intent Captured/i });
    await expect(modalHeading).toBeVisible();
    await expect(page.getByText(/This is a demonstration of Phase 2D PDP/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Got it/i });
    await closeBtn.click();
    await expect(modalHeading).not.toBeVisible();
  });

  test('redirects from /product/[slug] to /products/[slug]', async ({ page }) => {
    await page.goto('/product/apple-macbook-pro-16-m3-max');
    await expect(page).toHaveURL(/\/products\/apple-macbook-pro-16-m3-max$/);
  });

  test('displays mobile sticky action bar on 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(pdpUrl);

    // Mobile sticky bar is visible at bottom
    const mobilePrice = page.locator('.md\\:hidden.fixed.bottom-0');
    await expect(mobilePrice).toBeVisible();
    await expect(mobilePrice.getByText('$2,499.00')).toBeVisible();
  });

  test('handles 404 gracefully when navigating to nonexistent product slug', async ({ page }) => {
    const response = await page.goto('/products/this-product-does-not-exist');
    expect([200, 404]).toContain(response?.status());
    await expect(page.getByText(/Product Not Found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Products/i })).toBeVisible();
  });
});
