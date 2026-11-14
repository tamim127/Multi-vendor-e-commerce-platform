import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type pg from 'pg';
import { getTestPool } from './test-helper';
import { placeMultiVendorOrder, InsufficientStockError } from '@/server/commerce/order-service';
import { importCatalog } from '@/server/catalog/importer';

describe('Order Placement & Concurrency PostgreSQL Integration Tests', () => {
  let pool: pg.Pool;

  const testProduct: any = {
    id: 'prod-order-test-100',
    slug: 'sony-wh1000xm5-order-test',
    title: { en: 'Sony WH-1000XM5 Noise Canceling Headphones' },
    description: { en: 'Industry leading noise cancellation headphones.' },
    brand: { id: 'brand-sony', name: 'Sony', slug: 'sony', status: 'featured', isFeatured: true },
    categoryId: 'cat-headphones',
    categoryPath: '/electronics/audio/headphones',
    categoryBreadcrumbs: [],
    primaryMedia: { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', type: 'image' },
    tags: ['sony', 'audio', 'headphones'],
    status: 'active',
  };

  const testOffer: any = {
    id: 'off-order-test-100',
    productId: 'prod-order-test-100',
    sellerId: 'seller-apex-tech',
    sellerSku: 'SKU-SONY-TEST-100',
    price: { amountMinor: 39900, currency: 'USD' },
    inventory: { available: 5, state: 'in_stock' }, // Initial stock = 5
    condition: 'new',
    fulfillment: { method: 'marketplace_fulfilled' },
    isBuyBoxWinner: true,
    shipping: { freeShipping: true, shippingFeeMinor: 0, estimatedDaysMin: 2, estimatedDaysMax: 4 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeAll(async () => {
    pool = getTestPool();
    // Seed prerequisite product and offer
    await importCatalog({
      products: [testProduct],
      offers: [testOffer],
      pool,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('places a multi-vendor order atomically with inventory deduction and audit logging', async () => {
    const result = await placeMultiVendorOrder(
      {
        customerId: 'cust-test-user-001',
        paymentMethod: 'credit_card',
        currency: 'USD',
        shippingAddress: {
          name: 'Jane Doe',
          street: '123 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'US',
        },
        items: [
          {
            offerId: testOffer.id,
            productId: testProduct.id,
            sellerId: testOffer.sellerId,
            quantity: 2,
          },
        ],
      },
      pool
    );

    expect(result.orderId).toBeDefined();
    expect(result.grandTotalMinor).toBe(39900 * 2);
    expect(result.packageCount).toBe(1);
    expect(result.itemCount).toBe(2);

    // Verify stock was reduced from 5 to 3
    const offerRes = await pool.query('SELECT stock_quantity FROM seller_offers WHERE id = $1', [testOffer.id]);
    expect(offerRes.rows[0]?.stock_quantity).toBe(3);

    // Verify order was inserted
    const orderRes = await pool.query('SELECT id, grand_total_minor, status FROM orders WHERE id = $1', [result.orderId]);
    expect(orderRes.rows.length).toBe(1);
    expect(orderRes.rows[0]?.status).toBe('confirmed');

    // Verify seller package was inserted
    const pkgRes = await pool.query('SELECT * FROM seller_packages WHERE order_id = $1', [result.orderId]);
    expect(pkgRes.rows.length).toBe(1);

    // Verify order item was inserted
    const itemRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [result.orderId]);
    expect(itemRes.rows.length).toBe(1);
    expect(itemRes.rows[0]?.quantity).toBe(2);

    // Verify audit log was created
    const auditRes = await pool.query(
      `SELECT * FROM audit_logs WHERE target_id = $1 AND action = 'ORDER_PLACED'`,
      [result.orderId]
    );
    expect(auditRes.rows.length).toBe(1);
  });

  it('atomically rolls back the entire transaction when inventory is insufficient', async () => {
    // Current stock is 3. Attempting to purchase 10 must fail.
    await expect(
      placeMultiVendorOrder(
        {
          customerId: 'cust-test-user-002',
          paymentMethod: 'credit_card',
          shippingAddress: {
            name: 'Bob Smith',
            street: '456 Tech Ave',
            city: 'Austin',
            state: 'TX',
            postalCode: '78701',
            country: 'US',
          },
          items: [
            {
              offerId: testOffer.id,
              productId: testProduct.id,
              sellerId: testOffer.sellerId,
              quantity: 10,
            },
          ],
        },
        pool
      )
    ).rejects.toThrow(InsufficientStockError);

    // Verify stock remains untouched at 3
    const offerRes = await pool.query('SELECT stock_quantity FROM seller_offers WHERE id = $1', [testOffer.id]);
    expect(offerRes.rows[0]?.stock_quantity).toBe(3);

    // Verify no orders were created for customer cust-test-user-002
    const orderRes = await pool.query('SELECT * FROM orders WHERE customer_id = $1', ['cust-test-user-002']);
    expect(orderRes.rows.length).toBe(0);
  });

  it('guarantees concurrency safety under parallel checkout requests', async () => {
    // Current stock is 3.
    // Fire 3 simultaneous orders of quantity 1 each. All 3 must succeed, leaving 0 stock.
    const concurrentOrders = [1, 2, 3].map((idx) =>
      placeMultiVendorOrder(
        {
          customerId: `cust-concurrent-${idx}`,
          paymentMethod: 'credit_card',
          shippingAddress: {
            name: `User ${idx}`,
            street: `${idx} Fast Lane`,
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'US',
          },
          items: [
            {
              offerId: testOffer.id,
              productId: testProduct.id,
              sellerId: testOffer.sellerId,
              quantity: 1,
            },
          ],
        },
        pool
      )
    );

    const outcomes = await Promise.allSettled(concurrentOrders);
    const successful = outcomes.filter((o) => o.status === 'fulfilled');
    expect(successful.length).toBe(3);

    // Stock must be exactly 0 now
    const offerRes = await pool.query('SELECT stock_quantity, inventory_state FROM seller_offers WHERE id = $1', [
      testOffer.id,
    ]);
    expect(offerRes.rows[0]?.stock_quantity).toBe(0);
    expect(offerRes.rows[0]?.inventory_state).toBe('out_of_stock');

    // A 4th attempt now must fail with InsufficientStockError
    await expect(
      placeMultiVendorOrder(
        {
          customerId: 'cust-concurrent-4',
          paymentMethod: 'credit_card',
          shippingAddress: {
            name: 'User 4',
            street: '4 Fast Lane',
            city: 'Seattle',
            state: 'WA',
            postalCode: '98101',
            country: 'US',
          },
          items: [
            {
              offerId: testOffer.id,
              productId: testProduct.id,
              sellerId: testOffer.sellerId,
              quantity: 1,
            },
          ],
        },
        pool
      )
    ).rejects.toThrow(InsufficientStockError);
  });
});
