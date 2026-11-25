import { NextResponse } from 'next/server';
import { searchCatalogSuggestions } from '@/server/catalog/catalog-service';
import { apiSuccess, handleApiError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const data = await searchCatalogSuggestions(query);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/catalog/search');
  }
}
