import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window store (can be backed by Redis in multi-instance clusters)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Garbage collect expired buckets every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000).unref?.();
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  prefix?: string;
}

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  clientIp: string;
}

/**
 * Extracts client IP from standard reverse proxy and CDN headers.
 */
export function extractClientIp(request: Request): string {
  const headers = request.headers;
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0];
    if (first) return first.trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Checks sliding window rate limit for an incoming request.
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = { maxRequests: 100, windowSeconds: 60, prefix: 'global' }
): RateLimitResult {
  const clientIp = extractClientIp(request);
  const key = `${config.prefix || 'api'}:${clientIp}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    record = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      isAllowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetSeconds: config.windowSeconds,
      clientIp,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  const isAllowed = record.count <= config.maxRequests;

  return {
    isAllowed,
    limit: config.maxRequests,
    remaining,
    resetSeconds,
    clientIp,
  };
}

/**
 * Wraps an API route handler with automatic rate limit enforcement.
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any): Promise<NextResponse> => {
    const rate = checkRateLimit(request, config);

    if (!rate.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests',
          message: `Rate limit of ${rate.limit} requests per ${config.windowSeconds}s exceeded. Please retry in ${rate.resetSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.resetSeconds),
            'X-RateLimit-Limit': String(rate.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rate.resetSeconds),
          },
        }
      );
    }

    const response = await handler(request, context);

    response.headers.set('X-RateLimit-Limit', String(rate.limit));
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(rate.resetSeconds));

    return response;
  };
}

