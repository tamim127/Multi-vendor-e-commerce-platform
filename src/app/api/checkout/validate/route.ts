import { NextResponse } from 'next/server';
import { CheckoutFormSchema } from '@/domains/checkout/schemas/checkout.schema';
import { createMoney } from '@/domains/catalog/utils/money';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CheckoutFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed for checkout fields',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { contact, shipping, deliveryMethod } = parsed.data;

    // Calculate dynamic shipping rate & estimated tax
    const isExpress = deliveryMethod === 'express';
    const estimatedDays = isExpress ? '1-2 business days' : '3-5 business days';
    const shippingAmountMinor = isExpress ? 1500 : 0; // $15 or Free

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        contact,
        shipping,
        deliveryMethod,
        estimatedDays,
        shippingFee: createMoney(shippingAmountMinor, 'USD'),
        taxRatePercent: 8.25,
        currency: 'USD',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Checkout validation service error', details: message },
      { status: 500 }
    );
  }
}

