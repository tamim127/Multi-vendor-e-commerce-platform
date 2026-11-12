import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIProvider } from '@/domains/ai/providers/factory';
import { appLogger } from '@/lib/observability/logger';
import { extractOrGenerateCorrelationId } from '@/lib/observability/request-context';
import { AIError } from '@/domains/ai/utils/error-normalizer';

const RequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const correlationId = extractOrGenerateCorrelationId(request.headers);
  const logger = appLogger.child({ correlationId, endpoint: '/api/ai/assistant' });

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      logger.warn('Invalid AI assistant request payload', { errors: parsed.error.issues });
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parsed.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { prompt, history } = parsed.data;
    logger.info('Processing AI customer assistant query', { promptLength: prompt.length });

    const provider = getAIProvider();
    const result = await provider.generateAssistantResponse(prompt, history);

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

    logger.error('Unhandled AI assistant error', {}, err);
    return NextResponse.json(
      {
        error: 'An unexpected internal error occurred while processing your AI request.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}

