'use client';

/**
 * ==============================================================================
 * NAVIGATION PRIMITIVES — SAFE ROUTER & SEARCH PARAMS HOOKS
 * ==============================================================================
 * Provides null-safe Next.js navigation hooks that do not throw invariants
 * when rendered in isolated unit test environments (e.g. without AppRouterContext).
 */

import * as NextNav from 'next/navigation';

export interface SafeRouter {
  push: (href: string, options?: Record<string, unknown>) => void;
  replace: (href: string, options?: Record<string, unknown>) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
}

export function useSafeRouter(): SafeRouter | null {
  try {
    const nav = NextNav as Record<string, unknown>;
    if (typeof nav['useRouter'] === 'function') {
      return (nav['useRouter'] as () => SafeRouter)();
    }
  } catch {
    // Expected when rendered outside Next.js App Router context (e.g. unit tests)
  }
  return null;
}

export function useSafeSearchParams(): URLSearchParams | null {
  try {
    const nav = NextNav as Record<string, unknown>;
    if (typeof nav['useSearchParams'] === 'function') {
      return (nav['useSearchParams'] as () => URLSearchParams)();
    }
  } catch {
    // Expected when rendered outside Next.js App Router context
  }
  return null;
}
