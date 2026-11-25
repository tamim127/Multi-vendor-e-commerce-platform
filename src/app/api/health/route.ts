import { NextResponse } from 'next/server';
import { checkSystemHealth } from '@/lib/observability/health';
import { applySecurityHeaders } from '@/server/security/headers';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const health = checkSystemHealth();
  const status = health.status === 'error' ? 503 : 200;
  const res = NextResponse.json(health, { status });
  res.headers.set('Cache-Control', 'no-store');
  return applySecurityHeaders(res);
}
