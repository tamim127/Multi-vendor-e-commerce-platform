import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { createOrToggleAdminCategory } from '@/server/admin/admin-service';
import { dbQuery } from '@/server/db/client';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const CategoryActionSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('create'),
    nameEn: z.string().min(2),
    slug: z.string().min(2),
    parentId: z.string().nullable().optional(),
    icon: z.string().optional(),
  }),
  z.object({
    mode: z.literal('toggle'),
    categoryId: z.string().min(2),
  }),
]);

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'catalog:read');
    const res = await dbQuery('SELECT * FROM categories ORDER BY level ASC, name_en ASC;');
    return apiSuccess(res.rows);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/categories');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'catalog:write');
    const body = await readJsonBody(request, 16384);
    const parsed = CategoryActionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid category action payload', parsed.error.flatten().fieldErrors);
    }

    const result = await createOrToggleAdminCategory({
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(result, { status: parsed.data.mode === 'create' ? 201 : 200 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/admin/categories');
  }
}
