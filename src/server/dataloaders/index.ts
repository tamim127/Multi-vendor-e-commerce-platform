import DataLoader from 'dataloader';
import type pg from 'pg';
import { queryDb, getDbPool } from '@/server/db/client';
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

export function mapRowToProduct(row: any): Product {
  const primaryMedia = row.primary_image_url
    ? [{ id: 'm1', type: 'image' as const, url: row.primary_image_url, isPrimary: true }]
    : [];
  const galleryMedia = (row.gallery_images || []).map((url: string, i: number) => ({
    id: `m${i + 2}`,
    type: 'image' as const,
    url,
    isPrimary: false,
  }));

  return {
    id: row.id,
    slug: row.slug,
    title: {
      en: row.title_en,
      bn: row.title_bn || undefined,
      ar: row.title_ar || undefined,
      hi: row.title_hi || undefined,
    },
    description: {
      en: row.description_en,
      bn: row.description_bn || undefined,
      ar: row.description_ar || undefined,
      hi: row.description_hi || undefined,
    },
    brand: {
      id: row.brand_id,
      name: row.brand_name || row.brand_id,
      slug: row.brand_slug || row.brand_id,
      status: 'active',
      isFeatured: false,
    },
    categoryId: row.category_id,
    categoryPath: row.category_path || `/${row.category_id}`,
    categoryBreadcrumbs: [],
    categoryIds: [row.category_id],
    media: [...primaryMedia, ...galleryMedia],
    attributes: [],
    variants: [],
    badges: [],
    reviewCount: Number(row.rating_count) || 0,
    tags: row.tags || [],
    status: row.is_active ? 'active' : 'inactive',
    isDigital: false,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    ratingSummary: {
      average: Number(row.rating_avg) || 0,
      count: Number(row.rating_count) || 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    offerSummary: {
      offerCount: 1,
      lowestPrice: { amountMinor: 0, currency: 'USD' },
      highestPrice: { amountMinor: 0, currency: 'USD' },
      hasMultipleOffers: false,
    },
  };
}

export function mapRowToOffer(row: any): SellerOffer {
  return {
    offerId: row.id,
    productId: row.product_id,
    sellerId: row.seller_id,
    seller: {
      id: row.seller_id,
      name: row.seller_id,
      slug: row.seller_id,
      isVerified: true,
      rating: { average: 4.8, count: 100, positiveFeedbackPercent: 99 },
      badges: [],
    },
    price: {
      amountMinor: Number(row.price_minor),
      currency: (row.currency || 'USD') as any,
    },
    compareAtPrice: row.compare_at_price_minor
      ? {
          amountMinor: Number(row.compare_at_price_minor),
          currency: (row.currency || 'USD') as any,
        }
      : undefined,
    inventory: {
      state: row.inventory_state || (row.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'),
      quantityAvailable: Number(row.stock_quantity),
    },
    condition: row.condition || 'new',
    fulfillmentType: row.fulfillment_type || 'marketplace_fulfilled',
    shippingEstimate: {
      isFreeShipping: Boolean(row.is_free_shipping),
      shippingCost: row.shipping_cost_minor
        ? { amountMinor: Number(row.shipping_cost_minor), currency: (row.currency || 'USD') as any }
        : undefined,
      minDays: Number(row.min_delivery_days) || 3,
      maxDays: Number(row.max_delivery_days) || 5,
    },
    isBuyBoxWinner: Boolean(row.is_buy_box_winner),
    returnPolicyDays: 30,
  };
}

export function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    parentId: row.parent_id || null,
    slug: row.slug,
    name: {
      en: row.name_en,
      bn: row.name_bn || undefined,
      ar: row.name_ar || undefined,
      hi: row.name_hi || undefined,
    },
    level: Number(row.level) || 0,
    path: `/${row.slug}`,
    isActive: Boolean(row.is_active),
    isFeatured: false,
    childCount: 0,
    productCount: 0,
    icon: row.icon || undefined,
  };
}

export function mapRowToBrand(row: any): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: 'active',
    isFeatured: Boolean(row.is_verified),
    websiteUrl: row.website || undefined,
  };
}

/**
 * Creates isolated per-request DataLoader instances to guarantee zero cross-request cache leaks.
 */
export function createDataLoaders(pool?: pg.Pool): AppDataLoaders {
  const targetPool = pool || getDbPool();

  // 1. Product by ID Loader
  const productById = new DataLoader<string, Product | null>(async (ids) => {
    try {
      const res = await queryDb<any>(
        `SELECT p.*, b.name as brand_name, b.slug as brand_slug
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         WHERE p.id = ANY($1);`,
        [ids as string[]],
        targetPool
      );
      const map = new Map<string, Product>(res.rows.map((r) => [r.id, mapRowToProduct(r)]));
      return ids.map((id) => map.get(id) || MOCK_PRODUCTS.find((p) => p.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_PRODUCTS.find((p) => p.id === id) || null);
    }
  });

  // 2. Product by Slug Loader
  const productBySlug = new DataLoader<string, Product | null>(async (slugs) => {
    try {
      const res = await queryDb<any>(
        `SELECT p.*, b.name as brand_name, b.slug as brand_slug
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         WHERE p.slug = ANY($1);`,
        [slugs as string[]],
        targetPool
      );
      const map = new Map<string, Product>(res.rows.map((r) => [r.slug, mapRowToProduct(r)]));
      return slugs.map((slug) => map.get(slug) || MOCK_PRODUCTS.find((p) => p.slug === slug) || null);
    } catch {
      return slugs.map((slug) => MOCK_PRODUCTS.find((p) => p.slug === slug) || null);
    }
  });

  // 3. Category by ID Loader
  const categoryById = new DataLoader<string, Category | null>(async (ids) => {
    try {
      const res = await queryDb<any>(
        'SELECT * FROM categories WHERE id = ANY($1);',
        [ids as string[]],
        targetPool
      );
      const map = new Map<string, Category>(res.rows.map((c) => [c.id, mapRowToCategory(c)]));
      return ids.map((id) => map.get(id) || MOCK_CATEGORIES.find((c) => c.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_CATEGORIES.find((c) => c.id === id) || null);
    }
  });

  // 4. Brand by ID Loader
  const brandById = new DataLoader<string, Brand | null>(async (ids) => {
    try {
      const res = await queryDb<any>(
        'SELECT * FROM brands WHERE id = ANY($1);',
        [ids as string[]],
        targetPool
      );
      const map = new Map<string, Brand>(res.rows.map((b) => [b.id, mapRowToBrand(b)]));
      return ids.map((id) => map.get(id) || MOCK_BRANDS.find((b) => b.id === id) || null);
    } catch {
      return ids.map((id) => MOCK_BRANDS.find((b) => b.id === id) || null);
    }
  });

  // 5. Multi-Vendor Offers by Product ID Loader (One-to-Many batched query)
  const sellerOffersByProductId = new DataLoader<string, SellerOffer[]>(async (productIds) => {
    try {
      const res = await queryDb<any>(
        'SELECT * FROM seller_offers WHERE product_id = ANY($1) ORDER BY price_minor ASC;',
        [productIds as string[]],
        targetPool
      );
      const groupMap = new Map<string, SellerOffer[]>();
      for (const row of res.rows) {
        const offer = mapRowToOffer(row);
        const list = groupMap.get(offer.productId) || [];
        list.push(offer);
        groupMap.set(offer.productId, list);
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
