import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type pg from 'pg';
import { getTestPool } from './test-helper';
import { importCatalog } from '@/server/catalog/importer';

describe('Catalog Importer PostgreSQL Integration Tests', () => {
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = getTestPool();
  });

  afterAll(async () => {
    await pool.end();
  });

  const sampleProduct: any = {
    id: 'prod-test-int-001',
    slug: 'test-macbook-pro-m3-integration',
    title: {
      en: 'Apple MacBook Pro 14 M3 Test Unit',
    },
    description: {
      en: 'High-speed developer machine for integration testing.',
    },
    brand: {
      id: 'brand-apple',
      name: 'Apple',
      slug: 'apple',
      status: 'featured',
      isFeatured: true,
    },
    categoryId: 'cat-laptops',
    categoryPath: '/electronics/laptops',
    categoryBreadcrumbs: [],
    primaryMedia: {
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      type: 'image',
    },
    tags: ['apple', 'laptop', 'integration-test'],
    status: 'active',
    ratingSummary: {
      average: 4.8,
      count: 42,
      distribution: { 1: 0, 2: 1, 3: 2, 4: 9, 5: 30 },
    },
  };

  const sampleOffer: any = {
    id: 'off-test-int-001',
    productId: 'prod-test-int-001',
    sellerId: 'seller-apex-tech',
    sellerSku: 'SKU-APEX-TEST-001',
    price: {
      amountMinor: 199900,
      currency: 'USD',
    },
    inventory: {
      available: 25,
      state: 'in_stock',
    },
    condition: 'new',
    fulfillment: {
      method: 'marketplace_fulfilled',
    },
    isBuyBoxWinner: true,
    shipping: {
      freeShipping: true,
      shippingFeeMinor: 0,
      estimatedDaysMin: 2,
      estimatedDaysMax: 4,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('imports valid products and seller offers with normalized foreign keys', async () => {
    const report = await importCatalog({
      products: [sampleProduct],
      offers: [sampleOffer],
      pool,
    });

    expect(report.totalProcessed).toBe(1);
    expect(report.productsImported + report.productsUpdated).toBe(1);
    expect(report.offersImported + report.offersUpdated).toBe(1);
    expect(report.validationErrors.length).toBe(0);

    // Verify row was written to PostgreSQL
    const res = await pool.query('SELECT id, title_en, brand_id, category_id FROM products WHERE id = $1', [
      sampleProduct.id,
    ]);
    expect(res.rows.length).toBe(1);
    expect(res.rows[0]?.title_en).toBe(sampleProduct.title.en);
    expect(res.rows[0]?.brand_id).toBe('brand-apple');
  });

  it('is completely idempotent when re-importing the same dataset', async () => {
    const report1 = await importCatalog({
      products: [sampleProduct],
      offers: [sampleOffer],
      pool,
    });
    expect(report1.validationErrors.length).toBe(0);

    // Re-importing must not create duplicate records
    const report2 = await importCatalog({
      products: [sampleProduct],
      offers: [sampleOffer],
      pool,
    });
    expect(report2.productsImported).toBe(0);
    expect(report2.productsUpdated).toBe(1);
    expect(report2.offersImported).toBe(0);
    expect(report2.offersUpdated).toBe(1);

    const countRes = await pool.query('SELECT COUNT(*) FROM products WHERE id = $1', [sampleProduct.id]);
    expect(Number(countRes.rows[0]?.count)).toBe(1);
  });

  it('detects duplicate product IDs within the import payload', async () => {
    const duplicateProduct: any = {
      ...sampleProduct,
      slug: 'different-slug-but-same-id',
    };

    const report = await importCatalog({
      products: [sampleProduct, duplicateProduct],
      offers: [],
      pool,
    });

    expect(report.duplicatesDetected.length).toBeGreaterThanOrEqual(1);
    expect(report.duplicatesDetected[0]).toContain(`Duplicate ID: ${sampleProduct.id}`);
  });

  it('enforces foreign key constraints when inserting non-existent foreign keys directly', async () => {
    // Attempt direct insert with non-existent brand_id
    await expect(
      pool.query(
        `INSERT INTO products (id, slug, sku, category_id, brand_id, title_en, description_en, primary_image_url)
         VALUES ('prod-invalid-fk', 'slug-invalid', 'SKU-INV', 'cat-laptops', 'brand-non-existent-xyz', 'Title', 'Desc', 'https://example.com/img.jpg')`
      )
    ).rejects.toThrow(/violates foreign key constraint/);
  });
});
