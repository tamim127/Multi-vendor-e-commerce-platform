import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { moderateProduct } from '@/server/admin/admin-service';
import { dbQuery } from '@/server/db/client';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ModerateProductSchema = z.object({
  productId: z.string().min(2),
  moderationStatus: z.enum(['approved', 'pending_review', 'rejected', 'flagged']),
  reason: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'catalog:read');
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const [rowsRes, countRes] = await Promise.all([
      dbQuery(
        `SELECT p.id, p.slug, p.sku, p.title_en, p.moderation_status, p.moderation_reason,
                p.is_active, p.is_spec_verified, p.source_provenance, p.created_at,
                b.name AS brand_name, c.name_en AS category_name
         FROM products p
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.updated_at DESC
         LIMIT $1 OFFSET $2;`,
        [limit, offset]
      ),
      dbQuery<{ total: string }>('SELECT COUNT(*) AS total FROM products;'),
    ]);

    return apiSuccess(rowsRes.rows, {
      meta: { total: parseInt(countRes.rows[0]?.total || '0', 10), page, limit },
    });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/products');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'catalog:moderate');
    const body = await readJsonBody(request, 16384);
    const parsed = ModerateProductSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid product moderation payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await moderateProduct({
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/products');
  }
}
