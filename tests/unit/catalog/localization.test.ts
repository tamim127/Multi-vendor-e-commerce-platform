/**
 * ==============================================================================
 * CATALOG DOMAIN TEST SUITE — LOCALIZATION UTILITIES
 * ==============================================================================
 * Verifies safe text resolution fallback chains and Unicode-safe search normalization.
 * Guarantees preservation of Bengali, Arabic, and Hindi scripts while folding Latin diacritics.
 */

import { describe, expect, it } from 'vitest';
import { normalizeSearchToken, resolveLocalizedText } from '@/domains/catalog/utils/localization';

describe('Catalog Localization Utilities', () => {
  describe('resolveLocalizedText', () => {
    const text = {
      en: 'MacBook Pro 16"',
      bn: 'ম্যাকবুক প্রো ১৬"',
      ar: 'ماك بوك برو ١٦ بوصة',
      hi: 'मैकबुक प्रो 16"',
    };

    it('returns requested locale string when present', () => {
      expect(resolveLocalizedText(text, 'bn')).toBe('ম্যাকবুক প্রো ১৬"');
      expect(resolveLocalizedText(text, 'ar')).toBe('ماك بوك برو ١٦ بوصة');
      expect(resolveLocalizedText(text, 'hi')).toBe('मैकबुक प्रो 16"');
      expect(resolveLocalizedText(text, 'en')).toBe('MacBook Pro 16"');
    });

    it('falls back to English when requested locale is missing', () => {
      const partial = { en: 'Default English' };
      expect(resolveLocalizedText(partial, 'bn')).toBe('Default English');
    });

    it('falls back to first available string when English is missing', () => {
      const noEn = { bn: 'শুধুমাত্র বাংলা' } as unknown as { en: string; bn: string };
      expect(resolveLocalizedText(noEn, 'ar')).toBe('শুধুমাত্র বাংলা');
    });
  });

  describe('normalizeSearchToken Unicode Normalization', () => {
    it('handles empty and whitespace-only strings gracefully', () => {
      expect(normalizeSearchToken('')).toBe('');
      expect(normalizeSearchToken('   ')).toBe('');
      expect(normalizeSearchToken(null as unknown as string)).toBe('');
      expect(normalizeSearchToken(undefined as unknown as string)).toBe('');
    });

    it('trims leading/trailing whitespace and collapses multiple spaces', () => {
      expect(normalizeSearchToken('  wireless    noise   cancelling  ')).toBe(
        'wireless noise cancelling'
      );
    });

    it('lowercases ASCII letters', () => {
      expect(normalizeSearchToken('Apple MacBook PRO 16')).toBe('apple macbook pro 16');
    });

    it('folds Latin diacritics to basic Latin equivalents (Latin-1 Supplement & Extended-A/B)', () => {
      expect(normalizeSearchToken('café')).toBe('cafe');
      expect(normalizeSearchToken('München')).toBe('munchen');
      expect(normalizeSearchToken('naïve')).toBe('naive');
      expect(normalizeSearchToken('crème brûlée')).toBe('creme brulee');
      expect(normalizeSearchToken('façade')).toBe('facade');
      expect(normalizeSearchToken('Ångström')).toBe('angstrom');
      expect(normalizeSearchToken('El Niño')).toBe('el nino');
      expect(normalizeSearchToken('Zürich')).toBe('zurich');
    });

    it('preserves Bengali script without altering vowels, conjuncts, or hasant', () => {
      expect(normalizeSearchToken('ম্যাকবুক')).toBe('ম্যাকবুক');
      expect(normalizeSearchToken('ল্যাপটপ')).toBe('ল্যাপটপ');
      expect(normalizeSearchToken('অ্যাপল')).toBe('অ্যাপল');
      expect(normalizeSearchToken('হেডফোন')).toBe('হেডফোন');
      expect(normalizeSearchToken('  ম্যাকবুক   প্রো  ')).toBe('ম্যাকবুক প্রো');
    });

    it('preserves Arabic script without altering Arabic Unicode points', () => {
      expect(normalizeSearchToken('ماك بوك')).toBe('ماك بوك');
      expect(normalizeSearchToken('إلكترونيات')).toBe('إلكترونيات');
      expect(normalizeSearchToken('سماعات')).toBe('سماعات');
      expect(normalizeSearchToken('  أبل   ماك بوك  ')).toBe('أبل ماك بوك');
    });

    it('preserves Hindi / Devanagari script without altering matras, nuktas, or virama', () => {
      expect(normalizeSearchToken('मैकबुक')).toBe('मैकबुक');
      expect(normalizeSearchToken('लैपटॉप')).toBe('लैपटॉप');
      expect(normalizeSearchToken('ऐप्पल')).toBe('ऐप्पल');
      expect(normalizeSearchToken('हेडफ़ोन')).toBe('हेडफ़ोन');
      expect(normalizeSearchToken('  मैकबुक   प्रो  ')).toBe('मैकबुक प्रो');
    });
  });
});
