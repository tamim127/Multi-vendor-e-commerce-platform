/**
 * ==============================================================================
 * AI DOMAIN — SELLER AI TOOLS CONTRACTS
 * ==============================================================================
 * Contracts for seller-facing AI capabilities: title suggestions, product
 * descriptions, SEO keywords, attribute extraction, and inventory explanations.
 */

export interface ProductTitleSuggestion {
  title: string;
  characterCount: number;
  readabilityScore: number;
  highlightedKeywords: string[];
}

export interface ProductDescriptionDraft {
  shortDescription: string;
  bulletPoints: string[];
  detailedHtml: string;
  readingTimeMinutes: number;
  targetAudience: string;
}

export interface SeoMetadataSuggestion {
  metaTitle: string;
  metaDescription: string;
  canonicalSlugSuggestion: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
}

export interface ExtractedAttribute {
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: number;
}

export interface ListingQualityScore {
  overallScore: number; // 0 - 100
  titleScore: number;
  descriptionScore: number;
  attributeCoverageScore: number;
  imageGuidanceScore: number;
  suggestions: {
    category: 'title' | 'description' | 'attributes' | 'images' | 'pricing';
    severity: 'critical' | 'improvement' | 'positive';
    message: string;
  }[];
}

export interface InventoryTrendInsight {
  sku: string;
  productName: string;
  currentStock: number;
  burnRatePerDay: number;
  runoutEstimateDays: number;
  urgency: 'critical_restock' | 'healthy' | 'overstocked';
  explanation: string;
  suggestedAction: string;
}

export interface SellerAiToolsInput {
  productTitle?: string;
  rawNotes?: string;
  brandName?: string;
  category?: string;
  keyFeatures?: string[];
  targetAudience?: string;
  language?: string;
}

