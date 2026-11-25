import { NextResponse } from 'next/server';
import { listCatalogBrands } from '@/server/catalog/catalog-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const data = await listCatalogBrands(query);
    return apiSuccess(data, { meta: { total: data.length } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/catalog/brands');
  }
}
