import crypto from 'crypto';

/**
 * Enterprise Cryptographic Utilities
 * Uses Web Crypto / Node.js crypto for zero-dependency high performance security.
 */

const PBKDF2_ITERATIONS = 10000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Hashes a plaintext password with a unique cryptographic 16-byte salt using PBKDF2.
 * Returns format: $pbkdf2$<iterations>$<saltHex>$<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST,
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`$pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derivedKey.toString('hex')}`);
      }
    );
  });
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash using timing-safe comparison.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 5 || parts[1] !== 'pbkdf2') {
        return resolve(false);
      }

      const iterations = parseInt(parts[2]!, 10);
      const salt = parts[3]!;
      const hash = parts[4]!;

      crypto.pbkdf2(
        password,
        salt,
        iterations,
        PBKDF2_KEYLEN,
        PBKDF2_DIGEST,
        (err, derivedKey) => {
          if (err) return resolve(false);

          const hashBuffer = Buffer.from(hash, 'hex');
          if (hashBuffer.length !== derivedKey.length) {
            return resolve(false);
          }

          resolve(crypto.timingSafeEqual(hashBuffer, derivedKey));
        }
      );
    } catch {
      resolve(false);
    }
  });
}

/**
 * Generates a cryptographically strong random token (e.g. for CSRF, session, or API keys).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

