import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSellerAccess } from '@/server/auth/auth-middleware';
import { dispatchPackageForSeller, listSellerPackages } from '@/server/seller/seller-service';
import {
  acquireIdempotencyLock,
  completeIdempotencyRecord,
  failIdempotencyRecord,
} from '@/server/db/idempotency-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

const UpdateFulfillmentSchema = z.object({
  packageId: z.string().min(3),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const requestedSellerId = searchParams.get('sellerId');
    const { membership } = await requireSellerAccess(request, requestedSellerId);

    const status = searchParams.get('status') || undefined;
    const q = searchParams.get('q') || undefined;

    const packages = await listSellerPackages(membership.sellerId, { status, q });
    return apiSuccess(packages, { meta: { total: packages.length, sellerId: membership.sellerId } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/seller/orders');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  let idemRecordId: string | null = null;
  try {
    const requestedSellerId = new URL(request.url).searchParams.get('sellerId');
    const { auth, membership } = await requireSellerAccess(request, requestedSellerId);
    const body = await readJsonBody(request, 16384);
    const parsed = UpdateFulfillmentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid fulfillment update', parsed.error.flatten().fieldErrors);
    }

    const idemKey = request.headers.get('idempotency-key') || request.headers.get('x-idempotency-key');
    if (idemKey) {
      const idem = await acquireIdempotencyLock({
        scope: `seller_fulfillment:${membership.sellerId}`,
        key: idemKey.trim(),
        payload: parsed.data,
      });
      if (idem.kind === 'replay') {
        const res = NextResponse.json(idem.responseBody, { status: idem.statusCode });
        res.headers.set('X-Idempotent-Replay', 'true');
        return applySecurityHeaders(res);
      }
      idemRecordId = idem.recordId;
    }

    const updated = await dispatchPackageForSeller({
      packageId: parsed.data.packageId,
      sellerId: membership.sellerId,
      status: parsed.data.status,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber,
      actorId: auth.customer.id,
    });

    const responseBody = {
      success: true,
      data: updated,
      message: `Package ${parsed.data.packageId} fulfillment status updated to ${parsed.data.status}.`,
    };

    if (idemRecordId) {
      await completeIdempotencyRecord(idemRecordId, 200, responseBody);
    }

    return applySecurityHeaders(NextResponse.json(responseBody, { status: 200 }));
  } catch (error) {
    if (idemRecordId) {
      await failIdempotencyRecord(idemRecordId).catch(() => {});
    }
    return handleApiError(request, error, 'PATCH /api/seller/orders');
  }
}
