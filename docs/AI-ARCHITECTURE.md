# Multi-Vendor Marketplace — AI Architecture Specification

## 1. Executive Summary

This document specifies the modular, multi-provider Artificial Intelligence (AI) architecture implemented in Phase 7 of the enterprise multi-vendor e-commerce platform.

The AI system is architected as an extensible, provider-agnostic domain (`src/domains/ai/`) decoupled from presentation layers. It operates strictly server-side for authenticated LLM calls, protecting proprietary model keys, and provides a deterministic `MockAIProvider` for test reproducibility, offline development, and unit/E2E verification without third-party network egress.

---

## 2. Core Architectural Pillars

```
+-----------------------------------------------------------------------------+
|                            Presentation Layer                               |
|  Customer Assistant Modal  |  Seller AI Studio  |  Admin Operations Copilot  |
+-----------------------------------------------------------------------------+
                                       │ HTTP POST (Zod-validated)
                                       ▼
+-----------------------------------------------------------------------------+
|                         Next.js Server API Routes                           |
|       /api/ai/assistant    |    /api/ai/seller    |    /api/ai/admin        |
+-----------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------+
|                          AI Domain Engine & Safety                          |
|  - Prompt Sanitizer (Injection Defense & Boundary Isolation)                |
|  - Token Estimator & Minor-Unit Cost Accounting                             |
|  - Error Normalizer (HTTP status & Retryability Classification)             |
|  - Catalog Recommendation Resolver (Integer Money & Fixtures)               |
+-----------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------+
|                         Provider Abstraction Layer                          |
|                               BaseAIProvider                                |
|          ▲                                 ▲                     ▲          |
|          │                                 │                     │          |
|   MockAIProvider               OpenAICompatibleProvider   AnthropicProvider |
| (Deterministic / E2E)           (Server-Side API Keys)    (Server-Side API) |
+-----------------------------------------------------------------------------+
```

### 2.1 Provider Abstraction (`BaseAIProvider`)

The core contract (`src/domains/ai/providers/base-provider.ts`) establishes standard capabilities:

- `generateCompletion(messages, options)`: Raw text generation with token tracking.
- `generateStructured<T>(messages, schema, options)`: Schema-enforced structured generation with Zod validation.
- `generateAssistantResponse(prompt, history)`: Multi-vendor catalog product discovery & policy explanations.
- `generateSellerSuggestions(input)`: Editable titles, descriptions, SEO metadata, and listing audits.
- `generateAdminAnalytics(timeframe)`: Executive KPI trends, merchant audits, and content moderation pre-screening.

### 2.2 Provider Implementations

1. **`MockAIProvider`**: Built for continuous integration, deterministic tests, and offline execution. Generates authentic catalog responses referencing actual products from `MOCK_PRODUCTS` (e.g. Apple MacBook Pro, Sony XM5) with exact integer-minor Money pricing.
2. **`OpenAICompatibleProvider`**: Connects to OpenAI or compatible endpoints (Azure OpenAI, Groq, Ollama, vLLM). Enforces server-side credentials and translates provider-specific errors.
3. **`AnthropicProvider`**: Native Claude integration utilizing the Messages API with system prompt isolation.

---

## 3. Token Accounting & Request Metadata

All AI requests produce structured metadata conforming to `AIRequestMetadata`:

- `requestId`: Distributed tracing identifier.
- `correlationId`: Propagated from HTTP request headers (`x-correlation-id`).
- `usage`: `promptTokens`, `completionTokens`, `totalTokens`, and `estimatedCostMinorUsd` calculated in integer cents.
- `finishReason`: Normalized execution outcome (`stop`, `length`, `content_filter`, `error`).

---

## 4. Failure Handling & Circuit Breaker Integration

AI provider calls are wrapped with reliability primitives from `src/lib/reliability/`:

- **Timeout Management (`withTimeout`)**: Default 15-second cap on completions.
- **Bounded Exponential Backoff (`retryWithBackoff`)**: Retries transient 429 and 503 errors up to 2 times with randomized jitter (+/- 20%).
- **Circuit Breaker (`CircuitBreaker`)**: Fails fast (CLOSED -> OPEN -> HALF_OPEN) after 5 consecutive upstream failures to prevent cascading latency spikes across web workers.
- **Graceful Fallback**: If third-party AI APIs become unreachable, the system returns clear error notices with fallback recommendations rather than degrading the whole storefront.
