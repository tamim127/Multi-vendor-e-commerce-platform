/**
 * ==============================================================================
 * E2E TEST SUITE — PHASE 4: CUSTOMER ACCOUNT SYSTEM
 * ==============================================================================
 * End-to-end tests for authentication (login, registration, demo autofill),
 * protected route redirection, customer dashboard, profile updates,
 * address book CRUD, order history with tracking stepper, wishlist,
 * recently viewed product tracking, and account settings.
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function loginDemoCustomer(page: Page, targetPath: string): Promise<void> {
  await page.goto(`/login?redirect=${encodeURIComponent(targetPath)}`);
  await page.getByRole('button', { name: /Use Demo Credentials/i }).click();
  await page.locator('main form button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(targetPath.replace('/', '\\/')));
}

test.describe('Phase 4: Customer Account & Authentication Suite', () => {
  test('1. unauthenticated visit to /account redirects to /login with redirect query', async ({
    page,
  }) => {
    // Clear cookies to ensure unauthenticated state
    await page.context().clearCookies();
    await page.goto('/account');

    await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Sign in to your account/i })
    ).toBeVisible();
  });

  test('2. logs in using demo credentials autofill and loads customer dashboard', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/login?redirect=%2Faccount');

    // Click demo credentials fill button
    const demoBtn = page.getByRole('button', { name: /Use Demo Credentials/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Verify fields populated
    const emailInput = page.locator('#login-email');
    await expect(emailInput).toHaveValue('sarah.jenkins@example.com');

    // Submit form specifically inside main
    const submitBtn = page.locator('main form button[type="submit"]');
    await submitBtn.click();

    // Verify redirected to /account
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole('heading', { level: 2, name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText('sarah.jenkins@example.com').first()).toBeVisible();
  });

  test('3. validates registration constraints and registers new customer account', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto('/register');

    // Attempt submit with empty form
    const submitBtn = page.getByRole('button', { name: /Sign Up/i });
    await submitBtn.click();

    // Verify validation errors appear
    await expect(page.getByText(/First name is required/i)).toBeVisible();

    // Fill valid registration info
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    await page.locator('#reg-firstName').fill('Alexander');
    await page.locator('#reg-lastName').fill('Hamilton');
    await page.locator('#reg-email').fill(uniqueEmail);
    await page.locator('#reg-password').fill('Valid@Password123');
    await page.locator('#reg-confirmPassword').fill('Valid@Password123');

    // Agree to terms
    await page.locator('input[type="checkbox"]').check();

    // Submit
    await submitBtn.click();

    // Redirects to account dashboard
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole('heading', { level: 2, name: /Welcome back/i })).toBeVisible();
  });

  test('4. edits customer profile details and persists update', async ({ page }) => {
    await loginDemoCustomer(page, '/account/profile');

    const firstNameInput = page.locator('#profile-firstName');
    await expect(firstNameInput).toHaveValue('Sarah');

    // Update phone number
    const phoneInput = page.locator('#profile-phone');
    await phoneInput.fill('+1 512-555-9999');

    // Save changes
    const saveBtn = page.getByRole('button', { name: /Save Changes/i });
    await saveBtn.click();

    // Verify success banner
    await expect(page.getByText(/profile has been updated/i)).toBeVisible();
  });

  test('5. manages address book: views default addresses and adds a new address', async ({
    page,
  }) => {
    await loginDemoCustomer(page, '/account/addresses');

    await expect(page.getByText('742 Evergreen Terrace')).toBeVisible();

    // Open Add New Address modal
    const addBtn = page.getByRole('button', { name: /Add New Address/i });
    await addBtn.click();

    // Modal should be visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await modal.locator('#address-fullName').fill('Sarah Jenkins Home 2');
    await modal.locator('#address-street').fill('123 Innovation Boulevard');
    await modal.locator('#address-city').fill('Dallas');
    await modal.locator('#address-state').fill('TX');
    await modal.locator('#address-postal').fill('75001');
    await modal.locator('#address-country').fill('US');
    await modal.locator('#address-phone').fill('+1 512-555-8888');

    // Save address
    await modal.getByRole('button', { name: /Save Changes/i }).click();

    // Verify modal closes and new address appears in list
    await expect(page.getByText('123 Innovation Boulevard')).toBeVisible();
  });

  test('6. browses order history and navigates to order details with package tracking', async ({
    page,
  }) => {
    await loginDemoCustomer(page, '/account/orders');

    await expect(page.getByText('ORD-2026-981245')).toBeVisible();

    // Click View Order Details
    const detailsBtn = page.getByRole('button', { name: /View Order Details/i }).first();
    await detailsBtn.click();

    // Verify order detail view
    await expect(page).toHaveURL(/\/account\/orders\/ORD-2026-981245/);
    await expect(page.getByRole('heading', { level: 2, name: 'ORD-2026-981245' })).toBeVisible();
    await expect(page.getByText('Shipment Progress')).toBeVisible();
    await expect(page.getByText('FedEx Express').first()).toBeVisible();
  });

  test('7. toggles product wishlist from PLP and verifies persistence in /wishlist', async ({
    page,
  }) => {
    await page.goto('/products');

    // Locate first product card wishlist button
    const wishlistBtn = page.locator('button[aria-label*="wishlist" i]').first();
    await expect(wishlistBtn).toBeVisible();
    await wishlistBtn.click();

    // Navigate to wishlist page
    await page.goto('/wishlist');

    await expect(page.getByRole('heading', { level: 2, name: /My Wishlist/i })).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('8. tracks recently viewed products on PDP visits', async ({ page }) => {
    // Visit Product 1
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    // Then visit Product 2
    await page.goto('/products/sony-wh-1000xm5-wireless-noise-cancelling-headphones');

    // Verify Recently Viewed section is present and shows Product 1
    const rvHeading = page.getByRole('heading', { level: 2, name: /Recently Viewed/i });
    await expect(rvHeading).toBeVisible();
    await expect(page.getByText(/Apple MacBook Pro 16"/i).first()).toBeVisible();
  });

  test('9. updates notification settings in /account/settings', async ({ page }) => {
    await loginDemoCustomer(page, '/account/settings');

    await expect(page.getByRole('heading', { level: 2, name: /Account Settings/i })).toBeVisible();

    // Toggle a notification checkbox
    const emailUpdatesCheckbox = page.locator('input[name="orderUpdatesEmail"]');
    await emailUpdatesCheckbox.click();

    // Save
    const saveBtn = page.getByRole('button', { name: /Save/i }).first();
    await saveBtn.click();

    // Verify saved notification
    await expect(page.getByRole('status')).toBeVisible();
  });

  test('10. verifies mobile bottom navigation tabs for Wishlist and Account', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Mobile-only bottom navigation bar check');

    await page.goto('/');

    const bottomNav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(bottomNav).toBeVisible();

    // Verify Wishlist and Account links exist in mobile bottom nav
    const wishlistTab = bottomNav.getByRole('link', { name: /Wishlist/i });
    const accountTab = bottomNav.getByRole('link', { name: /Account/i });

    await expect(wishlistTab).toBeVisible();
    await expect(accountTab).toBeVisible();
  });
});
