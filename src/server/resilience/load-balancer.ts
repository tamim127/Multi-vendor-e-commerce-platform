import { checkDatabaseHealth } from '@/server/db/client';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  database: {
    isHealthy: boolean;
    latencyMs: number;
    poolTotal: number;
    poolIdle: number;
    poolWaiting: number;
    error?: string;
  };
}

/**
 * Executes a comprehensive health check for upstream load balancers.
 */
export async function getSystemHealth(): Promise<HealthCheckResult> {
  const mem = process.memoryUsage();
  const dbHealth = await checkDatabaseHealth();

  const isHealthy = dbHealth.isHealthy;
  const isDegraded = !dbHealth.isHealthy && dbHealth.latencyMs > 500;

  return {
    status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      rssMb: Math.round(mem.rss / (1024 * 1024)),
    },
    database: dbHealth,
  };
}
