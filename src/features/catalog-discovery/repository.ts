/**
 * ==============================================================================
 * CATALOG DISCOVERY FEATURE — REPOSITORY ADAPTER
 * ==============================================================================
 * Deterministic fixture-backed repository adapter for product catalog discovery.
 * Implements filtering, sorting, pagination, and presentation facet counts.
 * NOTE: Non-authoritative development/demo repository. Production connects to backend API.
 */

import {
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_SELLER_OFFERS,
} from '@/domains/catalog/fixtures';
import type { CurrencyCode } from '@/domains/catalog/types/pricing';
import type { Product } from '@/domains/catalog/types/product';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
import { normalizeSearchToken } from '@/domains/catalog/utils/localization';
import {
  calculateDiscount,
  isValidMoney,
  SUPPORTED_CURRENCY_CODES,
} from '@/domains/catalog/utils/money';
import { getCategoryDescendants } from '@/domains/catalog/utils/tree';

export interface CatalogDiscoveryFacetItem {
  id: string;
  slug: string;
  label: string;
  count: number;
}

export interface CatalogDiscoveryFacets {
  categories: CatalogDiscoveryFacetItem[];
  brands: CatalogDiscoveryFacetItem[];
  inStockCount: number;
}

export interface CatalogDiscoveryResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: CatalogDiscoveryFacets;
}

/**
 * Checks if a product currently has at least one active in-stock seller offer.
 */
function isProductInStock(productId: string): boolean {
  return MOCK_SELLER_OFFERS.some(
    (offer) =>
      offer.productId === productId &&
      offer.inventory.state === 'in_stock' &&
      (offer.inventory.quantityAvailable ?? 0) > 0
  );
}

/**
 * Checks if a product has the 'best_seller' badge.
 */
function hasBestSellerBadge(product: Product): boolean {
  return (product.badges ?? []).some((b) => b.type === 'best_seller');
}

/**
 * Calculates the maximum qualifying discount percentage for a product in the given currency.
 * Evaluates active purchasable seller offers with valid Money values.
 */
export function getProductMaxDiscount(
  product: Product,
  authoritativeCurrency: CurrencyCode
): number {
  let maxDiscount = 0;

  for (const offer of MOCK_SELLER_OFFERS) {
    if (offer.productId !== product.id) continue;
    if (!offer.price || offer.price.currency !== authoritativeCurrency) continue;
    if (!offer.compareAtPrice || offer.compareAtPrice.currency !== authoritativeCurrency) continue;

    if (!isValidMoney(offer.price) || !isValidMoney(offer.compareAtPrice)) continue;

    const isPurchasable =
      offer.inventory.state === 'in_stock' ||
      (offer.inventory.state === 'low_stock' && (offer.inventory.quantityAvailable ?? 0) > 0) ||
      (offer.inventory.state === 'backorder' && Boolean(offer.inventory.allowsBackorder));
    if (!isPurchasable) continue;

    if (
      offer.compareAtPrice.amountMinor <= offer.price.amountMinor ||
      offer.price.amountMinor <= 0
    ) {
      continue;
    }

    try {
      const discount = calculateDiscount(offer.compareAtPrice, offer.price);
      if (discount.value > maxDiscount) {
        maxDiscount = discount.value;
      }
    } catch {
      continue;
    }
  }

  return maxDiscount;
}

/**
 * Computes deterministic relevance score for search results.
 */
