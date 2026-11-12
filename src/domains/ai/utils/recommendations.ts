/**
 * ==============================================================================
 * AI DOMAIN — DETERMINISTIC RECOMMENDATION ENGINE
 * ==============================================================================
 * Deterministic catalog recommendation & semantic similarity engine.
 * Maps natural language customer intents to canonical products using exact
 * category paths, brand relations, spec filters, and integer Money pricing.
 * Zero external vector DB dependencies; fully verifiable in unit & E2E tests.
 */

import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures/products.fixture';
import type { Product } from '@/domains/catalog/types/product';
import type {
  RecommendationItem,
  RecommendationResult,
  RecommendationStrategy,
  SemanticParsedQuery,
} from '../types/search-recommendation';
import type { RecommendedProductCard } from '../types/assistant';

function mapProductToRecommendationItem(
  product: Product,
  relevanceScore: number,
  reasonCode: string,
  reasonLabel: string
): RecommendationItem {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title.en,
    brandName: product.brand.name,
    price: product.offerSummary.lowestPrice,
    ratingAverage: product.ratingSummary.average,
    primaryImage:
      product.media.find((m) => m.role === 'primary')?.url ||
      product.media[0]?.url ||
      '/assets/mock/products/mbp16-hero.webp',
    relevanceScore,
    reasonCode,
    reasonLabel,
  };
}

export function mapProductToAssistantCard(
  product: Product,
  matchReason: string
): RecommendedProductCard {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title.en,
    brandName: product.brand.name,
    primaryImage:
      product.media.find((m) => m.role === 'primary')?.url ||
      product.media[0]?.url ||
      '/assets/mock/products/mbp16-hero.webp',
    price: product.offerSummary.lowestPrice,
    ratingAverage: product.ratingSummary.average,
    reviewCount: product.ratingSummary.count,
    stockStatus: product.offerSummary.offerCount > 0 ? 'in_stock' : 'out_of_stock',
    matchReason,
    categoryPath: product.categoryPath,
  };
}

/**
 * Parses freeform natural language query to infer category, brand, budget, and intent.
 */
export function parseNaturalLanguageQuery(query: string): SemanticParsedQuery {
  const lower = query.toLowerCase();
  const extractedFeatures: string[] = [];
  let inferredCategory: string | undefined;
  let inferredBrand: string | undefined;
  let maxBudgetMinor: number | undefined;
  let intent: SemanticParsedQuery['intent'] = 'browse';

  // Extract budget: e.g. "under $500", "less than 400", "budget 2000"
  const budgetMatch =
    lower.match(/under\s+\$?(\d+)/i) ||
    lower.match(/less\s+than\s+\$?(\d+)/i) ||
    lower.match(/below\s+\$?(\d+)/i) ||
    lower.match(/budget\s+(?:of\s+)?\$?(\d+)/i);

  if (budgetMatch?.[1]) {
    const dollars = parseInt(budgetMatch[1], 10);
    if (!isNaN(dollars)) {
      maxBudgetMinor = dollars * 100;
      intent = 'budget_filter';
      extractedFeatures.push(`Budget: <$${dollars}`);
    }
  }

  // Detect brands
  if (lower.includes('apple') || lower.includes('macbook')) {
    inferredBrand = 'Apple';
    extractedFeatures.push('Brand: Apple');
  } else if (lower.includes('sony')) {
    inferredBrand = 'Sony';
    extractedFeatures.push('Brand: Sony');
  } else if (lower.includes('samsung')) {
    inferredBrand = 'Samsung';
    extractedFeatures.push('Brand: Samsung');
  } else if (lower.includes('nike')) {
    inferredBrand = 'Nike';
    extractedFeatures.push('Brand: Nike');
  }

  // Detect category keywords
  if (
    lower.includes('laptop') ||
    lower.includes('notebook') ||
    lower.includes('macbook') ||
    lower.includes('computer')
  ) {
    inferredCategory = 'Laptops';
    extractedFeatures.push('Category: Laptops');
  } else if (
    lower.includes('headphone') ||
    lower.includes('earphone') ||
    lower.includes('audio') ||
    lower.includes('xm5')
  ) {
    inferredCategory = 'Headphones';
    extractedFeatures.push('Category: Audio');
  } else if (lower.includes('shoe') || lower.includes('running') || lower.includes('sneaker')) {
    inferredCategory = 'Shoes';
    extractedFeatures.push('Category: Footwear');
  } else if (lower.includes('monitor') || lower.includes('display') || lower.includes('screen')) {
    inferredCategory = 'Monitors';
    extractedFeatures.push('Category: Displays');
  }

  if (lower.includes('compare') || lower.includes('versus') || lower.includes('vs')) {
    intent = 'compare';
  } else if (lower.includes('buy') || lower.includes('order') || lower.includes('price')) {
    if (intent !== 'budget_filter') {
      intent = 'buy_specific';
    }
  }

  return {
    rawQuery: query,
    inferredCategory,
    inferredBrand,
    maxBudgetMinor,
    currency: 'USD',
    extractedFeatures,
    intent,
  };
}

