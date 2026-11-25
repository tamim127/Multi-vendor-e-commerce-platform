import crypto from 'node:crypto';
import type pg from 'pg';
import { dbQuery, getDbPool, withTransaction } from '@/server/db/client';
import {
  generateSecureToken,
  hashPassword,
  hashToken,
  timingSafeEqualHex,
  verifyPassword,
} from '@/server/security/crypto';
import { sendTransactionalEmail, type EmailDeliveryResult } from './email-adapter';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/server/security/http';
import type { AdminPermission, AdminRole } from '@/domains/admin/types/admin';
import { getRolePermissions } from '@/domains/admin/utils/rbac';

export const SESSION_COOKIE_NAME = 'aureon_session';
export const CSRF_COOKIE_NAME = 'aureon_csrf';
export const GUEST_CART_COOKIE_NAME = 'aureon_guest_cart';

// Precomputed valid Argon2id hash used strictly to equalize timing when account email is unknown
const DUMMY_ARGON2_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHR2YWx1ZTEyMzQ$8jF5dO7N4dJ8K2X7wZ3qN5bQ1vL9mT6rP4yW2cX8zA0';

export interface SellerMembership {
  sellerId: string;
  sellerSlug: string;
  sellerName: string;
  sellerStatus: string;
  membershipRole: string;
}

export interface AuthenticatedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'locked' | 'pending_verification';
  emailVerified: boolean;
  role: 'customer' | 'seller' | 'admin';
  adminRole?: AdminRole;
  adminPermissions: AdminPermission[];
  sellerMemberships: SellerMembership[];
  preferences: {
    language: 'en' | 'bn' | 'ar' | 'hi';
    currency: 'USD' | 'EUR' | 'GBP' | 'BDT' | 'AED' | 'SAR';
    newsletterSubscribed: boolean;
    orderUpdatesEmail: boolean;
    orderUpdatesSms: boolean;
    twoFactorEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionVerificationResult {
  sessionId: string;
  csrfTokenHash: string;
  expiresAt: string;
  customer: AuthenticatedCustomer;
}

function mapCustomerRow(row: any, sellerMemberships: SellerMembership[] = []): AuthenticatedCustomer {
  const adminRole = (row.admin_role as AdminRole | null) || undefined;
  const derivedAdminPerms = adminRole ? getRolePermissions(adminRole) : [];
  const explicitPerms = Array.isArray(row.admin_permissions) ? (row.admin_permissions as AdminPermission[]) : [];
  const mergedPerms = Array.from(new Set([...derivedAdminPerms, ...explicitPerms]));

  const prefs = typeof row.preferences === 'object' && row.preferences ? row.preferences : {};

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone || undefined,
    avatarUrl: row.avatar_url || undefined,
    status: row.status || 'active',
    emailVerified: Boolean(row.email_verified),
    role: row.role || (adminRole ? 'admin' : sellerMemberships.length > 0 ? 'seller' : 'customer'),
    adminRole,
    adminPermissions: mergedPerms,
    sellerMemberships,
    preferences: {
      language: prefs.language || 'en',
      currency: prefs.currency || 'USD',
      newsletterSubscribed: Boolean(prefs.newsletterSubscribed ?? true),
      orderUpdatesEmail: Boolean(prefs.orderUpdatesEmail ?? true),
      orderUpdatesSms: Boolean(prefs.orderUpdatesSms ?? false),
      twoFactorEnabled: Boolean(prefs.twoFactorEnabled ?? false),
    },
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

async function fetchSellerMemberships(
  customerId: string,
  executor: pg.Pool | pg.PoolClient
): Promise<SellerMembership[]> {
  const res = await executor.query(
    `SELECT sm.seller_id, sm.membership_role, s.slug, s.name, s.status
     FROM seller_memberships sm
     JOIN sellers s ON s.id = sm.seller_id
     WHERE sm.customer_id = $1 AND sm.status = 'active';`,
    [customerId]
  );

  return res.rows.map((r) => ({
    sellerId: r.seller_id,
    sellerSlug: r.slug,
    sellerName: r.name,
    sellerStatus: r.status,
    membershipRole: r.membership_role,
  }));
}

async function insertSession(
  client: pg.PoolClient,
  customerId: string,
  meta: { userAgent?: string | null; ipAddress?: string; rememberMe?: boolean }
): Promise<{ sessionId: string; rawSessionToken: string; rawCsrfToken: string; expiresAt: Date }> {
  const sessionId = `sess-${crypto.randomUUID()}`;
  const rawSessionToken = generateSecureToken(32);
  const rawCsrfToken = generateSecureToken(24);
  const ttlSeconds = meta.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await client.query(
    `INSERT INTO user_sessions (
       id, customer_id, token_hash, csrf_token_hash, user_agent, ip_address, expires_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    [
      sessionId,
      customerId,
      hashToken(rawSessionToken),
      hashToken(rawCsrfToken),
      meta.userAgent || null,
      meta.ipAddress || null,
      expiresAt,
    ]
  );

  return { sessionId, rawSessionToken, rawCsrfToken, expiresAt };
}

/**
 * Registers a new customer account using Argon2id password hashing and creates a persistent session.
 */
export async function registerCustomer(
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  },
  meta: { userAgent?: string | null; ipAddress?: string } = {},
  pool?: pg.Pool
): Promise<{
  customer: AuthenticatedCustomer;
  sessionToken: string;
  csrfToken: string;
  expiresAt: string;
  expiresIn: number;
  emailDelivery: EmailDeliveryResult;
  verificationTokenPreview?: string;
}> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const rawVerifyToken = generateSecureToken(24);
  const verifyTokenHash = hashToken(rawVerifyToken);
  const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const txResult = await withTransaction(
    async (client) => {
      const existing = await client.query('SELECT id FROM customers WHERE LOWER(email) = $1 LIMIT 1;', [
        normalizedEmail,
      ]);
      if (existing.rows.length > 0) {
        throw new ConflictError('An account with this email address already exists.');
      }

      const customerId = `cust-${crypto.randomUUID().slice(0, 12)}`;
      const prefs = {
        language: 'en',
        currency: 'USD',
        newsletterSubscribed: true,
        orderUpdatesEmail: true,
        orderUpdatesSms: Boolean(input.phoneNumber),
        twoFactorEnabled: false,
      };

      const insertRes = await client.query(
        `INSERT INTO customers (
           id, email, password_hash, first_name, last_name, phone,
           status, email_verified, role, preferences,
           email_verification_token_hash, email_verification_expires_at,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           'active', false, 'customer', $7,
           $8, $9, NOW(), NOW()
         )
         RETURNING *;`,
        [
          customerId,
          normalizedEmail,
          passwordHash,
          input.firstName.trim(),
          input.lastName.trim(),
          input.phoneNumber?.trim() || null,
          JSON.stringify(prefs),
          verifyTokenHash,
          verifyExpiresAt,
        ]
      );

      const session = await insertSession(client, customerId, {
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        rememberMe: false,
      });

      await client.query(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, outcome, ip_address)
         VALUES ($1, $2, $3, 'customer', 'CUSTOMER_REGISTERED', 'customer', $2, 'success', $4);`,
        [
          `aud-${crypto.randomUUID().slice(0, 12)}`,
          customerId,
          `${input.firstName.trim()} ${input.lastName.trim()}`,
          meta.ipAddress || null,
        ]
      );

      return {
        customerRow: insertRes.rows[0],
        session,
      };
    },
    undefined,
    pool
  );

  const emailDelivery = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: 'Verify your Aureon Marketplace email address',
    text: `Verification token: ${rawVerifyToken}`,
    purpose: 'email_verification',
  });

  const expiresIn = Math.floor((txResult.session.expiresAt.getTime() - Date.now()) / 1000);

  return {
    customer: mapCustomerRow(txResult.customerRow, []),
    sessionToken: txResult.session.rawSessionToken,
    csrfToken: txResult.session.rawCsrfToken,
    expiresAt: txResult.session.expiresAt.toISOString(),
    expiresIn,
    emailDelivery,
    ...(process.env.NODE_ENV === 'test' ? { verificationTokenPreview: rawVerifyToken } : {}),
  };
}

