/**
 * ==============================================================================
 * AI DOMAIN — OPENAI COMPATIBLE PROVIDER
 * ==============================================================================
 * Server-side OpenAI & OpenAI-compatible provider adapter (e.g. Azure OpenAI,
 * Groq, vLLM, Ollama).
 * Never exposes API keys or base URLs to client-side bundles.
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

export class OpenAICompatibleProvider extends BaseAIProvider {
  public readonly name: AIProviderName = 'openai';
  public readonly defaultModel: AIModelId = 'gpt-4o-mini';
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fallbackMock: MockAIProvider;

  constructor() {
    super();
    this.apiKey = process.env['OPENAI_API_KEY'];
    this.baseUrl = process.env['OPENAI_BASE_URL'] || 'https://api.openai.com/v1';
    this.fallbackMock = new MockAIProvider();
  }

  public async generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse<string>> {
    if (!this.apiKey) {
      // In development or when unconfigured, gracefully fallback to Mock
      return this.fallbackMock.generateCompletion(messages, options);
    }

    const model = options?.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI HTTP ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || '';
      const usage = json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
          }
        : createTokenUsage(messages.map((m) => m.content).join('\n'), content);

      return {
        id: json.id || `comp-${Date.now()}`,
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
        finishReason: json.choices?.[0]?.finish_reason || 'stop',
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

    const completion = await this.generateCompletion(messages, {
      ...options,
      responseFormat: 'json',
    });

    try {
      const parsedJson = JSON.parse(completion.data);
      const validated = schema.parse(parsedJson);
      return {
        ...completion,
        data: validated,
      };
    } catch (err) {
      throw new AIError({
        message: `Schema validation failed on OpenAI output: ${err instanceof Error ? err.message : String(err)}`,
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
    // When API key is not present, use the deterministic catalog mock provider
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