function computeRelevanceScore(
  product: Product,
  queryTokens: string[],
  normalizedQuery: string
): number {
  let score = 0;
  const titles = Object.values(product.title)
    .filter((t): t is string => typeof t === 'string')
    .map((t) => normalizeSearchToken(t));
  const shortDescriptions = product.shortDescription
    ? Object.values(product.shortDescription)
        .filter((t): t is string => typeof t === 'string')
        .map((t) => normalizeSearchToken(t))
    : [];
  const brandName = normalizeSearchToken(product.brand.name);
  const tags = product.tags.map((t) => normalizeSearchToken(t));
  const skus = (product.variants ?? []).map((v) => normalizeSearchToken(v.sku));
  const categoryNames = (product.categoryBreadcrumbs ?? []).flatMap((c) =>
    Object.values(c.name)
      .filter((n): n is string => typeof n === 'string')
      .map((n) => normalizeSearchToken(n))
  );

  // Exact match of full query in title
  if (titles.some((t) => t === normalizedQuery)) {
    score += 50;
  } else if (titles.some((t) => t.startsWith(normalizedQuery))) {
    score += 30;
  } else if (titles.some((t) => t.includes(normalizedQuery))) {
    score += 20;
  }

  // Exact match of full query in brand
  if (brandName === normalizedQuery) {
    score += 25;
  }

  // Token level scoring
  for (const token of queryTokens) {
    if (titles.some((t) => t.includes(token))) {
      score += 10;
    }
    if (shortDescriptions.some((d) => d.includes(token))) {
      score += 6;
    }
    if (brandName.includes(token)) {
      score += 8;
    }
    if (tags.some((t) => t.includes(token))) {
      score += 5;
    }
    if (skus.some((s) => s.includes(token))) {
      score += 5;
    }
    if (categoryNames.some((c) => c.includes(token))) {
      score += 3;
    }
  }

  return score;
}

/**
 * Deterministic query execution for product listing.
 */
