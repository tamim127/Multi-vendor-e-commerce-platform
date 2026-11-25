import crypto from 'node:crypto';
import argon2 from 'argon2';

/**
 * Enterprise Cryptographic Utilities
 * Uses Argon2id for password hashing and SHA-256 for high-entropy token storage at rest.
 */

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
} as const;

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against a stored Argon2id hash (or legacy PBKDF2 hash during transition).
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || !storedHash) return false;

  // Argon2id verification
  if (storedHash.startsWith('$argon2')) {
    try {
      return await argon2.verify(storedHash, password);
    } catch {
      return false;
    }
  }

  // Legacy PBKDF2 support if an older seeded hash exists
  return new Promise((resolve) => {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
        return resolve(false);
      }

      const iterations = parseInt(parts[2]!, 10);
      const salt = parts[3]!;
      const hash = parts[4]!;

      crypto.pbkdf2(password, salt, iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) return resolve(false);
        const hashBuffer = Buffer.from(hash, 'hex');
        if (hashBuffer.length !== derivedKey.length) {
          return resolve(false);
        }
        resolve(crypto.timingSafeEqual(hashBuffer, derivedKey));
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Generates a cryptographically strong random token (hex encoded).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Computes a SHA-256 hex digest for storing session, CSRF, reset, or verification tokens at rest.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of two SHA-256 hex strings.
 */
export function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  try {
    const aBuf = Buffer.from(aHex, 'hex');
    const bBuf = Buffer.from(bHex, 'hex');
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

/**
 * Deterministic canonical JSON payload fingerprint for durable idempotency checks.
 */
export function computePayloadHash(payload: unknown): string {
  const stableStringify = (val: unknown): string => {
    if (val === null || typeof val !== 'object') {
      return JSON.stringify(val);
    }
    if (Array.isArray(val)) {
      return `[${val.map(stableStringify).join(',')}]`;
    }
    const keys = Object.keys(val as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((val as Record<string, unknown>)[k])}`).join(',')}}`;
  };

  return crypto.createHash('sha256').update(stableStringify(payload), 'utf8').digest('hex');
}
