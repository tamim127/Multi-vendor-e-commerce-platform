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
import type { Product } from '@/domains/catalog/types/product';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
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
 * Deterministic query execution for product listing.
 */
export async function getCatalogProducts(
  params?: CatalogQueryParams
): Promise<CatalogDiscoveryResult> {
  const query = params ?? {};
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, query.limit ?? 12);

  let filtered = [...MOCK_PRODUCTS];

  // 1. Text Query (basic substring match for fixture search)
  if (query.query && query.query.trim().length > 0) {
    const q = query.query.trim().toLowerCase();
    filtered = filtered.filter((p) => {
      const title = p.title.en.toLowerCase();
      const brandName = p.brand.name.toLowerCase();
      const tagsMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      return title.includes(q) || brandName.includes(q) || tagsMatch;
    });
  }

  // 2. Category Filter (supports recursive descendant matching)
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
    }
  }

  // 3. Brand Filter
  if (query.brandSlugs && query.brandSlugs.length > 0) {
    const allowedBrands = new Set(query.brandSlugs);
    filtered = filtered.filter((p) => allowedBrands.has(p.brand.slug));
  }

  // 4. Price Filter (using non-authoritative lowestPrice minor units)
  if (typeof query.minPriceMinor === 'number') {
    filtered = filtered.filter(
      (p) => p.offerSummary.lowestPrice.amountMinor >= query.minPriceMinor!
    );
  }
  if (typeof query.maxPriceMinor === 'number') {
    filtered = filtered.filter(
      (p) => p.offerSummary.lowestPrice.amountMinor <= query.maxPriceMinor!
    );
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
  const sort: CatalogSortOption = query.sort ?? 'newest';
  switch (sort) {
    case 'price_asc':
      filtered.sort(
        (a, b) => a.offerSummary.lowestPrice.amountMinor - b.offerSummary.lowestPrice.amountMinor
      );
      break;
    case 'price_desc':
      filtered.sort(
        (a, b) => b.offerSummary.lowestPrice.amountMinor - a.offerSummary.lowestPrice.amountMinor
      );
      break;
    case 'rating_desc':
      filtered.sort((a, b) => b.ratingSummary.average - a.ratingSummary.average);
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'relevance':
    default:
      // Deterministic fallback: preserve stable order by rating and review count
      filtered.sort((a, b) => b.ratingSummary.average - a.ratingSummary.average);
      break;
  }

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
    (c) => c.level <= 1 // Top and second-level categories for clean sidebar presentation
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
