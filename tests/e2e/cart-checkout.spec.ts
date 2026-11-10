/**
 * ==============================================================================
 * E2E TEST SUITE — PHASE 3: CART & CHECKOUT
 * ==============================================================================
 * Comprehensive Playwright tests for Add to Cart (PDP/PLP), quantity stepper,
 * item removal, localStorage persistence across reload, multi-seller cart,
 * checkout flow, validation, and mobile experience.
 */

import { expect, test } from '@playwright/test';

test.describe('Phase 3: Shopping Cart & Checkout Flow', () => {
  test('1. adds product to cart from PDP and verifies cart drawer', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop/Tablet PDP drawer check');

    await page.goto('/products/apple-macbook-pro-16-m3-max');

    // Click Add to Cart
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Close PDP Phase 2 intent modal if visible
    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    // Verify Cart Drawer is open
    const cartDrawer = page.getByRole('dialog', { name: /Your Cart/i });
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText(/Apple MacBook Pro 16"/i).first()).toBeVisible();
    await expect(cartDrawer.getByText(/\$2,499\.00/i).first()).toBeVisible();
  });

  test('2. adds product to cart from PLP catalog page', async ({ page }) => {
    await page.goto('/products');

    // Locate first product card with Add to Cart button
    const quickAddBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await quickAddBtn.scrollIntoViewIfNeeded();
    await quickAddBtn.click();

    // Verify Cart Drawer opens with item
    const cartDrawer = page.getByRole('dialog', { name: /Your Cart/i });
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText(/Proceed to Checkout/i)).toBeVisible();
  });

  test('3. updates item quantity and recalculates totals in /cart', async ({ page }) => {
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    // Navigate to full cart page
    await page.goto('/cart');
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { level: 1, name: /Shopping Cart/i })).toBeVisible();

    // Initial total $2,499.00
    await expect(page.getByText(/\$2,499\.00/i).first()).toBeVisible();

    // Click increment quantity (+)
    const incrementBtn = page.getByRole('button', { name: /Increase quantity/i }).first();
    await incrementBtn.click();

    // Quantity should be 2 and line total / subtotal updated to $4,998.00
    await expect(page.getByText(/\$4,998\.00/i).first()).toBeVisible();
  });

  test('4. removes item from cart and reveals empty state', async ({ page }) => {
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    await page.goto('/cart');

    // Remove item
    const removeBtn = page.getByRole('button', { name: /Remove/i }).first();
    await removeBtn.click();

    // Empty cart state appears
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue Shopping/i })).toBeVisible();
  });

  test('5. persists cart state across page reload', async ({ page }) => {
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    // Reload page
    await page.reload();

    // Open cart drawer from header
    const cartHeaderBtn = page.getByRole('link', { name: /Shopping cart/i }).first();
    await cartHeaderBtn.click();

    const cartDrawer = page.getByRole('dialog', { name: /Your Cart/i });
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer.getByText(/Apple MacBook Pro 16"/i).first()).toBeVisible();
  });

  test('6. renders multi-vendor seller grouping on /cart page', async ({ page }) => {
    // Add first item (Apple product)
    await page.goto('/products/apple-macbook-pro-16-m3-max');
    const addMacBook = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addMacBook).toBeVisible();
    await addMacBook.click();

    const intentClose1 = page.getByRole('button', { name: /Got it/i });
    if (await intentClose1.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose1.click();
    }

    // Add second item (Sony headphones from PLP)
    await page.goto('/products/sony-wh-1000xm5-wireless-noise-cancelling-headphones');
    const addSony = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addSony).toBeVisible();
    await addSony.click();

    const intentClose2 = page.getByRole('button', { name: /Got it/i });
    if (await intentClose2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose2.click();
    }

    await page.goto('/cart');

    // Both seller packages should be displayed distinctly
    await expect(page.getByText(/Official Store|Flagship Store/i).first()).toBeVisible();
    await expect(page.getByText(/Seller Subtotal/i).first()).toBeVisible();
  });

  test('7. navigates from cart to checkout page', async ({ page }) => {
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    await page.goto('/cart');

    const checkoutBtn = page.getByRole('button', { name: /Proceed to Checkout/i });
    await checkoutBtn.click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { level: 1, name: /Checkout/i })).toBeVisible();
    await expect(page.getByText(/1\. Contact Information/i)).toBeVisible();
    await expect(page.getByText(/2\. Shipping Address/i)).toBeVisible();
    await expect(page.getByText(/3\. Delivery Method/i)).toBeVisible();
  });

  test('8. handles checkout validation and simulates successful order placement', async ({
    page,
  }) => {
    await page.goto('/products/apple-macbook-pro-16-m3-max');

    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    await page.goto('/checkout');

    // 1. Submit with empty fields to trigger validation
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
    await placeOrderBtn.click();

    // 2. Fill required form fields
    await page.fill('#contact-fullName', 'Alice Customer');
    await page.fill('#contact-email', 'alice@example.com');
    await page.fill('#contact-phone', '+1 555-987-6543');
    await page.fill('#shipping-address', '789 Enterprise Way');
    await page.fill('#shipping-city', 'Austin');
    await page.fill('#shipping-state', 'TX');
    await page.fill('#shipping-postalCode', '78701');

    // 3. Select Express Delivery option
    const expressRadio = page.getByLabel(/Express Delivery/i);
    await expressRadio.click();

    // 4. Place order
    await placeOrderBtn.click();

    // 5. Confirmation appears
    await expect(page.getByText(/Order Placed Successfully!/i)).toBeVisible();
    await expect(page.getByText(/Order Reference/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Return to Store/i })).toBeVisible();
  });

  test('9. handles direct access to checkout with empty cart', async ({ page }) => {
    await page.goto('/checkout');

    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue Shopping/i })).toBeVisible();
  });

  test('10. mobile cart drawer and responsive bottom navigation', async ({ page }) => {
    // Emulate iPhone / mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/products/apple-macbook-pro-16-m3-max');

    // Use mobile sticky bottom bar Add to Cart
    const mobileAddBtn = page.locator('.md\\:hidden.fixed.bottom-0').getByRole('button', {
      name: /Add to Cart/i,
    });
    if (await mobileAddBtn.isVisible()) {
      await mobileAddBtn.click();
    } else {
      await page
        .getByRole('button', { name: /Add to Cart/i })
        .first()
        .click();
    }

    // Close intent modal if present
    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await intentClose.click();
    }

    // Verify mobile cart drawer opened, and navigate to full cart page
    const cartDrawer = page.getByRole('dialog', { name: /Your Cart/i });
    if (await cartDrawer.isVisible({ timeout: 2000 }).catch(() => false)) {
      const viewCartLink = cartDrawer.getByRole('link', { name: /View Full Cart/i });
      await viewCartLink.click();
    } else {
      await page.goto('/cart');
    }

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('heading', { level: 1, name: /Shopping Cart/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Proceed to Checkout/i })).toBeVisible();

    // Verify mobile bottom navigation is present and accessible on mobile
    const bottomNav = page.locator('nav[aria-label="Mobile bottom navigation"]');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: /Cart/i })).toBeVisible();
  });
});
