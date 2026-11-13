import { NextResponse } from 'next/server';
import { DEMO_ORDERS } from '@/domains/customer/fixtures/orders.fixture';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const query = searchParams.get('q')?.toLowerCase();

    let orders = [...DEMO_ORDERS];

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId);
    }

    if (query) {
      orders = orders.filter(
        (o) =>
          o.orderId.toLowerCase().includes(query) ||
          o.carrier?.toLowerCase().includes(query) ||
          o.trackingNumber?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders list', details: message },
      { status: 500 }
    );
  }
}

