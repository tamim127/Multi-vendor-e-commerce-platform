# Multi-Vendor Marketplace — Environment Variables Specification

## 1. Environment Variable Architecture

Environment variables are partitioned into:

1. **Server-Side Only**: Cryptographic keys, AI provider secrets, database connection strings. NEVER exposed to browser client.
2. **Client-Accessible (`NEXT_PUBLIC_*`)**: Non-sensitive public URLs and telemetry IDs.

---

## 2. Environment Variables Catalog

| Variable Name         | Required | Default                     | Scope         | Description                                               |
| :-------------------- | :------- | :-------------------------- | :------------ | :-------------------------------------------------------- |
| `NODE_ENV`            | Optional | `development`               | Server/Build  | Environment mode (`development`, `production`, `test`).   |
| `PORT`                | Optional | `3000`                      | Server        | HTTP port for Next.js server listener.                    |
| `NEXT_PUBLIC_APP_URL` | Optional | `http://localhost:3000`     | Client/Server | Canonical base URL for metadata & sitemaps.               |
| `AI_PROVIDER`         | Optional | `mock`                      | Server        | Selected AI provider (`mock`, `openai`, `anthropic`).     |
| `OPENAI_API_KEY`      | Optional | -                           | Server        | OpenAI secret API key (required if `AI_PROVIDER=openai`). |
| `OPENAI_BASE_URL`     | Optional | `https://api.openai.com/v1` | Server        | Custom endpoint for Azure OpenAI, Groq, Ollama.           |
| `ANTHROPIC_API_KEY`   | Optional | -                           | Server        | Anthropic Claude secret API key.                          |
| `DATABASE_URL`        | Optional | -                           | Server        | Relational database connection string (PostgreSQL).       |
| `REDIS_URL`           | Optional | -                           | Server        | Cache & rate limiting store URL.                          |

---

## 3. Strict Security Rules

1. **No Client Leaks**: Never prefix provider API keys with `NEXT_PUBLIC_`.
2. **Zero Hardcoded Secrets**: Secrets must not be committed to Git.
3. **Local Dev Fallback**: In the absence of external keys, the platform defaults safely to `AI_PROVIDER=mock`, enabling full functionality and testing without network egress.
