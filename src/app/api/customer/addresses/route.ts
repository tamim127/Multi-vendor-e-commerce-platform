import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEMO_ADDRESSES } from '@/domains/customer/fixtures/customer.fixture';
import type { CustomerAddress } from '@/domains/customer/types/address';

export const dynamic = 'force-dynamic';

const AddressPayloadSchema = z.object({
  label: z.enum(['home', 'work', 'other']).default('home'),
  fullName: z.string().min(2),
  streetAddress: z.string().min(5),
  streetAddress2: z.string().optional(),
  city: z.string().min(2),
  stateOrProvince: z.string().min(2),
  postalCode: z.string().min(3),
  countryCode: z.string().min(2),
  phoneNumber: z.string().min(6),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: DEMO_ADDRESSES,
    total: DEMO_ADDRESSES.length,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = AddressPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address payload',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newAddress: CustomerAddress = {
      id: `addr-${Date.now()}`,
      customerId: 'cust-demo-sarah',
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      data: newAddress,
      message: 'Address saved successfully',
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to save address', details: message },
      { status: 500 }
    );
  }
}

