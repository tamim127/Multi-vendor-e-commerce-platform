import type pg from 'pg';
import type { Product } from '@/domains/catalog/types/product';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
import type { CatalogDiscoveryResult, CatalogDiscoveryFacetItem } from '@/features/catalog-discovery/repository';
import { dbQuery, getDbPool } from '@/server/db/client';
import { mapRowToBrand, mapRowToCategory, mapRowToOffer, mapRowToProduct } from '@/server/dataloaders';
import { buildCategoryTree } from '@/domains/catalog/utils/tree';
import { createMoney } from '@/domains/catalog/utils/money';
import { DatabaseUnavailableError } from '@/server/security/http';

/**
 * Resolves PostgreSQL catalog queries authoritatively.
 * Fails closed when PostgreSQL is unavailable (never silently falls back to mock arrays).
 */
export async function queryRealCatalog(
  params: CatalogQueryParams = {},
  pool?: pg.Pool
): Promise<CatalogDiscoveryResult> {
  const targetPool = pool || getDbPool();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 24));
  const query = (params.query || '').trim();
  const categorySlug = params.categorySlug?.toLowerCase();
  const brandSlugs = params.brandSlugs?.map((b) => b.toLowerCase()).filter(Boolean);
  const minPriceMinor = params.minPriceMinor;
  const maxPriceMinor = params.maxPriceMinor;
  const minRating = params.minRating;
  const inStockOnly = params.inventoryStates?.includes('in_stock');
  const sort: CatalogSortOption = params.sort || 'relevance';

  const conditions: string[] = [`p.is_active = true`, `p.moderation_status = 'approved'`];
  const values: any[] = [];
  let paramIndex = 1;

  if (query) {
    conditions.push(
      `(p.title_en ILIKE $${paramIndex} OR p.description_en ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex} OR $${paramIndex + 1} = ANY(p.tags))`
    );
    values.push(`%${query}%`, query.toLowerCase());
    paramIndex += 2;
  }

  if (categorySlug) {
    // Support parent category matching all descendant categories via recursive CTE
    conditions.push(
      `p.category_id IN (
        WITH RECURSIVE cat_tree AS (
          SELECT id FROM categories WHERE LOWER(slug) = $${paramIndex}
          UNION ALL
          SELECT c.id FROM categories c JOIN cat_tree ct ON c.parent_id = ct.id
        )
        SELECT id FROM cat_tree
      )`
    );
    values.push(categorySlug);
    paramIndex += 1;
  }

  if (brandSlugs && brandSlugs.length > 0) {
    conditions.push(`LOWER(b.slug) = ANY($${paramIndex})`);
    values.push(brandSlugs);
    paramIndex += 1;
  }

  if (minRating !== undefined && Number.isFinite(minRating)) {
    conditions.push(`p.rating_avg >= $${paramIndex}`);
    values.push(minRating);
    paramIndex += 1;
  }

  if (minPriceMinor !== undefined && Number.isFinite(minPriceMinor)) {
    conditions.push(`o.price_minor >= $${paramIndex}`);
    values.push(minPriceMinor);
    paramIndex += 1;
  }

  if (maxPriceMinor !== undefined && Number.isFinite(maxPriceMinor)) {
    conditions.push(`o.price_minor <= $${paramIndex}`);
    values.push(maxPriceMinor);
    paramIndex += 1;
  }

  if (inStockOnly) {
    conditions.push(`(o.stock_quantity - COALESCE(o.reserved_quantity, 0)) > 0`);
  }

  let orderBy = 'p.rating_avg DESC, p.rating_count DESC, p.id ASC';
  switch (sort) {
    case 'price_asc':
      orderBy = 'o.price_minor ASC NULLS LAST, p.id ASC';
      break;
    case 'price_desc':
      orderBy = 'o.price_minor DESC NULLS LAST, p.id ASC';
      break;
    case 'rating_desc':
      orderBy = 'p.rating_avg DESC, p.rating_count DESC, p.id ASC';
      break;
    case 'bestselling':
      orderBy = 'p.rating_count DESC, p.id ASC';
      break;
    case 'discount_desc':
      orderBy = 'COALESCE(o.compare_at_price_minor - o.price_minor, 0) DESC, p.rating_avg DESC';
      break;
    case 'newest':
      orderBy = 'p.created_at DESC, p.id ASC';
      break;
    case 'relevance':
    default:
      orderBy = 'p.rating_avg DESC, p.rating_count DESC, p.id ASC';
      break;
  }

  const whereClause = conditions.join(' AND ');
  const lateralOfferJoin = `
    LEFT JOIN LATERAL (
      SELECT id, price_minor, compare_at_price_minor, currency, is_buy_box_winner, stock_quantity, reserved_quantity
      FROM seller_offers
      WHERE product_id = p.id
      ORDER BY is_buy_box_winner DESC, price_minor ASC
      LIMIT 1
    ) o ON true
  `;

  try {
    const countSql = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${lateralOfferJoin}
      WHERE ${whereClause};
    `;
    const countRes = await dbQuery<{ total: string }>(countSql, values, targetPool);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT
        p.*,
        b.name AS brand_name,
        b.slug AS brand_slug,
        o.price_minor AS lowest_price_minor,
        o.compare_at_price_minor AS compare_at_price_minor,
        o.currency AS offer_currency,
        o.is_buy_box_winner,
        o.id AS buy_box_offer_id
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${lateralOfferJoin}
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    const dataRes = await dbQuery<any>(dataSql, [...values, limit, offset], targetPool);

    const products: Product[] = dataRes.rows.map((row) => {
      const prod = mapRowToProduct(row);
      if (row.lowest_price_minor !== null && row.lowest_price_minor !== undefined) {
        const currency = (row.offer_currency || 'USD') as any;
        prod.offerSummary = {
          offerCount: 1,
          lowestPrice: createMoney(Number(row.lowest_price_minor), currency),
          highestPrice: createMoney(Number(row.lowest_price_minor), currency),
          buyBoxOfferId: row.buy_box_offer_id,
          hasMultipleOffers: false,
        };
      }
      return prod;
    });

    // Real SQL Facet Counts from PostgreSQL
    const [catFacetRes, brandFacetRes, inStockRes] = await Promise.all([
      dbQuery<any>(
        `SELECT c.id, c.slug, c.name_en, COUNT(p.id) AS cnt
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
         WHERE c.is_active = true
         GROUP BY c.id, c.slug, c.name_en
         ORDER BY cnt DESC, c.name_en ASC
         LIMIT 20;`,
        [],
        targetPool
      ),
      dbQuery<any>(
        `SELECT b.id, b.slug, b.name, COUNT(p.id) AS cnt
         FROM brands b
         LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = true
         GROUP BY b.id, b.slug, b.name
         ORDER BY cnt DESC, b.name ASC
         LIMIT 20;`,
        [],
        targetPool
      ),
      dbQuery<{ cnt: string }>(
        `SELECT COUNT(DISTINCT so.product_id) AS cnt
         FROM seller_offers so
         JOIN products p ON p.id = so.product_id
         WHERE p.is_active = true AND (so.stock_quantity - COALESCE(so.reserved_quantity, 0)) > 0;`,
        [],
        targetPool
      ),
    ]);

    const categoryFacets: CatalogDiscoveryFacetItem[] = catFacetRes.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      label: r.name_en,
      count: parseInt(r.cnt || '0', 10),
    }));

    const brandFacets: CatalogDiscoveryFacetItem[] = brandFacetRes.rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      label: r.name,
      count: parseInt(r.cnt || '0', 10),
    }));

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      facets: {
        categories: categoryFacets,
        brands: brandFacets,
        inStockCount: parseInt(inStockRes.rows[0]?.cnt || '0', 10),
      },
    };
  } catch (err) {
    throw new DatabaseUnavailableError(
      err instanceof Error ? `Catalog query failed: ${err.message}` : 'Catalog database query failed'
    );
  }
}

/**
 * Retrieves a single product by ID or Slug with verified seller offers, reviews, and related items from PostgreSQL.
 */
export async function getRealProductDetail(
  identifier: string,
  pool?: pg.Pool
): Promise<{
  product: Product;
  offers: any[];
  relatedProducts: Product[];
  reviews: any[];
  qaList: any[];
} | null> {
  const targetPool = pool || getDbPool();
  const clean = decodeURIComponent(identifier).trim();

  const prodRes = await dbQuery<any>(
    `SELECT p.*, b.name AS brand_name, b.slug AS brand_slug,
            c.slug AS cat_slug, c.name_en AS cat_name
     FROM products p
     LEFT JOIN brands b ON p.brand_id = b.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE LOWER(p.id) = LOWER($1) OR LOWER(p.slug) = LOWER($1)
     LIMIT 1;`,
    [clean],
    targetPool
  );

  if (prodRes.rows.length === 0) return null;

  const row = prodRes.rows[0];
  const product = mapRowToProduct(row);

  const [offersRes, relatedRes, reviewsRes] = await Promise.all([
    dbQuery<any>(
      `SELECT so.*, s.name AS seller_name, s.slug AS seller_slug, s.is_verified AS seller_verified,
              s.rating_avg AS seller_rating_avg, s.rating_count AS seller_rating_count,
              s.positive_feedback_pct AS seller_positive_pct
       FROM seller_offers so
       JOIN sellers s ON s.id = so.seller_id
       WHERE so.product_id = $1
       ORDER BY so.is_buy_box_winner DESC, so.price_minor ASC;`,
      [product.id],
      targetPool
    ),
    dbQuery<any>(
      `SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id != $1 AND p.is_active = true AND (p.category_id = $2 OR p.brand_id = $3)
       LIMIT 4;`,
      [product.id, product.categoryId, product.brand.id],
      targetPool
    ),
    dbQuery<any>(
      `SELECT * FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 20;`,
      [product.id],
      targetPool
    ),
  ]);

  const offers = offersRes.rows.map((o) => {
    const mapped = mapRowToOffer(o);
    mapped.seller = {
      id: o.seller_id,
      name: o.seller_name || o.seller_id,
      slug: o.seller_slug || o.seller_id,
      isVerified: Boolean(o.seller_verified),
      rating: {
        average: Number(o.seller_rating_avg) || 4.8,
        count: Number(o.seller_rating_count) || 0,
        positiveFeedbackPercent: Number(o.seller_positive_pct) || 98,
      },
      badges: Boolean(o.seller_verified) ? ['authorized_dealer'] : [],
    };
    return mapped;
  });

  if (offers.length > 0) {
    const prices = offers.map((o) => o.price.amountMinor);
    const currency = offers[0]!.price.currency;
    product.offerSummary = {
      offerCount: offers.length,
      lowestPrice: createMoney(Math.min(...prices), currency),
      highestPrice: createMoney(Math.max(...prices), currency),
      buyBoxOfferId: offers.find((o) => o.isBuyBoxWinner)?.offerId ?? offers[0]!.offerId,
      hasMultipleOffers: offers.length > 1,
    };
  }

  return {
    product,
    offers,
    relatedProducts: relatedRes.rows.map(mapRowToProduct),
    reviews: reviewsRes.rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      authorName: r.customer_name,
      rating: Number(r.rating),
      title: r.title,
      content: r.comment,
      isVerifiedPurchase: Boolean(r.is_verified_purchase),
      helpfulCount: Number(r.helpful_count),
      createdAt: new Date(r.created_at).toISOString(),
    })),
    qaList: [],
  };
}

/**
 * Lists all brands directly from PostgreSQL with real active product counts.
 */
export async function listCatalogBrands(query?: string, pool?: pg.Pool): Promise<Array<Record<string, any>>> {
  const targetPool = pool || getDbPool();
  const clean = (query || '').trim().toLowerCase();
  const res = await dbQuery<any>(
    `SELECT b.*, COUNT(p.id) AS product_count
     FROM brands b
     LEFT JOIN products p ON p.brand_id = b.id AND p.is_active = true
     ${clean ? 'WHERE LOWER(b.name) LIKE $1 OR LOWER(b.slug) LIKE $1' : ''}
     GROUP BY b.id
     ORDER BY product_count DESC, b.name ASC;`,
    clean ? [`%${clean}%`] : [],
    targetPool
  );

  return res.rows.map((r) => ({
    ...mapRowToBrand(r),
    isVerified: Boolean(r.is_verified),
    productCount: parseInt(r.product_count || '0', 10),
  }));
}

/**
 * Lists hierarchical categories directly from PostgreSQL.
 */
export async function listCatalogCategories(
  options: { asTree?: boolean; parentId?: string | null } = {},
  pool?: pg.Pool
): Promise<{ data: any[]; total: number }> {
  const targetPool = pool || getDbPool();
  const res = await dbQuery<any>(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
     WHERE c.is_active = true
     GROUP BY c.id
     ORDER BY c.level ASC, c.sort_order ASC, c.name_en ASC;`,
    [],
    targetPool
  );

  let categories = res.rows.map((r) => ({
    ...mapRowToCategory(r),
    productCount: parseInt(r.product_count || '0', 10),
  }));

  if (options.parentId !== undefined) {
    categories = categories.filter((c) => c.parentId === options.parentId);
    return { data: categories, total: categories.length };
  }

  return {
    data: options.asTree !== false ? buildCategoryTree(categories) : categories,
    total: categories.length,
  };
}

