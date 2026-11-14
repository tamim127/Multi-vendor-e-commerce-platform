import { z } from 'zod';
import type pg from 'pg';
import { getDbPool, withTransaction } from '@/server/db/client';
import { appLogger } from '@/lib/observability/logger';
import type { Product } from '@/domains/catalog/types/product';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { CATALOG_PRODUCTS_1000, CATALOG_OFFERS_1000 } from './products-1000';
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SELLERS } from '@/domains/catalog/fixtures';

export interface ImportReport {
  totalProcessed: number;
  productsImported: number;
  productsUpdated: number;
  offersImported: number;
  offersUpdated: number;
  brandsSynchronized: number;
  categoriesSynchronized: number;
  sellersSynchronized: number;
  validationErrors: Array<{ identifier: string; error: string }>;
  duplicatesDetected: string[];
  durationMs: number;
  timestamp: Date;
}

// Validation schemas ensuring real data integrity
const ProductImportSchema = z.object({
  id: z.string().min(3),
  slug: z.string().min(3),
  title: z.object({
    en: z.string().min(2),
  }),
  description: z.object({
    en: z.string().min(5),
  }),
  brand: z.object({
    id: z.string().min(2),
    name: z.string().min(1),
  }),
  categoryId: z.string().min(2),
});

const OfferImportSchema = z.object({
  productId: z.string().min(3),
  sellerId: z.string().min(3),
  price: z.object({
    amountMinor: z.number().int().positive(),
  }),
});

/**
 * Normalizes and synchronizes reference tables (brands, categories, sellers) before catalog import.
 */
async function syncPrerequisites(client: pg.PoolClient): Promise<{
  brandsCount: number;
  categoriesCount: number;
  sellersCount: number;
}> {
  // 1. Sync Brands
  let brandsCount = 0;
  for (const b of MOCK_BRANDS) {
    await client.query(
      `INSERT INTO brands (id, name, slug, logo_url, is_verified, country)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         updated_at = NOW();`,
      [
        b.id,
        b.name,
        b.slug,
        b.logo?.url || (b as any).logoUrl || null,
        Boolean(b.isFeatured || (b.status as string) === 'featured'),
        (b as any).countryOfOrigin || 'US',
      ]
    );
    brandsCount++;
  }

  // 2. Sync Categories (sorted by level to satisfy self-referential parent_id foreign key)
  let categoriesCount = 0;
  const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.level - b.level);
  for (const c of sortedCategories) {
    await client.query(
      `INSERT INTO categories (id, parent_id, slug, name_en, level, icon, banner_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name_en = EXCLUDED.name_en,
         slug = EXCLUDED.slug,
         parent_id = EXCLUDED.parent_id,
         level = EXCLUDED.level,
         updated_at = NOW();`,
      [
        c.id,
        c.parentId || null,
        c.slug,
        c.name.en,
        c.level,
        c.icon || null,
        c.image?.url || (c as any).bannerUrl || null,
        Boolean(c.isActive),
      ]
    );
    categoriesCount++;
  }

  // 3. Sync Sellers (deduplicate by id and slug)
  let sellersCount = 0;
  const seenSellerIds = new Set<string>();
  const seenSellerSlugs = new Set<string>();

  for (const s of MOCK_SELLERS) {
    const slug = s.slug || s.id;
    if (seenSellerIds.has(s.id) || seenSellerSlugs.has(slug)) {
      continue;
    }
    seenSellerIds.add(s.id);
    seenSellerSlugs.add(slug);

    await client.query(
      `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified, rating_avg, rating_count, positive_feedback_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tier = EXCLUDED.tier,
         status = EXCLUDED.status,
         updated_at = NOW();`,
      [
        s.id,
        s.name || (s as any).displayName || (s as any).legalBusinessName || s.id,
        s.slug || s.id,
        (s as any).businessEmail || `${s.slug || s.id}@aureon.market`,
        (s as any).tier || 'standard',
        (s as any).status || 'verified',
        Boolean(s.isVerified),
        s.rating?.average || (s as any).metrics?.ratingAverage || 4.5,
        s.rating?.count || (s as any).metrics?.ratingCount || 10,
        s.rating?.positiveFeedbackPercent || (s as any).metrics?.positiveFeedbackRate || 98.0,
      ]
    );
    sellersCount++;
  }

  return { brandsCount, categoriesCount, sellersCount };
}

/**
 * Robust, repeatable, idempotent catalog importer.
 * Validates, normalizes, detects duplicates, and executes batch upserts.
 */
