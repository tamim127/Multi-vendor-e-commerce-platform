import { NextResponse } from 'next/server';
import { DEMO_AUDIT_LOGS } from '@/domains/admin/fixtures/audit-logs.fixture';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const outcome = searchParams.get('outcome');
    const query = searchParams.get('q')?.toLowerCase();

    let logs = [...DEMO_AUDIT_LOGS];

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }

    if (outcome) {
      logs = logs.filter((l) => l.outcome === outcome);
    }

    if (query) {
      logs = logs.filter(
        (l) =>
          l.actor.name.toLowerCase().includes(query) ||
          l.action.toLowerCase().includes(query) ||
          l.targetId?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve administrative audit logs', details: message },
      { status: 500 }
    );
  }
}
