# Multi-Vendor Marketplace — AI Security & Safety Specification

## 1. Security Overview

Deploying artificial intelligence inside an enterprise multi-vendor marketplace introduces specific attack vectors:

1. **Direct and Indirect Prompt Injection**: Malicious input attempting to override system directives.
2. **Credential Exfiltration**: Leaking proprietary platform prompt instructions, database schemas, or customer records.
3. **Privilege Escalation**: Forcing AI to authorize seller onboarding, trigger refunds, or alter pricing.
4. **Data Pollution / Toxic Content**: Generating offensive, defamatory, or misleading product descriptions.

This document details the layered defense architecture implemented to neutralize these threats.

---

## 2. Layered Defense Architecture

### Layer 1: Prompt Injection Analysis (`analyzePromptSafety`)

Every incoming user prompt is analyzed before provider dispatch:

- **Regex Heuristics**: Detects instruction-override attempts (e.g. `ignore all previous instructions`, `disregard system directives`, `jailbroken DAN`, `output developer prompt`).
- **Sanitization**: Strips null bytes, `<script>` tags, `<iframe>` tags, and `javascript:` URIs.
- **Length Throttling**: Strict 4,000 character limit per customer turn and 2,000 character limit per API request prevents buffer/token denial-of-service.

### Layer 2: Delimiter Boundary Containment

User inputs are wrapped inside structural XML boundary tags:

```xml
<system_directive>
You are an e-commerce assistant. Only answer questions regarding catalog products and marketplace policies.
</system_directive>

<user_input>
${sanitizedUserInput}
</user_input>
```

Models are instructed that contents within `<user_input>` must be treated strictly as untrusted data strings, not as instructions.

### Layer 3: Zero-Execution Privilege (Advisory Only)

- The AI domain has **ZERO direct mutation privileges** on platform state.
- **Customer Assistant**: Can only recommend products and link to PDPs; cannot place orders or alter carts directly.
- **Seller Studio**: Generates drafts in temporary UI state. The seller must explicitly click "Approve & Apply to Store" to commit copy.
- **Admin Copilot**: Summarizes performance and flags suspicious activities. It is strictly prohibited from executing financial transactions (refunds, payouts) or administrative status changes (seller approval, account suspension).

### Layer 4: Client-Side Secrets Isolation

- AI provider credentials (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`) are exclusively read on the server runtime.
- No `NEXT_PUBLIC_` prefixes are permitted on provider secrets.
- All client interactions route through `/api/ai/*` server endpoints.

---

## 3. Threat Matrix & Mitigations

| Threat                             | Impact   | Mitigation Strategy                                      | Implemented Status |
| :--------------------------------- | :------- | :------------------------------------------------------- | :----------------- |
| Direct Prompt Injection            | High     | Heuristic regex scanner + boundary wrapping              | Verified           |
| System Prompt Exfiltration         | Medium   | Delimiter isolation + refusal policies                   | Verified           |
| Unauthorized Financial Refund      | Critical | Zero AI execution privilege; human confirmation required | Verified           |
| Automatic Defamatory Listing       | High     | Seller review checkpoint before catalog ingestion        | Verified           |
| Token Exhaustion Denial-of-Service | Medium   | Character bounds + Zod max limits + Timeout wrapper      | Verified           |