export async function importCatalog(options?: {
  products?: Product[];
  offers?: SellerOffer[];
  pool?: pg.Pool;
  chunkSize?: number;
}): Promise<ImportReport> {
  const startTime = Date.now();
  const pool = options?.pool || getDbPool();
  const products = options?.products || CATALOG_PRODUCTS_1000;
  const offers = options?.offers || CATALOG_OFFERS_1000;
  const chunkSize = options?.chunkSize || 50;

  const report: ImportReport = {
    totalProcessed: products.length,
    productsImported: 0,
    productsUpdated: 0,
    offersImported: 0,
    offersUpdated: 0,
    brandsSynchronized: 0,
    categoriesSynchronized: 0,
    sellersSynchronized: 0,
    validationErrors: [],
    duplicatesDetected: [],
    durationMs: 0,
    timestamp: new Date(),
  };

  // 1. In-memory validation and duplicate detection
  const seenProductIds = new Set<string>();
  const seenProductSkus = new Set<string>();
  const validProducts: Product[] = [];

  for (const product of products) {
    const parseResult = ProductImportSchema.safeParse(product);
    if (!parseResult.success) {
      report.validationErrors.push({
        identifier: product.id || 'unknown',
        error: parseResult.error.message,
      });
      continue;
    }

    if (seenProductIds.has(product.id)) {
      report.duplicatesDetected.push(`Duplicate ID: ${product.id}`);
      continue;
    }
    seenProductIds.add(product.id);

    const sku = (product as any).sku || `SKU-${product.id}`;
    if (seenProductSkus.has(sku)) {
      report.duplicatesDetected.push(`Duplicate SKU: ${sku}`);
      continue;
    }
    seenProductSkus.add(sku);

    validProducts.push(product);
  }

  // 2. Validate offers
  const validOffers: SellerOffer[] = [];
  const seenOfferIds = new Set<string>();

  for (const offer of offers) {
    const offerId = (offer as any).id || (offer as any).offerId;
    const parseResult = OfferImportSchema.safeParse(offer);
    if (!parseResult.success || !offerId) {
      report.validationErrors.push({
        identifier: offerId || 'unknown',
        error: parseResult.success ? 'Missing offerId' : parseResult.error.message,
      });
      continue;
    }

    if (seenOfferIds.has(offerId)) {
      report.duplicatesDetected.push(`Duplicate Offer ID: ${offerId}`);
      continue;
    }
    seenOfferIds.add(offerId);

    // Only import offers that reference a valid product
    if (seenProductIds.has(offer.productId)) {
      validOffers.push(offer);
    }
  }

  // 3. Database import in transaction
  await withTransaction(
    async (client) => {
      // Synchronize prerequisites
      const syncResult = await syncPrerequisites(client);
      report.brandsSynchronized = syncResult.brandsCount;
      report.categoriesSynchronized = syncResult.categoriesCount;
      report.sellersSynchronized = syncResult.sellersCount;

      // Chunked upsert for products
      for (let i = 0; i < validProducts.length; i += chunkSize) {
        const chunk = validProducts.slice(i, i + chunkSize);
        for (const p of chunk) {
          // Guarantee brand foreign key
          await client.query(
            `INSERT INTO brands (id, name, slug, is_verified)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (id) DO NOTHING;`,
            [p.brand.id, p.brand.name, p.brand.slug || p.brand.id]
          );

          // Guarantee category foreign key
          await client.query(
            `INSERT INTO categories (id, slug, name_en, level, is_active)
             VALUES ($1, $2, $3, 1, true)
             ON CONFLICT (id) DO NOTHING;`,
            [p.categoryId, p.categoryId, p.categoryId]
          );

          const sku = (p as any).sku || `SKU-${p.id}`;
          const primaryUrl =
            (p as any).primaryMedia?.url ||
            p.media?.[0]?.url ||
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80';
          const gallery =
            (p as any).mediaGallery?.map((m: any) => m.url) ||
            p.media?.map((m: any) => m.url) ||
            [];
          const specsJson = JSON.stringify(p.attributes || {});
          const tagsArray = p.tags || [];

          const query = `
            INSERT INTO products (
              id, slug, sku, category_id, brand_id,
              title_en, title_bn, title_ar, title_hi,
              description_en, description_bn, description_ar, description_hi,
              specifications, tags, primary_image_url, gallery_images,
              rating_avg, rating_count, is_active, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11, $12, $13,
              $14, $15, $16, $17,
              $18, $19, $20, NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
              slug = EXCLUDED.slug,
              title_en = EXCLUDED.title_en,
              description_en = EXCLUDED.description_en,
              primary_image_url = EXCLUDED.primary_image_url,
              specifications = EXCLUDED.specifications,
              tags = EXCLUDED.tags,
              rating_avg = EXCLUDED.rating_avg,
              rating_count = EXCLUDED.rating_count,
              updated_at = NOW()
            RETURNING (xmax = 0) AS is_insert;
          `;

          const res = await client.query(query, [
            p.id,
            p.slug,
            sku,
            p.categoryId,
            p.brand.id,
            p.title.en,
            p.title.bn || null,
            p.title.ar || null,
            p.title.hi || null,
            p.description.en,
            p.description.bn || null,
            p.description.ar || null,
            p.description.hi || null,
            specsJson,
            tagsArray,
            primaryUrl,
            gallery,
            p.ratingSummary?.average || 4.5,
            p.ratingSummary?.count || 25,
            p.status === 'active' || true,
          ]);

          if (res.rows[0]?.is_insert) {
            report.productsImported++;
          } else {
            report.productsUpdated++;
          }
        }
      }

      // Chunked upsert for seller offers
      for (let i = 0; i < validOffers.length; i += chunkSize) {
        const chunk = validOffers.slice(i, i + chunkSize);
        for (const o of chunk) {
          const offerId = (o as any).id || (o as any).offerId;
          const offerSku = (o as any).sellerSku || (o as any).variantId || `SKU-${offerId}`;
          const isWinner = o.isBuyBoxWinner ?? false;
          const condition = o.condition || 'new';
          const stock = (o as any).inventory?.available ?? o.inventory?.quantityAvailable ?? 10;
          const fulfillmentMethod = (o as any).fulfillment?.method || (o as any).fulfillmentType || 'marketplace_fulfilled';
          const minDays = (o as any).shipping?.estimatedDaysMin || (o as any).shippingEstimate?.minDays || 3;
          const maxDays = (o as any).shipping?.estimatedDaysMax || (o as any).shippingEstimate?.maxDays || 5;
          const freeShip = (o as any).shipping?.freeShipping ?? (o as any).shippingEstimate?.isFreeShipping ?? true;
          const shipCost = (o as any).shipping?.shippingFeeMinor ?? (o as any).shippingEstimate?.shippingCost?.amountMinor ?? 0;

          // Guarantee seller foreign key
          await client.query(
            `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified)
             VALUES ($1, $2, $3, $4, 'standard', 'verified', true)
             ON CONFLICT (id) DO NOTHING;`,
            [o.sellerId, o.sellerId, o.sellerId, `${o.sellerId}@aureon.market`]
          );

          const query = `
            INSERT INTO seller_offers (
              id, product_id, seller_id, sku,
              price_minor, compare_at_price_minor, currency,
              stock_quantity, inventory_state, condition, fulfillment_type,
              is_buy_box_winner, min_delivery_days, max_delivery_days,
              is_free_shipping, shipping_cost_minor, updated_at
            ) VALUES (
              $1, $2, $3, $4,
              $5, $6, $7,
              $8, $9, $10, $11,
              $12, $13, $14,
              $15, $16, NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
              price_minor = EXCLUDED.price_minor,
              compare_at_price_minor = EXCLUDED.compare_at_price_minor,
              stock_quantity = EXCLUDED.stock_quantity,
              inventory_state = EXCLUDED.inventory_state,
              is_buy_box_winner = EXCLUDED.is_buy_box_winner,
              updated_at = NOW()
            RETURNING (xmax = 0) AS is_insert;
          `;

          const res = await client.query(query, [
            offerId,
            o.productId,
            o.sellerId,
            offerSku,
            o.price.amountMinor,
            o.compareAtPrice?.amountMinor || null,
            o.price.currency,
            stock,
            stock > 0 ? 'in_stock' : 'out_of_stock',
            condition,
            fulfillmentMethod,
            isWinner,
            minDays,
            maxDays,
            freeShip,
            shipCost,
          ]);

          if (res.rows[0]?.is_insert) {
            report.offersImported++;
          } else {
            report.offersUpdated++;
          }
        }
      }
    },
    undefined,
    pool
  );

  report.durationMs = Date.now() - startTime;
  appLogger.info('Catalog import completed successfully', { report });
  return report;
}
