'use client';

/**
 * Reads the non-HttpOnly `aureon_csrf` cookie for sending `x-csrf-token`
 * on cookie-authenticated mutations.
 */
export function getClientCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const pairs = document.cookie.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    if (pair.slice(0, idx).trim() === 'aureon_csrf') {
      return decodeURIComponent(pair.slice(idx + 1).trim());
    }
  }
  return null;
}

export function buildApiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const csrf = getClientCsrfToken();
  if (csrf) {
    headers['x-csrf-token'] = csrf;
  }
  return headers;
}