/**
 * Search suggestions backed directly by PostgreSQL.
 */
export async function searchCatalogSuggestions(
  query: string,
  pool?: pg.Pool
): Promise<{
  query?: string;
  trendingSearches?: string[];
  products: any[];
  categories: any[];
  brands: any[];
}> {
  const targetPool = pool || getDbPool();
  const clean = query.trim();

  if (!clean) {
    return {
      trendingSearches: [
        'MacBook Pro',
        'Wireless Headphones',
        'Gaming Monitor',
        'Mechanical Keyboard',
        'Smart Watch',
      ],
      products: [],
      categories: [],
      brands: [],
    };
  }

  const pattern = `%${clean}%`;
  const [prodRes, catRes, brandRes] = await Promise.all([
    dbQuery<any>(
      `SELECT p.id, p.title_en, p.slug, p.primary_image_url, p.rating_avg, b.name AS brand_name,
              o.price_minor, o.currency
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN LATERAL (
         SELECT price_minor, currency FROM seller_offers WHERE product_id = p.id ORDER BY price_minor ASC LIMIT 1
       ) o ON true
       WHERE p.is_active = true AND (p.title_en ILIKE $1 OR p.description_en ILIKE $1 OR $2 = ANY(p.tags))
       ORDER BY p.rating_avg DESC
       LIMIT 6;`,
      [pattern, clean.toLowerCase()],
      targetPool
    ),
    dbQuery<any>(
      `SELECT id, name_en, slug FROM categories WHERE is_active = true AND (name_en ILIKE $1 OR slug ILIKE $1) LIMIT 4;`,
      [pattern],
      targetPool
    ),
    dbQuery<any>(
      `SELECT id, name, slug FROM brands WHERE name ILIKE $1 OR slug ILIKE $1 LIMIT 4;`,
      [pattern],
      targetPool
    ),
  ]);

  return {
    query: clean,
    products: prodRes.rows.map((p) => ({
      id: p.id,
      title: p.title_en,
      slug: p.slug,
      thumbnail: p.primary_image_url || '',
      price: createMoney(Number(p.price_minor || 0), (p.currency || 'USD') as any),
      rating: Number(p.rating_avg || 0),
      brand: p.brand_name || '',
    })),
    categories: catRes.rows.map((c) => ({ id: c.id, name: c.name_en, slug: c.slug })),
    brands: brandRes.rows.map((b) => ({ id: b.id, name: b.name, slug: b.slug })),
  };
}
