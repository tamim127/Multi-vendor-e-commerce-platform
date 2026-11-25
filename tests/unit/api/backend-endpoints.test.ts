import { describe, it, expect } from 'vitest';
import { GET as getProducts } from '@/app/api/catalog/products/route';
import { GET as getProductDetail } from '@/app/api/catalog/products/[id]/route';
import { GET as getCategories } from '@/app/api/catalog/categories/route';
import { GET as getBrands } from '@/app/api/catalog/brands/route';
import { GET as getSearch } from '@/app/api/catalog/search/route';
import { POST as postCart, GET as getCart } from '@/app/api/cart/route';
import { POST as postWishlist } from '@/app/api/wishlist/route';
import { POST as validateCheckout } from '@/app/api/checkout/validate/route';
import { POST as placeOrder } from '@/app/api/checkout/place-order/route';
import { GET as getOrders } from '@/app/api/orders/route';
import { POST as authLogin } from '@/app/api/auth/login/route';
import { GET as getSellerProfile } from '@/app/api/seller/profile/route';
import { GET as getSellerOrders, PATCH as patchSellerOrder } from '@/app/api/seller/orders/route';
import { GET as getAdminMetrics } from '@/app/api/admin/metrics/route';

describe('Aureon Backend REST API Fail-Closed Contracts', () => {
  describe('1. Catalog & Product Discovery Endpoints (DB-Backed or 503 Fail-Closed)', () => {
    it('GET /api/catalog/products returns DB data (200) or fails closed (503) without mock fallback', async () => {
      const request = new Request('http://localhost:3000/api/catalog/products?page=1&limit=6');
      const response = await getProducts(request);
      expect([200, 503]).toContain(response.status);
      const json = await response.json();
      if (response.status === 200) {
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
      } else {
        expect(json.success).toBe(false);
        expect(json.code).toBe('DATABASE_UNAVAILABLE');
      }
    });

    it('GET /api/catalog/products/[id] returns DB product (200) or fails closed (503/404)', async () => {
      const request = new Request('http://localhost:3000/api/catalog/products/apple-macbook-pro-16-m3-max');
      const response = await getProductDetail(request, {
        params: Promise.resolve({ id: 'apple-macbook-pro-16-m3-max' }),
      });
      expect([200, 404, 503]).toContain(response.status);
    });

    it('GET /api/catalog/categories returns DB tree (200) or 503', async () => {
      const response = await getCategories(new Request('http://localhost:3000/api/catalog/categories?tree=true'));
      expect([200, 503]).toContain(response.status);
    });

    it('GET /api/catalog/brands returns DB brands (200) or 503', async () => {
      const response = await getBrands(new Request('http://localhost:3000/api/catalog/brands'));
      expect([200, 503]).toContain(response.status);
    });

    it('GET /api/catalog/search returns DB search or 503', async () => {
      const response = await getSearch(new Request('http://localhost:3000/api/catalog/search?q=macbook'));
      expect([200, 503]).toContain(response.status);
    });
  });

  describe('2. Shopping Cart & Protected Wishlist Enforcement', () => {
    it('GET /api/cart returns empty cart for anonymous visitors without DB failure, or 503 if DB down', async () => {
      const response = await getCart(new Request('http://localhost:3000/api/cart'));
      expect([200, 503]).toContain(response.status);
    });

    it('POST /api/cart rejects malformed actions with 400', async () => {
      const request = new Request('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalid_action' }),
      });
      const response = await postCart(request);
      expect(response.status).toBe(400);
    });

    it('POST /api/wishlist enforces authentication (401) rather than returning demo wishlist', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', productId: 'prod-macbook-pro-16' }),
      });
      const response = await postWishlist(request);
      expect([401, 503]).toContain(response.status);
    });
  });

  describe('3. Authentication, Checkout & Protected Order Enforcement', () => {
    it('POST /api/auth/login rejects invalid input with 400', async () => {
      const response = await authLogin(
        new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'not-an-email', password: '123' }),
        })
      );
      expect(response.status).toBe(400);
    });

    it('POST /api/checkout/validate rejects unauthenticated callers (401)', async () => {
      const response = await validateCheckout(
        new Request('http://localhost:3000/api/checkout/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );
      expect([401, 503]).toContain(response.status);
    });

    it('POST /api/checkout/place-order rejects unauthenticated callers (401)', async () => {
      const response = await placeOrder(
        new Request('http://localhost:3000/api/checkout/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );
      expect([401, 503]).toContain(response.status);
    });

    it('GET /api/orders rejects unauthenticated callers (401)', async () => {
      const response = await getOrders(new Request('http://localhost:3000/api/orders'));
      expect([401, 503]).toContain(response.status);
    });
  });

  describe('4. Seller & Admin RBAC Fail-Closed Enforcement', () => {
    it('GET /api/seller/profile denies unauthenticated access (401)', async () => {
      const response = await getSellerProfile(new Request('http://localhost:3000/api/seller/profile'));
      expect([401, 503]).toContain(response.status);
    });

    it('GET & PATCH /api/seller/orders deny unauthenticated access (401)', async () => {
      const getRes = await getSellerOrders(new Request('http://localhost:3000/api/seller/orders'));
      expect([401, 503]).toContain(getRes.status);

      const patchRes = await patchSellerOrder(
        new Request('http://localhost:3000/api/seller/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: 'pkg-1', status: 'shipped' }),
        })
      );
      expect([401, 503]).toContain(patchRes.status);
    });

    it('GET /api/admin/metrics denies unauthenticated access (401)', async () => {
      const response = await getAdminMetrics(new Request('http://localhost:3000/api/admin/metrics'));
      expect([401, 503]).toContain(response.status);
    });
  });
});
