import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DEMO_SELLER_PACKAGES } from '@/domains/seller/fixtures/seller-orders.fixture';

export const dynamic = 'force-dynamic';

const UpdateFulfillmentSchema = z.object({
  packageId: z.string(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const query = searchParams.get('q')?.toLowerCase();

    let packages = [...DEMO_SELLER_PACKAGES];

    if (status && status !== 'all') {
      packages = packages.filter((p) => p.status === status);
    }

    if (query) {
      packages = packages.filter(
        (p) =>
          p.orderId.toLowerCase().includes(query) ||
          p.packageId.toLowerCase().includes(query) ||
          p.customer.name.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      data: packages,
      total: packages.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve seller orders', details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = UpdateFulfillmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid fulfillment update', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { packageId, status, carrier, trackingNumber } = parsed.data;
    const existing = DEMO_SELLER_PACKAGES.find((p) => p.packageId === packageId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Package not found: ${packageId}` },
        { status: 404 }
      );
    }

    const updatedPackage = {
      ...existing,
      status,
      carrier: carrier || existing.carrier,
      trackingNumber: trackingNumber || existing.trackingNumber,
      dispatchedAt: status === 'shipped' ? new Date().toISOString() : existing.dispatchedAt,
    };

    return NextResponse.json({
      success: true,
      data: updatedPackage,
      message: `Package ${packageId} fulfillment status updated to ${status}.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to update order fulfillment', details: message },
      { status: 500 }
    );
  }
}
