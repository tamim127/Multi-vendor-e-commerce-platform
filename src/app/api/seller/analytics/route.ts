import { NextResponse } from 'next/server';
import { DEMO_SELLER_METRICS } from '@/domains/seller/fixtures/analytics.fixture';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'last_30_days';

    return NextResponse.json({
      success: true,
      data: {
        ...DEMO_SELLER_METRICS,
        timeframe,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve seller analytics', details: message },
      { status: 500 }
    );
  }
}

