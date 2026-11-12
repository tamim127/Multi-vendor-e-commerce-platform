/**
 * ==============================================================================
 * AI DOMAIN — BASE PROVIDER CONTRACT
 * ==============================================================================
 * Abstract AI provider defining common capabilities: chat completion,
 * structured JSON output with Zod validation, and specialized domain workflows.
 */

import type { z } from 'zod';
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

export abstract class BaseAIProvider {
  public abstract readonly name: AIProviderName;
  public abstract readonly defaultModel: AIModelId;

  public abstract generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse<string>>;

  public abstract generateStructured<T>(
    messages: AIMessage[],
    schema: z.ZodType<T>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>>;

  public abstract generateAssistantResponse(
    userPrompt: string,
    history?: AIMessage[]
  ): Promise<AssistantStructuredResponse>;

  public abstract generateSellerSuggestions(input: SellerAiToolsInput): Promise<{
    titleSuggestions: ProductTitleSuggestion[];
    descriptionDraft: ProductDescriptionDraft;
    seo: SeoMetadataSuggestion;
    quality: ListingQualityScore;
  }>;

  public abstract generateAdminAnalytics(timeframe?: string): Promise<PlatformHealthSummary>;
}
