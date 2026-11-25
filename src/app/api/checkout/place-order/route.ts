import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { placeOrderFromCustomerCart, InsufficientStockError } from '@/server/commerce/order-service';
import { getCustomerOrderById } from '@/server/customer/customer-service';
import {
  acquireIdempotencyLock,
  completeIdempotencyRecord,
  failIdempotencyRecord,
} from '@/server/db/idempotency-service';
import { checkRateLimit } from '@/server/security/rate-limiter';
import { applySecurityHeaders } from '@/server/security/headers';
import { ConflictError, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const PlaceOrderSchema = z.object({
  contact: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
  }),
  shipping: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().min(2),
  }),
  addressId: z.string().optional(),
  deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum(['credit_card', 'bank_transfer']).default('credit_card'),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const rate = checkRateLimit(request, { maxRequests: 20, windowSeconds: 60, prefix: 'checkout_place' });
  if (!rate.isAllowed) {
    return applySecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Too Many Requests', retryAfter: rate.resetSeconds },
        { status: 429 }
      )
    );
  }

  let idemRecordId: string | null = null;

  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 65536);
    const parsed = PlaceOrderSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid order placement request', parsed.error.flatten().fieldErrors);
    }

    const rawIdemKey =
      request.headers.get('idempotency-key') ||
      request.headers.get('x-idempotency-key') ||
      parsed.data.idempotencyKey;

    if (!rawIdemKey || rawIdemKey.trim().length < 8) {
      throw new ValidationError('Idempotency-Key header (min 8 chars) is required for order placement.');
    }

    const idem = await acquireIdempotencyLock({
      scope: `checkout:${auth.customer.id}`,
      key: rawIdemKey.trim(),
      payload: {
        customerId: auth.customer.id,
        contact: parsed.data.contact,
        shipping: parsed.data.shipping,
        addressId: parsed.data.addressId || null,
        deliveryMethod: parsed.data.deliveryMethod,
        paymentMethod: parsed.data.paymentMethod,
      },
      ttlSeconds: 86400,
    });

    if (idem.kind === 'replay') {
      const replayRes = NextResponse.json(idem.responseBody, { status: idem.statusCode });
      replayRes.headers.set('X-Idempotent-Replay', 'true');
      replayRes.headers.set('Cache-Control', 'no-store');
      return applySecurityHeaders(replayRes);
    }

    idemRecordId = idem.recordId;

    const placed = await placeOrderFromCustomerCart({
      customerId: auth.customer.id,
      addressId: parsed.data.addressId,
      shippingAddress: {
        name: parsed.data.contact.fullName,
        street: parsed.data.shipping.address,
        city: parsed.data.shipping.city,
        state: parsed.data.shipping.state,
        postalCode: parsed.data.shipping.postalCode,
        country: parsed.data.shipping.country,
        phone: parsed.data.contact.phone,
      },
      deliveryMethod: parsed.data.deliveryMethod,
      paymentMethod: parsed.data.paymentMethod,
      idempotencyKey: rawIdemKey.trim(),
    });

    const fullOrder = await getCustomerOrderById(auth.customer.id, placed.orderId);

    const responseBody = {
      success: true,
      data: {
        orderId: placed.orderId,
        order: fullOrder,
        status: placed.status,
        paymentStatus: placed.paymentStatus,
        paymentGatewayVerified: false,
        fulfillmentStatus: placed.fulfillmentStatus,
        grandTotalMinor: placed.grandTotalMinor,
        currency: placed.currency,
        packages: placed.packages,
        message:
          'Order persisted in pending_payment state with inventory reserved. Payment processor confirmation is required before capture.',
      },
    };

    await completeIdempotencyRecord(idemRecordId, 201, responseBody);

    const response = NextResponse.json(responseBody, { status: 201 });
    response.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(response);
  } catch (error) {
    if (idemRecordId) {
      await failIdempotencyRecord(idemRecordId).catch(() => {});
    }
    if (error instanceof InsufficientStockError) {
      return handleApiError(request, new ConflictError(error.message), 'POST /api/checkout/place-order');
    }
    return handleApiError(request, error, 'POST /api/checkout/place-order');
  }
}