export async function getCatalogProducts(
  params?: CatalogQueryParams
): Promise<CatalogDiscoveryResult> {
  const query = params ?? {};
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 12);

  const authCurrency: CurrencyCode =
    query.currency && (SUPPORTED_CURRENCY_CODES as readonly string[]).includes(query.currency)
      ? query.currency
      : 'USD';

  let filtered = [...MOCK_PRODUCTS];

  // 1. Text Query (Stage 1 AND token eligibility)
  let normalizedQuery = '';
  let queryTokens: string[] = [];
  const hasQuery = typeof query.query === 'string' && query.query.trim().length > 0;

  if (hasQuery) {
    normalizedQuery = normalizeSearchToken(query.query!);
    queryTokens = query
      .query!.trim()
      .split(/\s+/)
      .map((t) => normalizeSearchToken(t))
      .filter((t) => t.length > 0);

    if (queryTokens.length > 0) {
      filtered = filtered.filter((p) => {
        const titles = Object.values(p.title)
          .filter((t): t is string => typeof t === 'string')
          .map((t) => normalizeSearchToken(t));
        const shortDescriptions = p.shortDescription
          ? Object.values(p.shortDescription)
              .filter((t): t is string => typeof t === 'string')
              .map((t) => normalizeSearchToken(t))
          : [];
        const brandName = normalizeSearchToken(p.brand.name);
        const tags = p.tags.map((t) => normalizeSearchToken(t));
        const skus = (p.variants ?? []).map((v) => normalizeSearchToken(v.sku));
        const categoryNames = (p.categoryBreadcrumbs ?? []).flatMap((c) =>
          Object.values(c.name)
            .filter((n): n is string => typeof n === 'string')
            .map((n) => normalizeSearchToken(n))
        );

        // Every token must match at least one searchable field
        return queryTokens.every(
          (tok) =>
            titles.some((t) => t.includes(tok)) ||
            shortDescriptions.some((d) => d.includes(tok)) ||
            brandName.includes(tok) ||
            tags.some((t) => t.includes(tok)) ||
            skus.some((s) => s.includes(tok)) ||
            categoryNames.some((c) => c.includes(tok))
        );
      });
    }
  }

  // 2. Category Filter (supports recursive descendant matching with fail-closed semantics)
  if (query.categorySlug || query.categoryId || query.categoryPath) {
    const category = MOCK_CATEGORIES.find(
      (c) =>
        (query.categorySlug && c.slug === query.categorySlug) ||
        (query.categoryId && c.id === query.categoryId) ||
        (query.categoryPath && c.path === query.categoryPath)
    );

    if (category) {
      const descendants = getCategoryDescendants(category.id, MOCK_CATEGORIES);
      const allowedCategoryIds = new Set<string>([category.id, ...descendants.map((d) => d.id)]);
      filtered = filtered.filter((p) => allowedCategoryIds.has(p.categoryId));
    } else {
      // Fail-closed: non-existent category yields 0 products
      filtered = [];
    }
  }

  // 3. Brand Filter
  if (query.brandSlugs && query.brandSlugs.length > 0) {
    const allowedBrands = new Set(query.brandSlugs);
    filtered = filtered.filter((p) => allowedBrands.has(p.brand.slug));
  }

  // 4. Price Filter (Strict integer minor units in authoritative currency)
  const hasMin = typeof query.minPriceMinor === 'number';
  const hasMax = typeof query.maxPriceMinor === 'number';

  if (hasMin && hasMax && query.minPriceMinor! > query.maxPriceMinor!) {
    // Inverted bounds yield 0 products
    filtered = [];
  } else {
    if (hasMin) {
      filtered = filtered.filter(
        (p) =>
          isValidMoney(p.offerSummary?.lowestPrice) &&
          p.offerSummary.lowestPrice.currency === authCurrency &&
          p.offerSummary.lowestPrice.amountMinor >= query.minPriceMinor!
      );
    }
    if (hasMax) {
      filtered = filtered.filter(
        (p) =>
          isValidMoney(p.offerSummary?.lowestPrice) &&
          p.offerSummary.lowestPrice.currency === authCurrency &&
          p.offerSummary.lowestPrice.amountMinor <= query.maxPriceMinor!
      );
    }
  }

  // 5. Rating Filter
  if (typeof query.minRating === 'number' && query.minRating > 0) {
    filtered = filtered.filter((p) => p.ratingSummary.average >= query.minRating!);
  }

  // 6. Availability / Inventory Filter
  if (query.inventoryStates && query.inventoryStates.includes('in_stock')) {
    filtered = filtered.filter((p) => isProductInStock(p.id));
  }

  // 7. Deterministic Sorting
  // Default to 'relevance' when query is present and sort is omitted; otherwise 'newest'
  const sort: CatalogSortOption = query.sort ?? (hasQuery ? 'relevance' : 'newest');

  // Pre-calculate relevance scores if sorting by relevance
  const relevanceScores = new Map<string, number>();
  if (sort === 'relevance') {
    for (const p of filtered) {
      relevanceScores.set(p.id, computeRelevanceScore(p, queryTokens, normalizedQuery));
    }
  }

  // Pre-calculate discount percentages if sorting by discount_desc
  const discountValues = new Map<string, number>();
  if (sort === 'discount_desc') {
    for (const p of filtered) {
      discountValues.set(p.id, getProductMaxDiscount(p, authCurrency));
    }
  }

  filtered.sort((a, b) => {
    switch (sort) {
      case 'relevance': {
        const scoreA = relevanceScores.get(a.id) ?? 0;
        const scoreB = relevanceScores.get(b.id) ?? 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
        if (countDiff !== 0) return countDiff;
        return a.id.localeCompare(b.id);
      }

      case 'price_asc': {
        const validA =
          isValidMoney(a.offerSummary?.lowestPrice) &&
          a.offerSummary.lowestPrice.currency === authCurrency;
        const validB =
          isValidMoney(b.offerSummary?.lowestPrice) &&
          b.offerSummary.lowestPrice.currency === authCurrency;

        if (validA && validB) {
          const diff =
            a.offerSummary.lowestPrice.amountMinor - b.offerSummary.lowestPrice.amountMinor;
          if (diff !== 0) return diff;
          const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
          if (countDiff !== 0) return countDiff;
          return a.id.localeCompare(b.id);
        }
        if (validA && !validB) return -1;
        if (!validA && validB) return 1;
        return a.id.localeCompare(b.id);
      }

      case 'price_desc': {
        const validA =
          isValidMoney(a.offerSummary?.lowestPrice) &&
          a.offerSummary.lowestPrice.currency === authCurrency;
        const validB =
          isValidMoney(b.offerSummary?.lowestPrice) &&
          b.offerSummary.lowestPrice.currency === authCurrency;

        if (validA && validB) {
          const diff =
            b.offerSummary.lowestPrice.amountMinor - a.offerSummary.lowestPrice.amountMinor;
          if (diff !== 0) return diff;
          const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
          if (ratingDiff !== 0) return ratingDiff;
          const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
          if (countDiff !== 0) return countDiff;
          return a.id.localeCompare(b.id);
        }
        if (validA && !validB) return -1;
        if (!validA && validB) return 1;
        return a.id.localeCompare(b.id);
      }

      case 'rating_desc': {
        const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
        if (countDiff !== 0) return countDiff;
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.id.localeCompare(b.id);
      }

      case 'bestselling': {
        const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
        if (countDiff !== 0) return countDiff;
        const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        if (reviewDiff !== 0) return reviewDiff;
        const aBest = hasBestSellerBadge(a);
        const bBest = hasBestSellerBadge(b);
        const badgeDiff = (bBest ? 1 : 0) - (aBest ? 1 : 0);
        if (badgeDiff !== 0) return badgeDiff;
        return a.id.localeCompare(b.id);
      }

      case 'discount_desc': {
        const discA = discountValues.get(a.id) ?? 0;
        const discB = discountValues.get(b.id) ?? 0;
        if (discB !== discA) return discB - discA;

        // Secondary tie-breaker: compare lowest price ONLY if both are valid in authCurrency
        const validPriceA =
          isValidMoney(a.offerSummary?.lowestPrice) &&
          a.offerSummary.lowestPrice.currency === authCurrency;
        const validPriceB =
          isValidMoney(b.offerSummary?.lowestPrice) &&
          b.offerSummary.lowestPrice.currency === authCurrency;

        if (validPriceA && validPriceB) {
          const priceDiff =
            a.offerSummary.lowestPrice.amountMinor - b.offerSummary.lowestPrice.amountMinor;
          if (priceDiff !== 0) return priceDiff;
        }

        const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
        if (countDiff !== 0) return countDiff;
        return a.id.localeCompare(b.id);
      }

      case 'newest':
      default: {
        const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateDiff !== 0) return dateDiff;
        const ratingDiff = (b.ratingSummary?.average ?? 0) - (a.ratingSummary?.average ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        const countDiff = (b.ratingSummary?.count ?? 0) - (a.ratingSummary?.count ?? 0);
        if (countDiff !== 0) return countDiff;
        return a.id.localeCompare(b.id);
      }
    }
  });

  // 8. Pagination Slicing
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

  // 9. Simple Deterministic Facet Counts (Presentation-only fixture metadata)
  const categoryCounts = new Map<string, number>();
  for (const cat of MOCK_CATEGORIES) {
    const descendants = getCategoryDescendants(cat.id, MOCK_CATEGORIES);
    const ids = new Set([cat.id, ...descendants.map((d) => d.id)]);
    const count = MOCK_PRODUCTS.filter((p) => ids.has(p.categoryId)).length;
    categoryCounts.set(cat.id, count);
  }

  const brandCounts = new Map<string, number>();
  for (const brand of MOCK_BRANDS) {
    const count = MOCK_PRODUCTS.filter((p) => p.brand.id === brand.id).length;
    brandCounts.set(brand.slug, count);
  }

  const categoryFacets: CatalogDiscoveryFacetItem[] = MOCK_CATEGORIES.filter(
    (c) => c.level <= 1
  ).map((c) => ({
    id: c.id,
    slug: c.slug,
    label: c.name.en,
    count: categoryCounts.get(c.id) ?? 0,
  }));

  const brandFacets: CatalogDiscoveryFacetItem[] = MOCK_BRANDS.map((b) => ({
    id: b.id,
    slug: b.slug,
    label: b.name,
    count: brandCounts.get(b.slug) ?? 0,
  }));

  const inStockCount = MOCK_PRODUCTS.filter((p) => isProductInStock(p.id)).length;

  return {
    products: paginatedProducts,
    total,
    page,
    limit,
    totalPages,
    facets: {
      categories: categoryFacets,
      brands: brandFacets,
      inStockCount,
    },
  };
}
