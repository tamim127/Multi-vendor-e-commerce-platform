/**
 * ==============================================================================
 * AI DOMAIN — PROVIDER & CAPABILITY CONTRACTS
 * ==============================================================================
 * Strict TypeScript types for multi-provider AI architecture (OpenAI, Anthropic,
 * Local/Mock), model capabilities, token tracking, and structured responses.
 */

export type AIProviderName = 'mock' | 'openai' | 'anthropic' | 'custom';

export type AIModelId =
  | 'mock-fast'
  | 'mock-smart'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-3-5-sonnet'
  | 'claude-3-5-haiku'
  | (string & {});

export interface AIModelCapability {
  supportsStructuredOutputs: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
  costPerInputTokenMinorUsd?: number;
  costPerOutputTokenMinorUsd?: number;
}

export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
  name?: string;
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostMinorUsd?: number;
}

export interface AIRequestMetadata {
  requestId: string;
  correlationId?: string;
  clientTimestamp: string;
  provider: AIProviderName;
  model: AIModelId;
  durationMs?: number;
}

export interface AIRequestOptions {
  model?: AIModelId;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  correlationId?: string;
  systemPrompt?: string;
  jsonSchema?: Record<string, unknown>;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse<T = string> {
  id: string;
  provider: AIProviderName;
  model: AIModelId;
  data: T;
  rawText: string;
  usage: AITokenUsage;
  metadata: AIRequestMetadata;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  isMock: boolean;
}

export interface AIProviderConfig {
  provider: AIProviderName;
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  defaultModel: AIModelId;
  timeoutMs: number;
  maxRetries: number;
  isMock: boolean;
}

export interface AIHealthStatus {
  provider: AIProviderName;
  isAvailable: boolean;
  status: 'healthy' | 'degraded' | 'unreachable';
  latencyMs?: number;
  lastChecked: string;
  error?: string;
}