/**
 * Authenticates a user against PostgreSQL using Argon2id password verification,
 * account lockout enforcement, and persistent hashed sessions.
 */
export async function loginCustomer(
  input: { email: string; password: string; rememberMe?: boolean },
  meta: { userAgent?: string | null; ipAddress?: string } = {},
  pool?: pg.Pool
): Promise<{
  customer: AuthenticatedCustomer;
  sessionToken: string;
  csrfToken: string;
  expiresAt: string;
  expiresIn: number;
}> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const targetPool = pool || getDbPool();

  const userRes = await dbQuery<any>(
    'SELECT * FROM customers WHERE LOWER(email) = $1 LIMIT 1;',
    [normalizedEmail],
    targetPool
  );

  if (userRes.rows.length === 0) {
    // Perform dummy hash verify to prevent timing-based user enumeration
    await verifyPassword(input.password, DUMMY_ARGON2_HASH);
    throw new UnauthorizedError('Invalid email or password.');
  }

  const user = userRes.rows[0];

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    throw new ForbiddenError('Account is temporarily locked due to repeated failed login attempts. Try again later.');
  }

  if (user.status === 'suspended' || user.status === 'locked') {
    throw new ForbiddenError('This account is not permitted to sign in.');
  }

  const passwordValid = await verifyPassword(input.password, user.password_hash);
  if (!passwordValid) {
    const newFailures = Number(user.failed_login_attempts || 0) + 1;
    const lockUntil = newFailures >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await dbQuery(
      `UPDATE customers
       SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW()
       WHERE id = $3;`,
      [newFailures, lockUntil, user.id],
      targetPool
    );

    throw new UnauthorizedError('Invalid email or password.');
  }

  const txResult = await withTransaction(
    async (client) => {
      await client.query(
        `UPDATE customers
         SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW()
         WHERE id = $1;`,
        [user.id]
      );

      const session = await insertSession(client, user.id, {
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        rememberMe: input.rememberMe,
      });

      const memberships = await fetchSellerMemberships(user.id, client);

      await client.query(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_type, target_id, outcome, ip_address)
         VALUES ($1, $2, $3, $4, 'USER_LOGGED_IN', 'customer', $2, 'success', $5);`,
        [
          `aud-${crypto.randomUUID().slice(0, 12)}`,
          user.id,
          `${user.first_name} ${user.last_name}`,
          user.role || 'customer',
          meta.ipAddress || null,
        ]
      );

      return { session, memberships };
    },
    undefined,
    targetPool
  );

  const expiresIn = Math.floor((txResult.session.expiresAt.getTime() - Date.now()) / 1000);

  return {
    customer: mapCustomerRow(user, txResult.memberships),
    sessionToken: txResult.session.rawSessionToken,
    csrfToken: txResult.session.rawCsrfToken,
    expiresAt: txResult.session.expiresAt.toISOString(),
    expiresIn,
  };
}

/**
 * Verifies a raw session token against hashed tokens in PostgreSQL.
 */
export async function verifySessionToken(
  rawSessionToken: string,
  pool?: pg.Pool
): Promise<SessionVerificationResult | null> {
  if (!rawSessionToken || rawSessionToken.length < 16) {
    return null;
  }

  const tokenHash = hashToken(rawSessionToken);
  const targetPool = pool || getDbPool();

  const res = await dbQuery<any>(
    `SELECT
       s.id as session_id,
       s.csrf_token_hash,
       s.expires_at,
       s.revoked_at,
       c.*
     FROM user_sessions s
     JOIN customers c ON c.id = s.customer_id
     WHERE s.token_hash = $1
     LIMIT 1;`,
    [tokenHash],
    targetPool
  );

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0];
  if (row.revoked_at !== null) {
    return null;
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return null;
  }
  if (row.status !== 'active' && row.status !== 'pending_verification') {
    return null;
  }

  const memberships = await fetchSellerMemberships(row.id, targetPool);

  // Best-effort non-blocking last_seen_at update
  void targetPool
    .query('UPDATE user_sessions SET last_seen_at = NOW() WHERE id = $1;', [row.session_id])
    .catch(() => {});

  return {
    sessionId: row.session_id,
    csrfTokenHash: row.csrf_token_hash,
    expiresAt: new Date(row.expires_at).toISOString(),
    customer: mapCustomerRow(row, memberships),
  };
}

/**
 * Rotates an active session atomically (revoking the old token and minting a fresh pair).
 */
export async function rotateSession(
  currentSessionId: string,
  customerId: string,
  meta: { userAgent?: string | null; ipAddress?: string; rememberMe?: boolean } = {},
  pool?: pg.Pool
): Promise<{ sessionToken: string; csrfToken: string; expiresAt: string; expiresIn: number }> {
  const newSession = await withTransaction(
    async (client) => {
      await client.query(
        `UPDATE user_sessions
         SET revoked_at = NOW(), revocation_reason = 'rotated'
         WHERE id = $1 AND customer_id = $2;`,
        [currentSessionId, customerId]
      );
      return insertSession(client, customerId, meta);
    },
    undefined,
    pool
  );

  return {
    sessionToken: newSession.rawSessionToken,
    csrfToken: newSession.rawCsrfToken,
    expiresAt: newSession.expiresAt.toISOString(),
    expiresIn: Math.floor((newSession.expiresAt.getTime() - Date.now()) / 1000),
  };
}

/**
 * Revokes a single session (logout).
 */
export async function revokeSessionByToken(
  rawSessionToken: string,
  reason = 'user_logout',
  pool?: pg.Pool
): Promise<boolean> {
  if (!rawSessionToken) return false;
  const res = await dbQuery(
    `UPDATE user_sessions
     SET revoked_at = NOW(), revocation_reason = $2
     WHERE token_hash = $1 AND revoked_at IS NULL;`,
    [hashToken(rawSessionToken), reason],
    pool
  );
  return res.rowCount > 0;
}

/**
 * Revokes every active session belonging to a customer ("logout from all devices").
 */
export async function revokeAllCustomerSessions(
  customerId: string,
  reason = 'logout_all_devices',
  pool?: pg.Pool
): Promise<number> {
  const res = await dbQuery(
    `UPDATE user_sessions
     SET revoked_at = NOW(), revocation_reason = $2
     WHERE customer_id = $1 AND revoked_at IS NULL;`,
    [customerId, reason],
    pool
  );
  return res.rowCount;
}

/**
 * Email verification lifecycle.
 */
export async function requestEmailVerification(
  customerId: string,
  pool?: pg.Pool
): Promise<{ emailDelivery: EmailDeliveryResult; verificationTokenPreview?: string }> {
  const rawToken = generateSecureToken(24);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const res = await dbQuery<{ email: string }>(
    `UPDATE customers
     SET email_verification_token_hash = $1,
         email_verification_expires_at = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING email;`,
    [hashToken(rawToken), expiresAt, customerId],
    pool
  );

  if (res.rows.length === 0) {
    throw new NotFoundError('Customer account not found.');
  }

  const emailDelivery = await sendTransactionalEmail({
    to: res.rows[0]!.email,
    subject: 'Verify your Aureon email address',
    text: `Verification token: ${rawToken}`,
    purpose: 'email_verification',
  });

  return {
    emailDelivery,
    ...(process.env.NODE_ENV === 'test' ? { verificationTokenPreview: rawToken } : {}),
  };
}

export async function confirmEmailVerification(rawToken: string, pool?: pg.Pool): Promise<void> {
  if (!rawToken) throw new ValidationError('Verification token is required.');

  const res = await dbQuery(
    `UPDATE customers
     SET email_verified = true,
         email_verification_token_hash = NULL,
         email_verification_expires_at = NULL,
         updated_at = NOW()
     WHERE email_verification_token_hash = $1
       AND email_verification_expires_at > NOW()
     RETURNING id;`,
    [hashToken(rawToken)],
    pool
  );

  if (res.rowCount === 0) {
    throw new ValidationError('Invalid or expired email verification token.');
  }
}

/**
 * Password reset lifecycle (enumeration-safe).
 */
export async function requestPasswordReset(
  email: string,
  pool?: pg.Pool
): Promise<{ accepted: true; emailDelivery: EmailDeliveryResult; resetTokenPreview?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const targetPool = pool || getDbPool();
  const res = await dbQuery<{ id: string; status: string }>(
    'SELECT id, status FROM customers WHERE LOWER(email) = $1 LIMIT 1;',
    [normalizedEmail],
    targetPool
  );

  if (res.rows.length === 0 || res.rows[0]!.status !== 'active') {
    return {
      accepted: true,
      emailDelivery: {
        delivered: false,
        verified: false,
        provider: 'none',
        reason: 'Enumeration-safe response',
      },
    };
  }

  const rawToken = generateSecureToken(24);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await dbQuery(
    `UPDATE customers
     SET password_reset_token_hash = $1,
         password_reset_expires_at = $2,
         updated_at = NOW()
     WHERE id = $3;`,
    [hashToken(rawToken), expiresAt, res.rows[0]!.id],
    targetPool
  );

  const emailDelivery = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: 'Aureon Marketplace Password Reset',
    text: `Password reset token: ${rawToken}`,
    purpose: 'password_reset',
  });

  return {
    accepted: true,
    emailDelivery,
    ...(process.env.NODE_ENV === 'test' ? { resetTokenPreview: rawToken } : {}),
  };
}

export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
  pool?: pg.Pool
): Promise<void> {
  if (!rawToken || !newPassword || newPassword.length < 8) {
    throw new ValidationError('Valid reset token and password (minimum 8 characters) are required.');
  }

  const newHash = await hashPassword(newPassword);

  await withTransaction(
    async (client) => {
      const res = await client.query<{ id: string }>(
        `UPDATE customers
         SET password_hash = $1,
             password_reset_token_hash = NULL,
             password_reset_expires_at = NULL,
             failed_login_attempts = 0,
             locked_until = NULL,
             updated_at = NOW()
         WHERE password_reset_token_hash = $2
           AND password_reset_expires_at > NOW()
         RETURNING id;`,
        [newHash, hashToken(rawToken)]
      );

      if (res.rows.length === 0) {
        throw new ValidationError('Invalid or expired password reset token.');
      }

      // Revoke all existing sessions whenever a password is reset
      await client.query(
        `UPDATE user_sessions
         SET revoked_at = NOW(), revocation_reason = 'password_reset'
         WHERE customer_id = $1 AND revoked_at IS NULL;`,
        [res.rows[0]!.id]
      );
    },
    undefined,
    pool
  );
}

/**
 * Verifies CSRF token when cookie authentication is active.
 */
export function verifyCsrfTokenMatch(rawCsrfHeader: string | null, expectedHash: string): boolean {
  if (!rawCsrfHeader || !expectedHash) return false;
  return timingSafeEqualHex(hashToken(rawCsrfHeader.trim()), expectedHash);
}
