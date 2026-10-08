/**
 * ==============================================================================
 * CATALOG DOMAIN — PRODUCTS FIXTURES
 * ==============================================================================
 * Deterministic canonical product definitions demonstrating full marketplace complexity.
 * Relational references map to MOCK_BRANDS, MOCK_CATEGORIES, and MOCK_VARIANTS.
 * NOTE: Non-authoritative development/demo seed data only.
 */

import type { Product } from '../types/product';
import { MOCK_BRANDS } from './brands.fixture';
import { MOCK_VARIANTS } from './variants.fixture';

const brandMap = new Map(MOCK_BRANDS.map((b) => [b.id, b]));

export const MOCK_PRODUCTS: Product[] = [
  // =========================================================
  // 1. MACBOOK PRO 16" (Multi-variant: Color x Storage, Level 4 Category)
  // =========================================================
  {
    id: 'prod-macbook-pro-16',
    slug: 'apple-macbook-pro-16-m3-max',
    title: {
      en: 'Apple MacBook Pro 16" with M3 Max Chip',
      bn: 'অ্যাপল ম্যাকবুক প্রো ১৬" এম৩ ম্যাক্স চিপ সহ',
      ar: 'آبل ماك بوك برو 16 بوصة مع شريحة M3 Max',
      hi: 'एप्पल मैकबुक प्रो 16" M3 मैक्स चिप के साथ',
    },
    shortDescription: {
      en: 'The most advanced Mac laptop for demanding professional workflows.',
      bn: 'পেশাদার কাজের জন্য সবচেয়ে উন্নত ম্যাক ল্যাপটপ।',
      ar: 'أقوى حاسوب محمول للمحترفين مع شاشة Liquid Retina XDR.',
    },
    description: {
      en: 'MacBook Pro blasts forward with M3 Max, an extraordinarily advanced chip delivering massive speed and capability for extreme workflows. Featuring Liquid Retina XDR display and up to 22 hours of battery life.',
      bn: 'এম৩ ম্যাক্স চিপ সহ ম্যাকবুক প্রো অত্যন্ত শক্তিশালী কর্মক্ষমতা প্রদান করে। লিকুইড রেটিনা এক্সডিআর ডিসপ্লে এবং ২২ ঘন্টা পর্যন্ত ব্যাটারি লাইফ।',
      ar: 'يقدم جهاز MacBook Pro المزود بشريحة M3 Max أداءً فائقًا للمحترفين، مع شاشة Liquid Retina XDR وعمر بطارية يدوم حتى 22 ساعة.',
    },
    brand: brandMap.get('brand-apple')!,
    categoryId: 'cat-workstation-ultrabooks',
    categoryPath:
      '/electronics/computers-laptops/laptops/ultraportable-laptops/workstation-ultrabooks',
    categoryBreadcrumbs: [
      {
        id: 'cat-electronics',
        slug: 'electronics',
        name: { en: 'Electronics' },
        level: 0,
        path: '/electronics',
      },
      {
        id: 'cat-computers-laptops',
        slug: 'computers-laptops',
        name: { en: 'Computers & Laptops' },
        level: 1,
        path: '/electronics/computers-laptops',
      },
      {
        id: 'cat-laptops',
        slug: 'laptops',
        name: { en: 'Laptops' },
        level: 2,
        path: '/electronics/computers-laptops/laptops',
      },
      {
        id: 'cat-ultraportable-laptops',
        slug: 'ultraportable-laptops',
        name: { en: 'Ultraportable Laptops' },
        level: 3,
        path: '/electronics/computers-laptops/laptops/ultraportable-laptops',
      },
      {
        id: 'cat-workstation-ultrabooks',
        slug: 'workstation-ultrabooks',
        name: { en: 'Workstation Ultrabooks' },
        level: 4,
        path: '/electronics/computers-laptops/laptops/ultraportable-laptops/workstation-ultrabooks',
      },
    ],
    categoryIds: [
      'cat-electronics',
      'cat-computers-laptops',
      'cat-laptops',
      'cat-ultraportable-laptops',
      'cat-workstation-ultrabooks',
    ],
    media: [
      {
        id: 'med-mbp-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/mbp16-hero.webp',
        alt: { en: 'MacBook Pro 16 inch Space Black' },
        width: 1600,
        height: 1200,
        order: 0,
      },
      {
        id: 'med-mbp-ports',
        type: 'image',
        role: 'gallery',
        url: '/assets/mock/products/mbp16-ports.webp',
        alt: { en: 'MacBook Pro side profile and ports' },
        width: 1600,
        height: 1200,
        order: 1,
      },
      {
        id: 'med-mbp-video',
        type: 'video',
        role: 'gallery',
        url: '/assets/mock/products/mbp16-intro.mp4',
        alt: { en: 'MacBook Pro 16 inch Introduction Video' },
        width: 1920,
        height: 1080,
        order: 2,
        durationSeconds: 45,
      },
    ],
    attributes: [
      {
        id: 'attr-chip',
        key: 'processor',
        label: { en: 'Processor', bn: 'প্রসেসর', ar: 'المعالج' },
        type: 'text',
        value: 'Apple M3 Max (16-core CPU, 40-core GPU)',
        group: 'performance',
        isFilterable: true,
        isSearchable: true,
        isVisibleOnPdp: true,
      },
      {
        id: 'attr-ram',
        key: 'unified-memory',
        label: { en: 'Unified Memory', bn: 'র‍্যাম', ar: 'الذاكرة' },
        type: 'text',
        value: '48 GB',
        group: 'technical',
        isFilterable: true,
        isSearchable: true,
        isVisibleOnPdp: true,
      },
      {
        id: 'attr-display',
        key: 'screen-size',
        label: { en: 'Screen Size', bn: 'স্ক্রিন সাইজ', ar: 'حجم الشاشة' },
        type: 'measurement',
        value: 16.2,
        unit: 'inches',
        group: 'technical',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
    ],
    variants: MOCK_VARIANTS.filter((v) => v.productId === 'prod-macbook-pro-16'),
    defaultVariantId: 'var-mbp-16-blk-512',
    ratingSummary: {
      average: 4.88,
      count: 1420,
      distribution: { 5: 1280, 4: 110, 3: 20, 2: 7, 1: 3 },
    },
    reviewCount: 840,
    badges: [
      {
        id: 'bdg-best-seller',
        type: 'best_seller',
        label: { en: 'Best Seller', bn: 'সেরা বিক্রিত', ar: 'الأكثر مبيعاً' },
        tone: 'accent',
      },
      {
        id: 'bdg-editorial',
        type: 'editorial_pick',
        label: { en: "Editor's Choice", bn: 'সম্পাদকের পছন্দ', ar: 'اختيار المحرر' },
        tone: 'default',
      },
    ],
    tags: ['laptop', 'apple', 'm3-max', 'pro-laptop', 'ultrabook'],
    status: 'active',
    offerSummary: {
      offerCount: 4,
      lowestPrice: { amountMinor: 209900, currency: 'USD' },
      highestPrice: { amountMinor: 289900, currency: 'USD' },
      buyBoxOfferId: 'ofr-mbp-sb512-flagship',
      hasMultipleOffers: true,
    },
    isDigital: false,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
  },

  // =========================================================
  // 2. SONY WH-1000XM5 (Wireless Headphones, Level 3 Category)
  // =========================================================
  {
    id: 'prod-sony-wh1000xm5',
    slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphones',
    title: {
      en: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      bn: 'সনি WH-1000XM5 ওয়্যারলেস নয়েজ ক্যানসেলিং হেডফোন',
      ar: 'سماعات سوني WH-1000XM5 اللاسلكية العازلة للضوضاء',
    },
    shortDescription: {
      en: 'Industry-leading noise cancellation with exceptional sound clarity.',
      bn: 'অসাধারণ সাউন্ড ক্ল্যারিটি সহ ইন্ডাস্ট্রি-লিডিং নয়েজ ক্যান্সেলেশন।',
      ar: 'عزل ضوضاء رائد في الصناعة مع صوت استثنائي فائق النقاء.',
    },
    description: {
      en: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control eight microphones for unprecedented noise cancellation.',
      bn: 'WH-1000XM5 হেডফোন বিঘ্নহীন সঙ্গীত উপভোগের নতুন মান নির্ধারণ করে। এতে রয়েছে আটটি মাইক্রোফোন এবং দুটি প্রসেসর।',
      ar: 'تعيد سماعات WH-1000XM5 صياغة قواعد الاستماع الخالي من التشتت بفضل معالجين وثمانية ميكروفونات.',
    },
    brand: brandMap.get('brand-sony')!,
    categoryId: 'cat-noise-cancelling',
    categoryPath: '/electronics/audio-headphones/wireless-headphones/noise-cancelling-headphones',
    categoryBreadcrumbs: [
      {
        id: 'cat-electronics',
        slug: 'electronics',
        name: { en: 'Electronics' },
        level: 0,
        path: '/electronics',
      },
      {
        id: 'cat-audio-headphones',
        slug: 'audio-headphones',
        name: { en: 'Audio & Headphones' },
        level: 1,
        path: '/electronics/audio-headphones',
      },
      {
        id: 'cat-wireless-headphones',
        slug: 'wireless-headphones',
        name: { en: 'Wireless Headphones' },
        level: 2,
        path: '/electronics/audio-headphones/wireless-headphones',
      },
      {
        id: 'cat-noise-cancelling',
        slug: 'noise-cancelling-headphones',
        name: { en: 'Noise Cancelling Headphones' },
        level: 3,
        path: '/electronics/audio-headphones/wireless-headphones/noise-cancelling-headphones',
      },
    ],
    categoryIds: [
      'cat-electronics',
      'cat-audio-headphones',
      'cat-wireless-headphones',
      'cat-noise-cancelling',
    ],
    media: [
      {
        id: 'med-xm5-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/sony-xm5-hero.webp',
        alt: { en: 'Sony WH-1000XM5 Hero Front' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    attributes: [
      {
        id: 'attr-battery',
        key: 'battery-life',
        label: { en: 'Battery Life', bn: 'ব্যাটারি লাইফ', ar: 'عمر البطارية' },
        type: 'measurement',
        value: 30,
        unit: 'hours',
        group: 'performance',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
      {
        id: 'attr-anc',
        key: 'noise-cancellation',
        label: {
          en: 'Active Noise Cancellation',
          bn: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন',
          ar: 'عزل الضوضاء النشط',
        },
        type: 'boolean',
        value: true,
        group: 'performance',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
    ],
    variants: MOCK_VARIANTS.filter((v) => v.productId === 'prod-sony-wh1000xm5'),
    defaultVariantId: 'var-sony-xm5-blk',
    ratingSummary: {
      average: 4.75,
      count: 3200,
      distribution: { 5: 2600, 4: 450, 3: 110, 2: 25, 1: 15 },
    },
    reviewCount: 1850,
    badges: [
      {
        id: 'bdg-deal',
        type: 'deal_of_the_day',
        label: { en: 'Deal of the Day', bn: 'আজকের সেরা ডিল', ar: 'صفقة اليوم' },
        tone: 'accent',
      },
    ],
    tags: ['headphones', 'anc', 'wireless', 'sony', 'audio'],
    status: 'active',
    offerSummary: {
      offerCount: 2,
      lowestPrice: { amountMinor: 34999, currency: 'USD' },
      highestPrice: { amountMinor: 39999, currency: 'USD' },
      buyBoxOfferId: 'ofr-sony-xm5-techdirect',
      hasMultipleOffers: true,
    },
    isDigital: false,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-22T08:00:00Z',
  },

  // =========================================================
  // 3. NIKE AIR ZOOM ALPHAFLY 3 (Apparel / Footwear, Level 3 Category)
  // =========================================================
  {
    id: 'prod-nike-alphafly-3',
    slug: 'nike-air-zoom-alphafly-3-running-shoes',
    title: {
      en: 'Nike Air Zoom Alphafly 3 Road Racing Shoes',
      bn: 'নাইকি এয়ার জুম আল্ট্রাফ্লাই ৩ রোড রেসিং জুতো',
      ar: 'حذاء الجري نايكي إير زوم ألفافلاي 3',
    },
    description: {
      en: 'Fine-tuned for marathon speed, the Alphafly 3 helps push you beyond what you thought possible. Dual Air Zoom units combine with ZoomX foam for maximum energy return.',
      bn: 'ম্যারাথন গতির জন্য নিখুঁতভাবে তৈরি আল্ট্রাফ্লাই ৩। ডুয়াল এয়ার জুম ইউনিট এবং জুমএক্স ফোমের অসাধারণ সংমিশ্রণ।',
      ar: 'تم ضبط Alphafly 3 بدقة لسرعة الماراثون الفائقة مع وحدات Air Zoom المزدوجة ورغوة ZoomX.',
    },
    brand: brandMap.get('brand-nike')!,
    categoryId: 'cat-marathon-running',
    categoryPath: '/fashion/mens-footwear/athletic-shoes/marathon-running-shoes',
    categoryBreadcrumbs: [
      { id: 'cat-fashion', slug: 'fashion', name: { en: 'Fashion' }, level: 0, path: '/fashion' },
      {
        id: 'cat-mens-footwear',
        slug: 'mens-footwear',
        name: { en: "Men's Footwear" },
        level: 1,
        path: '/fashion/mens-footwear',
      },
      {
        id: 'cat-athletic-shoes',
        slug: 'athletic-shoes',
        name: { en: 'Athletic Shoes' },
        level: 2,
        path: '/fashion/mens-footwear/athletic-shoes',
      },
      {
        id: 'cat-marathon-running',
        slug: 'marathon-running-shoes',
        name: { en: 'Marathon & Road Running' },
        level: 3,
        path: '/fashion/mens-footwear/athletic-shoes/marathon-running-shoes',
      },
    ],
    categoryIds: ['cat-fashion', 'cat-mens-footwear', 'cat-athletic-shoes', 'cat-marathon-running'],
    media: [
      {
        id: 'med-af3-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/nike-alphafly-3-hero.webp',
        alt: { en: 'Nike Alphafly 3 Prototype' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    attributes: [
      {
        id: 'attr-surface',
        key: 'terrain',
        label: { en: 'Terrain', bn: 'রাস্তা/স্থান', ar: 'نوع السطح' },
        type: 'text',
        value: 'Road Racing / Marathon',
        group: 'performance',
        isFilterable: true,
        isSearchable: true,
        isVisibleOnPdp: true,
      },
    ],
    variants: MOCK_VARIANTS.filter((v) => v.productId === 'prod-nike-alphafly-3'),
    defaultVariantId: 'var-nike-af3-us9',
    ratingSummary: {
      average: 4.92,
      count: 480,
      distribution: { 5: 450, 4: 25, 3: 5, 2: 0, 1: 0 },
    },
    reviewCount: 310,
    badges: [
      {
        id: 'bdg-trending',
        type: 'trending',
        label: { en: 'Trending', bn: 'জনপ্রিয়', ar: 'شائع الآن' },
        tone: 'accent',
      },
    ],
    tags: ['running', 'marathon', 'nike', 'racing-shoes'],
    status: 'active',
    offerSummary: {
      offerCount: 1,
      lowestPrice: { amountMinor: 28500, currency: 'USD' },
      highestPrice: { amountMinor: 28500, currency: 'USD' },
      buyBoxOfferId: 'ofr-nike-af3-flagship',
      hasMultipleOffers: false,
    },
    isDigital: false,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },

  // =========================================================
  // 4. HERMAN MILLER AERON (No variants, Level 2 Category)
  // =========================================================
  {
    id: 'prod-herman-miller-aeron',
    slug: 'herman-miller-aeron-ergonomic-office-chair',
    title: {
      en: 'Herman Miller Aeron Ergonomic Chair - Fully Loaded',
      bn: 'হারম্যান মিলার এরন এরগনোমিক অফিস চেয়ার',
      ar: 'كرسي هيرمان ميلر إيرون المكتبي الطبي',
    },
    description: {
      en: 'The definitive benchmark for ergonomic seating. Designed with Pellicle breathable suspension and PostureFit SL back support.',
      bn: 'আরামদায়ক বসার ক্ষেত্রে বিশ্বমানের মানদণ্ড। পেলিকল ব্রিদেবল উপাদান ও উন্নত ব্যাক সাপোর্ট সহ।',
      ar: 'المعيار الذهبي للجلوس المريح والصحي مع دعم العمود الفقري وتقنية Pellicle.',
    },
    brand: brandMap.get('brand-herman-miller')!,
    categoryId: 'cat-ergonomic-seating',
    categoryPath: '/home-living/office-furniture/ergonomic-seating',
    categoryBreadcrumbs: [
      {
        id: 'cat-home-living',
        slug: 'home-living',
        name: { en: 'Home & Living' },
        level: 0,
        path: '/home-living',
      },
      {
        id: 'cat-office-furniture',
        slug: 'office-furniture',
        name: { en: 'Office Furniture' },
        level: 1,
        path: '/home-living/office-furniture',
      },
      {
        id: 'cat-ergonomic-seating',
        slug: 'ergonomic-seating',
        name: { en: 'Ergonomic Office Chairs' },
        level: 2,
        path: '/home-living/office-furniture/ergonomic-seating',
      },
    ],
    categoryIds: ['cat-home-living', 'cat-office-furniture', 'cat-ergonomic-seating'],
    media: [
      {
        id: 'med-aeron-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/herman-miller-aeron.webp',
        alt: { en: 'Herman Miller Aeron Chair Graphite' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    attributes: [
      {
        id: 'attr-material',
        key: 'material',
        label: { en: 'Material', bn: 'উপাদান', ar: 'المادة' },
        type: 'text',
        value: 'Pellicle 8Z Elastomeric Suspension',
        group: 'material',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
    ],
    variants: [], // Canonical product with NO option variants
    ratingSummary: {
      average: 4.95,
      count: 890,
      distribution: { 5: 850, 4: 35, 3: 5, 2: 0, 1: 0 },
    },
    reviewCount: 620,
    badges: [
      {
        id: 'bdg-recommended',
        type: 'recommended',
        label: { en: 'Highly Recommended', bn: 'উচ্চ প্রশংসিত', ar: 'موصى به بشدة' },
        tone: 'success',
      },
    ],
    tags: ['furniture', 'ergonomic', 'office-chair', 'herman-miller'],
    status: 'active',
    offerSummary: {
      offerCount: 1,
      lowestPrice: { amountMinor: 149500, currency: 'USD' },
      highestPrice: { amountMinor: 149500, currency: 'USD' },
      buyBoxOfferId: 'ofr-hm-aeron-flagship',
      hasMultipleOffers: false,
    },
    isDigital: false,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },

  // =========================================================
  // 5. ANKER 737 POWER BANK (Single Product, Low Stock State)
  // =========================================================
  {
    id: 'prod-anker-737',
    slug: 'anker-737-power-bank-powercore-24k',
    title: {
      en: 'Anker 737 Power Bank (PowerCore 24K, 140W)',
      bn: 'অ্যাঙ্কর ৭৩৭ পাওয়ার ব্যাংক (২৪কে, ১৪০ ওয়াট)',
      ar: 'بنك الطاقة أنكر 737 بقوة 140 واط',
    },
    description: {
      en: 'Ultra-powerful two-way fast charging with smart digital display and 24,000mAh capacity capable of charging high-power laptops.',
      bn: 'স্মার্ট ডিজিটাল ডিসপ্লে এবং ২৪,০০০ এমএএইচ ক্ষমতা সহ উচ্চ ক্ষমতার ফাস্ট চার্জার।',
      ar: 'شحن فائق السرعة ثنائي الاتجاه بقوة 140 واط مع شاشة ذكية وسعة 24,000 مللي أمبير.',
    },
    brand: brandMap.get('brand-anker')!,
    categoryId: 'cat-power-banks',
    categoryPath: '/electronics/mobile-accessories/power-banks',
    categoryBreadcrumbs: [
      {
        id: 'cat-electronics',
        slug: 'electronics',
        name: { en: 'Electronics' },
        level: 0,
        path: '/electronics',
      },
      {
        id: 'cat-mobile-accessories',
        slug: 'mobile-accessories',
        name: { en: 'Mobile Accessories' },
        level: 1,
        path: '/electronics/mobile-accessories',
      },
      {
        id: 'cat-power-banks',
        slug: 'power-banks',
        name: { en: 'Power Banks & Portable Chargers' },
        level: 2,
        path: '/electronics/mobile-accessories/power-banks',
      },
    ],
    categoryIds: ['cat-electronics', 'cat-mobile-accessories', 'cat-power-banks'],
    media: [
      {
        id: 'med-anker-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/anker-737.webp',
        alt: { en: 'Anker 737 Power Bank' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    attributes: [
      {
        id: 'attr-capacity',
        key: 'capacity',
        label: { en: 'Capacity', bn: 'ক্যাপাসিটি', ar: 'السعة' },
        type: 'measurement',
        value: 24000,
        unit: 'mAh',
        group: 'technical',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
      {
        id: 'attr-output',
        key: 'max-output',
        label: { en: 'Max Output', bn: 'সর্বোচ্চ আউটপুট', ar: 'أقصى طاقة' },
        type: 'measurement',
        value: 140,
        unit: 'W',
        group: 'performance',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
    ],
    variants: [],
    ratingSummary: {
      average: 4.82,
      count: 2100,
      distribution: { 5: 1800, 4: 240, 3: 40, 2: 12, 1: 8 },
    },
    reviewCount: 1450,
    badges: [
      {
        id: 'bdg-sale',
        type: 'sale',
        label: { en: 'Flash Sale', bn: 'ফ্ল্যাশ সেল', ar: 'عرض سريع' },
        tone: 'warning',
      },
    ],
    tags: ['anker', 'power-bank', 'charger', 'usb-c'],
    status: 'active',
    offerSummary: {
      offerCount: 1,
      lowestPrice: { amountMinor: 10999, currency: 'USD' },
      highestPrice: { amountMinor: 10999, currency: 'USD' },
      buyBoxOfferId: 'ofr-anker-737-techdirect',
      hasMultipleOffers: false,
    },
    isDigital: false,
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-03-24T00:00:00Z',
  },

  // =========================================================
  // 6. SAMSUNG ODYSSEY NEO G9 (Backorder / Multi-Offer State)
  // =========================================================
  {
    id: 'prod-samsung-odyssey-g9',
    slug: 'samsung-odyssey-neo-g9-57-inch-dual-uhd-monitor',
    title: {
      en: 'Samsung Odyssey Neo G9 57" Dual 4K Curved Gaming Monitor',
      bn: 'স্যামসাং ওডিসি নিও জি৯ ৫৭" ডুয়াল ৪কে কার্ভড গেমিং মনিটর',
      ar: 'شاشة سامسونج أوديسي نيو G9 المنحنية للألعاب مقاس 57 بوصة',
    },
    description: {
      en: 'The world first Dual UHD gaming monitor with 1000R curvature, Quantum Mini-LED technology, and blistering 240Hz refresh rate.',
      bn: 'বিশ্বের প্রথম ডুয়াল ইউএইচডি গেমিং মনিটর যাতে রয়েছে ১০০০আর কার্ভেচার এবং কোয়ান্টাম মিনি-এলইডি প্রযুক্তি।',
      ar: 'أول شاشة ألعاب بدقة Dual UHD في العالم مع تقنية Quantum Mini-LED ومعدل تحديث 240 هرتز.',
    },
    brand: brandMap.get('brand-samsung')!,
    categoryId: 'cat-curved-gaming-monitors',
    categoryPath: '/electronics/monitors-displays/curved-gaming-monitors',
    categoryBreadcrumbs: [
      {
        id: 'cat-electronics',
        slug: 'electronics',
        name: { en: 'Electronics' },
        level: 0,
        path: '/electronics',
      },
      {
        id: 'cat-monitors-displays',
        slug: 'monitors-displays',
        name: { en: 'Monitors & Displays' },
        level: 1,
        path: '/electronics/monitors-displays',
      },
      {
        id: 'cat-curved-gaming-monitors',
        slug: 'curved-gaming-monitors',
        name: { en: 'Curved Gaming Monitors' },
        level: 2,
        path: '/electronics/monitors-displays/curved-gaming-monitors',
      },
    ],
    categoryIds: ['cat-electronics', 'cat-monitors-displays', 'cat-curved-gaming-monitors'],
    media: [
      {
        id: 'med-g9-hero',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/samsung-neo-g9.webp',
        alt: { en: 'Samsung Odyssey Neo G9 57 inch Front' },
        width: 1600,
        height: 1000,
        order: 0,
      },
    ],
    attributes: [
      {
        id: 'attr-screensize',
        key: 'screen-size',
        label: { en: 'Screen Size', bn: 'স্ক্রিন সাইজ', ar: 'حجم الشاشة' },
        type: 'measurement',
        value: 57,
        unit: 'inches',
        group: 'technical',
        isFilterable: true,
        isSearchable: false,
        isVisibleOnPdp: true,
      },
      {
        id: 'attr-refresh',
        key: 'refresh-rate',
        label: { en: 'Refresh Rate', bn: 'রিফ্রেশ রেট', ar: 'معدل التحديث' },
        type: 'measurement',
        value: 240,
        unit: 'Hz',
        group: 'performance',
        isFilterable: true,
        isSearchable: true,
        isVisibleOnPdp: true,
      },
    ],
    variants: [],
    ratingSummary: {
      average: 4.65,
      count: 340,
      distribution: { 5: 250, 4: 65, 3: 15, 2: 7, 1: 3 },
    },
    reviewCount: 210,
    badges: [
      {
        id: 'bdg-limited',
        type: 'limited_edition',
        label: { en: 'Limited Stock', bn: 'সীমিত স্টক', ar: 'كمية محدودة' },
        tone: 'destructive',
      },
    ],
    tags: ['monitor', 'gaming', 'samsung', 'curved', '4k'],
    status: 'active',
    offerSummary: {
      offerCount: 2,
      lowestPrice: { amountMinor: 179999, currency: 'USD' },
      highestPrice: { amountMinor: 199999, currency: 'USD' },
      buyBoxOfferId: 'ofr-samsung-g9-globalware',
      hasMultipleOffers: true,
    },
    isDigital: false,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-25T00:00:00Z',
  },
];
