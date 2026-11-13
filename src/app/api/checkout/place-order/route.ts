import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createMoney } from '@/domains/catalog/utils/money';
import { groupCartBySeller } from '@/domains/cart/utils/calculations';
import type { CustomerOrder } from '@/domains/customer/types/order';

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
  deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  items: z.array(z.any()).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['credit_card', 'escrow_wallet', 'bank_transfer']).default('credit_card'),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = PlaceOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order placement request',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { contact, shipping, deliveryMethod, items, paymentMethod } = parsed.data;

    // Split items into vendor packages
    const sellerGroups = groupCartBySeller(items);
    const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const currency = items[0]?.unitPrice?.currency || 'USD';

    let totalAmountMinor = 0;
    for (const item of items) {
      const lineTotal = item.lineTotal?.amountMinor ?? (item.unitPrice?.amountMinor * item.quantity);
      totalAmountMinor += lineTotal;
    }

    const shippingMinor = deliveryMethod === 'express' ? 1500 : 0;
    const grandTotalMinor = totalAmountMinor + shippingMinor;

    const vendorPackages = sellerGroups.map((group) => ({
      sellerId: group.sellerId,
      sellerName: group.sellerName,
      deliveryMethod,
      shippingFee: createMoney(0, currency),
      subtotal: group.subtotal,
      estimatedDays: deliveryMethod === 'express' ? '1-2 business days' : '3-5 business days',
      items: group.items,
    }));

    const orderRecord: CustomerOrder = {
      orderId,
      customerId: contact.email,
      currency: currency as any,
      itemsSubtotal: createMoney(totalAmountMinor, currency as any),
      shippingTotal: createMoney(shippingMinor, currency as any),
      grandTotal: createMoney(grandTotalMinor, currency as any),
      itemCount: items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        label: 'home',
        fullName: contact.fullName,
        phoneNumber: contact.phone,
        streetAddress: shipping.address,
        city: shipping.city,
        stateOrProvince: shipping.state,
        postalCode: shipping.postalCode,
        countryCode: shipping.country,
        isDefaultShipping: true,
        isDefaultBilling: true,
        createdAt: now,
        updatedAt: now,
      },
      carrier: deliveryMethod === 'express' ? 'FedEx Priority' : 'Standard Ground Carrier',
      trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: deliveryMethod === 'express' ? 'In 2 days' : 'In 4-5 days',
      trackingEvents: [
        {
          status: 'Order Confirmed',
          location: 'Aureon Global Clearinghouse',
          timestamp: now,
          description: `Order successfully placed and escrow funds secured via ${paymentMethod}.`,
        },
      ],
      vendorPackages,
    };

    return NextResponse.json({
      success: true,
      data: {
        order: orderRecord,
        escrowReference: `ESCROW-${Date.now()}`,
        status: 'confirmed',
        message: 'Order created successfully and routed to respective multi-vendor merchants.',
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Order processing failed', details: message },
      { status: 500 }
    );
  }
}
