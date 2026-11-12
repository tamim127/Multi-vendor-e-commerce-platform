/**
 * ==============================================================================
 * OBSERVABILITY — STRUCTURED LOGGER WITH SENSITIVE DATA REDACTION
 * ==============================================================================
 * Production-ready JSON logger with log levels, request correlation IDs,
 * ISO-8601 timestamps, and automatic redaction of sensitive credentials.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sellerId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'cvv',
  'cardnumber',
  'creditcard',
]);

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact potential email addresses in logs if flagged
    if (data.length > 500) {
      return `${data.slice(0, 500)}...[TRUNCATED]`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        cleanObj[key] = '[REDACTED]';
      } else {
        cleanObj[key] = redactSensitiveData(val);
      }
    }
    return cleanObj;
  }

  return data;
}

export class Logger {
  private readonly defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
  }

  private output(level: LogLevel, message: string, context?: LogContext, error?: unknown): void {
    const timestamp = new Date().toISOString();
    const mergedContext = {
      ...this.defaultContext,
      ...context,
    };

    const payload = {
      timestamp,
      level,
      message,
      context: redactSensitiveData(mergedContext),
      ...(error instanceof Error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
          }
        : error
          ? { error: String(error) }
          : {}),
    };

    const json = JSON.stringify(payload);

    switch (level) {
      case 'error':
        console.error(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(json);
        }
        break;
      case 'info':
      default:
        console.log(json);
        break;
    }
  }

  public debug(message: string, context?: LogContext): void {
    this.output('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.output('info', message, context);
  }

  public warn(message: string, context?: LogContext, error?: unknown): void {
    this.output('warn', message, context, error);
  }

  public error(message: string, context?: LogContext, error?: unknown): void {
    this.output('error', message, context, error);
  }

  public child(childContext: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...childContext });
  }
}

export const appLogger: Logger = new Logger({ service: 'marketplace-platform' });
