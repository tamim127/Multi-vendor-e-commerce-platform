import { describe, it, expect } from 'vitest';
import {
  getProductBySlug,
  getProductById,
  getAllProductSlugs,
} from '@/features/product-detail/repository';

describe('Phase 2D: PDP Repository Adapter', () => {
  it('retrieves full product detail data by valid canonical slug', async () => {
    const data = await getProductBySlug('apple-macbook-pro-16-m3-max');
    expect(data).not.toBeNull();
    expect(data?.product.id).toBe('prod-macbook-pro-16');
    expect(data?.product.slug).toBe('apple-macbook-pro-16-m3-max');
    expect(data?.offers.length).toBeGreaterThan(0);
    expect(data?.relatedProducts.length).toBeGreaterThan(0);
    // Ensure related products never includes the product itself
    expect(data?.relatedProducts.some((p) => p.id === data.product.id)).toBe(false);
  });

  it('returns null for nonexistent product slug', async () => {
    const data = await getProductBySlug('nonexistent-product-slug-xyz');
    expect(data).toBeNull();
  });

  it('retrieves full product detail by canonical product ID', async () => {
    const data = await getProductById('prod-macbook-pro-16');
    expect(data).not.toBeNull();
    expect(data?.product.id).toBe('prod-macbook-pro-16');
  });

  it('returns null for nonexistent product ID', async () => {
    const data = await getProductById('prod-nonexistent-id-999');
    expect(data).toBeNull();
  });

  it('retrieves all registered product slugs', async () => {
    const slugs = await getAllProductSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs).toContain('apple-macbook-pro-16-m3-max');
  });

  it('includes demonstration feedback fixtures for seeded products', async () => {
    const data = await getProductBySlug('apple-macbook-pro-16-m3-max');
    expect(data?.reviews.length).toBeGreaterThan(0);
    expect(data?.qaList.length).toBeGreaterThan(0);

    const firstReview = data?.reviews[0];
    expect(firstReview?.authorName).toBeDefined();
    expect(firstReview?.rating).toBeGreaterThanOrEqual(1);
    expect(firstReview?.rating).toBeLessThanOrEqual(5);

    const firstQa = data?.qaList[0];
    expect(firstQa?.question).toBeDefined();
    expect(firstQa?.answer).toBeDefined();
  });
});
