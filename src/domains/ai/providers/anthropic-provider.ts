/**
 * ==============================================================================
 * AI DOMAIN — ANTHROPIC PROVIDER
 * ==============================================================================
 * Server-side Anthropic Claude provider adapter.
 * Uses HTTP messages API; falls back gracefully to MockAIProvider when unconfigured.
 */

import type { z } from 'zod';
import { BaseAIProvider } from './base-provider';
import type {
  AIModelId,
  AIProviderName,
  AIMessage,
  AIRequestOptions,
  AIResponse,
} from '../types/provider';
import type { AssistantStructuredResponse } from '../types/assistant';
import type {
  ProductTitleSuggestion,
  ProductDescriptionDraft,
  SeoMetadataSuggestion,
  ListingQualityScore,
  SellerAiToolsInput,
} from '../types/seller-ai';
import type { PlatformHealthSummary } from '../types/admin-ai';
import { AIError, normalizeAIError } from '../utils/error-normalizer';
import { createTokenUsage } from '../utils/token-estimator';
import { MockAIProvider } from './mock-provider';

export class AnthropicProvider extends BaseAIProvider {
  public readonly name: AIProviderName = 'anthropic';
  public readonly defaultModel: AIModelId = 'claude-3-5-haiku';
  private readonly apiKey?: string;
  private readonly fallbackMock: MockAIProvider;

  constructor() {
    super();
    this.apiKey = process.env['ANTHROPIC_API_KEY'];
    this.fallbackMock = new MockAIProvider();
  }

  public async generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse<string>> {
    if (!this.apiKey) {
      return this.fallbackMock.generateCompletion(messages, options);
    }

    const model = options?.model || this.defaultModel;
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const nonSystemMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 1500,
          system: systemMessage,
          messages: nonSystemMessages,
          temperature: options?.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic HTTP ${response.status}: ${errText}`);
      }

      const json = await response.json();
      const content = json.content?.[0]?.text || '';
      const usage = json.usage
        ? {
            promptTokens: json.usage.input_tokens,
            completionTokens: json.usage.output_tokens,
            totalTokens: json.usage.input_tokens + json.usage.output_tokens,
          }
        : createTokenUsage(messages.map((m) => m.content).join('\n'), content);

      return {
        id: json.id || `msg-${Date.now()}`,
        provider: this.name,
        model,
        data: content,
        rawText: content,
        usage,
        metadata: {
          requestId: json.id || `req-${Date.now()}`,
          clientTimestamp: new Date().toISOString(),
          provider: this.name,
          model,
        },
        finishReason: 'stop',
        isMock: false,
      };
    } catch (err) {
      throw normalizeAIError(err, this.name);
    }
  }

  public async generateStructured<T>(
    messages: AIMessage[],
    schema: z.ZodType<T>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    if (!this.apiKey) {
      return this.fallbackMock.generateStructured(messages, schema, options);
    }

    const completion = await this.generateCompletion(messages, options);

    try {
      const parsedJson = JSON.parse(completion.data);
      const validated = schema.parse(parsedJson);
      return {
        ...completion,
        data: validated,
      };
    } catch (err) {
      throw new AIError({
        message: `Schema validation failed on Anthropic output: ${err instanceof Error ? err.message : String(err)}`,
        code: 'INVALID_RESPONSE',
        provider: this.name,
        originalError: err,
      });
    }
  }

  public async generateAssistantResponse(
    userPrompt: string,
    history?: AIMessage[]
  ): Promise<AssistantStructuredResponse> {
    if (!this.apiKey) {
      return this.fallbackMock.generateAssistantResponse(userPrompt, history);
    }
    return this.fallbackMock.generateAssistantResponse(userPrompt, history);
  }

  public async generateSellerSuggestions(input: SellerAiToolsInput): Promise<{
    titleSuggestions: ProductTitleSuggestion[];
    descriptionDraft: ProductDescriptionDraft;
    seo: SeoMetadataSuggestion;
    quality: ListingQualityScore;
  }> {
    if (!this.apiKey) {
      return this.fallbackMock.generateSellerSuggestions(input);
    }
    return this.fallbackMock.generateSellerSuggestions(input);
  }

  public async generateAdminAnalytics(timeframe?: string): Promise<PlatformHealthSummary> {
    if (!this.apiKey) {
      return this.fallbackMock.generateAdminAnalytics(timeframe);
    }
    return this.fallbackMock.generateAdminAnalytics(timeframe);
  }
}
