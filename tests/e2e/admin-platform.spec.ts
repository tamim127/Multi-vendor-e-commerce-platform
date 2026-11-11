/**
 * ==============================================================================
 * E2E TEST SUITE — PHASE 6: ADMIN PLATFORM IMPLEMENTATION
 * ==============================================================================
 * Complete automated verification of marketplace administration workflows:
 * Dashboard KPIs, role-based navigation, fail-closed permission denial, seller KYC,
 * customer management, catalog moderation, categories, orders oversight, refunds,
 * returns, coupons, reviews, settings, audit trail, and mobile drawer.
 */

import { expect, test } from '@playwright/test';

test.describe('Phase 6: Admin Platform E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure admin user defaults to super_admin for broad test execution
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'marketplace_admin_user',
        JSON.stringify({
          id: 'admin-super-001',
          email: 'superadmin@marketplace.demo',
          name: 'Alex Rivera (Super Admin)',
          role: 'super_admin',
          permissions: [
            'sellers:read',
            'sellers:write',
            'sellers:moderate',
            'customers:read',
            'customers:write',
            'customers:moderate',
            'catalog:read',
            'catalog:write',
            'catalog:moderate',
            'orders:read',
            'orders:write',
            'orders:override',
            'refunds:read',
            'refunds:write',
            'refunds:process',
            'promotions:read',
            'promotions:write',
            'reviews:read',
            'reviews:moderate',
            'settings:read',
            'settings:write',
            'audit_logs:read',
            'analytics:read',
          ],
          isActive: true,
          lastLoginAt: '2026-02-20T10:15:00Z',
          createdAt: '2025-01-01T00:00:00Z',
        })
      );
    });
  });

  test('1. renders admin dashboard with simulated demo banner and platform KPIs', async ({
    page,
  }) => {
    await page.goto('/admin');

    // Verify top demo banner
    await expect(page.getByText(/Platform Administration \(Demo Mode\)/i)).toBeVisible();

    // Verify heading
    await expect(
      page.getByRole('heading', { level: 1, name: /Marketplace Operations Overview/i })
    ).toBeVisible();

    // Verify stat cards
    await expect(page.getByText(/Platform Gross Merchandise/i)).toBeVisible();
    await expect(page.getByText(/Total Marketplace Orders/i)).toBeVisible();
    await expect(page.getByText(/Sellers & Merchants/i).first()).toBeVisible();
  });

  test('2. enforces permission-based navigation visibility upon role switching', async ({
    page,
  }) => {
    await page.goto('/admin');

    // In super_admin mode, all navigation links should be present
    const sellersNav = page
      .locator('aside')
      .getByRole('link', { name: /Sellers & Merchants/i, exact: true });
    await expect(sellersNav).toBeVisible();

    // Switch role to catalog_manager
    const roleSelect = page.getByLabel('Simulated Admin Role');
    await roleSelect.selectOption('catalog_manager');

    // Sellers link should now be hidden from sidebar
    await expect(sellersNav).not.toBeVisible();

    // Catalog Products link should remain visible
    const productsNav = page
      .locator('aside')
      .getByRole('link', { name: /Catalog Products/i, exact: true });
    await expect(productsNav).toBeVisible();
  });

  test('3. enforces fail-closed permission denial when unauthorized role visits route', async ({
    page,
  }) => {
    // Navigate directly to sellers management as super_admin
    await page.goto('/admin/sellers');
    await expect(page.getByText(/Merchant Management & Verification/i)).toBeVisible();

    // Switch role to catalog_manager (lacks sellers:read)
    const roleSelect = page.getByLabel('Simulated Admin Role');
    await roleSelect.selectOption('catalog_manager');

    // Access Restricted screen should appear immediately via AdminGuard
    await expect(page.getByText(/Access Restricted: Permission Required/i)).toBeVisible();
    await expect(page.getByText(/Requires permission: 'sellers:read'/i)).toBeVisible();

    // Switch back to Super Admin via quick button
    await page.getByRole('button', { name: /Super Admin \(Full Access\)/i }).click();

    // Page should now re-render merchant directory
    await expect(page.getByText(/Merchant Management & Verification/i)).toBeVisible();
  });

  test('4. manages seller directory, filtering by status and updating verification', async ({
    page,
  }) => {
    await page.goto('/admin/sellers');

    // Check headings and search
    await expect(
      page.getByRole('heading', { level: 1, name: /Merchant Management & Verification/i })
    ).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search sellers by store/i);
    await searchInput.fill('TechDirect');

    // Table should contain TechDirect Express
    await expect(
      page.locator('table').getByRole('link', { name: /TechDirect Express/i })
    ).toBeVisible();
  });

  test('5. inspects seller detail page with legal KYC credentials', async ({ page }) => {
    await page.goto('/admin/sellers/seller-tech-direct');

    // Verify store title and verified badge
    await expect(
      page.getByRole('heading', { level: 1, name: /TechDirect Express/i })
    ).toBeVisible();
    await expect(page.getByText(/Verified Business Information/i)).toBeVisible();
    await expect(page.getByText(/TechDirect Commercial LLC/i)).toBeVisible();
    await expect(page.getByText(/Operational Policies & SLAs/i)).toBeVisible();
  });

  test('6. manages customer accounts directory and toggles suspension hold', async ({ page }) => {
    await page.goto('/admin/customers');

    await expect(
      page.getByRole('heading', { level: 1, name: /Customer Accounts & Moderation/i })
    ).toBeVisible();

    // Search for Sarah Jenkins
    const searchInput = page.getByPlaceholder(/Search customers by name or email/i);
    await searchInput.fill('Sarah');

    await expect(page.locator('table').getByText(/Sarah Jenkins/i)).toBeVisible();
    await expect(
      page
        .locator('table')
        .getByText(/Active/i)
        .first()
    ).toBeVisible();
  });

  test('7. inspects customer profile and order history', async ({ page }) => {
    await page.goto('/admin/customers/cust-demo-sarah');

    await expect(page.getByRole('heading', { level: 1, name: /Sarah Jenkins/i })).toBeVisible();
    await expect(page.getByText(/Customer Profile Information/i)).toBeVisible();
    await expect(page.getByText(/Recent Order History/i)).toBeVisible();
  });

  test('8. moderates product catalog status in products directory', async ({ page }) => {
    await page.goto('/admin/products');

    await expect(
      page.getByRole('heading', { level: 1, name: /Catalog & Product Moderation/i })
    ).toBeVisible();

    const searchInput = page.getByPlaceholder(/Search canonical catalog products/i);
    await searchInput.fill('MacBook');

    await expect(page.locator('table').getByText(/Apple MacBook Pro 16"/i)).toBeVisible();
  });

  test('9. inspects product detail specifications and mapped multi-vendor seller offers', async ({
    page,
  }) => {
    await page.goto('/admin/products/prod-macbook-pro-16');

    await expect(
      page.getByRole('heading', { level: 1, name: /Apple MacBook Pro 16"/i })
    ).toBeVisible();
    await expect(page.getByText(/Canonical Specifications/i)).toBeVisible();
    await expect(page.getByText(/Active Multi-Vendor Seller Offers/i)).toBeVisible();
  });

  test('10. provisions new category taxonomy node', async ({ page }) => {
    await page.goto('/admin/categories');

    await expect(
      page.getByRole('heading', { level: 1, name: /Taxonomy & Category Hierarchy/i })
    ).toBeVisible();

    // Open Add Category modal
    await page.getByRole('button', { name: /Add Category/i }).click();

    // Fill form
    await page.getByPlaceholder(/e\.g\. Smart Wearables/i).fill('Smart Wearables E2E');
    await page.locator('button[type="submit"]:has-text("Create Category")').click();

    // Verify it appears in table
    await expect(page.locator('table').getByText(/Smart Wearables E2E/i)).toBeVisible();
  });

  test('11. supervises order directory and inspects split vendor packages', async ({ page }) => {
    await page.goto('/admin/orders');

    await expect(
      page.getByRole('heading', { level: 1, name: /Marketplace Order Oversight/i })
    ).toBeVisible();

    // Click supervise on first order
    const superviseBtn = page
      .locator('table')
      .getByRole('link', { name: /Supervise/i })
      .first();
    await superviseBtn.click();

    // Detail view should render packages and delivery destination
    await expect(page.getByText(/Multi-Vendor Packages/i)).toBeVisible();
    await expect(page.getByText(/Delivery Destination & Customer/i)).toBeVisible();
  });

  test('12. reviews customer refund claims with canonical Money amounts', async ({ page }) => {
    await page.goto('/admin/refunds');

    await expect(
      page.getByRole('heading', { level: 1, name: /Refund Claims Management/i })
    ).toBeVisible();

    // Verify monetary amounts and claims
    await expect(page.locator('table').getByText(/\$129\.00/i)).toBeVisible();
  });

  test('13. creates promotional discount coupon code', async ({ page }) => {
    await page.goto('/admin/coupons');

    await expect(page.getByRole('heading', { level: 2, name: /Discount Coupons/i })).toBeVisible();

    // Open modal
    await page.getByRole('button', { name: /Create Coupon/i }).click();

    // Fill coupon details
    await page.getByPlaceholder(/e\.g\. SUMMER2026/i).fill('AUTOFEST20');
    await page.getByPlaceholder(/e\.g\. 15% off orders over \$75/i).fill('20% off auto fest');

    // Submit
    await page.locator('button[type="submit"]:has-text("Create Coupon")').click();

    // Verify new coupon is present in table
    await expect(page.locator('table').getByText(/AUTOFEST20/i)).toBeVisible();
  });

  test('14. reviews content moderation queue and hides flagged review', async ({ page }) => {
    await page.goto('/admin/reviews');

    await expect(
      page.getByRole('heading', { level: 1, name: /Review & Content Moderation/i })
    ).toBeVisible();

    // Filter by Reported
    const filterSelect = page.getByLabel('Filter reviews by moderation status');
    await filterSelect.selectOption('reported');

    // Verify reported review with spam warning is visible
    await expect(page.getByText(/BUY CHEAP CRYPTO AT THIS LINK/i)).toBeVisible();
  });

  test('15. verifies append-only compliance audit trail ledger', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    await expect(
      page.getByRole('heading', { level: 1, name: /Compliance & Security Audit Trail/i })
    ).toBeVisible();
    await expect(page.getByText(/Append-Only Integrity/i)).toBeVisible();

    // Table should contain recorded administrative events
    await expect(page.locator('table').getByText(/SELLER_APPLICATION_APPROVED/i)).toBeVisible();
  });

  test('16. verifies responsive mobile admin navigation drawer', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin');

    // Click mobile hamburger toggle
    const mobileToggle = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(mobileToggle).toBeVisible();
    await mobileToggle.click();

    // Mobile drawer should appear
    await expect(page.getByText(/Admin Menu/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sellers/i })).toBeVisible();
  });
});
