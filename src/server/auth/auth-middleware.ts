import { NextResponse } from 'next/server';
import type pg from 'pg';
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  verifyCsrfTokenMatch,
  verifySessionToken,
  type AuthenticatedCustomer,
  type SellerMembership,
} from './session-service';
import { ForbiddenError, UnauthorizedError } from '@/server/security/http';
import type { AdminPermission, AdminRole } from '@/domains/admin/types/admin';
import { hasPermission } from '@/domains/admin/utils/rbac';

export interface AuthRequestContext {
  sessionId: string;
  rawToken: string;
  tokenSource: 'bearer' | 'cookie';
  csrfTokenHash: string;
  expiresAt: string;
  customer: AuthenticatedCustomer;
}

/**
 * Parses a named cookie from an HTTP Cookie header safely.
 */
export function getCookieValue(request: Request, cookieName: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === cookieName) {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

/**
 * Extracts raw bearer or HttpOnly session cookie token from the incoming request.
 * Never accepts unsigned tokens or arbitrary client headers like X-User-Id.
 */
export function extractSessionToken(
  request: Request
): { rawToken: string; source: 'bearer' | 'cookie' } | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      return { rawToken: token, source: 'bearer' };
    }
  }

  const cookieToken = getCookieValue(request, SESSION_COOKIE_NAME);
  if (cookieToken) {
    return { rawToken: cookieToken, source: 'cookie' };
  }

  return null;
}

/**
 * Attaches session + readable CSRF cookies using secure defaults.
 */
export function attachAuthCookies(
  response: NextResponse,
  sessionToken: string,
  csrfToken: string,
  maxAgeSeconds: number,
  request?: Request
): void {
  const isSecure =
    process.env['FORCE_SECURE_COOKIES'] === 'true' ||
    (request
      ? request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() === 'https' ||
        request.url.startsWith('https://')
      : process.env.NODE_ENV === 'production' &&
        (process.env['NEXT_PUBLIC_APP_URL']?.startsWith('https://') ?? false));

  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Read by client JavaScript to send in x-csrf-token header
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(CSRF_COOKIE_NAME);
  response.cookies.delete('marketplace_session_id');
}

/**
 * Resolves authenticated user context if present; returns null for anonymous visitors.
 * Throws if PostgreSQL itself fails so infrastructure outages fail closed.
 */
export async function getAuthContext(
  request: Request,
  pool?: pg.Pool
): Promise<AuthRequestContext | null> {
  const extracted = extractSessionToken(request);
  if (!extracted) return null;

  const verified = await verifySessionToken(extracted.rawToken, pool);
  if (!verified) return null;

  return {
    sessionId: verified.sessionId,
    rawToken: extracted.rawToken,
    tokenSource: extracted.source,
    csrfTokenHash: verified.csrfTokenHash,
    expiresAt: verified.expiresAt,
    customer: verified.customer,
  };
}

/**
 * Enforces an authenticated active session on a protected endpoint.
 * Enforces CSRF protection for cookie-authenticated state-changing requests.
 */
export async function requireAuth(
  request: Request,
  options?: { pool?: pg.Pool; skipCsrf?: boolean }
): Promise<AuthRequestContext> {
  const ctx = await getAuthContext(request, options?.pool);
  if (!ctx) {
    throw new UnauthorizedError('Authentication required. Please sign in.');
  }

  const method = request.method.toUpperCase();
  const isMutating = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

  if (isMutating && ctx.tokenSource === 'cookie' && !options?.skipCsrf) {
    const csrfHeader = request.headers.get('x-csrf-token');
    if (!verifyCsrfTokenMatch(csrfHeader, ctx.csrfTokenHash)) {
      throw new ForbiddenError('Invalid or missing CSRF token for cookie-authenticated mutation.');
    }
  }

  return ctx;
}

/**
 * Enforces marketplace seller membership and active merchant status.
 * Never trusts client-supplied sellerId without verifying ownership.
 */
export async function requireSellerAccess(
  request: Request,
  requestedSellerId?: string | null,
  options?: { pool?: pg.Pool; skipCsrf?: boolean }
): Promise<{ auth: AuthRequestContext; membership: SellerMembership }> {
  const auth = await requireAuth(request, options);

  const memberships = auth.customer.sellerMemberships;
  if (memberships.length === 0) {
    throw new ForbiddenError('Active merchant membership is required for Seller Central operations.');
  }

  const targetMembership = requestedSellerId
    ? memberships.find((m) => m.sellerId === requestedSellerId)
    : memberships[0];

  if (!targetMembership) {
    throw new ForbiddenError('Access denied: You are not an authorized member of the requested seller store.');
  }

  if (targetMembership.sellerStatus === 'suspended' || targetMembership.sellerStatus === 'rejected') {
    throw new ForbiddenError(`Merchant store status (${targetMembership.sellerStatus}) prohibits this operation.`);
  }

  return { auth, membership: targetMembership };
}

/**
 * Enforces server-side Admin RBAC permission checks using the Admin domain evaluator.
 */
export async function requireAdminPermission(
  request: Request,
  permission: AdminPermission,
  options?: { pool?: pg.Pool; skipCsrf?: boolean }
): Promise<AuthRequestContext> {
  const auth = await requireAuth(request, options);

  if (auth.customer.role !== 'admin' || !auth.customer.adminRole) {
    throw new ForbiddenError('Administrative role privileges are required.');
  }

  const adminUser = {
    id: auth.customer.id,
    email: auth.customer.email,
    name: `${auth.customer.firstName} ${auth.customer.lastName}`,
    role: auth.customer.adminRole as AdminRole,
    permissions: auth.customer.adminPermissions,
    isActive: auth.customer.status === 'active',
    lastLoginAt: auth.customer.updatedAt,
    createdAt: auth.customer.createdAt,
  };

  if (!hasPermission(adminUser, permission)) {
    throw new ForbiddenError(`Missing required administrative permission: ${permission}`);
  }

  return auth;
}
