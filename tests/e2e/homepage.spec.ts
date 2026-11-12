import { test, expect } from '@playwright/test';

test.describe('Marketplace Customer Homepage E2E', () => {
  test('renders complete marketplace homepage layout and verified sections', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify AppShell Header Components
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('header input[type="search"]').first()).toBeVisible();

    // 2. Verify Promotional Hero Section
    const heroCarousel = page.locator('section[aria-label="Promotional Carousel"]');
    await expect(heroCarousel).toBeVisible();
    await expect(heroCarousel.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(heroCarousel.getByText('Verified Marketplace Guarantee')).toBeVisible();

    // Verify Value Proposition Trust Ribbon
    await expect(page.getByText('Free Express Shipping')).toBeVisible();
    await expect(page.getByText('100% Authentic Guarantee')).toBeVisible();
    await expect(page.getByText('30-Day Hassle-Free Returns')).toBeVisible();
    await expect(page.getByText('24/7 Verified Support')).toBeVisible();

    // 3. Verify Featured Categories Section
    await expect(page.getByRole('heading', { name: 'Browse by Category' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Computers & Laptops/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Audio & Headphones/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Curved Displays/i }).first()).toBeVisible();

    // 4. Verify Flash Deals & Daily Steals
    await expect(page.getByRole('heading', { name: /Flash Deals & Daily Steals/i })).toBeVisible();
    await expect(page.getByText(/Ends In:/i)).toBeVisible();

    // 5. Verify Trending Marketplace Selections
    await expect(page.getByRole('heading', { name: /Trending Marketplace Selections/i })).toBeVisible();
    const productCards = page.locator('article');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // 6. Verify Featured Brand Stores & Merchants
    await expect(page.getByRole('heading', { name: /Featured Brand Stores & Merchants/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Official Flagship Store' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'TechDirect Express' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'GlobalWare Imports' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Apex Outlet Deals' })).toBeVisible();

    // Verify Storefront link
    const storefrontLink = page.getByRole('link', { name: /Visit Storefront/i }).first();
    await expect(storefrontLink).toBeVisible();
    await expect(storefrontLink).toHaveAttribute('href', /^\/store\//);

    // 7. Verify AI-Curated Recommendations & Platform Trust
    await expect(page.getByText(/AI-Curated Recommendations For You/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Why Millions Trust Our Global Multi-Vendor Platform/i })).toBeVisible();

    // 8. Verify Global Footer
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByText(/All rights reserved/i)).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({ path: 'test-results/homepage-desktop.png', fullPage: true });

    // Assert zero console/page errors
    expect(pageErrors).toEqual([]);
    expect(consoleErrors.filter((e) => !e.includes('favicon') && !e.includes('React DevTools'))).toEqual([]);
  });

  test('interacts with hero slide controls and category links', async ({ page }) => {
    await page.goto('/');

    const heroCarousel = page.locator('section[aria-label="Promotional Carousel"]');
    const nextBtn = heroCarousel.getByRole('button', { name: 'Next slide' });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Category click navigates to PLP
    const audioCategoryLink = page.getByRole('link', { name: /Audio & Headphones/i }).first();
    await expect(audioCategoryLink).toHaveAttribute('href', '/products?category=audio-headphones');
  });

  test('renders cleanly on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Hero title is visible
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Mobile bottom navigation is visible
    const bottomNav = page.locator('nav[aria-label="Mobile bottom navigation"]');
    await expect(bottomNav).toBeVisible();

    // Verify products render in vertical stack
    const productArticles = page.locator('article');
    await expect(productArticles.first()).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({ path: 'test-results/homepage-mobile.png', fullPage: true });
  });
});
