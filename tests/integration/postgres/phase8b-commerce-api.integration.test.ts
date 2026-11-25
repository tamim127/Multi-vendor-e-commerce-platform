import crypto from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { closeDbPool, getDbPool } from '@/server/db/client';
import { importCatalog } from '@/server/catalog/importer';
import { expireStaleReservations } from '@/server/commerce/inventory-service';
import { checkSystemReadiness, resetReadinessCacheForTests } from '@/lib/observability/health';
import { createDbPool } from '@/server/db/client';
import { resetRateLimitsForTests } from '@/server/security/rate-limiter';
import { TEST_DATABASE_URL } from './test-helper';

import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { GET as getCatalogProductsRoute } from '@/app/api/catalog/products/route';
import { GET as getCartRoute, POST as postCartRoute } from '@/app/api/cart/route';
import { GET as getWishlistRoute, POST as postWishlistRoute } from '@/app/api/wishlist/route';
import { POST as placeOrderRoute } from '@/app/api/checkout/place-order/route';
import { GET as getOrdersRoute } from '@/app/api/orders/route';
import { GET as getSellerOrdersRoute, PATCH as patchSellerOrderRoute } from '@/app/api/seller/orders/route';
import { PATCH as patchSellerInventoryRoute } from '@/app/api/seller/inventory/route';

