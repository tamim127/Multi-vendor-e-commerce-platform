/**
 * ==============================================================================
 * OBSERVABILITY — REQUEST CONTEXT & CORRELATION IDS
 * ==============================================================================
 * Correlation ID generation and extraction for distributed request tracking.
 */

export function extractOrGenerateCorrelationId(headers?: Headers): string {
  if (headers) {
    const existing =
      headers.get('x-correlation-id') || headers.get('x-request-id') || headers.get('traceparent');
    if (existing) {
      return existing.trim();
    }
  }

  // Generate lightweight deterministic correlation identifier
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `req-${timePart}-${randomPart}`;
}
