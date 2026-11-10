/**
 * ==============================================================================
 * CUSTOMER DOMAIN — AUTHENTICATION SECURITY UTILITIES
 * ==============================================================================
 * Secure session contracts, password strength calculation, and cookie preparation.
 * Note: Never store sensitive authentication tokens in localStorage.
 */

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'too_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let scoreCount = 0;
  if (hasMinLength) scoreCount++;
  if (hasUppercase && hasLowercase) scoreCount++;
  if (hasNumber) scoreCount++;
  if (hasSpecial) scoreCount++;

  const score = (password.length === 0 ? 0 : Math.min(4, Math.max(0, scoreCount))) as
    0 | 1 | 2 | 3 | 4;

  const labels: Record<number, PasswordStrengthResult['label']> = {
    0: 'too_weak',
    1: 'weak',
    2: 'medium',
    3: 'strong',
    4: 'very_strong',
  };

  return {
    score,
    label: labels[score] ?? 'weak',
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Standard cookie configuration contract for future production HttpOnly cookies.
 */
export const SESSION_COOKIE_NAME = 'marketplace_session_id';

export interface CookieConfig {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  maxAge: number;
}

export function createSessionCookieConfig(sessionId: string, rememberMe = false): CookieConfig {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 days vs 1 day
  };
}