/**
 * Finds similar products based on category, brand, or specs.
 */
export function getSimilarProducts(
  productId: string,
  limit = 4,
  strategy: RecommendationStrategy = 'similar_products'
): RecommendationResult {
  const target = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!target) {
    return {
      strategy,
      title: 'Recommended Products',
      items: MOCK_PRODUCTS.slice(0, limit).map((p) =>
        mapProductToRecommendationItem(p, 0.85, 'POPULAR_CHOICE', 'Top rated across marketplace')
      ),
      generatedAt: new Date().toISOString(),
    };
  }

  // Score other products
  const scored = MOCK_PRODUCTS.filter((p) => p.id !== productId)
    .map((p) => {
      let score = 0.5;
      let reason = 'Marketplace top pick';

      if (p.categoryId === target.categoryId) {
        score += 0.35;
        reason = 'Same product category';
      } else if (p.categoryPath.split('/')[1] === target.categoryPath.split('/')[1]) {
        score += 0.2;
        reason = 'Similar department';
      }

      if (p.brand.id === target.brand.id) {
        score += 0.15;
        reason = `Also by ${target.brand.name}`;
      }

      return {
        product: p,
        score: Math.min(score, 0.99),
        reason,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    strategy,
    title:
      strategy === 'similar_products'
        ? 'Similar Products You Might Like'
        : 'Frequently Bought Together',
    subtitle: `Curated alternatives to ${target.title.en}`,
    items: scored.map((s) =>
      mapProductToRecommendationItem(s.product, s.score, 'SIMILAR_SPEC', s.reason)
    ),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Recommends products matching natural language customer intent or budget constraint.
 */
export function getNaturalLanguageRecommendations(
  query: string,
  limit = 4
): {
  parsed: SemanticParsedQuery;
  cards: RecommendedProductCard[];
  summaryMessage: string;
} {
  const parsed = parseNaturalLanguageQuery(query);
  let candidates = [...MOCK_PRODUCTS];

  // Filter by budget if specified
  if (parsed.maxBudgetMinor !== undefined) {
    const budget = parsed.maxBudgetMinor;
    candidates = candidates.filter((p) => p.offerSummary.lowestPrice.amountMinor <= budget);
  }

  // Filter or prioritize by brand
  if (parsed.inferredBrand) {
    const brandLower = parsed.inferredBrand.toLowerCase();
    const brandMatches = candidates.filter(
      (p) =>
        p.brand.name.toLowerCase().includes(brandLower) ||
        p.title.en.toLowerCase().includes(brandLower)
    );
    if (brandMatches.length > 0) {
      candidates = brandMatches;
    }
  }

  // Filter or prioritize by category
  if (parsed.inferredCategory) {
    const catLower = parsed.inferredCategory.toLowerCase();
    const catMatches = candidates.filter(
      (p) =>
        p.categoryPath.toLowerCase().includes(catLower) ||
        p.title.en.toLowerCase().includes(catLower)
    );
    if (catMatches.length > 0) {
      candidates = catMatches;
    }
  }

  // Fallback to top rated if candidates became empty
  if (candidates.length === 0) {
    candidates = [...MOCK_PRODUCTS].sort(
      (a, b) => b.ratingSummary.average - a.ratingSummary.average
    );
  }

  const selected = candidates.slice(0, limit);
  const cards = selected.map((p) => {
    let reason = 'Top match for your search criteria';
    if (parsed.maxBudgetMinor) {
      reason = `Under $${(parsed.maxBudgetMinor / 100).toFixed(0)} budget filter`;
    } else if (parsed.inferredBrand) {
      reason = `Official ${parsed.inferredBrand} product with multi-vendor offers`;
    } else if (parsed.inferredCategory) {
      reason = `Highly rated in ${parsed.inferredCategory}`;
    }
    return mapProductToAssistantCard(p, reason);
  });

  let summaryMessage = `I found ${selected.length} verified products matching your request.`;
  if (parsed.maxBudgetMinor) {
    summaryMessage = `Here are the top options under $${(parsed.maxBudgetMinor / 100).toFixed(0)} with active marketplace stock.`;
  } else if (parsed.inferredBrand) {
    summaryMessage = `Here are our verified ${parsed.inferredBrand} options with multi-vendor pricing.`;
  }

  return {
    parsed,
    cards,
    summaryMessage,
  };
}
