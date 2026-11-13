import { NextResponse } from 'next/server';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();

    const order = DEMO_ORDERS.find(
      (o) =>
        o.orderId.toLowerCase() === cleanId ||
        o.trackingNumber?.toLowerCase() === cleanId
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order not found with identifier: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order details', details: message },
      { status: 500 }
    );
  }
}
