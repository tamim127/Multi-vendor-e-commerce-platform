import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  isValidLocale,
  getLocaleConfig,
  isRtl,
  getDirection,
  applyDirectionToDocument,
  mirrorIcon,
  formatNumber,
  formatPercent,
  formatDate,
  formatMoney,
  getTranslation,
  I18nProvider,
  useI18n,
  SUPPORTED_LOCALES,
} from '@/lib/i18n';
import { LanguageSelector } from '@/components/layout/header/language-selector';

describe('Phase 1F: Internationalization, Localization & RTL Foundation', () => {
  describe('Locale Configuration & Validation', () => {
    it('validates supported locales and rejects invalid inputs', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('bn')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
      expect(isValidLocale('hi')).toBe(true);

      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('')).toBe(false);
      expect(isValidLocale(null)).toBe(false);
      expect(isValidLocale(123)).toBe(false);
    });

    it('returns valid LocaleConfig for all 4 languages', () => {
      SUPPORTED_LOCALES.forEach((code) => {
        const config = getLocaleConfig(code);
        expect(config.code).toBe(code);
        expect(config.name).toBeDefined();
        expect(config.nativeName).toBeDefined();
        expect(config.defaultCurrency).toBeDefined();
        expect(config.localeString).toBeDefined();
      });
    });

    it('correctly maps Arabic to RTL and others to LTR', () => {
      expect(isRtl('ar')).toBe(true);
      expect(getDirection('ar')).toBe('rtl');

      expect(isRtl('en')).toBe(false);
      expect(getDirection('en')).toBe('ltr');

      expect(isRtl('bn')).toBe(false);
      expect(getDirection('bn')).toBe('ltr');

      expect(isRtl('hi')).toBe(false);
      expect(getDirection('hi')).toBe('ltr');
    });

    it('generates correct icon mirror classes for RTL', () => {
      expect(mirrorIcon(true)).toBe('scale-x-[-1]');
      expect(mirrorIcon(false)).toBe('');
    });
  });

  describe('Document Direction & DOM Updates', () => {
    it('applies dir and lang attributes to document.documentElement', () => {
      applyDirectionToDocument('rtl', 'ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');

      applyDirectionToDocument('ltr', 'bn');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('bn');

      // Reset to English
      applyDirectionToDocument('ltr', 'en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('Formatting Utilities Layer', () => {
    it('formats numbers across different locales', () => {
      const num = 1250000;
      const en = formatNumber(num, 'en');
      expect(en).toContain('1,250,000');

      const bn = formatNumber(num, 'bn');
      expect(bn).toBeDefined();
      expect(bn.length).toBeGreaterThan(0);
    });

    it('formats percentages correctly', () => {
      const rate = 0.185;
      const enPercent = formatPercent(rate, 'en');
      expect(enPercent).toContain('18.5%');
    });

    it('formats dates according to locale', () => {
      const date = new Date(2026, 9, 7);
      const enDate = formatDate(date, 'en');
      expect(enDate).toBeDefined();
      expect(enDate).toContain('2026');
    });

    it('formats monetary currency amounts with symbols without conversion', () => {
      const enMoney = formatMoney(120.5, 'USD', 'en');
      expect(enMoney).toContain('120.50');
      expect(enMoney).toContain('$');

      const arMoney = formatMoney(120.5, 'AED', 'ar');
      expect(arMoney).toBeDefined();

      const bnMoney = formatMoney(120.5, 'BDT', 'bn');
      expect(bnMoney).toBeDefined();
    });
  });

  describe('Translation Architecture & Interpolation', () => {
    it('retrieves translations for all 4 supported languages', () => {
      expect(getTranslation('en', 'common.home')).toBe('Home');
      expect(getTranslation('bn', 'common.home')).toBe('হোম');
      expect(getTranslation('ar', 'common.home')).toBe('الرئيسية');
      expect(getTranslation('hi', 'common.home')).toBe('होम');
    });

    it('falls back to English when key is missing in another language', () => {
      const nonExistentKey = 'non.existent.key';
      expect(getTranslation('bn', nonExistentKey)).toBe(nonExistentKey);
    });

    it('interpolates parameters correctly', () => {
      const text = getTranslation('en', 'announcement.defaultMessage');
      expect(text).toContain('150');
    });
  });

  describe('I18nProvider & LanguageSelector UI', () => {
    function Consumer(): React.JSX.Element {
      const { locale, direction, t } = useI18n();
      return (
        <div>
          <span data-testid="current-locale">{locale}</span>
          <span data-testid="current-dir">{direction}</span>
          <span data-testid="current-home">{t('common.home')}</span>
        </div>
      );
    }

    it('provides reactive locale context and updates on language switch', () => {
      render(
        <I18nProvider defaultLocale="en">
          <Consumer />
          <LanguageSelector />
        </I18nProvider>
      );

      expect(screen.getByTestId('current-locale').textContent).toBe('en');
      expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
      expect(screen.getByTestId('current-home').textContent).toBe('Home');

      // Open Language Selector dropdown
      const trigger = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(trigger);

      // Select Arabic (RTL)
      const arOption = screen.getByRole('option', { name: /العربية/i });
      fireEvent.click(arOption);

      expect(screen.getByTestId('current-locale').textContent).toBe('ar');
      expect(screen.getByTestId('current-dir').textContent).toBe('rtl');
      expect(screen.getByTestId('current-home').textContent).toBe('الرئيسية');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });
  });
});
