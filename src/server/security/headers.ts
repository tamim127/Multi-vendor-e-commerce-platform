import { NextResponse } from 'next/server';

/**
 * Standard enterprise HTTP security headers according to OWASP Top 10 guidelines.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Deny clickjacking
  'X-Frame-Options': 'DENY',
  // XSS Auditor
  'X-XSS-Protection': '1; mode=block',
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // Cross-Origin Resource Sharing Baseline
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-correlation-id, x-csrf-token',
};

/**
 * Applies OWASP security headers to any NextResponse.
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(key)) {
      response.headers.set(key, value);
    }
  }
  return response;
}
