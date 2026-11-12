import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/domains/ai/providers/factory';
import { appLogger } from '@/lib/observability/logger';
import { extractOrGenerateCorrelationId } from '@/lib/observability/request-context';
import { AIError } from '@/domains/ai/utils/error-normalizer';

const AdminAiRequestSchema = z.object({
  timeframe: z.enum(['last_7_days', 'last_30_days', 'last_quarter']).default('last_30_days'),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const correlationId = extractOrGenerateCorrelationId(request.headers);
  const logger = appLogger.child({ correlationId, endpoint: '/api/ai/admin' });

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = AdminAiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid timeframe parameter', details: parsed.error.issues },
        { status: 400 }
      );
    }

    logger.info('Generating admin AI analytics summary', { timeframe: parsed.data.timeframe });
    const provider = getAIProvider();
    const result = await provider.generateAdminAnalytics(parsed.data.timeframe);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'x-correlation-id': correlationId,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof AIError) {
      logger.error(`AI provider error: ${err.message}`, { code: err.code });
      return NextResponse.json(
        { error: err.message, code: err.code, isRetryable: err.isRetryable },
        { status: err.statusCode }
      );
    }

    logger.error('Unhandled admin AI error', {}, err);
    return NextResponse.json(
      { error: 'Failed to generate operational report.', code: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}

