import { NextResponse } from 'next/server';
import { queryRealCatalog } from '@/server/catalog/catalog-service';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
import type { CurrencyCode } from '@/domains/catalog/types/pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  // 1. Rate Limiting (120 req / min)
  const rate = checkRateLimit(request, { maxRequests: 120, windowSeconds: 60, prefix: 'catalog_products' });
  if (!rate.isAllowed) {
    const errorResponse = NextResponse.json(
      { success: false, error: 'Too Many Requests', retryAfter: rate.resetSeconds },
      { status: 429 }
    );
    return applySecurityHeaders(errorResponse);
  }

  try {
    const { searchParams } = new URL(request.url);
    const brands = searchParams.getAll('brand');

    const query: CatalogQueryParams = {
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      categorySlug: searchParams.get('category') || undefined,
      brandSlugs: brands.length > 0 ? brands : undefined,
      minPriceMinor: searchParams.get('minPrice') ? Math.round(Number(searchParams.get('minPrice')) * 100) : undefined,
      maxPriceMinor: searchParams.get('maxPrice') ? Math.round(Number(searchParams.get('maxPrice')) * 100) : undefined,
      minRating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      sort: (searchParams.get('sort') as CatalogSortOption) || 'relevance',
      page: searchParams.get('page') ? Math.max(1, parseInt(searchParams.get('page') || '1', 10)) : 1,
      limit: searchParams.get('limit') ? Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10))) : 24,
      currency: (searchParams.get('currency') as CurrencyCode) || 'USD',
    };

    const result = await queryRealCatalog(query);

    const response = NextResponse.json({
      success: true,
      data: result.products,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        facets: result.facets,
      },
    });

    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return applySecurityHeaders(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch catalog products', details: message },
      { status: 500 }
    );
    return applySecurityHeaders(errorResponse);
  }
}
