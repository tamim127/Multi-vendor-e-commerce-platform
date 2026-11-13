import DataLoader from 'dataloader';
import { dbQuery } from '@/server/db/client';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';
import type { Product } from '@/domains/catalog/types/product';
import type { Category } from '@/domains/catalog/types/category';
import type { Brand } from '@/domains/catalog/types/brand';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';

export interface AppDataLoaders {
  productById: DataLoader<string, Product | null>;
  productBySlug: DataLoader<string, Product | null>;
  categoryById: DataLoader<string, Category | null>;
  brandById: DataLoader<string, Brand | null>;
  sellerOffersByProductId: DataLoader<string, SellerOffer[]>;
}

/**
 * Creates isolated per-request DataLoader instances to guarantee zero cross-request cache leaks.
 */
export function createDataLoaders(): AppDataLoaders {
  // 1. Product by ID Loader
  const productById = new DataLoader<string, Product | null>(async (ids) => {
    // Attempt DB query if active, fallback to in-memory fixtures
    try {
      const res = await dbQuery<Product>(
        'SELECT * FROM products WHERE id = ANY($1)',
        [ids as string[]]
      );
      const map = new Map<string, Product>(res.rows.map((p) => [p.id, p]));
      return ids.map((id) => map.get(id) || MOCK_PRODUCTS.find((p) => p.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_PRODUCTS.find((p) => p.id === id) || null);
    }
  });

  // 2. Product by Slug Loader
  const productBySlug = new DataLoader<string, Product | null>(async (slugs) => {
    try {
      const res = await dbQuery<Product>(
        'SELECT * FROM products WHERE slug = ANY($1)',
        [slugs as string[]]
      );
      const map = new Map<string, Product>(res.rows.map((p) => [p.slug, p]));
      return slugs.map((slug) => map.get(slug) || MOCK_PRODUCTS.find((p) => p.slug === slug) || null);
    } catch {
      return slugs.map((slug) => MOCK_PRODUCTS.find((p) => p.slug === slug) || null);
    }
  });

  // 3. Category by ID Loader
  const categoryById = new DataLoader<string, Category | null>(async (ids) => {
    try {
      const res = await dbQuery<Category>(
        'SELECT * FROM categories WHERE id = ANY($1)',
        [ids as string[]]
      );
      const map = new Map<string, Category>(res.rows.map((c) => [c.id, c]));
      return ids.map((id) => map.get(id) || MOCK_CATEGORIES.find((c) => c.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_CATEGORIES.find((c) => c.id === id) || null);
    }
  });

  // 4. Brand by ID Loader
  const brandById = new DataLoader<string, Brand | null>(async (ids) => {
    try {
      const res = await dbQuery<Brand>(
        'SELECT * FROM brands WHERE id = ANY($1)',
        [ids as string[]]
      );
      const map = new Map<string, Brand>(res.rows.map((b) => [b.id, b]));
      return ids.map((id) => map.get(id) || MOCK_BRANDS.find((b) => b.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_BRANDS.find((b) => b.id === id) || null);
    }
  });

  // 5. Multi-Vendor Offers by Product ID Loader (One-to-Many batched query)
  const sellerOffersByProductId = new DataLoader<string, SellerOffer[]>(async (productIds) => {
    try {
      const res = await dbQuery<SellerOffer>(
        'SELECT * FROM seller_offers WHERE product_id = ANY($1) ORDER BY price_minor ASC',
        [productIds as string[]]
      );
      const groupMap = new Map<string, SellerOffer[]>();
      for (const row of res.rows) {
        const list = groupMap.get(row.productId) || [];
        list.push(row);
        groupMap.set(row.productId, list);
      }
      return productIds.map((pid) => groupMap.get(pid) || MOCK_SELLER_OFFERS.filter((o) => o.productId === pid));
    } catch {
      return productIds.map((pid) => MOCK_SELLER_OFFERS.filter((o) => o.productId === pid));
    }
  });

  return {
    productById,
    productBySlug,
    categoryById,
    brandById,
    sellerOffersByProductId,
  };
}

