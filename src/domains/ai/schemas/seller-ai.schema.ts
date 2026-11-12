/**
 * ==============================================================================
 * AI DOMAIN — SELLER AI SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  ProductTitleSuggestion,
  ProductDescriptionDraft,
  SeoMetadataSuggestion,
  ExtractedAttribute,
  ListingQualityScore,
  InventoryTrendInsight,
  SellerAiToolsInput,
} from '../types/seller-ai';

export const ProductTitleSuggestionSchema: z.ZodType<ProductTitleSuggestion> = z.object({
  title: z.string().min(3).max(200),
  characterCount: z.number().int().positive(),
  readabilityScore: z.number().min(0).max(100),
  highlightedKeywords: z.array(z.string()),
});

export const ProductDescriptionDraftSchema: z.ZodType<ProductDescriptionDraft> = z.object({
  shortDescription: z.string().min(10).max(300),
  bulletPoints: z.array(z.string().min(5).max(300)).min(1).max(10),
  detailedHtml: z.string().min(20),
  readingTimeMinutes: z.number().min(0.1),
  targetAudience: z.string(),
});

export const SeoMetadataSuggestionSchema: z.ZodType<SeoMetadataSuggestion> = z.object({
  metaTitle: z.string().min(5).max(70),
  metaDescription: z.string().min(10).max(160),
  canonicalSlugSuggestion: z.string().min(3).max(100),
  primaryKeywords: z.array(z.string()).min(1),
  secondaryKeywords: z.array(z.string()),
});

export const ExtractedAttributeSchema: z.ZodType<ExtractedAttribute> = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export const ListingQualityScoreSchema: z.ZodType<ListingQualityScore> = z.object({
  overallScore: z.number().min(0).max(100),
  titleScore: z.number().min(0).max(100),
  descriptionScore: z.number().min(0).max(100),
  attributeCoverageScore: z.number().min(0).max(100),
  imageGuidanceScore: z.number().min(0).max(100),
  suggestions: z.array(
    z.object({
      category: z.enum(['title', 'description', 'attributes', 'images', 'pricing']),
      severity: z.enum(['critical', 'improvement', 'positive']),
      message: z.string(),
    })
  ),
});

export const InventoryTrendInsightSchema: z.ZodType<InventoryTrendInsight> = z.object({
  sku: z.string().min(1),
  productName: z.string().min(1),
  currentStock: z.number().int().nonnegative(),
  burnRatePerDay: z.number().nonnegative(),
  runoutEstimateDays: z.number().nonnegative(),
  urgency: z.enum(['critical_restock', 'healthy', 'overstocked']),
  explanation: z.string(),
  suggestedAction: z.string(),
});

export const SellerAiToolsInputSchema: z.ZodType<SellerAiToolsInput> = z.object({
  productTitle: z.string().max(200).optional(),
  rawNotes: z.string().max(4000).optional(),
  brandName: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  keyFeatures: z.array(z.string().max(200)).optional(),
  targetAudience: z.string().max(200).optional(),
  language: z.string().max(10).optional(),
});

