import crypto from 'node:crypto';
import type pg from 'pg';
import { getDbPool, withTransaction } from './client';
import { computePayloadHash } from '@/server/security/crypto';
import { ConflictError } from '@/server/security/http';

export type IdempotencyState =
  | { kind: 'new'; recordId: string; payloadHash: string }
  | { kind: 'replay'; statusCode: number; responseBody: unknown };

/**
 * Durable PostgreSQL-backed idempotency engine.
 * Replaces process-local Maps so duplicate retries and payload conflicts survive restarts and multiple workers.
 */
export async function acquireIdempotencyLock(
  params: {
    scope: string;
    key: string;
    payload: unknown;
    ttlSeconds?: number;
  },
  pool?: pg.Pool
): Promise<IdempotencyState> {
  const targetPool = pool || getDbPool();
  const payloadHash = computePayloadHash(params.payload);
  const ttlSeconds = params.ttlSeconds ?? 86400; // 24 hours default
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const newId = `idem-${crypto.randomUUID().slice(0, 12)}`;

  return await withTransaction(
    async (client) => {
      // Remove any expired record for this exact scope+key so keys can safely expire
      await client.query(
        `DELETE FROM idempotency_records
         WHERE scope = $1 AND idempotency_key = $2 AND expires_at <= NOW();`,
        [params.scope, params.key]
      );

      // Attempt atomic insert
      const insertRes = await client.query<{ id: string }>(
        `INSERT INTO idempotency_records (
           id, scope, idempotency_key, payload_hash, status, expires_at
         ) VALUES ($1, $2, $3, $4, 'pending', $5)
         ON CONFLICT (scope, idempotency_key) DO NOTHING
         RETURNING id;`,
        [newId, params.scope, params.key, payloadHash, expiresAt]
      );

      if (insertRes.rows.length > 0) {
        return { kind: 'new', recordId: insertRes.rows[0]!.id, payloadHash };
      }

      // Row already exists — lock and inspect state
      const existingRes = await client.query<{
        id: string;
        payload_hash: string;
        status: string;
        status_code: number | null;
        response_body: unknown;
      }>(
        `SELECT id, payload_hash, status, status_code, response_body
         FROM idempotency_records
         WHERE scope = $1 AND idempotency_key = $2
         FOR UPDATE;`,
        [params.scope, params.key]
      );

      const existing = existingRes.rows[0];
      if (!existing) {
        // Race with concurrent cleanup; retry insert once
        const retryInsert = await client.query<{ id: string }>(
          `INSERT INTO idempotency_records (
             id, scope, idempotency_key, payload_hash, status, expires_at
           ) VALUES ($1, $2, $3, $4, 'pending', $5)
           RETURNING id;`,
          [newId, params.scope, params.key, payloadHash, expiresAt]
        );
        return { kind: 'new', recordId: retryInsert.rows[0]!.id, payloadHash };
      }

      if (existing.payload_hash !== payloadHash) {
        throw new ConflictError(
          `Idempotency key "${params.key}" was already used with a different request payload.`
        );
      }

      if (existing.status === 'pending') {
        throw new ConflictError(
          `A request with idempotency key "${params.key}" is currently in progress. Retry shortly.`
        );
      }

      if (existing.status === 'completed') {
        return {
          kind: 'replay',
          statusCode: existing.status_code ?? 200,
          responseBody: existing.response_body,
        };
      }

      // If previous attempt failed, allow clean retry under the same key & payload
      await client.query(
        `UPDATE idempotency_records
         SET status = 'pending', updated_at = NOW()
         WHERE id = $1;`,
        [existing.id]
      );
      return { kind: 'new', recordId: existing.id, payloadHash };
    },
    undefined,
    targetPool
  );
}

export async function completeIdempotencyRecord(
  recordId: string,
  statusCode: number,
  responseBody: unknown,
  pool?: pg.Pool
): Promise<void> {
  const targetPool = pool || getDbPool();
  await targetPool.query(
    `UPDATE idempotency_records
     SET status = 'completed',
         status_code = $2,
         response_body = $3,
         updated_at = NOW()
     WHERE id = $1;`,
    [recordId, statusCode, JSON.stringify(responseBody)]
  );
}

export async function failIdempotencyRecord(
  recordId: string,
  pool?: pg.Pool
): Promise<void> {
  const targetPool = pool || getDbPool();
  await targetPool.query(
    `UPDATE idempotency_records
     SET status = 'failed', updated_at = NOW()
     WHERE id = $1;`,
    [recordId]
  );
}
