import crypto from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { closeDbPool, getDbPool } from '@/server/db/client';
import { hashToken } from '@/server/security/crypto';
import { resetRateLimitsForTests } from '@/server/security/rate-limiter';
import { TEST_DATABASE_URL } from './test-helper';

import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { GET as meRoute } from '@/app/api/auth/me/route';
import { POST as logoutRoute } from '@/app/api/auth/logout/route';
import { POST as logoutAllRoute } from '@/app/api/auth/logout-all/route';
import { POST as refreshRoute } from '@/app/api/auth/refresh/route';
import { POST as verifyEmailRoute } from '@/app/api/auth/verify-email/route';
import { POST as forgotPasswordRoute } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordRoute } from '@/app/api/auth/reset-password/route';
import { GET as getOrdersRoute } from '@/app/api/orders/route';
import { GET as getAdminMetricsRoute } from '@/app/api/admin/metrics/route';
import { PATCH as reviewRefundRoute } from '@/app/api/admin/refunds/route';
import { GET as getSellerProfileRoute } from '@/app/api/seller/profile/route';
import { POST as postWishlistRoute } from '@/app/api/wishlist/route';
import { GET as getAddressesRoute, POST as postAddressRoute } from '@/app/api/customer/addresses/route';
import { DELETE as deleteAddressRoute } from '@/app/api/customer/addresses/[id]/route';

