/**
 * ==============================================================================
 * ADMIN DOMAIN — REFUNDS & RETURNS FIXTURES
 * ==============================================================================
 */

import type { RefundRequest, ReturnRequest } from '../types/refund-return';

export const DEMO_REFUND_REQUESTS: RefundRequest[] = [
  {
    id: 'ref-req-801',
    orderId: 'ord-demo-1001',
    packageId: 'pkg-demo-tech-01',
    customerId: 'cust-demo-sarah',
    customerName: 'Sarah Jenkins',
    sellerId: 'seller-tech-direct',
    sellerName: 'TechDirect Express',
    amount: { amountMinor: 12900, currency: 'USD' },
    reason: 'defective',
    customerNote: 'Earbuds disconnect intermittently after 10 minutes of playback.',
    adminNote: 'Customer contacted support. Verified diagnostic logs.',
    status: 'pending',
    createdAt: '2026-02-18T10:30:00Z',
  },
  {
    id: 'ref-req-802',
    orderId: 'ord-demo-1002',
    packageId: 'pkg-demo-audio-02',
    customerId: 'cust-demo-sarah',
    customerName: 'Sarah Jenkins',
    sellerId: 'seller-official-flagship',
    sellerName: 'Official Flagship Store',
    amount: { amountMinor: 24900, currency: 'USD' },
    reason: 'damaged',
    customerNote: 'Outer chassis was dented during courier transit.',
    adminNote: 'Damage pictures verified. Approved for full replacement or refund.',
    status: 'approved',
    createdAt: '2026-02-15T14:20:00Z',
    resolvedAt: '2026-02-16T11:00:00Z',
    resolvedBy: 'Sophia Patel (Finance Director)',
  },
  {
    id: 'ref-req-803',
    orderId: 'ord-demo-0988',
    packageId: 'pkg-demo-global-03',
    customerId: 'cust-demo-michael',
    customerName: 'Michael Chang',
    sellerId: 'seller-global-ware',
    sellerName: 'GlobalWare Imports',
    amount: { amountMinor: 4500, currency: 'USD' },
    reason: 'buyer_remorse',
    customerNote: 'Ordered wrong color variant by mistake.',
    adminNote: 'Item unopened and within return window.',
    status: 'processed',
    createdAt: '2026-02-10T09:15:00Z',
    resolvedAt: '2026-02-11T16:30:00Z',
    resolvedBy: 'Alex Rivera (Super Admin)',
  },
];

export const DEMO_RETURN_REQUESTS: ReturnRequest[] = [
  {
    id: 'ret-req-501',
    orderId: 'ord-demo-1001',
    packageId: 'pkg-demo-tech-01',
    customerId: 'cust-demo-sarah',
    customerName: 'Sarah Jenkins',
    sellerId: 'seller-tech-direct',
    sellerName: 'TechDirect Express',
    items: [
      {
        productId: 'prod-wireless-earbuds-pro',
        productName: 'AeroSound Pro Wireless Earbuds',
        quantity: 1,
      },
    ],
    status: 'pending',
    reason: 'defective',
    customerNote: 'Left earpiece battery drains in under 15 minutes.',
    createdAt: '2026-02-18T10:30:00Z',
  },
  {
    id: 'ret-req-502',
    orderId: 'ord-demo-0988',
    packageId: 'pkg-demo-global-03',
    customerId: 'cust-demo-michael',
    customerName: 'Michael Chang',
    sellerId: 'seller-global-ware',
    sellerName: 'GlobalWare Imports',
    items: [
      {
        productId: 'prod-leather-sleeve-14',
        productName: 'Handcrafted Italian Leather Laptop Sleeve',
        quantity: 1,
      },
    ],
    status: 'received',
    reason: 'buyer_remorse',
    trackingNumber: 'RET-USPS-982144',
    adminNote: 'Package received at warehouse inspection hub. Verified intact.',
    createdAt: '2026-02-10T09:15:00Z',
    resolvedAt: '2026-02-14T13:45:00Z',
    resolvedBy: 'Elena Rostova (Fulfillment Lead)',
  },
];
