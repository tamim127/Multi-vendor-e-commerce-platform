/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — REPOSITORY ADAPTER
 * ==============================================================================
 * Deterministic fixture-backed repository adapter for product detail data.
 * Resolves canonical product identity, multi-vendor seller offers, related items,
 * and demonstration feedback.
 */

import { MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import type { Product } from '@/domains/catalog/types/product';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { DEMO_QA, DEMO_REVIEWS } from './fixtures/demo-feedback.fixture';
import type { ProductDetailData } from './types';

/**
 * Retrieves full product detail data by canonical slug.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  return assembleProductDetail(product);
}

/**
 * Retrieves full product detail data by canonical product ID.
 */
export async function getProductById(id: string): Promise<ProductDetailData | null> {
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) return null;

  return assembleProductDetail(product);
}

/**
 * Retrieves all registered product slugs for routing / metadata.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  return MOCK_PRODUCTS.map((p) => p.slug);
}

/**
 * Helper to assemble complete ProductDetailData bundle for a product.
 */
function assembleProductDetail(product: Product): ProductDetailData {
  // Find all commercial offers for this product
  const offers: SellerOffer[] = MOCK_SELLER_OFFERS.filter(
    (offer) => offer.productId === product.id
  );

  // Find related products (same category hierarchy or brand, excluding self)
  const relatedProducts: Product[] = MOCK_PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.categoryId === product.categoryId ||
        p.brand.id === product.brand.id ||
        p.categoryIds?.some((catId) => product.categoryIds?.includes(catId)))
  ).slice(0, 4);

  // Find demo feedback
  const reviews = DEMO_REVIEWS.filter((r) => r.productId === product.id);
  const qaList = DEMO_QA.filter((q) => q.productId === product.id);

  return {
    product,
    offers,
    relatedProducts,
    reviews,
    qaList,
  };
}
