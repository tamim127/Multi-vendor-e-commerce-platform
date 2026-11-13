import { NextResponse } from 'next/server';
import { getRealProductDetail } from '@/server/catalog/catalog-service';
import { getProductBySlug } from '@/features/product-detail/repository';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const rate = checkRateLimit(request, { maxRequests: 180, windowSeconds: 60, prefix: 'catalog_detail' });
  if (!rate.isAllowed) {
    const errorResponse = NextResponse.json(
      { success: false, error: 'Too Many Requests', retryAfter: rate.resetSeconds },
      { status: 429 }
    );
    return applySecurityHeaders(errorResponse);
  }

  try {
    const { id } = await context.params;

    // First check the 1,000+ real products dataset
    let detail = await getRealProductDetail(id);

    // If not found in 1000 dataset, check core fixtures
    if (!detail) {
      const legacyData = await getProductBySlug(id);
      if (legacyData) {
        detail = {
          product: legacyData.product,
          offers: legacyData.offers as any,
          relatedProducts: legacyData.relatedProducts,
        };
      }
    }

    if (!detail) {
      const notFoundRes = NextResponse.json(
        { success: false, error: `Product not found with identifier: ${id}` },
        { status: 404 }
      );
      return applySecurityHeaders(notFoundRes);
    }

    const response = NextResponse.json({
      success: true,
      data: detail,
    });

    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return applySecurityHeaders(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const errRes = NextResponse.json(
      { success: false, error: 'Failed to retrieve product details', details: message },
      { status: 500 }
    );
    return applySecurityHeaders(errRes);
  }
}
