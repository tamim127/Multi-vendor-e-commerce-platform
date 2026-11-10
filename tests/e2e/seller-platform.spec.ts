/**
 * ==============================================================================
 * E2E TEST SUITE — PHASE 5: SELLER PLATFORM & MULTI-VENDOR MANAGEMENT
 * ==============================================================================
 * Complete automated verification of multi-vendor seller workflows:
 * Onboarding, demo approval, dashboard KPIs, store branding, product offers,
 * inventory stock adjustments, package dispatch fulfillment, analytics, and public storefront.
 */

import { expect, test } from '@playwright/test';

test.describe('Phase 5: Seller Platform & Multi-Vendor Management Suite', () => {
  test('1. fresh merchant visits /seller/register, autofills and submits application', async ({
    page,
  }) => {
    await page.goto('/seller/register');

    // Verify Onboarding Title & Auto-fill action
    await expect(
      page.getByRole('heading', { level: 1, name: /Become a Marketplace Seller/i })
    ).toBeVisible();

    const autoFillBtn = page.getByRole('button', { name: /Auto-fill Demo Application/i });
    await expect(autoFillBtn).toBeVisible();
    await autoFillBtn.click();

    // Verify fields populated
    const storeNameInput = page.locator('#storeName');
    await expect(storeNameInput).toHaveValue('OmniTrade Direct');

    // Submit application form
    await page.locator('main form button[type="submit"]').click();

    // Verify pending card and instant demo approval button appear
    await expect(
      page.getByRole('button', { name: /Simulate Instant Demo Approval/i })
    ).toBeVisible();
  });

  test('2. simulates instant demo approval and unlocks /seller dashboard', async ({ page }) => {
    await page.goto('/seller/register');

    // If pending approval card is visible or submit fresh application
    const approveBtn = page.getByRole('button', { name: /Simulate Instant Demo Approval/i });
    if (!(await approveBtn.isVisible())) {
      await page.getByRole('button', { name: /Auto-fill Demo Application/i }).click();
      await page.locator('main form button[type="submit"]').click();
    }

    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Expect navigation to /seller
    await expect(page).toHaveURL(/\/seller/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Seller Central Dashboard/i })
    ).toBeVisible();

    // Verify Approved Merchant badge is visible in subheader
    await expect(page.getByText('Approved Merchant', { exact: true }).first()).toBeVisible();
  });

  test('3. seller dashboard renders revenue KPIs, sales trends, and recent packages', async ({
    page,
  }) => {
    await page.goto('/seller');

    // Verify Metric Counters
    await expect(page.getByText(/Total Revenue/i).first()).toBeVisible();
    await expect(page.getByText(/Total Orders/i).first()).toBeVisible();
    await expect(page.getByText(/Active Offers/i).first()).toBeVisible();
    await expect(page.getByText(/Low Stock Alerts/i).first()).toBeVisible();

    // Verify 7-day Sales Trends section
    await expect(page.getByText(/Sales & Revenue Trends/i)).toBeVisible();

    // Verify Quick Actions
    await expect(page.getByRole('link', { name: /Add Commercial Offer/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Adjust Inventory/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Dispatch Package/i })).toBeVisible();
  });

  test('4. store management updates store settings and displays success toast', async ({
    page,
  }) => {
    await page.goto('/seller/store');

    await expect(page.getByRole('heading', { level: 1, name: /Store Management/i })).toBeVisible();

    // Update Tagline
    const taglineInput = page.locator('#tagline');
    await taglineInput.fill('Certified Premier Distributor & Hardware Specialist');

    // Submit specifically using the form submit button
    const saveBtn = page.locator('main form button[type="submit"]');
    await saveBtn.click();

    // Verify success banner appears
    await expect(
      page.getByText(/Store settings have been updated and synchronized/i)
    ).toBeVisible();
  });

  test('5. public storefront at /store/tech-direct-express renders vendor profile, rating, and products', async ({
    page,
  }) => {
    await page.goto('/store/tech-direct-express');

    // Verify Storefront Hero & Header
    await expect(
      page.getByRole('heading', { level: 1, name: /TechDirect Express/i })
    ).toBeVisible();
    await expect(
      page.locator('main').getByText('Verified Merchant', { exact: true })
    ).toBeVisible();
    await expect(page.locator('main').getByText(/Contact Support/i)).toBeVisible();

    // Verify Tabs & Product Cards
    await expect(page.getByRole('button', { name: /Catalog Products/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Shipping & Policies/i })).toBeVisible();

    // Switch to Policies Tab
    await page.getByRole('button', { name: /Shipping & Policies/i }).click();
    await expect(page.locator('main').getByText(/Shipping & Dispatch SLA/i)).toBeVisible();
    await expect(
      page.locator('main').getByRole('heading', { name: /Returns & Refunds/i })
    ).toBeVisible();
  });

  test('6. product & offer management allows searching and editing commercial offer price', async ({
    page,
  }) => {
    await page.goto('/seller/products');

    await expect(
      page.getByRole('heading', { level: 1, name: /Products & Commercial Offers/i })
    ).toBeVisible();

    // Verify offers table
    await expect(page.getByText(/Product & SKU/i)).toBeVisible();

    // Click "Edit Offer" on the first listing
    const editBtn = page
      .locator('main table tbody tr')
      .first()
      .getByRole('button', { name: /Edit Offer/i });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal opens
    await expect(
      page.getByRole('heading', { level: 3, name: /Edit Commercial Offer/i })
    ).toBeVisible();

    // Update price
    const priceInput = page.locator('#priceMajor');
    await priceInput.fill('2299.00');

    // Submit modal form
    await page
      .locator('div[role="dialog"] form button[type="submit"], .fixed form button[type="submit"]')
      .click();

    // Modal closes
    await expect(
      page.getByRole('heading', { level: 3, name: /Edit Commercial Offer/i })
    ).not.toBeVisible();
  });

  test('7. inventory matrix filters stock alert levels and updates quantity available', async ({
    page,
  }) => {
    await page.goto('/seller/inventory');

    await expect(page.getByRole('heading', { level: 1, name: /Inventory Matrix/i })).toBeVisible();

    // Filter by Healthy SKUs
    await page.getByRole('button', { name: /Healthy/i }).click();

    // Click "Adjust Inventory" on first item
    const adjustBtn = page
      .locator('main table tbody tr')
      .first()
      .getByRole('button', { name: /Adjust Inventory/i });
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();

    // Adjustment Modal opens
    await expect(
      page.getByRole('heading', { level: 3, name: /Adjust Inventory Stock/i })
    ).toBeVisible();

    // Input new quantity
    const qtyInput = page.locator('#newQuantity');
    await qtyInput.fill('88');

    // Confirm adjustment
    await page
      .locator('div[role="dialog"] form button[type="submit"], .fixed form button[type="submit"]')
      .click();

    // Modal closes and table reflects 88
    await expect(
      page.getByRole('heading', { level: 3, name: /Adjust Inventory Stock/i })
    ).not.toBeVisible();
    await expect(page.getByText('88').first()).toBeVisible();
  });

  test('8. order fulfillment workflow dispatches pending package with carrier and tracking number', async ({
    page,
  }) => {
    await page.goto('/seller/orders');

    await expect(
      page.getByRole('heading', { level: 1, name: /Fulfillment & Order Packages/i })
    ).toBeVisible();

    // Filter to Pending
    await page.getByRole('button', { name: /Pending/i }).click();

    // Find first "Dispatch Package" button
    const dispatchBtn = page
      .locator('main table tbody tr')
      .first()
      .getByRole('button', { name: /Dispatch Package/i });
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();

      // Modal opens
      await expect(
        page.getByRole('heading', { level: 3, name: /Fulfill & Dispatch Package/i })
      ).toBeVisible();

      const trackingInput = page.locator('#trackingNumber');
      await trackingInput.fill('FDX-9988776655');

      // Submit shipment
      await page.locator('.fixed form button[type="submit"]').click();

      // Modal closes
      await expect(
        page.getByRole('heading', { level: 3, name: /Fulfill & Dispatch Package/i })
      ).not.toBeVisible();
    }
  });

  test('9. seller analytics renders revenue breakdown, volume chart, and top performing products', async ({
    page,
  }) => {
    await page.goto('/seller/analytics');

    await expect(
      page.getByRole('heading', { level: 1, name: /Performance & Analytics/i })
    ).toBeVisible();

    await expect(page.getByText(/Gross Marketplace Sales/i)).toBeVisible();
    await expect(page.getByText(/Average Order Value/i)).toBeVisible();
    await expect(page.getByText(/Top Performing Products/i)).toBeVisible();

    // Time range filter buttons
    await page.getByRole('button', { name: /Last 7 Days/i }).click();
    await expect(page.getByRole('button', { name: /Last 7 Days/i })).toHaveClass(/bg-primary/);
  });

  test('10. mobile viewport toggles seller navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/seller');

    // Menu button visible
    const menuBtn = page.getByRole('button', { name: /Toggle Seller Menu/i });
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();

    // Drawer opens with navigation items in mobile container
    const mobileLink = page.locator('div.md\\:hidden nav a[href="/seller/products"]');
    await expect(mobileLink).toBeVisible();

    // Close menu
    await menuBtn.click();
    await expect(mobileLink).not.toBeVisible();
  });
});
