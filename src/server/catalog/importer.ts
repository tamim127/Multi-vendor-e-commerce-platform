import { z } from 'zod';
import type pg from 'pg';
import { getDbPool, withTransaction } from '@/server/db/client';
import { appLogger } from '@/lib/observability/logger';
import type { Product } from '@/domains/catalog/types/product';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';
import { MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SELLERS, MOCK_PRODUCTS, MOCK_SELLER_OFFERS } from '@/domains/catalog/fixtures';

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
  brandIdMap: Map<string, string>;
  categoryIdMap: Map<string, string>;
  sellerIdMap: Map<string, string>;
}> {
  const brandIdMap = new Map<string, string>();
  const categoryIdMap = new Map<string, string>();
  const sellerIdMap = new Map<string, string>();

  // Preload existing slugs to reconcile pre-seeded rows cleanly without violating unique slug constraints
  const existingBrandsRes = await client.query<{ id: string; slug: string }>('SELECT id, slug FROM brands;');
  const existingBrandBySlug = new Map(existingBrandsRes.rows.map((r) => [r.slug, r.id]));

  const existingCatsRes = await client.query<{ id: string; slug: string }>('SELECT id, slug FROM categories;');
  const existingCatBySlug = new Map(existingCatsRes.rows.map((r) => [r.slug, r.id]));

  const existingSellersRes = await client.query<{ id: string; slug: string }>('SELECT id, slug FROM sellers;');
  const existingSellerBySlug = new Map(existingSellersRes.rows.map((r) => [r.slug, r.id]));

  // 1. Sync Brands
  let brandsCount = 0;
  for (const b of MOCK_BRANDS) {
    const targetId = existingBrandBySlug.get(b.slug) || b.id;
    brandIdMap.set(b.id, targetId);
    await client.query(
      `INSERT INTO brands (id, name, slug, logo_url, is_verified, country)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         updated_at = NOW();`,
      [
        targetId,
        b.name,
        b.slug,
        b.logo?.url || (b as any).logoUrl || null,
        Boolean(b.isFeatured || (b.status as string) === 'featured'),
        (b as any).countryOfOrigin || 'US',
      ]
    );
    existingBrandBySlug.set(b.slug, targetId);
    brandsCount++;
  }

  // 2. Sync Categories (sorted by level to satisfy self-referential parent_id foreign key)
  let categoriesCount = 0;
  const sortedCategories = [...MOCK_CATEGORIES].sort((a, b) => a.level - b.level);
  for (const c of sortedCategories) {
    const targetId = existingCatBySlug.get(c.slug) || c.id;
    categoryIdMap.set(c.id, targetId);
    const resolvedParentId = c.parentId ? (categoryIdMap.get(c.parentId) || c.parentId) : null;
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
        targetId,
        resolvedParentId,
        c.slug,
        c.name.en,
        c.level,
        c.icon || null,
        c.image?.url || (c as any).bannerUrl || null,
        Boolean(c.isActive),
      ]
    );
    existingCatBySlug.set(c.slug, targetId);
    categoriesCount++;
  }

  // 3. Sync Sellers (deduplicate by id and slug, reconciling existing slug rows)
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

    const targetId = existingSellerBySlug.get(slug) || s.id;
    sellerIdMap.set(s.id, targetId);

    await client.query(
      `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified, rating_avg, rating_count, positive_feedback_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tier = EXCLUDED.tier,
         status = EXCLUDED.status,
         updated_at = NOW();`,
      [
        targetId,
        s.name || (s as any).displayName || (s as any).legalBusinessName || s.id,
        slug,
        (s as any).businessEmail || `${slug}@aureon.market`,
        (s as any).tier || 'standard',
        (s as any).status === 'verified' ? 'approved' : ((s as any).status || 'approved'),
        Boolean(s.isVerified),
        s.rating?.average || (s as any).metrics?.ratingAverage || 4.5,
        s.rating?.count || (s as any).metrics?.ratingCount || 10,
        s.rating?.positiveFeedbackPercent || (s as any).metrics?.positiveFeedbackRate || 98.0,
      ]
    );
    existingSellerBySlug.set(slug, targetId);
    sellersCount++;
  }

  return { brandsCount, categoriesCount, sellersCount, brandIdMap, categoryIdMap, sellerIdMap };
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
  const products = options?.products || MOCK_PRODUCTS;
  const offers = options?.offers || MOCK_SELLER_OFFERS;
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

      // Preload existing products & offers to ensure safe idempotent upserts across seeded IDs
      const existingProductsRes = await client.query<{ id: string; slug: string; sku: string }>(
        'SELECT id, slug, sku FROM products;'
      );
      const existingProdBySlug = new Map(existingProductsRes.rows.map((r) => [r.slug, r.id]));
      const existingProdBySku = new Map(existingProductsRes.rows.map((r) => [r.sku, r.id]));

      // Chunked upsert for products
      const productIdMap = new Map<string, string>();
      for (let i = 0; i < validProducts.length; i += chunkSize) {
        const chunk = validProducts.slice(i, i + chunkSize);
        for (const p of chunk) {
          const resolvedBrandId = syncResult.brandIdMap.get(p.brand.id) || p.brand.id;
          const resolvedCategoryId = syncResult.categoryIdMap.get(p.categoryId) || p.categoryId;

          // Guarantee brand foreign key when referencing brand outside fixture catalog
          if (!syncResult.brandIdMap.has(p.brand.id)) {
            await client.query(
              `INSERT INTO brands (id, name, slug, is_verified)
               VALUES ($1, $2, $3, true)
               ON CONFLICT DO NOTHING;`,
              [resolvedBrandId, p.brand.name, p.brand.slug || resolvedBrandId]
            );
          }

          // Guarantee category foreign key when referencing category outside fixture catalog
          if (!syncResult.categoryIdMap.has(p.categoryId)) {
            await client.query(
              `INSERT INTO categories (id, slug, name_en, level, is_active)
               VALUES ($1, $2, $3, 1, true)
               ON CONFLICT DO NOTHING;`,
              [resolvedCategoryId, resolvedCategoryId, resolvedCategoryId]
            );
          }

          const sku = (p as any).sku || `SKU-${p.id}`;
          const targetProductId =
            existingProdBySlug.get(p.slug) || existingProdBySku.get(sku) || p.id;
          productIdMap.set(p.id, targetProductId);
          existingProdBySlug.set(p.slug, targetProductId);
          existingProdBySku.set(sku, targetProductId);
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
              rating_avg, rating_count, is_active, moderation_status, source_provenance, is_spec_verified, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9,
              $10, $11, $12, $13,
              $14, $15, $16, $17,
              $18, $19, $20, 'approved', 'catalog_dataset_import', false, NOW()
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
            targetProductId,
            p.slug,
            sku,
            resolvedCategoryId,
            resolvedBrandId,
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

      const existingOffersRes = await client.query<{
        id: string;
        product_id: string;
        seller_id: string;
        condition: string;
      }>('SELECT id, product_id, seller_id, condition FROM seller_offers;');
      const offerIdByTuple = new Map(
        existingOffersRes.rows.map((r) => [`${r.product_id}::${r.seller_id}::${r.condition}`, r.id])
      );
      const seenOfferTuples = new Set<string>();

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

          const resolvedProductId = productIdMap.get(o.productId) || o.productId;
          const resolvedSellerId = syncResult.sellerIdMap.get(o.sellerId) || o.sellerId;
          const tupleKey = `${resolvedProductId}::${resolvedSellerId}::${condition}`;

          if (seenOfferTuples.has(tupleKey)) {
            report.duplicatesDetected.push(`Duplicate offer tuple: ${tupleKey}`);
            continue;
          }
          seenOfferTuples.add(tupleKey);

          const targetOfferId = offerIdByTuple.get(tupleKey) || offerId;
          offerIdByTuple.set(tupleKey, targetOfferId);

          // Guarantee seller foreign key when referencing seller outside fixture catalog
          if (!syncResult.sellerIdMap.has(o.sellerId)) {
            await client.query(
              `INSERT INTO sellers (id, name, slug, email, tier, status, is_verified)
               VALUES ($1, $2, $3, $4, 'standard', 'approved', true)
               ON CONFLICT DO NOTHING;`,
              [resolvedSellerId, resolvedSellerId, resolvedSellerId, `${resolvedSellerId}@aureon.market`]
            );
          }

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
            targetOfferId,
            resolvedProductId,
            resolvedSellerId,
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
