import { closeDbPool } from './client';
import { appLogger } from '@/lib/observability/logger';

let shuttingDown = false;
let inFlightRequests = 0;
let shutdownHooksRegistered = false;

export function isServerShuttingDown(): boolean {
  return shuttingDown;
}

export function trackInFlightStart(): boolean {
  if (shuttingDown) return false;
  inFlightRequests += 1;
  return true;
}

export function trackInFlightEnd(): void {
  inFlightRequests = Math.max(0, inFlightRequests - 1);
}

/**
 * Initiates graceful shutdown: marks server unready, waits briefly for in-flight DB operations,
 * and cleanly closes the PostgreSQL connection pool.
 */
export async function initiateGracefulShutdown(signal: string, maxWaitMs = 5000): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  appLogger.warn(`Received ${signal}; initiating graceful shutdown`, { inFlightRequests });

  const start = Date.now();
  while (inFlightRequests > 0 && Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 50));
  }

  await closeDbPool();
  appLogger.info('PostgreSQL pool drained and closed cleanly', { remainingInFlight: inFlightRequests });
}

export function registerGracefulShutdownHooks(): void {
  if (shutdownHooksRegistered || typeof process === 'undefined' || process.env['NODE_ENV'] === 'test') {
    return;
  }
  shutdownHooksRegistered = true;

  for (const sig of ['SIGTERM', 'SIGINT'] as const) {
    process.once(sig, () => {
      void initiateGracefulShutdown(sig).then(() => {
        process.exit(0);
      });
    });
  }
}

export function resetShutdownStateForTests(): void {
  shuttingDown = false;
  inFlightRequests = 0;
}
