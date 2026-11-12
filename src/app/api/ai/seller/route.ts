import { NextResponse } from 'next/server';
import { SellerAiToolsInputSchema } from '@/domains/ai/schemas/seller-ai.schema';
import { getAIProvider } from '@/domains/ai/providers/factory';
import { appLogger } from '@/lib/observability/logger';
import { extractOrGenerateCorrelationId } from '@/lib/observability/request-context';
import { AIError } from '@/domains/ai/utils/error-normalizer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const correlationId = extractOrGenerateCorrelationId(request.headers);
  const logger = appLogger.child({ correlationId, endpoint: '/api/ai/seller' });

  try {
    const body = await request.json();
    const parsed = SellerAiToolsInputSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Invalid seller AI request payload', { errors: parsed.error.issues });
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    logger.info('Generating seller AI tools output');
    const provider = getAIProvider();
    const result = await provider.generateSellerSuggestions(parsed.data);

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
        {
          error: err.message,
          code: err.code,
          isRetryable: err.isRetryable,
        },
        { status: err.statusCode }
      );
    }

    logger.error('Unhandled seller AI error', {}, err);
    return NextResponse.json(
      {
        error: 'Failed to generate seller suggestions.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

