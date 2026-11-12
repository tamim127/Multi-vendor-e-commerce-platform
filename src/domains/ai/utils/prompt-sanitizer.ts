/**
 * ==============================================================================
 * AI DOMAIN — PROMPT SANITIZER & SAFETY DEFENSE
 * ==============================================================================
 * Defense against prompt injection, malicious delimiters, and adversarial jailbreaks.
 * Enforces boundary containment and strips script/injection artifacts.
 */

import type { PromptInjectionAnalysis } from '../types/security';

const INJECTION_PATTERNS: { regex: RegExp; label: string; severity: 'suspicious' | 'malicious' }[] =
  [
    {
      regex: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|directives)/i,
      label: 'instruction_override',
      severity: 'malicious',
    },
    {
      regex: /disregard\s+(all\s+)?(system|safety|guardrail)/i,
      label: 'safety_bypass',
      severity: 'malicious',
    },
    {
      regex: /you\s+are\s+now\s+(DAN|unrestricted|jailbroken|an\s+unfiltered\s+AI)/i,
      label: 'jailbreak_persona',
      severity: 'malicious',
    },
    {
      regex: /(reveal|print|output|display)\s+(the\s+)?(system\s+prompt|developer\s+message)/i,
      label: 'prompt_leakage',
      severity: 'suspicious',
    },
    {
      regex: /(delete|drop|truncate|alter)\s+table/i,
      label: 'sql_keyword',
      severity: 'suspicious',
    },
    {
      regex: /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      label: 'script_injection',
      severity: 'malicious',
    },
    {
      regex: /javascript:\s*/i,
      label: 'uri_scheme_injection',
      severity: 'malicious',
    },
  ];

export function analyzePromptSafety(rawInput: string): PromptInjectionAnalysis {
  const detectedPatterns: string[] = [];
  let threatLevel: 'none' | 'low' | 'suspicious' | 'malicious' = 'none';

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(rawInput)) {
      detectedPatterns.push(pattern.label);
      if (pattern.severity === 'malicious') {
        threatLevel = 'malicious';
      } else if (threatLevel !== 'malicious') {
        threatLevel = 'suspicious';
      }
    }
  }

  // Sanitize: strip script tags, strip null bytes, normalize whitespace
  let sanitized = rawInput
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();

  // Cap length to prevent denial-of-service / token-exhaustion attacks
  if (sanitized.length > 4000) {
    sanitized = sanitized.slice(0, 4000);
    detectedPatterns.push('input_length_truncated');
    if (threatLevel === 'none') {
      threatLevel = 'low';
    }
  }

  return {
    isSafe: threatLevel !== 'malicious',
    threatLevel,
    detectedPatterns,
    sanitizedInput: sanitized,
  };
}

/**
 * Wraps user input in strict XML-style boundary markers so system prompts can
 * distinguish instructions from untrusted data.
 */
export function wrapUserInputBoundary(input: string): string {
  const clean = input.replace(/<\/?user_input>/gi, '');
  return `<user_input>\n${clean}\n</user_input>`;
}

