import { NextResponse } from 'next/server';
import { CheckoutFormSchema } from '@/domains/checkout/schemas/checkout.schema';
import { createMoney } from '@/domains/catalog/utils/money';
import { requireAuth } from '@/server/auth/auth-middleware';
import { getPersistedCart } from '@/server/commerce/cart-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 32768);
    const parsed = CheckoutFormSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Validation failed for checkout fields', parsed.error.flatten().fieldErrors);
    }

    const { cart } = await getPersistedCart({ customerId: auth.customer.id });
    if (cart.items.length === 0) {
      throw new ValidationError('Active cart is empty. Add items before validating checkout.');
    }

    const { contact, shipping, deliveryMethod } = parsed.data;
    const isExpress = deliveryMethod === 'express';
    const estimatedDays = isExpress ? '1-2 business days' : '3-5 business days';
    const expressFeeMinor = isExpress ? cart.sellerGroups.length * 1500 : 0;
    const shippingAmountMinor = cart.shippingTotal.amountMinor + expressFeeMinor;
    const taxAmountMinor = Math.round(cart.subtotal.amountMinor * 0.0825);
    const grandTotalMinor = cart.subtotal.amountMinor + shippingAmountMinor + taxAmountMinor;

    return apiSuccess({
      isValid: true,
      contact,
      shipping,
      deliveryMethod,
      estimatedDays,
      itemsSubtotal: cart.subtotal,
      shippingFee: createMoney(shippingAmountMinor, cart.currency),
      taxTotal: createMoney(taxAmountMinor, cart.currency),
      grandTotal: createMoney(grandTotalMinor, cart.currency),
      taxRatePercent: 8.25,
      currency: cart.currency,
      packageCount: cart.sellerGroups.length,
    });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/checkout/validate');
  }
}
