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

describe('Aureon Backend REST API Services', () => {
  describe('1. Catalog & Product Discovery Endpoints', () => {
    it('GET /api/catalog/products returns paginated products with facets', async () => {
      const request = new Request('http://localhost:3000/api/catalog/products?page=1&limit=6');
      const response = await getProducts(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeLessThanOrEqual(6);
      expect(json.meta.total).toBeGreaterThan(0);
      expect(json.meta.facets.categories).toBeDefined();
      expect(json.meta.facets.brands).toBeDefined();
    });

    it('GET /api/catalog/products/[id] retrieves product by slug', async () => {
      const request = new Request('http://localhost:3000/api/catalog/products/apple-macbook-pro-16-m3-max');
      const response = await getProductDetail(request, {
        params: Promise.resolve({ id: 'apple-macbook-pro-16-m3-max' }),
      });
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.product).toBeDefined();
      expect(json.data.product.slug).toBe('apple-macbook-pro-16-m3-max');
      expect(json.data.offers).toBeDefined();
    });

    it('GET /api/catalog/categories returns hierarchy tree', async () => {
      const request = new Request('http://localhost:3000/api/catalog/categories?tree=true');
      const response = await getCategories(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.total).toBeGreaterThan(0);
    });

    it('GET /api/catalog/brands returns verified brands', async () => {
      const request = new Request('http://localhost:3000/api/catalog/brands');
      const response = await getBrands(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data[0]?.isVerified).toBe(true);
    });

    it('GET /api/catalog/search returns matching suggestions', async () => {
      const request = new Request('http://localhost:3000/api/catalog/search?q=macbook');
      const response = await getSearch(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.products.length).toBeGreaterThan(0);
    });
  });

  describe('2. Shopping Cart & Wishlist Endpoints', () => {
    it('GET /api/cart returns default empty cart structure', async () => {
      const response = await getCart();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.itemCount).toBe(0);
      expect(json.data.subtotal.amountMinor).toBe(0);
    });

    it('POST /api/cart recalculates totals and groups by seller', async () => {
      const request = new Request('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          items: [],
          item: {
            productId: 'prod-test-01',
            title: 'Test Audio Device',
            slug: 'test-audio-device',
            sellerId: 'seller-tech-direct',
            sellerName: 'TechDirect Express',
            sellerSlug: 'tech-direct-express',
            isSellerVerified: true,
            unitPrice: { amountMinor: 9900, currency: 'USD' },
            quantity: 2,
          },
        }),
      });

      const response = await postCart(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.itemCount).toBe(2);
      expect(json.data.subtotal.amountMinor).toBe(19800);
      expect(json.data.sellerGroups.length).toBe(1);
      expect(json.data.sellerGroups[0].sellerId).toBe('seller-tech-direct');
    });

    it('POST /api/wishlist toggles items and returns snapshots', async () => {
      const request = new Request('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          productId: 'prod-macbook-pro-16',
          currentProductIds: [],
        }),
      });

      const response = await postWishlist(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.productIds).toContain('prod-macbook-pro-16');
      expect(json.data.items[0].productSnapshot).toBeDefined();
    });
  });

  describe('3. Checkout & Multi-Vendor Orders Endpoints', () => {
    it('POST /api/checkout/validate checks address and returns shipping fee', async () => {
      const request = new Request('http://localhost:3000/api/checkout/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: {
            fullName: 'Alexander Wright',
            email: 'a.wright@example.com',
            phone: '+1 555-019-2834',
          },
          shipping: {
            address: '500 Technology Square',
            city: 'Cambridge',
            state: 'MA',
            postalCode: '02139',
            country: 'US',
          },
          deliveryMethod: 'express',
        }),
      });

      const response = await validateCheckout(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.isValid).toBe(true);
      expect(json.data.shippingFee.amountMinor).toBe(1500); // $15 Express
    });

    it('POST /api/checkout/place-order splits vendor packages and reserves escrow', async () => {
      const request = new Request('http://localhost:3000/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: {
            fullName: 'Alexander Wright',
            email: 'a.wright@example.com',
            phone: '+1 555-019-2834',
          },
          shipping: {
            address: '500 Technology Square',
            city: 'Cambridge',
            state: 'MA',
            postalCode: '02139',
            country: 'US',
          },
          deliveryMethod: 'standard',
          paymentMethod: 'credit_card',
          items: [
            {
              id: 'item-1',
              productId: 'prod-macbook-pro-16',
              slug: 'apple-macbook-pro-16',
              sellerId: 'seller-tech-direct',
              sellerName: 'TechDirect Express',
              sellerSlug: 'tech-direct-express',
              isSellerVerified: true,
              unitPrice: { amountMinor: 249900, currency: 'USD' },
              quantity: 1,
              lineTotal: { amountMinor: 249900, currency: 'USD' },
            },
          ],
        }),
      });

      const response = await placeOrder(request);
      expect(response.status).toBe(201);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.order.orderId).toMatch(/^ORD-2026-\d{6}$/);
      expect(json.data.order.vendorPackages.length).toBe(1);
      expect(json.data.escrowReference).toMatch(/^ESCROW-/);
    });

    it('GET /api/orders returns orders list', async () => {
      const request = new Request('http://localhost:3000/api/orders');
      const response = await getOrders(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.total).toBeGreaterThan(0);
    });
  });

  describe('4. Customer Authentication & Seller/Admin Operations', () => {
    it('POST /api/auth/login validates credentials and creates session', async () => {
      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sarah.jenkins@example.com',
          password: 'Password123!',
          rememberMe: true,
        }),
      });

      const response = await authLogin(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.customer.email).toBe('sarah.jenkins@example.com');
      expect(json.data.token).toBeDefined();
    });

    it('GET /api/seller/profile returns verified seller details', async () => {
      const response = await getSellerProfile();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.slug).toBe('tech-direct-express');
      expect(json.data.isVerified).toBe(true);
    });

    it('GET & PATCH /api/seller/orders supports order fulfillment updates', async () => {
      const getReq = new Request('http://localhost:3000/api/seller/orders');
      const getRes = await getSellerOrders(getReq);
      expect(getRes.status).toBe(200);

      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(getJson.data.length).toBeGreaterThan(0);

      const patchReq = new Request('http://localhost:3000/api/seller/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: getJson.data[0].packageId,
          status: 'shipped',
          carrier: 'DHL Express Global',
          trackingNumber: 'DHL-892341902',
        }),
      });

      const patchRes = await patchSellerOrder(patchReq);
      expect(patchRes.status).toBe(200);

      const patchJson = await patchRes.json();
      expect(patchJson.success).toBe(true);
      expect(patchJson.data.status).toBe('shipped');
      expect(patchJson.data.carrier).toBe('DHL Express Global');
    });

    it('GET /api/admin/metrics returns enterprise marketplace KPIs and trends', async () => {
      const request = new Request('http://localhost:3000/api/admin/metrics?timeframe=last_30_days');
      const response = await getAdminMetrics(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.kpis.totalGmv.amountMinor).toBeGreaterThan(0);
      expect(json.data.revenueTrend.length).toBeGreaterThan(0);
      expect(json.data.systemHealth.uptimePercent).toBeGreaterThan(99);
    });
  });
});
