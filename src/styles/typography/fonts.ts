import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';

/**
 * ==============================================================================
 * GLOBAL COMMERCE TYPOGRAPHY ARCHITECTURE
 * ==============================================================================
 * Configures self-hosted Google Fonts via next/font with zero external runtime
 * network requests, layout shift prevention, and international fallback stacks.
 */

export interface FontWithVariable {
  readonly className: string;
  readonly variable: string;
  readonly style: {
    readonly fontFamily: string;
    readonly fontWeight?: number;
    readonly fontStyle?: string;
  };
}

/**
 * 1. Primary UI Sans: Inter
 * Rationale: Industry-standard neutral grotesque with exceptional legibility at
 * small viewport sizes (11px-14px) and tabular numeric features for e-commerce.
 */
export const fontSans: FontWithVariable = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'SolaimanLipi',
    'Noto Sans Bengali',
    'Noto Sans Arabic',
    'Noto Sans Devanagari',
    'sans-serif',
  ],
});

/**
 * 2. Editorial Serif: Newsreader
 * Rationale: High-fashion, editorial optical serif designed for luxury brand
 * storytelling, magazine lookbooks, and high-contrast editorial headlines.
 */
export const fontSerif: FontWithVariable = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  style: ['normal', 'italic'],
  fallback: [
    'Playfair Display',
    'Times New Roman',
    'Georgia',
    'Noto Serif Bengali',
    'Noto Naskh Arabic',
    'Noto Serif Devanagari',
    'serif',
  ],
});

/**
 * 3. Monospace: JetBrains Mono
 * Rationale: High-clarity tabular figures for tracking numbers, SKU codes,
 * financial ledgers, and inventory matrices.
 */
export const fontMono: FontWithVariable = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'monospace',
  ],
});

/**
 * Combined CSS variable classes to apply onto the root <html> element.
 */
export const fontVariablesClass: string = `${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`;
