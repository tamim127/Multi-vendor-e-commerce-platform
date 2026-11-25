import { NextResponse } from 'next/server';
import { checkSystemReadiness } from '@/lib/observability/health';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const readiness = await checkSystemReadiness();
  const res = NextResponse.json(readiness, { status: readiness.ready ? 200 : 503 });
  res.headers.set('Cache-Control', 'no-store');
  return applySecurityHeaders(res);
}
