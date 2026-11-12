# Multi-Vendor Marketplace — Production Deployment Guide

## 1. Overview

This guide details deployment options for hosting the Next.js 16.4.2 multi-vendor marketplace in production.

Supported targets:

1. **Docker Container Deployment** (Kubernetes, AWS ECS, Google Cloud Run)
2. **Vercel / Cloudflare Pages Serverless Deployment**
3. **Node.js Standalone PM2 Deployment**

---

## 2. Docker Container Deployment

### 2.1 Multi-Stage Dockerfile

```dockerfile
# 1. Base Stage
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
WORKDIR /app

# 2. Dependencies Stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 3. Builder Stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# 4. Production Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["pnpm", "start"]
```

---

## 3. Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```
