/**
 * ==============================================================================
 * CATALOG DOMAIN — SELLERS FIXTURES
 * ==============================================================================
 * Deterministic mock sellers for development and testing.
 * NOTE: Non-authoritative development/demo seed data only.
 */

import type { SellerSummary } from '../types/seller';

export const MOCK_SELLERS: SellerSummary[] = [
  {
    id: 'seller-official-flagship',
    slug: 'official-flagship-store',
    name: 'Official Flagship Store',
    logoUrl: '/assets/mock/sellers/official-flagship.png',
    rating: {
      average: 4.9,
      count: 14200,
      positiveFeedbackPercent: 99.2,
    },
    badges: ['official_store', 'top_rated', 'authorized_dealer'],
    isVerified: true,
  },
  {
    id: 'seller-tech-direct',
    slug: 'tech-direct-express',
    name: 'TechDirect Express',
    logoUrl: '/assets/mock/sellers/tech-direct.png',
    rating: {
      average: 4.8,
      count: 8900,
      positiveFeedbackPercent: 97.8,
    },
    badges: ['top_rated', 'fast_shipper', 'authorized_dealer'],
    isVerified: true,
  },
  {
    id: 'seller-global-ware',
    slug: 'global-ware-imports',
    name: 'GlobalWare Imports',
    logoUrl: '/assets/mock/sellers/global-ware.png',
    rating: {
      average: 4.6,
      count: 4200,
      positiveFeedbackPercent: 94.5,
    },
    badges: ['authorized_dealer'],
    isVerified: true,
  },
  {
    id: 'seller-apex-outlet',
    slug: 'apex-outlet-deals',
    name: 'Apex Outlet Deals',
    logoUrl: '/assets/mock/sellers/apex-outlet.png',
    rating: {
      average: 4.4,
      count: 2150,
      positiveFeedbackPercent: 91.0,
    },
    badges: ['fast_shipper'],
    isVerified: false,
  },
];
