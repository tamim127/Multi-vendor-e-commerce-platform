import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from '@/domains/catalog/fixtures';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    if (!query) {
      return NextResponse.json({
        success: true,
        data: {
          trendingSearches: [
            'Wireless Headphones',
            'MacBook Air M3',
            'Smart Watches',
            'Nike Air Zoom',
            'Mechanical Keyboards',
            '4K Gaming Monitors',
          ],
          products: [],
          categories: [],
          brands: [],
        },
      });
    }

    // Matching products (top 6)
    const matchingProducts = MOCK_PRODUCTS.filter((p) =>
      p.title.en.toLowerCase().includes(query) ||
      p.description.en.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
    ).slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title.en,
      slug: p.slug,
      thumbnail: p.media[0]?.url || '',
      price: p.offerSummary.lowestPrice,
      rating: p.ratingSummary?.average ?? 0,
      brand: p.brand.name,
    }));

    // Matching categories (top 4)
    const matchingCategories = MOCK_CATEGORIES.filter((c) =>
      c.name.en.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query)
    ).slice(0, 4).map((c) => ({
      id: c.id,
      name: c.name.en,
      slug: c.slug,
    }));

    // Matching brands (top 4)
    const matchingBrands = MOCK_BRANDS.filter((b) =>
      b.name.toLowerCase().includes(query) ||
      b.slug.toLowerCase().includes(query)
    ).slice(0, 4).map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    }));

    return NextResponse.json({
      success: true,
      data: {
        query,
        products: matchingProducts,
        categories: matchingCategories,
        brands: matchingBrands,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Search suggestion lookup failed', details: message },
      { status: 500 }
    );
  }
}
