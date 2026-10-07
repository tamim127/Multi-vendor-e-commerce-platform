import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 1B Design Token Architecture Suite', () => {
  const readCss = (relativePath: string): string =>
    fs.readFileSync(path.resolve(import.meta.dirname, '../../src/styles', relativePath), 'utf-8');

  const primitivesCss = readCss('tokens/primitives.css');
  const semanticCss = readCss('tokens/semantic.css');
  const componentsCss = readCss('tokens/components.css');
  const globalsCss = readCss('globals.css');

  describe('Layer 1: Primitive Tokens', () => {
    it('should define raw neutral, brand, accent, and semantic colors in OKLCH format', () => {
      const oklchMatches = primitivesCss.match(/oklch\([^)]+\)/g);
      expect(oklchMatches).not.toBeNull();
      expect(oklchMatches!.length).toBeGreaterThan(30);

      // Verify canonical oklch lightness bounds
      for (const color of oklchMatches!) {
        expect(color).toMatch(
          /^oklch\(\s*[0-1](\.\d+)?\s+[0-9.]+\s+[0-9.]+(\s*\/\s*[0-9.]+)?\s*\)$/
        );
      }
    });

    it('should define mathematical spacing scale adhering to 4px increments', () => {
      expect(primitivesCss).toMatch(/--primitive-space-1:\s*0\.25rem/); // 4px
      expect(primitivesCss).toMatch(/--primitive-space-2:\s*0\.5rem/); // 8px
      expect(primitivesCss).toMatch(/--primitive-space-4:\s*1rem/); // 16px
      expect(primitivesCss).toMatch(/--primitive-space-8:\s*2rem/); // 32px
      expect(primitivesCss).toMatch(/--primitive-space-12:\s*3rem/); // 48px
    });

    it('should define responsive breakpoint scale spanning 320px to 2560px', () => {
      expect(primitivesCss).toMatch(/--primitive-breakpoint-xs:\s*320px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-sm:\s*375px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-md:\s*768px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-lg:\s*1024px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-xl:\s*1280px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-2xl:\s*1440px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-3xl:\s*1920px/);
      expect(primitivesCss).toMatch(/--primitive-breakpoint-4xl:\s*2560px/);
    });

    it('should define monotonic z-index layer stack', () => {
      expect(primitivesCss).toMatch(/--primitive-z-base:\s*0/);
      expect(primitivesCss).toMatch(/--primitive-z-sticky:\s*10/);
      expect(primitivesCss).toMatch(/--primitive-z-header:\s*20/);
      expect(primitivesCss).toMatch(/--primitive-z-modal:\s*60/);
      expect(primitivesCss).toMatch(/--primitive-z-toast:\s*70/);
      expect(primitivesCss).toMatch(/--primitive-z-tooltip:\s*80/);
      expect(primitivesCss).toMatch(/--primitive-z-max:\s*100/);
    });
  });

  describe('Layer 2: Semantic Tokens', () => {
    it('should map core semantic roles to primitive tokens', () => {
      expect(semanticCss).toMatch(/--color-bg-canvas:\s*var\(--primitive-neutral-50\)/);
      expect(semanticCss).toMatch(/--color-bg-surface:\s*var\(--primitive-neutral-0\)/);
      expect(semanticCss).toMatch(/--color-fg-primary:\s*var\(--primitive-neutral-900\)/);
      expect(semanticCss).toMatch(/--color-primary:\s*var\(--primitive-indigo-600\)/);
      expect(semanticCss).toMatch(/--color-accent:\s*var\(--primitive-amber-500\)/);
      expect(semanticCss).toMatch(/--color-success:\s*var\(--primitive-emerald-500\)/);
      expect(semanticCss).toMatch(/--color-destructive:\s*var\(--primitive-crimson-500\)/);
    });

    it('should include commerce domain semantic tokens', () => {
      expect(semanticCss).toContain('--color-commerce-price:');
      expect(semanticCss).toContain('--color-commerce-price-sale:');
      expect(semanticCss).toContain('--color-commerce-rating-star:');
      expect(semanticCss).toContain('--color-commerce-verified-fg:');
      expect(semanticCss).toContain('--color-inventory-instock:');
      expect(semanticCss).toContain('--color-inventory-lowstock:');
      expect(semanticCss).toContain('--color-inventory-outofstock:');
      expect(semanticCss).toContain('--color-order-processing:');
      expect(semanticCss).toContain('--color-order-delivered:');
      expect(semanticCss).toContain('--color-campaign-flash:');
    });

    it('should define dark mode semantic overrides under .dark selector', () => {
      expect(semanticCss).toContain('.dark {');
      expect(semanticCss).toMatch(/--color-bg-canvas:\s*var\(--primitive-neutral-950\)/);
      expect(semanticCss).toMatch(/--color-bg-surface:\s*var\(--primitive-neutral-900\)/);
      expect(semanticCss).toMatch(/--color-fg-primary:\s*var\(--primitive-neutral-50\)/);
      expect(semanticCss).toMatch(/--color-border-subtle:\s*var\(--primitive-neutral-800\)/);
    });

    it('should establish WCAG 2.2 AA compliant interactive touch targets', () => {
      expect(semanticCss).toMatch(/--size-touch-target-min:\s*2\.75rem/); // 44px
      expect(semanticCss).toMatch(/--size-touch-target-comfort:\s*3(\.00)?rem/); // 48px
    });
  });

  describe('Layer 3: Component Tokens', () => {
    it('should define explicit component namespaces', () => {
      expect(componentsCss).toContain('--comp-btn-');
      expect(componentsCss).toContain('--comp-input-');
      expect(componentsCss).toContain('--comp-checkbox-');
      expect(componentsCss).toContain('--comp-card-');
      expect(componentsCss).toContain('--comp-product-card-');
      expect(componentsCss).toContain('--comp-price-');
      expect(componentsCss).toContain('--comp-rating-');
      expect(componentsCss).toContain('--comp-dialog-');
      expect(componentsCss).toContain('--comp-drawer-');
      expect(componentsCss).toContain('--comp-tooltip-');
      expect(componentsCss).toContain('--comp-nav-');
      expect(componentsCss).toContain('--comp-table-');
    });
  });

  describe('Tailwind v4 Integration Registry', () => {
    it('should expose @theme bindings for utility consumption in globals.css', () => {
      expect(globalsCss).toContain('@theme {');
      expect(globalsCss).toContain('--color-canvas:');
      expect(globalsCss).toContain('--color-surface:');
      expect(globalsCss).toContain('--color-primary:');
      expect(globalsCss).toContain('--radius-md:');
      expect(globalsCss).toContain('--shadow-md:');
      expect(globalsCss).toContain('--breakpoint-md:');
    });
  });
});
