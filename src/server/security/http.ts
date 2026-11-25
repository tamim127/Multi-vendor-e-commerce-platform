import { NextResponse } from 'next/server';
import { applySecurityHeaders } from './headers';
import { extractOrGenerateCorrelationId } from '@/lib/observability/request-context';
import { appLogger } from '@/lib/observability/logger';
import { sanitizeDbError } from '@/server/db/client';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(maxBytes: number) {
    super(`Request payload exceeds maximum size of ${maxBytes} bytes.`, 413, 'PAYLOAD_TOO_LARGE');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required to access this resource.') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected.', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class DatabaseUnavailableError extends AppError {
  constructor(message = 'Database service is temporarily unavailable.') {
    super(message, 503, 'DATABASE_UNAVAILABLE');
  }
}

/**
 * Reads and parses JSON body with strict maximum payload byte restriction.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
  maxBytes = 1_048_576
): Promise<T> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new PayloadTooLargeError(maxBytes);
  }

  const rawText = await request.text();
  if (Buffer.byteLength(rawText, 'utf8') > maxBytes) {
    throw new PayloadTooLargeError(maxBytes);
  }

  if (!rawText.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new ValidationError('Malformed JSON request body.');
  }
}

/**
 * Creates a standardized JSON success response with correlation ID and security headers.
 */
export function apiSuccess<T>(
  data: T,
  options?: { status?: number; meta?: Record<string, unknown>; correlationId?: string; cacheControl?: string }
): NextResponse {
  const body: Record<string, unknown> = {
    success: true,
    data,
  };
  if (options?.meta) {
    body['meta'] = options.meta;
  }

  const response = NextResponse.json(body, { status: options?.status ?? 200 });
  if (options?.correlationId) {
    response.headers.set('x-correlation-id', options.correlationId);
  }
  response.headers.set('Cache-Control', options?.cacheControl ?? 'no-store');
  return applySecurityHeaders(response);
}

/**
 * Serializes any thrown error into a safe, redacted API error contract.
 */
export function handleApiError(request: Request, error: unknown, contextName: string): NextResponse {
  const correlationId = extractOrGenerateCorrelationId(request.headers);

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      appLogger.error(`${contextName} failure`, { correlationId, code: error.code }, error);
    } else {
      appLogger.warn(`${contextName} rejected request`, { correlationId, code: error.code, status: error.statusCode });
    }

    const res = NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        correlationId,
      },
      { status: error.statusCode }
    );
    res.headers.set('x-correlation-id', correlationId);
    res.headers.set('Cache-Control', 'no-store');
    return applySecurityHeaders(res);
  }

  // Map raw DB / connection errors safely without leaking passwords or stack internals
  const sanitized = sanitizeDbError(error);
  const msgLower = error instanceof Error ? error.message.toLowerCase() : '';
  const isConnError =
    msgLower.includes('econnrefused') ||
    msgLower.includes('timeout') ||
    msgLower.includes('connection') ||
    msgLower.includes('eacces') ||
    msgLower.includes('database error');

  const statusCode = isConnError ? 503 : 500;
  const code = isConnError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR';

  appLogger.error(`Unhandled error in ${contextName}`, { correlationId, code }, error);

  const res = NextResponse.json(
    {
      success: false,
      error: isConnError
        ? 'Required backend database service is currently unavailable.'
        : 'An unexpected internal server error occurred.',
      code,
      correlationId,
      ...(process.env.NODE_ENV !== 'production' && sanitized.code ? { pgCode: sanitized.code } : {}),
    },
    { status: statusCode }
  );
  res.headers.set('x-correlation-id', correlationId);
  res.headers.set('Cache-Control', 'no-store');
  return applySecurityHeaders(res);
}
