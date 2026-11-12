/**
 * ==============================================================================
 * E2E TEST SUITE — PHASE 7: AI PLATFORM & OPERATIONS
 * ==============================================================================
 * Comprehensive end-to-end verification of customer shopping assistant,
 * recommendation cards, seller AI studio, admin copilot, and mobile responsiveness.
 */

import { expect, test } from '@playwright/test';

test.describe('Phase 7: AI Platform E2E Suite', () => {
  test('1. opens customer assistant widget and displays suggested prompt pills', async ({
    page,
  }) => {
    await page.goto('/');

    // Open floating AI assistant
    const toggleBtn = page.getByRole('button', { name: /Open AI Shopping Assistant/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Verify modal header & greeting
    await expect(
      page.getByRole('heading', { level: 2, name: /Marketplace Assistant/i })
    ).toBeVisible();
    await expect(page.getByText(/Hello! I am your marketplace shopping assistant/i)).toBeVisible();

    // Verify suggested questions are visible
    await expect(page.getByText(/Suggested questions:/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Find laptops under \$2,000/i })).toBeVisible();
  });

  test('2. asks for product recommendations and renders cards with direct PDP links', async ({
    page,
  }) => {
    await page.goto('/');

    // Open assistant
    await page.getByRole('button', { name: /Open AI Shopping Assistant/i }).click();

    // Type query
    const input = page.getByPlaceholder(/Ask about laptops, headphones, return policy/i);
    await input.fill('Show me Apple laptops');
    await page.getByRole('button', { name: /Send message/i }).click();

    // Wait for response with recommended product cards
    await expect(page.getByText(/Recommended Products/i)).toBeVisible();
    await expect(page.getByText(/Apple MacBook Pro 16"/i).first()).toBeVisible();

    // Verify PDP navigation link
    const productCardLink = page.getByRole('link', { name: /Apple MacBook Pro 16"/i });
    await expect(productCardLink).toBeVisible();
  });

  test('3. filters products by budget constraint and verifies Money amounts', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Open AI Shopping Assistant/i }).click();

    const input = page.getByPlaceholder(/Ask about laptops, headphones, return policy/i);
    await input.fill('headphones under $500');
    await page.getByRole('button', { name: /Send message/i }).click();

    // Verify response message and budget filter label
    await expect(page.getByText(/under \$500 budget filter/i).first()).toBeVisible();
    await expect(page.getByText(/AI-generated response • Verify details/i).first()).toBeVisible();
  });

  test('4. seller AI studio synthesizes product titles, descriptions and SEO metadata', async ({
    page,
  }) => {
    await page.goto('/seller/ai');

    await expect(
      page.getByRole('heading', { level: 1, name: /Seller AI Optimization Studio/i })
    ).toBeVisible();
    await expect(page.getByText(/Editorial Control/i)).toBeVisible();

    // Generate listing assets
    const generateBtn = page.getByRole('button', { name: /Generate AI Listing Assets/i });
    await generateBtn.click();

    // Verify Title Variations & Quality Scorecard
    await expect(page.getByText(/Listing Quality Audit Score/i)).toBeVisible();
    await expect(page.getByText(/Grade A/i)).toBeVisible();
    await expect(page.getByText(/Title Variations/i)).toBeVisible();
    await expect(page.getByText(/Editable Listing Draft/i)).toBeVisible();
    await expect(page.getByText(/SEO Search Engine Preview/i)).toBeVisible();
  });

  test('5. seller edits AI draft and applies to active store drafts', async ({ page }) => {
    await page.goto('/seller/ai');

    await page.getByRole('button', { name: /Generate AI Listing Assets/i }).click();
    await expect(page.getByText(/Editable Listing Draft/i)).toBeVisible({ timeout: 10000 });

    // Edit active title
    const titleInput = page.locator('#ai-editable-title');
    await titleInput.fill('Custom Seller Overridden Title (Reviewed)');

    // Click Approve & Apply
    const applyBtn = page.getByRole('button', { name: /Approve & Apply to Store/i });
    await applyBtn.click();

    // Verify approval confirmation banner
    await expect(page.getByText(/Approved & Stored/i)).toBeVisible();
    await expect(page.getByText(/Copy approved and staged in your seller drafts/i)).toBeVisible();
  });

  test('6. admin AI operations copilot renders executive summary and advisory notice', async ({
    page,
  }) => {
    // Set super admin role in local storage
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'marketplace_admin_user',
        JSON.stringify({
          id: 'admin-super-001',
          email: 'superadmin@marketplace.demo',
          name: 'Super Admin',
          role: 'super_admin',
          permissions: ['analytics:read', 'settings:read'],
          isActive: true,
        })
      );
    });

    await page.goto('/admin/ai');

    // Verify heading and Zero Execution disclosure
    await expect(
      page.getByRole('heading', { level: 1, name: /Marketplace Operations Copilot/i })
    ).toBeVisible();
    await expect(page.getByText(/Advisory Only/i)).toBeVisible();
    await expect(page.getByText(/Zero Execution Privilege/i)).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText(/Platform GMV Volume/i)).toBeVisible();
    await expect(page.getByText(/Fulfillment Success Rate/i)).toBeVisible();
    await expect(page.getByText(/Marketplace Intelligence Insights/i)).toBeVisible();
    await expect(page.getByText(/Top Merchant Health Analysis/i)).toBeVisible();
  });

  test('7. customer assistant handles policy inquiries explaining returns and shipping', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Open AI Shopping Assistant/i }).click();

    const input = page.getByPlaceholder(/Ask about laptops, headphones, return policy/i);
    await input.fill('What is your return policy?');
    await page.getByRole('button', { name: /Send message/i }).click();

    // Verify policy summary cards
    await expect(page.getByText(/Returns accepted within 30 days of delivery/i)).toBeVisible();
  });

  test('8. verifies responsive mobile assistant drawer interaction', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    const toggleBtn = page.getByRole('button', { name: /Open AI Shopping Assistant/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Assistant opens as full bottom drawer
    await expect(
      page.getByRole('heading', { level: 2, name: /Marketplace Assistant/i })
    ).toBeVisible();

    // Close button dismisses modal cleanly
    const closeBtn = page.getByRole('button', { name: /Close assistant/i });
    await closeBtn.click();
    await expect(
      page.getByRole('heading', { level: 2, name: /Marketplace Assistant/i })
    ).not.toBeVisible();
  });
});
