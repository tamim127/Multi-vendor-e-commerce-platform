import { NextResponse } from 'next/server';
import { getCatalogProducts } from '@/features/catalog-discovery/repository';
import type { CatalogQueryParams, CatalogSortOption } from '@/domains/catalog/types/query';
import type { CurrencyCode } from '@/domains/catalog/types/pricing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
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

    const result = await getCatalogProducts(query);

    return NextResponse.json({
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch catalog products', details: message },
      { status: 500 }
    );
  }
}
