/**
 * ==============================================================================
 * CATALOG DOMAIN — COLLECTIONS FIXTURES
 * ==============================================================================
 * Deterministic mock curated collections for merchandising.
 * NOTE: Non-authoritative development/demo seed data only.
 */

import type { CatalogCollection } from '../types/collection';

export const MOCK_COLLECTIONS: CatalogCollection[] = [
  {
    id: 'col-new-arrivals',
    slug: 'new-arrivals',
    title: {
      en: 'New Arrivals',
      bn: 'নতুন সংযোজন',
      ar: 'وصل حديثاً',
      hi: 'नई आवक',
    },
    description: {
      en: 'Discover the latest releases and cutting-edge innovations.',
      bn: 'সর্বশেষ রিলিজ এবং অত্যাধুনিক উদ্ভাবন আবিষ্কার করুন।',
      ar: 'اكتشف أحدث المنتجات والابتكارات المتطورة.',
    },
    productIds: ['prod-macbook-pro-16', 'prod-nike-alphafly-3', 'prod-samsung-odyssey-g9'],
    productCount: 3,
    ordering: 1,
    status: 'active',
  },
  {
    id: 'col-best-sellers',
    slug: 'best-sellers',
    title: {
      en: 'Best Sellers',
      bn: 'সর্বাধিক বিক্রিত',
      ar: 'الأكثر مبيعاً',
    },
    description: {
      en: 'Top rated and most popular items loved by our community.',
      bn: 'গ্রাহকদের পছন্দের সেরা এবং জনপ্রিয় পণ্যসমূহ।',
      ar: 'المنتجات الأعلى تقييماً والأكثر شعبية.',
    },
    productIds: ['prod-macbook-pro-16', 'prod-sony-wh1000xm5', 'prod-herman-miller-aeron'],
    productCount: 3,
    ordering: 2,
    status: 'active',
  },
  {
    id: 'col-flash-deals',
    slug: 'flash-tech-deals',
    title: {
      en: 'Flash Tech Deals',
      bn: 'ফ্ল্যাশ টেক ডিল',
      ar: 'عروض تقنية حصرية',
    },
    description: {
      en: 'Limited-time special prices on high-demand technology.',
      bn: 'উচ্চ চাহিদাসম্পন্ন প্রযুক্তিতে সীমিত সময়ের বিশেষ মূল্য।',
      ar: 'أسعار خاصة لفترة محدودة على أحدث التقنيات.',
    },
    productIds: ['prod-sony-wh1000xm5', 'prod-anker-737'],
    productCount: 2,
    ordering: 3,
    status: 'active',
  },
];
