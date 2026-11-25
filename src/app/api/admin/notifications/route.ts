import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { dbQuery } from '@/server/db/client';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const NotificationPatchSchema = z.object({
  notificationId: z.string().optional(),
  clearAll: z.boolean().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'analytics:read');
    const res = await dbQuery('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50;');
    return apiSuccess(res.rows);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/notifications');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'analytics:read');
    const body = await readJsonBody(request, 8192);
    const parsed = NotificationPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid notification update payload');
    }

    if (parsed.data.clearAll) {
      await dbQuery('UPDATE admin_notifications SET is_read = true WHERE is_read = false;');
    } else if (parsed.data.notificationId) {
      await dbQuery('UPDATE admin_notifications SET is_read = true WHERE id = $1;', [
        parsed.data.notificationId,
      ]);
    }

    return apiSuccess({ updated: true });
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/notifications');
  }
}
