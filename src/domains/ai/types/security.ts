/**
 * ==============================================================================
 * AI DOMAIN — AI SECURITY & SAFETY CONTRACTS
 * ==============================================================================
 * Contracts for input sanitization, prompt injection defense, output filtering,
 * and privilege separation between user input and system instructions.
 */

export interface PromptInjectionAnalysis {
  isSafe: boolean;
  threatLevel: 'none' | 'low' | 'suspicious' | 'malicious';
  detectedPatterns: string[];
  sanitizedInput: string;
}

export interface AIRedactionRule {
  field: string;
  pattern: RegExp;
  replacement: string;
}

export interface AISafetyPolicy {
  maxInputLength: number;
  blockedKeywords: string[];
  allowHtmlOutput: boolean;
  strictDelimiterSeparation: boolean;
}

