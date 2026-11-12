/**
 * ==============================================================================
 * AI DOMAIN — TOKEN ESTIMATOR & COST CALCULATOR
 * ==============================================================================
 * Fast, deterministic token estimation (~4 characters/token for English text)
 * and pricing calculation in minor units ($ USD).
 */

import type { AITokenUsage } from '../types/provider';

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Approximate standard BPE tokenizer: ~4 characters per token
  const charLength = text.trim().length;
  return Math.max(1, Math.ceil(charLength / 4));
}

export function calculateEstimatedCost(
  promptTokens: number,
  completionTokens: number,
  inputRatePer1MMinorUsd = 15, // $0.15 per 1M tokens in minor USD (cents)
  outputRatePer1MMinorUsd = 60 // $0.60 per 1M tokens in minor USD (cents)
): number {
  const promptCost = (promptTokens * inputRatePer1MMinorUsd) / 1_000_000;
  const completionCost = (completionTokens * outputRatePer1MMinorUsd) / 1_000_000;
  return Math.ceil(promptCost + completionCost);
}

export function createTokenUsage(promptText: string, completionText: string): AITokenUsage {
  const promptTokens = estimateTokenCount(promptText);
  const completionTokens = estimateTokenCount(completionText);
  const totalTokens = promptTokens + completionTokens;
  const estimatedCost = calculateEstimatedCost(promptTokens, completionTokens);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostMinorUsd: estimatedCost,
  };
}

