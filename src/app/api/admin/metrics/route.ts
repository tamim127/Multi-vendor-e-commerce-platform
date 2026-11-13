import { NextResponse } from 'next/server';
import {
  DEMO_ADMIN_KPIS,
  DEMO_ADMIN_REVENUE_CHART,
  DEMO_ADMIN_TOP_SELLERS,
  DEMO_ADMIN_TOP_PRODUCTS,
} from '@/domains/admin/fixtures/analytics.fixture';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'last_30_days';

    return NextResponse.json({
      success: true,
      data: {
        kpis: DEMO_ADMIN_KPIS,
        revenueTrend: DEMO_ADMIN_REVENUE_CHART,
        topSellers: DEMO_ADMIN_TOP_SELLERS,
        topProducts: DEMO_ADMIN_TOP_PRODUCTS,
        timeframe,
        systemHealth: {
          uptimePercent: 99.98,
          avgResponseTimeMs: 42,
          databaseStatus: 'healthy',
          searchEngineStatus: 'healthy',
          escrowServiceStatus: 'active',
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin platform metrics', details: message },
      { status: 500 }
    );
  }
}

