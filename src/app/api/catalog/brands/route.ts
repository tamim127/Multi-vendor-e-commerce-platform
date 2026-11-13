import { NextResponse } from 'next/server';
import { MOCK_BRANDS, MOCK_PRODUCTS } from '@/domains/catalog/fixtures';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').toLowerCase().trim();

    let brands = [...MOCK_BRANDS];

    if (query) {
      brands = brands.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query)
      );
    }

    // Attach verified flag and product count
    const data = brands.map((brand) => {
      const productCount = MOCK_PRODUCTS.filter((p) => p.brand.id === brand.id).length;
      return {
        ...brand,
        isVerified: true,
        productCount,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      total: data.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands', details: message },
      { status: 500 }
    );
  }
}

