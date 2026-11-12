/**
 * ==============================================================================
 * AI DOMAIN — ERROR NORMALIZER
 * ==============================================================================
 * Normalizes vendor-specific AI SDK and HTTP errors into canonical domain errors
 * with standardized error codes, HTTP status mapping, and retryability semantics.
 */

import type { AIProviderName } from '../types/provider';

export type AIErrorCode =
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_FAILED'
  | 'CONTEXT_LENGTH_EXCEEDED'
  | 'TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'INJECTION_DETECTED'
  | 'UNAUTHORIZED_ACCESS'
  | 'UNKNOWN_ERROR';

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly provider: AIProviderName;
  public readonly originalError?: unknown;

  constructor(params: {
    message: string;
    code: AIErrorCode;
    statusCode?: number;
    isRetryable?: boolean;
    provider?: AIProviderName;
    originalError?: unknown;
  }) {
    super(params.message);
    this.name = 'AIError';
    this.code = params.code;
    this.provider = params.provider ?? 'custom';
    this.originalError = params.originalError;

    // Set HTTP status code and retryability defaults
    switch (params.code) {
      case 'RATE_LIMITED':
        this.statusCode = params.statusCode ?? 429;
        this.isRetryable = params.isRetryable ?? true;
        break;
      case 'TIMEOUT':
        this.statusCode = params.statusCode ?? 504;
        this.isRetryable = params.isRetryable ?? true;
        break;
      case 'PROVIDER_UNAVAILABLE':
        this.statusCode = params.statusCode ?? 503;
        this.isRetryable = params.isRetryable ?? true;
        break;
      case 'AUTHENTICATION_FAILED':
        this.statusCode = params.statusCode ?? 401;
        this.isRetryable = false;
        break;
      case 'UNAUTHORIZED_ACCESS':
        this.statusCode = params.statusCode ?? 403;
        this.isRetryable = false;
        break;
      case 'INJECTION_DETECTED':
      case 'CONTEXT_LENGTH_EXCEEDED':
      case 'INVALID_RESPONSE':
        this.statusCode = params.statusCode ?? 400;
        this.isRetryable = false;
        break;
      default:
        this.statusCode = params.statusCode ?? 500;
        this.isRetryable = params.isRetryable ?? false;
        break;
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isRetryable: this.isRetryable,
      provider: this.provider,
    };
  }
}

export function normalizeAIError(error: unknown, provider: AIProviderName = 'custom'): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
    return new AIError({
      message: 'AI provider rate limit reached. Please wait a moment before trying again.',
      code: 'RATE_LIMITED',
      provider,
      originalError: error,
    });
  }

  if (
    message.includes('401') ||
    message.toLowerCase().includes('unauthorized') ||
    message.toLowerCase().includes('invalid api key')
  ) {
    return new AIError({
      message: 'AI provider authentication failed. Check server environment configuration.',
      code: 'AUTHENTICATION_FAILED',
      provider,
      originalError: error,
    });
  }

  if (
    message.toLowerCase().includes('timeout') ||
    message.toLowerCase().includes('timed out') ||
    message.includes('504')
  ) {
    return new AIError({
      message: 'The AI service timed out while generating a response.',
      code: 'TIMEOUT',
      provider,
      originalError: error,
    });
  }

  if (
    message.includes('503') ||
    message.toLowerCase().includes('connection refused') ||
    message.toLowerCase().includes('service unavailable')
  ) {
    return new AIError({
      message: 'The AI provider is currently unreachable or experiencing high load.',
      code: 'PROVIDER_UNAVAILABLE',
      provider,
      originalError: error,
    });
  }

  if (
    message.toLowerCase().includes('context length') ||
    message.toLowerCase().includes('tokens')
  ) {
    return new AIError({
      message: 'The conversation context is too large for the selected model.',
      code: 'CONTEXT_LENGTH_EXCEEDED',
      provider,
      originalError: error,
    });
  }

  return new AIError({
    message: message || 'An unexpected error occurred while processing the AI request.',
    code: 'UNKNOWN_ERROR',
    provider,
    originalError: error,
  });
}
