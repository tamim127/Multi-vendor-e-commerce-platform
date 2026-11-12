/**
 * ==============================================================================
 * AI DOMAIN — PROVIDER FACTORY
 * ==============================================================================
 * Central factory returning the configured AIProvider instance based on runtime
 * environment variables (AI_PROVIDER = 'mock' | 'openai' | 'anthropic').
 * Always runs server-side.
 */

import type { BaseAIProvider } from './base-provider';
import { MockAIProvider } from './mock-provider';
import { OpenAICompatibleProvider } from './openai-compatible-provider';
import { AnthropicProvider } from './anthropic-provider';
import type { AIProviderName } from '../types/provider';

let cachedProvider: BaseAIProvider | null = null;

export function getAIProvider(overrideName?: AIProviderName): BaseAIProvider {
  if (overrideName === 'mock') {
    return new MockAIProvider();
  }

  if (cachedProvider && !overrideName) {
    return cachedProvider;
  }

  const configured = overrideName || (process.env['AI_PROVIDER'] as AIProviderName) || 'mock';

  let provider: BaseAIProvider;

  switch (configured) {
    case 'openai':
      provider = new OpenAICompatibleProvider();
      break;
    case 'anthropic':
      provider = new AnthropicProvider();
      break;
    case 'mock':
    default:
      provider = new MockAIProvider();
      break;
  }

  if (!overrideName) {
    cachedProvider = provider;
  }

  return provider;
}
