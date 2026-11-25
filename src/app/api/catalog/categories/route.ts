import { NextResponse } from 'next/server';
import { listCatalogCategories } from '@/server/catalog/catalog-service';
import { handleApiError } from '@/server/security/http';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const asTree = searchParams.get('tree') !== 'false';
    const parentIdParam = searchParams.get('parentId');
    const parentId =
      parentIdParam === null ? undefined : parentIdParam === 'null' ? null : parentIdParam;

    const result = await listCatalogCategories({ asTree, parentId });

    return applySecurityHeaders(
      NextResponse.json({
        success: true,
        data: result.data,
        total: result.total,
      })
    );
  } catch (error) {
    return handleApiError(request, error, 'GET /api/catalog/categories');
  }
}
