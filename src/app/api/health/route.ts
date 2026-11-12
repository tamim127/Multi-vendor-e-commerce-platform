import { NextResponse } from 'next/server';
import { checkSystemHealth } from '@/lib/observability/health';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const health = checkSystemHealth();
  return NextResponse.json(health, { status: 200 });
}

