import { expect, test } from '@playwright/test';

test.describe('Phase 8B: Live PostgreSQL End-to-End Persistence & Security', () => {
  test('1. health & PostgreSQL readiness endpoints return 200 when database is healthy', async ({
    request,
  }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.status()).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe('ok');

    const readyRes = await request.get('/api/ready');
    expect(readyRes.status()).toBe(200);
    const readyJson = await readyRes.json();
    expect(readyJson.ready).toBe(true);
    expect(typeof readyJson.latencyMs).toBe('number');
  });

  test('2. catalog API returns live PostgreSQL products and PDP renders DB details', async ({
    page,
    request,
  }) => {
    const catalogRes = await request.get('/api/catalog/products?limit=5');
    expect(catalogRes.status()).toBe(200);
    const catalogJson = await catalogRes.json();
    expect(catalogJson.success).toBe(true);
    expect(catalogJson.data.length).toBeGreaterThan(0);

    await page.goto('/products/apple-macbook-pro-16-m3-max');
    await expect(
      page.getByRole('heading', { name: /Apple MacBook Pro 16/i }).first()
    ).toBeVisible();
  });

  test('3. unauthenticated customer/seller/admin endpoints fail closed with 401/403', async ({
    request,
  }) => {
    const [ordersRes, sellerRes, adminRes] = await Promise.all([
      request.get('/api/orders'),
      request.get('/api/seller/orders'),
      request.get('/api/admin/metrics'),
    ]);

    expect(ordersRes.status()).toBe(401);
    expect(sellerRes.status()).toBe(401);
    expect(adminRes.status()).toBe(401);
  });

  test('4. guest cart persists, merges on customer registration, and reloads cleanly', async ({
    page,
  }) => {
    await page.context().clearCookies();

    // Add item as guest on PDP
    await page.goto('/products/apple-macbook-pro-16-m3-max');
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartBtn).toBeVisible();
    const guestCartSync = page.waitForResponse(
      (res) => res.url().includes('/api/cart') && res.request().method() === 'POST'
    );
    await addToCartBtn.click();
    await guestCartSync;

    const intentClose = page.getByRole('button', { name: /Got it/i });
    if (await intentClose.isVisible({ timeout: 1500 }).catch(() => false)) {
      await intentClose.click();
    }

    // Register a brand-new user in PostgreSQL
    await page.goto('/register');
    const uniqueEmail = `e2e.phase8b.${Date.now()}@example.com`;
    await page.locator('#reg-firstName').fill('Phase');
    await page.locator('#reg-lastName').fill('Tester');
    await page.locator('#reg-email').fill(uniqueEmail);
    await page.locator('#reg-password').fill('Valid@Password123');
    await page.locator('#reg-confirmPassword').fill('Valid@Password123');
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Sign Up/i }).click();

    await expect(page).toHaveURL(/\/account/);

    // Reload /cart and confirm DB-backed merged cart still holds the item
    await page.goto('/cart');
    await expect(page.getByText(/Apple MacBook Pro 16/i).first()).toBeVisible();

    // Also test /api/seller/orders & /api/admin/metrics deny ordinary customer (403)
    const sellerDenied = await page.request.get('/api/seller/orders');
    expect(sellerDenied.status()).toBe(403);
    const adminDenied = await page.request.get('/api/admin/metrics');
    expect(adminDenied.status()).toBe(403);

    // Complete checkout and verify PostgreSQL order persists in /account/orders
    await page.goto('/checkout');
    await page.fill('#contact-fullName', 'Phase Tester');
    await page.fill('#contact-email', uniqueEmail);
    await page.fill('#contact-phone', '+1 555-234-5678');
    await page.fill('#shipping-address', '100 Commerce Ave');
    await page.fill('#shipping-city', 'Austin');
    await page.fill('#shipping-state', 'TX');
    await page.fill('#shipping-postalCode', '78701');
    await page.getByRole('button', { name: /Place Order/i }).click();

    await expect(page.getByText(/Order Placed Successfully!/i)).toBeVisible({ timeout: 10000 });
    await page.goto('/account/orders');
    await expect(page.getByText(/Apple MacBook Pro 16|PENDING_PAYMENT|pending_payment/i).first()).toBeVisible({ timeout: 10000 });
  });
});
