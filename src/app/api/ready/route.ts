import { NextResponse } from 'next/server';
import { checkSystemReadiness } from '@/lib/observability/health';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const readiness = checkSystemReadiness();
  return NextResponse.json(readiness, { status: readiness.ready ? 200 : 503 });
}

