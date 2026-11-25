import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { adminTransitionOrder, listAdminOrders, recordAdminAuditLog } from '@/server/admin/admin-service';
import { dbQuery, withTransaction } from '@/server/db/client';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const AdminOrderPatchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('transition'),
    orderId: z.string().min(3),
    status: z.enum([
      'pending_payment',
      'confirmed',
      'processing',
      'partially_shipped',
      'shipped',
      'delivered',
      'cancelled',
      'partially_refunded',
      'refunded',
    ]),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal('add_note'),
    orderId: z.string().min(3),
    note: z.string().min(2).max(1000),
  }),
]);

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'orders:read');
    const [orders, notesRes] = await Promise.all([
      listAdminOrders(),
      dbQuery('SELECT * FROM order_timeline_notes ORDER BY created_at DESC LIMIT 200;'),
    ]);
    return apiSuccess(orders, { meta: { timelineNotes: notesRes.rows } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/orders');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'orders:override');
    const body = await readJsonBody(request, 16384);
    const parsed = AdminOrderPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid admin order payload', parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.action === 'transition') {
      const res = await adminTransitionOrder({
        orderId: parsed.data.orderId,
        status: parsed.data.status,
        reason: parsed.data.reason,
        actorId: auth.customer.id,
        actorRole: auth.customer.adminRole || 'admin',
      });
      return apiSuccess(res);
    }

    const { orderId, note } = parsed.data;
    const noteRow = await withTransaction(async (client) => {
      const row = await client.query(
        `INSERT INTO order_timeline_notes (id, order_id, actor_id, actor_name, note)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [
          `otn-${crypto.randomUUID().slice(0, 12)}`,
          orderId,
          auth.customer.id,
          `${auth.customer.firstName} ${auth.customer.lastName}`,
          note,
        ]
      );
      await recordAdminAuditLog(client, {
        actorId: auth.customer.id,
        actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
        actorRole: auth.customer.adminRole || 'admin',
        action: 'ORDER_NOTE_ADDED',
        targetType: 'order',
        targetId: orderId,
      });
      return row.rows[0];
    });

    return apiSuccess(noteRow, { status: 201 });
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/orders');
  }
}
