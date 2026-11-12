/**
 * ==============================================================================
 * AI DOMAIN — MOCK AI PROVIDER
 * ==============================================================================
 * Deterministic, offline AI provider implementation for development, unit testing,
 * and Playwright E2E verification.
 * Zero external network access required; never calls external third-party APIs.
 * Fully validates output schemas using Zod.
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
import { AssistantStructuredResponseSchema } from '../schemas/assistant.schema';
import type {
  ProductTitleSuggestion,
  ProductDescriptionDraft,
  SeoMetadataSuggestion,
  ListingQualityScore,
  SellerAiToolsInput,
} from '../types/seller-ai';
import {
  ProductTitleSuggestionSchema,
  ProductDescriptionDraftSchema,
  SeoMetadataSuggestionSchema,
  ListingQualityScoreSchema,
} from '../schemas/seller-ai.schema';
import type { PlatformHealthSummary } from '../types/admin-ai';
import { PlatformHealthSummarySchema } from '../schemas/admin-ai.schema';
import { analyzePromptSafety } from '../utils/prompt-sanitizer';
import { createTokenUsage } from '../utils/token-estimator';
import { getNaturalLanguageRecommendations } from '../utils/recommendations';
import { AIError } from '../utils/error-normalizer';

export class MockAIProvider extends BaseAIProvider {
  public readonly name: AIProviderName = 'mock';
  public readonly defaultModel: AIModelId = 'mock-fast';

  public async generateCompletion(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse<string>> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const safety = analyzePromptSafety(lastUserMessage);

    if (!safety.isSafe) {
      throw new AIError({
        message: 'Security policy violation: Suspicious prompt injection detected.',
        code: 'INJECTION_DETECTED',
        provider: this.name,
      });
    }

    const completionText = `Mock AI response to: "${safety.sanitizedInput}". This is an automated deterministic mock reply.`;
    const promptCombined = messages.map((m) => m.content).join('\n');
    const usage = createTokenUsage(promptCombined, completionText);

    return {
      id: `mock-comp-${Date.now()}`,
      provider: this.name,
      model: options?.model ?? this.defaultModel,
      data: completionText,
      rawText: completionText,
      usage,
      metadata: {
        requestId: `req-${Date.now()}`,
        clientTimestamp: new Date().toISOString(),
        provider: this.name,
        model: options?.model ?? this.defaultModel,
      },
      finishReason: 'stop',
      isMock: true,
    };
  }

  public async generateStructured<T>(
    messages: AIMessage[],
    schema: z.ZodType<T>,
    options?: AIRequestOptions
  ): Promise<AIResponse<T>> {
    const completion = await this.generateCompletion(messages, options);
    const parsed = schema.safeParse(JSON.parse(completion.data));

    if (!parsed.success) {
      throw new AIError({
        message: `Structured output validation failed: ${parsed.error.message}`,
        code: 'INVALID_RESPONSE',
        provider: this.name,
        originalError: parsed.error,
      });
    }

    return {
      ...completion,
      data: parsed.data,
    };
  }

  public async generateAssistantResponse(
    userPrompt: string,
    _history?: AIMessage[]
  ): Promise<AssistantStructuredResponse> {
    const safety = analyzePromptSafety(userPrompt);

    if (!safety.isSafe) {
      return AssistantStructuredResponseSchema.parse({
        message:
          'I cannot process this request because it triggered our safety guidelines against prompt injection or harmful instructions.',
        intent: 'general_help',
        confidenceScore: 1.0,
        recommendedProducts: [],
        suggestedFollowUps: ['Search for laptops', 'View return policies', 'Browse headphones'],
        isAiGenerated: true,
        disclaimer: 'AI-generated response • Verify details on product pages',
      });
    }

    const query = safety.sanitizedInput;
    const lower = query.toLowerCase();

    // Check policy queries first
    if (
      lower.includes('return') ||
      lower.includes('refund') ||
      lower.includes('shipping') ||
      lower.includes('delivery') ||
      lower.includes('policy')
    ) {
      const response: AssistantStructuredResponse = {
        message:
          'Here are the official marketplace customer protection and fulfillment policies: We provide a 30-day hassle-free return window for eligible products, and multi-vendor split shipping with estimated delivery times.',
        intent: 'policy_faq',
        confidenceScore: 0.95,
        recommendedProducts: [],
        suggestedFollowUps: [
          'How do I request a refund?',
          'What is multi-vendor shipping?',
          'Search for laptops',
        ],
        referencedPolicies: [
          {
            topic: 'returns',
            summary:
              'Returns accepted within 30 days of delivery. Items must be in original condition with merchant packaging intact.',
            slaDays: 30,
          },
          {
            topic: 'shipping',
            summary:
              'Each merchant dispatches items directly in separate packages. Standard delivery takes 3-5 business days; Express delivery takes 1-2 days.',
            slaDays: 5,
          },
          {
            topic: 'warranty',
            summary:
              'All electronics include minimum 1-year official manufacturer warranty backed by marketplace seller resolution.',
            slaDays: 365,
          },
        ],
        isAiGenerated: true,
        disclaimer: 'AI-generated response • Verify details on product pages',
      };
      return AssistantStructuredResponseSchema.parse(response);
    }

    // Product search or recommendation query
    const { parsed, cards, summaryMessage } = getNaturalLanguageRecommendations(query, 3);

    const followUps: string[] = [];
    if (parsed.intent === 'budget_filter') {
      followUps.push('Show alternative brands');
      followUps.push('Compare specifications');
      followUps.push('View highest rated');
    } else {
      followUps.push('Find options under $500');
      followUps.push('Compare top 2 models');
      followUps.push('What are the shipping fees?');
    }

    const result: AssistantStructuredResponse = {
      message: summaryMessage,
      intent:
        parsed.intent === 'budget_filter'
          ? 'budget_recommendation'
          : parsed.intent === 'compare'
            ? 'product_comparison'
            : 'product_search',
      confidenceScore: 0.92,
      recommendedProducts: cards,
      suggestedFollowUps: followUps,
      isAiGenerated: true,
      disclaimer: 'AI-generated response • Verify details on product pages',
    };

    return AssistantStructuredResponseSchema.parse(result);
  }

  public async generateSellerSuggestions(input: SellerAiToolsInput): Promise<{
    titleSuggestions: ProductTitleSuggestion[];
    descriptionDraft: ProductDescriptionDraft;
    seo: SeoMetadataSuggestion;
    quality: ListingQualityScore;
  }> {
    const title = (input.productTitle || 'Universal Electronic Device').slice(0, 50);
    const brand = (input.brandName || 'Marketplace Verified').slice(0, 30);
    const features =
      input.keyFeatures && input.keyFeatures.length > 0
        ? input.keyFeatures.slice(0, 5)
        : ['High performance', 'Durable build', 'Energy efficient'];

    const title1 = `${brand} - ${title} (High Performance Edition)`;
    const title2 = `Professional ${title} by ${brand} with Enhanced Reliability`;

    const titleSuggestions: ProductTitleSuggestion[] = [
      ProductTitleSuggestionSchema.parse({
        title: title1.slice(0, 150),
        characterCount: title1.length,
        readabilityScore: 92,
        highlightedKeywords: [brand, 'Performance', 'Edition'],
      }),
      ProductTitleSuggestionSchema.parse({
        title: title2.slice(0, 150),
        characterCount: title2.length,
        readabilityScore: 88,
        highlightedKeywords: ['Professional', brand, 'Reliability'],
      }),
    ];

    const descriptionDraft = ProductDescriptionDraftSchema.parse({
      shortDescription: `Experience state-of-the-art performance with the ${brand} ${title}. Built for reliability and engineered for daily professional demands.`.slice(
        0,
        280
      ),
      bulletPoints: [
        `Engineered by ${brand} for superior build quality and endurance.`,
        `Features comprehensive support: ${features.join(', ')}.`.slice(0, 200),
        'Includes standard 1-year merchant warranty and direct customer support.',
      ],
      detailedHtml: `<p>The <strong>${brand} ${title}</strong> sets a new benchmark in marketplace excellence. Designed from the ground up to deliver uncompromising capability, it combines modern efficiency with intuitive ergonomics.</p><ul>${features
        .map((f) => `<li>${f}</li>`)
        .join('')}</ul>`,
      readingTimeMinutes: 1.5,
      targetAudience: input.targetAudience || 'Discerning professionals and power users',
    });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const seo = SeoMetadataSuggestionSchema.parse({
      metaTitle: `${brand} ${title} - Buy Online`.slice(0, 68),
      metaDescription: `Discover the ${brand} ${title}. Multi-vendor certified pricing and fast tracked fulfillment.`.slice(
        0,
        155
      ),
      canonicalSlugSuggestion: `${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${slug}`.slice(
        0,
        60
      ),
      primaryKeywords: [brand.toLowerCase(), slug.replace(/-/g, ' ')],
      secondaryKeywords: ['buy online', 'fast shipping', 'authentic'],
    });

    const quality = ListingQualityScoreSchema.parse({
      overallScore: 88,
      titleScore: 90,
      descriptionScore: 85,
      attributeCoverageScore: 88,
      imageGuidanceScore: 90,
      suggestions: [
        {
          category: 'title',
          severity: 'positive',
          message: 'Title incorporates brand, product identity, and key modifier.',
        },
        {
          category: 'description',
          severity: 'improvement',
          message: 'Consider adding exact technical dimension measurements to your bullet points.',
        },
        {
          category: 'images',
          severity: 'positive',
          message: 'Ensure at least 3 high-resolution angles are uploaded before publishing.',
        },
      ],
    });

    return {
      titleSuggestions,
      descriptionDraft,
      seo,
      quality,
    };
  }

  public async generateAdminAnalytics(timeframe = 'last_30_days'): Promise<PlatformHealthSummary> {
    const summary: PlatformHealthSummary = {
      period: timeframe === 'last_7_days' ? 'Last 7 Days' : 'Last 30 Days',
      gmvTrend: {
        totalGmv: { amountMinor: 14250000, currency: 'USD' }, // $142,500.00
        growthPercent: 14.2,
        trendDirection: 'up',
      },
      orderFulfillmentRate: 98.4,
      topMerchantPerformance: [
        {
          sellerId: 'seller-tech-direct',
          storeName: 'TechDirect Express',
          summary: 'Highest volume merchant with 99.2% on-time fulfillment and 0.4% return rate.',
        },
        {
          sellerId: 'seller-sound-hub',
          storeName: 'Aura Sound Labs',
          summary:
            'Audio specialist with strong customer satisfaction (4.8/5.0 average review rating).',
        },
      ],
      keyInsights: [
        'Platform GMV increased by 14.2% driven by seasonal workstation and audio catalog demand.',
        'Customer return rate remained exceptionally healthy at 1.4%, below the 3.0% platform threshold.',
        'Multi-vendor split package delivery SLA maintained a 98.4% on-time milestone.',
      ],
      advisoryRecommendations: [
        'Audit inventory levels for top-selling MacBook Pro and Sony WH-1000XM5 SKUs to prevent stockouts.',
        'Review 2 pending merchant applications awaiting KYC credential verification.',
        'Maintain current 8.0% marketplace commission rate; net platform take-rate is performing as modeled.',
      ],
      generatedAt: new Date().toISOString(),
    };

    return PlatformHealthSummarySchema.parse(summary);
  }
}
