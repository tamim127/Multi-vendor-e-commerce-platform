import { NextResponse } from 'next/server';
import { getRealProductDetail } from '@/server/catalog/catalog-service';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { handleApiError, NotFoundError } from '@/server/security/http';

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
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Too Many Requests', retryAfter: rate.resetSeconds },
        { status: 429 }
      )
    );
  }

  try {
    const { id } = await context.params;
    const detail = await getRealProductDetail(id);

    if (!detail) {
      throw new NotFoundError(`Product not found with identifier: ${id}`);
    }

    const response = NextResponse.json({
      success: true,
      data: detail,
    });

    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return applySecurityHeaders(response);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/catalog/products/[id]');
  }
}