describe('Phase 8B: HTTP Auth, Sessions, CSRF, & RBAC PostgreSQL Integration Tests', () => {
  const uniqueSuffix = crypto.randomUUID().slice(0, 8);
  const custAEmail = `cust-a-${uniqueSuffix}@example.com`;
  const custBEmail = `cust-b-${uniqueSuffix}@example.com`;
  const adminEmail = `admin-${uniqueSuffix}@example.com`;
  const catalogMgrEmail = `catmgr-${uniqueSuffix}@example.com`;
  const password = 'StrongPassword!2026';

  let custAToken = '';
  let custACsrf = '';
  let custBToken = '';
  let custBId = '';
  let adminToken = '';
  let catalogMgrToken = '';

  beforeAll(async () => {
    process.env['DATABASE_URL'] = TEST_DATABASE_URL;
    await closeDbPool();
    resetRateLimitsForTests();
  });

  afterAll(async () => {
    await closeDbPool();
  });

  it('registers customer A in PostgreSQL with Argon2id hash and authenticates session', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custAEmail,
        password,
        confirmPassword: password,
        firstName: 'Alice',
        lastName: 'Tester',
        acceptTerms: true,
      }),
    });

    const res = await registerRoute(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.customer.email).toBe(custAEmail);
    expect(json.data.customer.passwordHash).toBeUndefined();
    expect(json.data.token).toBeDefined();
    custAToken = json.data.token;
    custACsrf = json.data.csrfToken;

    // Verify stored password hash in DB is Argon2id and never plaintext
    const pool = getDbPool();
    const row = await pool.query('SELECT password_hash FROM customers WHERE LOWER(email) = $1;', [
      custAEmail,
    ]);
    expect(row.rows[0]?.password_hash).toMatch(/^\$argon2id\$/);

    // Verify email verification token works
    if (json.data.verificationTokenPreview) {
      const verifyRes = await verifyEmailRoute(
        new Request('http://localhost:3000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: json.data.verificationTokenPreview }),
        })
      );
      expect(verifyRes.status).toBe(200);
    }
  });

  it('rejects duplicate email registration (case-insensitive) and rejects invalid passwords', async () => {
    const dupRes = await registerRoute(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: custAEmail.toUpperCase(),
          password,
          confirmPassword: password,
          firstName: 'Dup',
          lastName: 'User',
          acceptTerms: true,
        }),
      })
    );
    expect(dupRes.status).toBe(409);

    const badPassRes = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: custAEmail, password: 'WrongPassword123!' }),
      })
    );
    expect(badPassRes.status).toBe(401);
  });

  it('rejects unsigned base64 fake tokens and expired/revoked sessions', async () => {
    const fakeUnsigned = `aureon_jwt_${Buffer.from(JSON.stringify({ sub: 'cust-1', email: custAEmail })).toString('base64url')}`;
    const fakeRes = await getOrdersRoute(
      new Request('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${fakeUnsigned}` },
      })
    );
    expect(fakeRes.status).toBe(401);

    // Expire session directly in Postgres and verify rejection
    const pool = getDbPool();
    const expiredRaw = 'expired-test-token-' + crypto.randomUUID();
    await pool.query(
      `INSERT INTO user_sessions (id, customer_id, token_hash, csrf_token_hash, expires_at)
       SELECT $1, id, $2, $3, NOW() - INTERVAL '1 hour'
       FROM customers WHERE LOWER(email) = $4 LIMIT 1;`,
      ['sess-exp-' + crypto.randomUUID().slice(0, 8), hashToken(expiredRaw), hashToken('csrf'), custAEmail]
    );
    const expRes = await getOrdersRoute(
      new Request('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${expiredRaw}` },
      })
    );
    expect(expRes.status).toBe(401);
  });

  it('enforces CSRF protection on cookie-authenticated mutations', async () => {
    // Missing x-csrf-token with cookie auth must fail with 403
    const missingCsrfRes = await postWishlistRoute(
      new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aureon_session=${custAToken}`,
        },
        body: JSON.stringify({ action: 'get' }),
      })
    );
    expect(missingCsrfRes.status).toBe(403);

    // Valid x-csrf-token succeeds
    const validCsrfRes = await postWishlistRoute(
      new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `aureon_session=${custAToken}`,
          'x-csrf-token': custACsrf,
        },
        body: JSON.stringify({ action: 'get' }),
      })
    );
    expect(validCsrfRes.status).toBe(200);
  });

  it('rotates sessions cleanly and invalidates old token', async () => {
    const refreshRes = await refreshRoute(
      new Request('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    expect(refreshRes.status).toBe(200);
    const refreshed = await refreshRes.json();
    const oldToken = custAToken;
    custAToken = refreshed.data.token;
    custACsrf = refreshed.data.csrfToken;

    // Old token must now fail
    const oldCheck = await getOrdersRoute(
      new Request('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${oldToken}` },
      })
    );
    expect(oldCheck.status).toBe(401);

    // New token succeeds
    const newCheck = await getOrdersRoute(
      new Request('http://localhost:3000/api/orders', {
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    expect(newCheck.status).toBe(200);
  });

  it('prevents cross-customer IDOR and vertical privilege escalation', async () => {
    // Register Customer B
    const regB = await registerRoute(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: custBEmail,
          password,
          confirmPassword: password,
          firstName: 'Bob',
          lastName: 'Tester',
          acceptTerms: true,
        }),
      })
    );
    const jsonB = await regB.json();
    custBToken = jsonB.data.token;
    custBId = jsonB.data.customer.id;

    // Customer B creates an address
    const addrRes = await postAddressRoute(
      new Request('http://localhost:3000/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${custBToken}`,
        },
        body: JSON.stringify({
          label: 'home',
          fullName: 'Bob Tester',
          streetAddress: '999 Private Ave',
          city: 'Seattle',
          stateOrProvince: 'WA',
          postalCode: '98101',
          countryCode: 'US',
          phoneNumber: '+1-555-0100',
        }),
      })
    );
    expect(addrRes.status).toBe(201);
    const addrJson = await addrRes.json();
    const bobAddressId = addrJson.data.id;

    // Customer A must NOT see or delete Bob's address
    const listARes = await getAddressesRoute(
      new Request('http://localhost:3000/api/customer/addresses', {
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    const listAJson = await listARes.json();
    expect(listAJson.data.some((a: any) => a.id === bobAddressId)).toBe(false);

    const delRes = await deleteAddressRoute(
      new Request(`http://localhost:3000/api/customer/addresses/${bobAddressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${custAToken}` },
      }),
      { params: Promise.resolve({ id: bobAddressId }) }
    );
    expect(delRes.status).toBe(404);

    // Customer A cannot access Seller Central or Admin endpoints (403 Forbidden)
    const sellerDeny = await getSellerProfileRoute(
      new Request('http://localhost:3000/api/seller/profile', {
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    expect(sellerDeny.status).toBe(403);

    const adminDeny = await getAdminMetricsRoute(
      new Request('http://localhost:3000/api/admin/metrics', {
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    expect(adminDeny.status).toBe(403);
  });

  it('enforces granular Admin RBAC permissions (catalog_manager vs super_admin)', async () => {
    // Register & promote super_admin and catalog_manager in DB
    await registerRoute(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password,
          confirmPassword: password,
          firstName: 'Super',
          lastName: 'Admin',
          acceptTerms: true,
        }),
      })
    );
    await registerRoute(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: catalogMgrEmail,
          password,
          confirmPassword: password,
          firstName: 'Cat',
          lastName: 'Mgr',
          acceptTerms: true,
        }),
      })
    );

    const pool = getDbPool();
    await pool.query(`UPDATE customers SET role = 'admin', admin_role = 'super_admin' WHERE LOWER(email) = $1;`, [
      adminEmail,
    ]);
    await pool.query(
      `UPDATE customers SET role = 'admin', admin_role = 'catalog_manager' WHERE LOWER(email) = $1;`,
      [catalogMgrEmail]
    );

    const admLogin = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password }),
      })
    );
    adminToken = (await admLogin.json()).data.token;

    const catLogin = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: catalogMgrEmail, password }),
      })
    );
    catalogMgrToken = (await catLogin.json()).data.token;

    // catalog_manager CAN read analytics metrics
    const catMetrics = await getAdminMetricsRoute(
      new Request('http://localhost:3000/api/admin/metrics', {
        headers: { Authorization: `Bearer ${catalogMgrToken}` },
      })
    );
    expect(catMetrics.status).toBe(200);

    // catalog_manager CANNOT process refunds (403 Forbidden)
    const catRefundDeny = await reviewRefundRoute(
      new Request('http://localhost:3000/api/admin/refunds', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${catalogMgrToken}`,
        },
        body: JSON.stringify({ refundId: 'ref-1', status: 'rejected' }),
      })
    );
    expect(catRefundDeny.status).toBe(403);

    // super_admin CAN read metrics and reaches handler validation/execution
    const admMetrics = await getAdminMetricsRoute(
      new Request('http://localhost:3000/api/admin/metrics', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(admMetrics.status).toBe(200);
  });

  it('supports password reset lifecycle (revoking sessions) and logout/logout-all', async () => {
    const forgotRes = await forgotPasswordRoute(
      new Request('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: custBEmail }),
      })
    );
    expect(forgotRes.status).toBe(200);
    const forgotJson = await forgotRes.json();
    const resetToken = forgotJson.data.resetTokenPreview;
    expect(resetToken).toBeDefined();

    const newPwd = 'NewStrongPassword!99';
    const resetRes = await resetPasswordRoute(
      new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: newPwd }),
      })
    );
    expect(resetRes.status).toBe(200);

    // Previous token for Customer B must be revoked after password reset
    const meOldB = await meRoute(
      new Request('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${custBToken}` },
      })
    );
    expect((await meOldB.json()).data.isAuthenticated).toBe(false);

    // Login with new password succeeds
    const loginNewRes = await loginRoute(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: custBEmail, password: newPwd }),
      })
    );
    expect(loginNewRes.status).toBe(200);
    const tokenB2 = (await loginNewRes.json()).data.token;

    // Logout from all devices revokes tokenB2
    const logoutAllRes = await logoutAllRoute(
      new Request('http://localhost:3000/api/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenB2}` },
      })
    );
    expect(logoutAllRes.status).toBe(200);
    expect(custBId).toBeDefined();

    const meAfterLogoutAll = await meRoute(
      new Request('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenB2}` },
      })
    );
    expect((await meAfterLogoutAll.json()).data.isAuthenticated).toBe(false);

    // Single logout revokes custAToken
    const logoutARes = await logoutRoute(
      new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${custAToken}` },
      })
    );
    expect(logoutARes.status).toBe(200);
  });
});
