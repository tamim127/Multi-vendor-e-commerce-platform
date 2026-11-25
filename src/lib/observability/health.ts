/**
 * ==============================================================================
 * OBSERVABILITY — HEALTH & READINESS PROBES
 * ==============================================================================
 * Real PostgreSQL-backed readiness verification with bounded timeouts,
 * probe caching (to prevent connection storms), and graceful shutdown awareness.
 */

import type pg from 'pg';
import { checkDatabaseHealth } from '@/server/db/client';
import { isServerShuttingDown } from '@/server/db/shutdown';

export interface SystemHealthReport {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  services: {
    name: string;
    status: 'ok' | 'degraded' | 'error';
    latencyMs?: number;
    details?: string;
  }[];
}

const STARTUP_TIME = Date.now();
const READINESS_CACHE_TTL_MS = 1000;
let cachedReadiness: { timestamp: number; result: { ready: boolean; reason?: string; latencyMs?: number } } | null =
  null;

export function checkSystemHealth(): SystemHealthReport {
  const uptimeSeconds = Math.floor((Date.now() - STARTUP_TIME) / 1000);
  const aiProviderName = process.env['AI_PROVIDER'] || 'mock';
  const shuttingDown = isServerShuttingDown();

  return {
    status: shuttingDown ? 'error' : 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: [
      {
        name: 'application_core',
        status: shuttingDown ? 'error' : 'ok',
        details: shuttingDown ? 'Draining for shutdown' : 'Next.js App Router active',
      },
      {
        name: 'ai_engine',
        status: 'ok',
        details: `Active provider: ${aiProviderName}`,
      },
    ],
  };
}

/**
 * Verifies live readiness by checking graceful shutdown state and probing PostgreSQL
 * within a bounded 2,000ms timeout (cached briefly to prevent probe storms).
 */
export async function checkSystemReadiness(
  customPool?: pg.Pool
): Promise<{ ready: boolean; reason?: string; latencyMs?: number }> {
  if (isServerShuttingDown()) {
    return { ready: false, reason: 'Application is shutting down and draining requests.' };
  }

  // Only bypass cache when an explicit custom pool (e.g. integration test failure probe) is passed
  if (!customPool && cachedReadiness && Date.now() - cachedReadiness.timestamp < READINESS_CACHE_TTL_MS) {
    return cachedReadiness.result;
  }

  try {
    const dbProbe = await Promise.race([
      checkDatabaseHealth(customPool),
      new Promise<{ isHealthy: boolean; latencyMs: number; error: string }>((resolve) =>
        setTimeout(() => resolve({ isHealthy: false, latencyMs: 2000, error: 'Database readiness probe timed out' }), 2000)
      ),
    ]);

    const result = dbProbe.isHealthy
      ? { ready: true, latencyMs: dbProbe.latencyMs }
      : { ready: false, reason: 'PostgreSQL dependency unavailable', latencyMs: dbProbe.latencyMs };

    if (!customPool) {
      cachedReadiness = { timestamp: Date.now(), result };
    }
    return result;
  } catch {
    return { ready: false, reason: 'PostgreSQL readiness check failed' };
  }
}

export function resetReadinessCacheForTests(): void {
  cachedReadiness = null;
}
