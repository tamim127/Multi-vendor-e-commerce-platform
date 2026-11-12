# Multi-Vendor Marketplace — Security Boundaries & Trust Architecture

## 1. Trust Boundaries Overview

This document formally defines the trust perimeters separating the client browser, server runtime, multi-tenant merchants, administrative operators, and third-party AI providers.

```
+-------------------------------------------------------------------------------+
| UNTRUSTED EXTERNAL ZONE: Client Browser & Mobile Viewports                     |
| - Customer Client State (Theme, Language, Cart, Shopping Assistant UI)        |
| - Seller Client State (Storefront previews, Form drafts)                      |
| - Admin Client State (Dashboard views, Role switcher simulation)              |
+-------------------------------------------------------------------------------+
                                    │
                                    │ TLS 1.3 / HTTPS / Strict-Transport-Security
                                    ▼
+-------------------------------------------------------------------------------+
| TRUST BOUNDARY 1: Next.js Edge & App Router Server Layer                      |
| - Server API Routes (/api/*)                                                  |
| - Zod Input Validation & Payload Sanitization                                 |
| - Request Correlation ID Generation (x-correlation-id)                        |
| - Structured JSON Logging with Sensitive Credential Redaction                 |
+-------------------------------------------------------------------------------+
                                    │
                                    │ Internal In-Memory / Secure RPC
                                    ▼
+-------------------------------------------------------------------------------+
| TRUST BOUNDARY 2: Core Domain Logic & Business Rules                          |
| - Multi-Vendor Order Splitting & Packaging                                    |
| - Integer-Minor Money Calculations (Zero Floating-Point)                      |
| - Immutable Audit Logging Engine                                              |
| - RBAC Permission Matrix                                                      |
+-------------------------------------------------------------------------------+
                                    │
                                    │ Isolated Server-Side Outbound HTTPS
                                    ▼
+-------------------------------------------------------------------------------+
| TRUST BOUNDARY 3: External Integration Providers                              |
| - AI Providers (OpenAI, Anthropic, Mock) - Server API Keys Only               |
| - Payment Gateways (Stripe, PayPal) - Idempotency Key Guard                   |
| - Logistic Carriers (FedEx, UPS, DHL) - Multi-Vendor Tracking                  |
+-------------------------------------------------------------------------------+
```

---

## 2. Multi-Tenant Merchant Isolation Boundary

In a multi-vendor marketplace, merchant data cross-contamination is a primary risk:

1. **Catalog Ownership**: Sellers can only update offers and inventory where `offer.sellerId === currentSeller.id`.
2. **Order Separation**: Customers purchase products across multiple merchants in one cart; the checkout engine splits the order into discrete `CheckoutVendorPackage` records so each seller only views their own packaged items, shipping fee, and customer delivery address.
3. **Financial Separation**: Platform take-rate (commission) is deducted at checkout package settlement.

---

## 3. Demo Mode vs. Production Authentication

| Boundary Feature     | Demo Mode (Current Implementation)            | Production Requirement                                  |
| :------------------- | :-------------------------------------------- | :------------------------------------------------------ |
| User Session Storage | In-memory React Context + LocalStorage        | HTTP-only, Secure, SameSite=Strict cookies              |
| Role Assignment      | Top simulation banner dropdown                | Cryptographically signed JWT / Redis session store      |
| Password Validation  | Zod schema regex validation                   | Argon2id / bcrypt hashing with salt                     |
| AI Key Storage       | Local environment variable `AI_PROVIDER=mock` | HashiCorp Vault / AWS Secrets Manager / Azure KeyVault  |
| Audit Trail          | In-memory append-only array + local storage   | Write-once read-many (WORM) PostgreSQL / DynamoDB table |
