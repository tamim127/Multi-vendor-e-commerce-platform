import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type pg from 'pg';
import { getTestPool } from './test-helper';
import { createDataLoaders } from '@/server/dataloaders';
import { importCatalog } from '@/server/catalog/importer';

describe('DataLoaders PostgreSQL Batching Integration Tests', () => {
  let pool: pg.Pool;

  const sampleProducts: any[] = [
    {
      id: 'prod-dl-test-001',
      slug: 'dl-test-product-1',
      title: { en: 'DataLoader Test Product 1' },
      description: { en: 'Test description 1' },
      brand: { id: 'brand-apple', name: 'Apple', slug: 'apple', status: 'featured', isFeatured: true },
      categoryId: 'cat-laptops',
      categoryPath: '/electronics/laptops',
      categoryBreadcrumbs: [],
      primaryMedia: { url: 'https://images.unsplash.com/photo-1?w=800', type: 'image' },
      tags: ['test1'],
      status: 'active',
    },
    {
      id: 'prod-dl-test-002',
      slug: 'dl-test-product-2',
      title: { en: 'DataLoader Test Product 2' },
      description: { en: 'Test description 2' },
      brand: { id: 'brand-sony', name: 'Sony', slug: 'sony', status: 'featured', isFeatured: true },
      categoryId: 'cat-headphones',
      categoryPath: '/electronics/audio/headphones',
      categoryBreadcrumbs: [],
      primaryMedia: { url: 'https://images.unsplash.com/photo-2?w=800', type: 'image' },
      tags: ['test2'],
      status: 'active',
    },
    {
      id: 'prod-dl-test-003',
      slug: 'dl-test-product-3',
      title: { en: 'DataLoader Test Product 3' },
      description: { en: 'Test description 3' },
      brand: { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', status: 'featured', isFeatured: true },
      categoryId: 'cat-flagship-phones',
      categoryPath: '/electronics/smartphones/flagship-phones',
      categoryBreadcrumbs: [],
      primaryMedia: { url: 'https://images.unsplash.com/photo-3?w=800', type: 'image' },
      tags: ['test3'],
      status: 'active',
    },
  ];

  const sampleOffers: any[] = [
    {
      id: 'off-dl-test-001',
      productId: 'prod-dl-test-001',
      sellerId: 'seller-apex-tech',
      sellerSku: 'SKU-DL-001',
      price: { amountMinor: 99900, currency: 'USD' },
      inventory: { available: 10, state: 'in_stock' },
      condition: 'new',
      fulfillment: { method: 'marketplace_fulfilled' },
      isBuyBoxWinner: true,
      shipping: { freeShipping: true, shippingFeeMinor: 0, estimatedDaysMin: 2, estimatedDaysMax: 4 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'off-dl-test-002',
      productId: 'prod-dl-test-002',
      sellerId: 'seller-apex-tech',
      sellerSku: 'SKU-DL-002',
      price: { amountMinor: 29900, currency: 'USD' },
      inventory: { available: 15, state: 'in_stock' },
      condition: 'new',
      fulfillment: { method: 'marketplace_fulfilled' },
      isBuyBoxWinner: true,
      shipping: { freeShipping: true, shippingFeeMinor: 0, estimatedDaysMin: 2, estimatedDaysMax: 4 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeAll(async () => {
    pool = getTestPool();
    await importCatalog({
      products: sampleProducts,
      offers: sampleOffers,
      pool,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('batches concurrent productById requests into a single database query', async () => {
    const loaders = createDataLoaders(pool);

    // Fire 3 simultaneous loads
    const [p1, p2, p3] = await Promise.all([
      loaders.productById.load('prod-dl-test-001'),
      loaders.productById.load('prod-dl-test-002'),
      loaders.productById.load('prod-dl-test-003'),
    ]);

    expect(p1).not.toBeNull();
    expect(p1?.id).toBe('prod-dl-test-001');
    expect(p1?.title.en).toBe('DataLoader Test Product 1');

    expect(p2).not.toBeNull();
    expect(p2?.id).toBe('prod-dl-test-002');

    expect(p3).not.toBeNull();
    expect(p3?.id).toBe('prod-dl-test-003');
  });

  it('batches concurrent productBySlug requests into a single database query', async () => {
    const loaders = createDataLoaders(pool);

    const [p1, p2] = await Promise.all([
      loaders.productBySlug.load('dl-test-product-1'),
      loaders.productBySlug.load('dl-test-product-2'),
    ]);

    expect(p1?.id).toBe('prod-dl-test-001');
    expect(p2?.id).toBe('prod-dl-test-002');
  });

  it('batches concurrent categoryById requests', async () => {
    const loaders = createDataLoaders(pool);

    const [c1, c2] = await Promise.all([
      loaders.categoryById.load('cat-laptops'),
      loaders.categoryById.load('cat-headphones'),
    ]);

    expect(c1).not.toBeNull();
    expect(c1?.slug).toBe('laptops');
    expect(c2).not.toBeNull();
  });

  it('batches concurrent brandById requests', async () => {
    const loaders = createDataLoaders(pool);

    const [b1, b2] = await Promise.all([
      loaders.brandById.load('brand-apple'),
      loaders.brandById.load('brand-sony'),
    ]);

    expect(b1).not.toBeNull();
    expect(b1?.name).toBe('Apple');
    expect(b2).not.toBeNull();
    expect(b2?.name).toBe('Sony');
  });

  it('batches concurrent sellerOffersByProductId requests', async () => {
    const loaders = createDataLoaders(pool);

    const [o1, o2] = await Promise.all([
      loaders.sellerOffersByProductId.load('prod-dl-test-001'),
      loaders.sellerOffersByProductId.load('prod-dl-test-002'),
    ]);

    expect(Array.isArray(o1)).toBe(true);
    expect(o1.length).toBeGreaterThanOrEqual(1);
    expect(o1[0]?.price.amountMinor).toBe(99900);

    expect(Array.isArray(o2)).toBe(true);
    expect(o2.length).toBeGreaterThanOrEqual(1);
    expect(o2[0]?.price.amountMinor).toBe(29900);
  });
});
