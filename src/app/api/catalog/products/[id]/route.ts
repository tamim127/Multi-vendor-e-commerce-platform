import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/features/product-detail/repository';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Check by slug first
    let result = await getProductBySlug(id);

    // If not found by slug, search by product ID
    if (!result) {
      const productById = MOCK_PRODUCTS.find((p) => p.id === id);
      if (productById) {
        result = await getProductBySlug(productById.slug);
      }
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve product details', details: message },
      { status: 500 }
    );
  }
}
