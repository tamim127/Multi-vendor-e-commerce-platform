/**
 * ==============================================================================
 * AI PLATFORM — VIEWS & COMPONENTS UNIT TESTS
 * ==============================================================================
 */

import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n';
import { AIAssistantProvider } from '@/features/ai/customer-assistant/ai-assistant-context';
import { AIAssistantWidget } from '@/features/ai/customer-assistant/ai-assistant-widget';
import { SellerAiToolsView } from '@/features/ai/seller-ai/seller-ai-tools-view';
import { AdminAiView } from '@/features/ai/admin-ai/admin-ai-view';
import { AIRecommendationsRow } from '@/features/ai/recommendations/ai-recommendations-row';

function renderWithAIProviders(ui: React.ReactElement) {
  return render(
    <I18nProvider defaultLocale="en">
      <AIAssistantProvider>{ui}</AIAssistantProvider>
    </I18nProvider>
  );
}

describe('AI Platform — Customer Assistant Widget', () => {
  it('renders floating trigger button with accessible label', () => {
    renderWithAIProviders(<AIAssistantWidget />);
    const button = screen.getByRole('button', { name: /Open AI Shopping Assistant/i });
    expect(button).toBeDefined();
  });
});

describe('AI Platform — Seller AI Tools View', () => {
  it('renders input form, specs area, and editorial safety notice', () => {
    renderWithAIProviders(<SellerAiToolsView />);
    expect(screen.getByText(/Seller AI Optimization Studio/i)).toBeDefined();
    expect(screen.getByText(/Editorial Control/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Generate AI Listing Assets/i })).toBeDefined();
    expect(screen.getByLabelText(/Working Product Name/i)).toBeDefined();
  });
});

describe('AI Platform — Admin AI Operations Copilot View', () => {
  it('renders advisory notice, timeframe selector, and zero execution disclosure', () => {
    renderWithAIProviders(<AdminAiView />);
    expect(screen.getByText(/Marketplace Operations Copilot/i)).toBeDefined();
    expect(screen.getByText(/Zero Execution Privilege/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Last 7 Days/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Last 30 Days/i })).toBeDefined();
  });
});

describe('AI Platform — Recommendations Shelf', () => {
  it('renders curated product recommendations with reason badges', () => {
    renderWithAIProviders(
      <AIRecommendationsRow productId="prod-macbook-pro-16" title="Recommended For You" />
    );
    expect(screen.getByText(/Recommended For You/i)).toBeDefined();
    expect(screen.getByText(/AI Curated/i)).toBeDefined();
  });
});
