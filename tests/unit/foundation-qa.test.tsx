import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import {
  I18nProvider,
  useI18n,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  getLocaleConfig,
  formatNumber,
  formatPercent,
  formatDate,
  formatMoney,
  i18nInitScript,
  type Locale,
} from '@/lib/i18n';
import { ThemeProvider, useTheme, themeInitScript, THEME_STORAGE_KEY } from '@/lib/theme';
import { SiteFooter } from '@/components/layout/footer/footer';
import { AppShell } from '@/components/layout/shell/app-shell';
import fs from 'fs';
import path from 'path';

describe('Phase 1G — Foundation QA & Acceptance Freeze Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Responsive Breakpoint Tokens Baseline', () => {
    it('verifies all standard responsive breakpoint tokens are strictly defined in primitives.css', () => {
      const primitivesCss = fs.readFileSync(
        path.resolve(process.cwd(), 'src/styles/tokens/primitives.css'),
        'utf-8'
      );
      expect(primitivesCss).toMatch(/--primitive-breakpoint-xs:\s*320px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-sm:\s*375px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-md:\s*768px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-lg:\s*1024px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-xl:\s*1280px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-2xl:\s*1440px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-3xl:\s*1920px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-4xl:\s*2560px/);
    });
  });

  describe('2. I18N & RTL Cross-Switching Matrix', () => {
    function LocaleConsumer(): React.JSX.Element {
      const { locale, setLocale, direction, isRtl, t } = useI18n();
      return (
        <div>
          <span data-testid="current-locale">{locale}</span>
          <span data-testid="current-dir">{direction}</span>
          <span data-testid="is-rtl">{isRtl ? 'true' : 'false'}</span>
          <span data-testid="home-string">{t('common.home')}</span>
          <button onClick={() => setLocale('en')}>Set EN</button>
          <button onClick={() => setLocale('bn')}>Set BN</button>
          <button onClick={() => setLocale('ar')}>Set AR</button>
          <button onClick={() => setLocale('hi')}>Set HI</button>
        </div>
      );
    }

    it('handles all locale transitions in the required matrix (en, bn, ar, hi)', () => {
      render(
        <I18nProvider>
          <LocaleConsumer />
        </I18nProvider>
      );

      // Default EN
      expect(screen.getByTestId('current-locale').textContent).toBe('en');
      expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
      expect(screen.getByTestId('is-rtl').textContent).toBe('false');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');

      // en -> bn
      fireEvent.click(screen.getByText('Set BN'));
      expect(screen.getByTestId('current-locale').textContent).toBe('bn');
      expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
      expect(document.documentElement.lang).toBe('bn');

      // bn -> ar (LTR -> RTL)
      fireEvent.click(screen.getByText('Set AR'));
      expect(screen.getByTestId('current-locale').textContent).toBe('ar');
      expect(screen.getByTestId('current-dir').textContent).toBe('rtl');
      expect(screen.getByTestId('is-rtl').textContent).toBe('true');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');

      // ar -> en (RTL -> LTR)
      fireEvent.click(screen.getByText('Set EN'));
      expect(screen.getByTestId('current-locale').textContent).toBe('en');
      expect(screen.getByTestId('current-dir').textContent).toBe('ltr');
      expect(document.documentElement.dir).toBe('ltr');

      // en -> hi
      fireEvent.click(screen.getByText('Set HI'));
      expect(screen.getByTestId('current-locale').textContent).toBe('hi');
      expect(screen.getByTestId('current-dir').textContent).toBe('ltr');

      // hi -> ar
      fireEvent.click(screen.getByText('Set AR'));
      expect(screen.getByTestId('current-locale').textContent).toBe('ar');
      expect(screen.getByTestId('current-dir').textContent).toBe('rtl');
    });

    it('validates locale helper functions', () => {
      expect(SUPPORTED_LOCALES).toEqual(['en', 'bn', 'ar', 'hi']);
      expect(DEFAULT_LOCALE).toBe('en');
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('bn')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
      expect(isValidLocale('hi')).toBe(true);
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });

    it('retrieves correct metadata for all locales', () => {
      const en = getLocaleConfig('en');
      expect(en.direction).toBe('ltr');
      expect(en.script).toBe('Latn');

      const ar = getLocaleConfig('ar');
      expect(ar.direction).toBe('rtl');
      expect(ar.script).toBe('Arab');

      const bn = getLocaleConfig('bn');
      expect(bn.direction).toBe('ltr');
      expect(bn.script).toBe('Beng');

      const hi = getLocaleConfig('hi');
      expect(hi.direction).toBe('ltr');
      expect(hi.script).toBe('Deva');
    });
  });

  describe('3. Internationalization Formatting Robustness', () => {
    it('formats negative, zero, and large numbers across locales without throwing', () => {
      const testLocales: Locale[] = ['en', 'bn', 'ar', 'hi'];
      testLocales.forEach((loc) => {
        expect(() => formatNumber(0, loc)).not.toThrow();
        expect(() => formatNumber(-42.5, loc)).not.toThrow();
        expect(() => formatNumber(1000000, loc)).not.toThrow();
        expect(() => formatPercent(0.15, loc)).not.toThrow();
        expect(() => formatDate(new Date(), loc)).not.toThrow();
        expect(() => formatMoney(99.99, 'USD', loc)).not.toThrow();
      });
    });
  });

  describe('4. Theme & I18N Resilience under Storage Failure', () => {
    it('gracefully handles localStorage.getItem throwing SecurityError in I18nProvider', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: Access denied');
      });

      function TestComponent(): React.JSX.Element {
        const { locale } = useI18n();
        return <div data-testid="fallback-locale">{locale}</div>;
      }

      expect(() => {
        render(
          <I18nProvider>
            <TestComponent />
          </I18nProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('fallback-locale').textContent).toBe(DEFAULT_LOCALE);
    });

    it('gracefully handles localStorage.getItem throwing SecurityError in ThemeProvider', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: Access denied');
      });

      function TestThemeComponent(): React.JSX.Element {
        const { theme } = useTheme();
        return <div data-testid="fallback-theme">{theme}</div>;
      }

      expect(() => {
        render(
          <ThemeProvider>
            <TestThemeComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('fallback-theme').textContent).toBe('system');
    });
  });

  describe('5. Zero-FOUC Inline Scripts Verification', () => {
    it('verifies themeInitScript contains valid executable JS with storage key', () => {
      expect(themeInitScript).toContain(THEME_STORAGE_KEY);
      expect(themeInitScript).toContain('localStorage.getItem');
      expect(themeInitScript).toContain('classList.add');
    });

    it('verifies i18nInitScript contains valid executable JS with storage key and direction', () => {
      expect(i18nInitScript).toContain('marketplace_locale');
      expect(i18nInitScript).toContain('document.documentElement.dir');
      expect(i18nInitScript).toContain('document.documentElement.lang');
    });
  });

  describe('6. Security & Neutral Non-Claim Language Audit', () => {
    it('verifies SiteFooter does not contain unverified third-party certification claims', () => {
      render(
        <I18nProvider>
          <SiteFooter />
        </I18nProvider>
      );

      // Verify absence of unverified claims
      expect(screen.queryByText(/SOC2 Type II/i)).toBeNull();
      expect(screen.queryByText(/GDPR & CCPA Compliant/i)).toBeNull();
      expect(screen.queryByText(/PCI-DSS Level 1/i)).toBeNull();
      expect(screen.queryByText(/Escrow Protection/i)).toBeNull();
      expect(screen.queryByText(/Dedicated Concierge/i)).toBeNull();

      // Verify presence of neutral platform architecture baseline descriptors
      expect(screen.getByText('Security Architecture')).toBeDefined();
      expect(screen.getByText('Privacy Framework')).toBeDefined();
      expect(screen.getByText('Payment Standards Baseline')).toBeDefined();
      expect(screen.getByText('Cross-Border Delivery')).toBeDefined();
      expect(screen.getByText('Payment Security')).toBeDefined();
      expect(screen.getByText('Return Policies')).toBeDefined();
      expect(screen.getByText('Platform Support')).toBeDefined();
    });
  });

  describe('7. Shell Landmarks & Accessibility Structure', () => {
    it('verifies presence of all required WCAG landmarks in AppShell', () => {
      render(
        <ThemeProvider>
          <I18nProvider>
            <AppShell announcementMessage="Launch notice">
              <div>Content</div>
            </AppShell>
          </I18nProvider>
        </ThemeProvider>
      );

      expect(screen.getByRole('banner')).toBeDefined(); // Header
      expect(screen.getByRole('main')).toBeDefined(); // Main content
      expect(screen.getByRole('contentinfo')).toBeDefined(); // Footer
      expect(screen.getByRole('search')).toBeDefined(); // Search form
      expect(screen.getByRole('link', { name: /skip to main content/i })).toBeDefined(); // Skip link
    });
  });
});
