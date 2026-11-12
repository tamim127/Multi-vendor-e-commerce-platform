import { describe, it, expect } from 'vitest';
import {
  parseNaturalLanguageQuery,
  getSimilarProducts,
  getNaturalLanguageRecommendations,
} from '@/domains/ai/utils/recommendations';

describe('AI Domain — Catalog Recommendations & Intent Parsing', () => {
  it('parses natural language budget constraint and category', () => {
    const query = 'Looking for a laptop under $2500';
    const parsed = parseNaturalLanguageQuery(query);

    expect(parsed.inferredCategory).toBe('Laptops');
    expect(parsed.maxBudgetMinor).toBe(250000); // $2500 in cents
    expect(parsed.intent).toBe('budget_filter');
  });

  it('parses brand and audio intent correctly', () => {
    const query = 'Best Sony wireless headphones';
    const parsed = parseNaturalLanguageQuery(query);

    expect(parsed.inferredBrand).toBe('Sony');
    expect(parsed.inferredCategory).toBe('Headphones');
    expect(parsed.extractedFeatures).toContain('Brand: Sony');
  });

  it('finds similar products for canonical MacBook Pro', () => {
    const result = getSimilarProducts('prod-macbook-pro-16', 3);

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.productId).not.toBe('prod-macbook-pro-16');
    expect(result.items[0]?.price.amountMinor).toBeGreaterThan(0);
  });

  it('filters recommendations by budget accurately', () => {
    const { cards } = getNaturalLanguageRecommendations('headphones under $500', 3);

    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.price.amountMinor).toBeLessThanOrEqual(50000);
    }
  });
});

