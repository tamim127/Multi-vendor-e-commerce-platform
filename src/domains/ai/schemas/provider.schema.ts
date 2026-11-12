/**
 * ==============================================================================
 * AI DOMAIN — PROVIDER SCHEMAS
 * ==============================================================================
 */

import { z } from 'zod';
import type {
  AIProviderConfig,
  AITokenUsage,
  AIMessage,
  AIRequestOptions,
} from '../types/provider';

export const AIMessageSchema: z.ZodType<AIMessage> = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().trim().min(1, 'Message content cannot be empty').max(32000),
  name: z.string().optional(),
});

export const AITokenUsageSchema: z.ZodType<AITokenUsage> = z.object({
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  estimatedCostMinorUsd: z.number().int().nonnegative().optional(),
});

export const AIRequestOptionsSchema: z.ZodType<AIRequestOptions> = z.object({
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(16000).optional(),
  timeoutMs: z.number().int().positive().max(60000).optional(),
  correlationId: z.string().optional(),
  systemPrompt: z.string().max(8000).optional(),
  jsonSchema: z.record(z.unknown()).optional(),
  responseFormat: z.enum(['text', 'json']).optional(),
});

export const AIProviderConfigSchema: z.ZodType<AIProviderConfig> = z.object({
  provider: z.enum(['mock', 'openai', 'anthropic', 'custom']),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  organizationId: z.string().optional(),
  defaultModel: z.string(),
  timeoutMs: z.number().int().positive(),
  maxRetries: z.number().int().nonnegative(),
  isMock: z.boolean(),
});