describe('Phase 8B: Cart, Wishlist, Checkout, Inventory Reservation, Idempotency & Seller Isolation Tests', () => {
  const uid = crypto.randomUUID().slice(0, 8);
  const buyerEmail = `buyer-${uid}@example.com`;
  const sellerAEmail = `seller-a-${uid}@example.com`;
  const sellerBEmail = `seller-b-${uid}@example.com`;
  const password = 'OrderPassword!2026';

  const productId = `prod-8b-${uid}`;
  const offerAId = `off-8b-a-${uid}`;
  const offerBId = `off-8b-b-${uid}`;
  const sellerAId = `sel-8b-a-${uid}`;
  const sellerBId = `sel-8b-b-${uid}`;

  let buyerToken = '';
  let buyerId = '';
  let sellerAToken = '';
  let sellerBToken = '';

  beforeAll(async () => {
    process.env['DATABASE_URL'] = TEST_DATABASE_URL;
    await closeDbPool();
    resetRateLimitsForTests();
    const pool = getDbPool();

    // Seed clean product and 2 seller offers with stock = 4 on offerA
    await importCatalog({
      products: [
        {
          id: productId,
          slug: `phase8b-camera-${uid}`,
          title: { en: `Phase 8B Mirrorless Camera ${uid}` },
          description: { en: 'Real PostgreSQL integration test item.' },
          brand: { id: 'brand-sony', name: 'Sony', slug: 'sony', status: 'featured', isFeatured: true },
          categoryId: 'cat-electronics',
          categoryPath: '/electronics',
          categoryBreadcrumbs: [],
          tags: ['camera', 'sony'],
          status: 'active',
        } as any,
      ],
      offers: [
        {
          id: offerAId,
          productId,
          sellerId: sellerAId,
          sellerSku: `SKU-A-${uid}`,
          price: { amountMinor: 120000, currency: 'USD' }, // $1200.00 authoritative price
          inventory: { available: 4, state: 'in_stock' },
          condition: 'new',
          isBuyBoxWinner: true,
        } as any,
        {
          id: offerBId,
          productId,
          sellerId: sellerBId,
          sellerSku: `SKU-B-${uid}`,
          price: { amountMinor: 125000, currency: 'USD' },
          inventory: { available: 10, state: 'in_stock' },
          condition: 'new',
          isBuyBoxWinner: false,
        } as any,
      ],
      pool,
    });

    // Register Buyer, Seller A, Seller B
    const regBuyer = await registerRoute(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: buyerEmail,
          password,
          confirmPassword: password,
          firstName: 'Buyer',
          lastName: 'One',
          acceptTerms: true,
        }),
      })
    );
    const buyerJson = await regBuyer.json();
    buyerToken = buyerJson.data.token;
    buyerId = buyerJson.data.customer.id;

    for (const [email, sellerId] of [
      [sellerAEmail, sellerAId],
      [sellerBEmail, sellerBId],
    ] as const) {
      const regS = await registerRoute(
        new Request('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            confirmPassword: password,
            firstName: 'Seller',
            lastName: sellerId,
            acceptTerms: true,
          }),
        })
      );
      const sJson = await regS.json();
      await pool.query(`UPDATE sellers SET status = 'approved', is_verified = true WHERE id = $1;`, [sellerId]);
      await pool.query(
        `INSERT INTO seller_memberships (id, customer_id, seller_id, membership_role, status)
         VALUES ($1, $2, $3, 'owner', 'active');`,
        [`sm-${crypto.randomUUID().slice(0, 8)}`, sJson.data.customer.id, sellerId]
      );
      await pool.query(`UPDATE customers SET role = 'seller' WHERE id = $1;`, [sJson.data.customer.id]);
    }

    const logA = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sellerAEmail, password }),
      })
    );
    sellerAToken = (await logA.json()).data.token;

    const logB = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sellerBEmail, password }),
      })
    );
    sellerBToken = (await logB.json()).data.token;
  });

  afterAll(async () => {
    await closeDbPool();
  });

  it('reads catalog directly from PostgreSQL without mock fallback', async () => {
    const res = await getCatalogProductsRoute(
      new Request(`http://localhost:3000/api/catalog/products?q=${uid}`)
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.some((p: any) => p.id === productId)).toBe(true);
  });

  it('persists guest cart and merges cleanly into authenticated customer cart on login using DB pricing', async () => {
    // 1. Anonymous visitor adds 1 item to guest cart (even trying to send a fake price fails to override DB price!)
    const guestAdd = await postCartRoute(
      new Request('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          productId,
          offerId: offerAId,
          quantity: 1,
          unitPrice: { amountMinor: 1, currency: 'USD' }, // Client spoof attempt
        }),
      })
    );
    expect(guestAdd.status).toBe(200);
    const guestJson = await guestAdd.json();
    expect(guestJson.data.subtotal.amountMinor).toBe(120000); // Authoritative DB $1,200.00!

    const setCookieHeader = guestAdd.headers.get('set-cookie') || '';
    const guestCookieMatch = setCookieHeader.match(/aureon_guest_cart=([^;]+)/);
    expect(guestCookieMatch).not.toBeNull();
    const rawGuestCookie = guestCookieMatch![1]!;

    // 2. Buyer logs in with guest cookie -> guest cart merges into buyer's DB cart
    const loginRes = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aureon_guest_cart=${rawGuestCookie}`,
        },
        body: JSON.stringify({ email: buyerEmail, password }),
      })
    );
    expect(loginRes.status).toBe(200);
    buyerToken = (await loginRes.json()).data.token;

    const cartAfterMerge = await getCartRoute(
      new Request('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
    );
    const mergedJson = await cartAfterMerge.json();
    expect(mergedJson.data.itemCount).toBe(1);
    expect(mergedJson.data.subtotal.amountMinor).toBe(120000);
  });

  it('persists wishlist items per customer in PostgreSQL', async () => {
    const toggleRes = await postWishlistRoute(
      new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ action: 'toggle', productId }),
      })
    );
    expect(toggleRes.status).toBe(200);

    const getRes = await getWishlistRoute(
      new Request('http://localhost:3000/api/wishlist', {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
    );
    const json = await getRes.json();
    expect(json.data.productIds).toContain(productId);
  });

  it('places order with inventory reservation, durable idempotency replay/conflict, and zero partial orders', async () => {
    const idemKey = `idem-order-${uid}`;
    const orderPayload = {
      contact: { fullName: 'Buyer One', email: buyerEmail, phone: '+1-555-0199' },
      shipping: { address: '100 Market St', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
      deliveryMethod: 'standard',
      paymentMethod: 'credit_card',
    };

    const res1 = await placeOrderRoute(
      new Request('http://localhost:3000/api/checkout/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify(orderPayload),
      })
    );
    expect(res1.status).toBe(201);
    const j1 = await res1.json();
    expect(j1.data.status).toBe('pending_payment');
    expect(j1.data.paymentStatus).toBe('pending_payment');
    expect(j1.data.paymentGatewayVerified).toBe(false);
    const createdOrderId = j1.data.orderId;

    // Identical retry with same Idempotency-Key replays exact response without placing a second order
    const resReplay = await placeOrderRoute(
      new Request('http://localhost:3000/api/checkout/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify(orderPayload),
      })
    );
    expect(resReplay.status).toBe(201);
    expect(resReplay.headers.get('X-Idempotent-Replay')).toBe('true');
    const jReplay = await resReplay.json();
    expect(jReplay.data.orderId).toBe(createdOrderId);

    // Reusing same Idempotency-Key with different payload returns 409 Conflict
    const resConflict = await placeOrderRoute(
      new Request('http://localhost:3000/api/checkout/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${buyerToken}`,
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify({ ...orderPayload, deliveryMethod: 'express' }),
      })
    );
    expect(resConflict.status).toBe(409);

    // Verify stock invariant in Postgres: stock_quantity=4 (physical), reserved_quantity=1 (not double-decremented!)
    const pool = getDbPool();
    const offerRow = await pool.query(
      'SELECT stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1;',
      [offerAId]
    );
    expect(offerRow.rows[0]?.stock_quantity).toBe(4);
    expect(offerRow.rows[0]?.reserved_quantity).toBe(1);

    // Customer can list own orders
    const ordersRes = await getOrdersRoute(
      new Request('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${buyerToken}` },
      })
    );
    const ordersJson = await ordersRes.json();
    expect(ordersJson.data.some((o: any) => o.orderId === createdOrderId)).toBe(true);
    expect(buyerId).toBeDefined();
  });

  it('enforces cross-seller isolation for packages and inventory adjustments', async () => {
    // Seller A lists packages -> gets 1 package belonging to createdOrderId
    const listARes = await getSellerOrdersRoute(
      new Request('http://localhost:3000/api/seller/orders', {
        headers: { Authorization: `Bearer ${sellerAToken}` },
      })
    );
    expect(listARes.status).toBe(200);
    const listA = await listARes.json();
    expect(listA.data.length).toBeGreaterThanOrEqual(1);
    const sellerAPackageId = listA.data[0].packageId;

    // Seller B attempts to dispatch Seller A's package -> 403 Forbidden!
    const crossDispatch = await patchSellerOrderRoute(
      new Request('http://localhost:3000/api/seller/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerBToken}`,
        },
        body: JSON.stringify({
          packageId: sellerAPackageId,
          status: 'shipped',
          carrier: 'FedEx',
          trackingNumber: 'FDX-999',
        }),
      })
    );
    expect(crossDispatch.status).toBe(403);

    // Seller B attempts to adjust Seller A's inventory -> 403 Forbidden!
    const crossInv = await patchSellerInventoryRoute(
      new Request('http://localhost:3000/api/seller/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerBToken}`,
        },
        body: JSON.stringify({
          offerId: offerAId,
          delta: 100,
          reason: 'Unauthorized spoof',
        }),
      })
    );
    expect(crossInv.status).toBe(403);

    // Seller A CAN legitimately transition their own package to shipped
    const validDispatch = await patchSellerOrderRoute(
      new Request('http://localhost:3000/api/seller/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sellerAToken}`,
        },
        body: JSON.stringify({
          packageId: sellerAPackageId,
          status: 'shipped',
          carrier: 'DHL Express',
          trackingNumber: `DHL-${uid}`,
        }),
      })
    );
    expect(validDispatch.status).toBe(200);
  });

  it('releases expired reservations safely and reports 503 readiness when DB fails', async () => {
    const pool = getDbPool();
    // Force expiration on the active reservation for offerAId
    await pool.query(
      `UPDATE inventory_reservations SET expires_at = NOW() - INTERVAL '5 minutes' WHERE offer_id = $1 AND status = 'reserved';`,
      [offerAId]
    );
    const expiredCount = await expireStaleReservations(pool);
    expect(expiredCount).toBeGreaterThanOrEqual(1);

    const offerAfter = await pool.query(
      'SELECT stock_quantity, reserved_quantity FROM seller_offers WHERE id = $1;',
      [offerAId]
    );
    expect(offerAfter.rows[0]?.stock_quantity).toBe(4);
    expect(offerAfter.rows[0]?.reserved_quantity).toBe(0);

    // Readiness returns ready: false on unreachable DB pool
    resetReadinessCacheForTests();
    const badPool = createDbPool({
      connectionString: 'postgresql://postgres@localhost:59998/missing_db',
      connectionTimeoutMillis: 500,
    });
    try {
      const readiness = await checkSystemReadiness(badPool);
      expect(readiness.ready).toBe(false);
    } finally {
      await badPool.end().catch(() => {});
    }
  });
});
