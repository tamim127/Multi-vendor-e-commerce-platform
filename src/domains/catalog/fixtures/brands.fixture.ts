/**
 * ==============================================================================
 * CATALOG DOMAIN — BRANDS FIXTURES
 * ==============================================================================
 * Deterministic mock brands for development and testing.
 * NOTE: Non-authoritative development/demo seed data only.
 */

import type { Brand } from '../types/brand';

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'brand-apple',
    slug: 'apple',
    name: 'Apple',
    description: {
      en: 'Pioneering technology products and operating systems.',
      bn: 'যুগান্তকারী প্রযুক্তি পণ্য এবং অপারেটিং সিস্টেম।',
      ar: 'منتجات التكنولوجيا الرائدة وأنظمة التشغيل.',
    },
    websiteUrl: 'https://www.apple.com',
    status: 'featured',
    isFeatured: true,
    productCount: 142,
  },
  {
    id: 'brand-sony',
    slug: 'sony',
    name: 'Sony',
    description: {
      en: 'World-class audio, imaging, and entertainment systems.',
      bn: 'বিশ্বমানের অডিও, ইমেজিং এবং বিনোদন প্রযুক্তি।',
      ar: 'أنظمة صوتية وتصوير وترفيه عالمية المستوى.',
    },
    websiteUrl: 'https://www.sony.com',
    status: 'featured',
    isFeatured: true,
    productCount: 98,
  },
  {
    id: 'brand-nike',
    slug: 'nike',
    name: 'Nike',
    description: {
      en: 'Performance athletic footwear, apparel, and equipment.',
      bn: 'উচ্চমানের অ্যাথলেটিক পাদুকা, পোশাক এবং সরঞ্জাম।',
      ar: 'أحذية وملابس ومعدات رياضية عالية الأداء.',
    },
    websiteUrl: 'https://www.nike.com',
    status: 'featured',
    isFeatured: true,
    productCount: 310,
  },
  {
    id: 'brand-herman-miller',
    slug: 'herman-miller',
    name: 'Herman Miller',
    description: {
      en: 'Ergonomic office seating and architectural modern furniture.',
      bn: 'আরামদায়ক অফিস চেয়ার এবং আধুনিক স্থাপত্য আসবাব।',
      ar: 'كراسي مكتبية مريحة وأثاث عصري متميز.',
    },
    websiteUrl: 'https://www.hermanmiller.com',
    status: 'active',
    isFeatured: true,
    productCount: 45,
  },
  {
    id: 'brand-samsung',
    slug: 'samsung',
    name: 'Samsung',
    description: {
      en: 'Innovative consumer electronics, displays, and smartphones.',
      bn: 'উদ্ভাবনী ভোক্তা ইলেকট্রনিক্স, ডিসপ্লে এবং স্মার্টফোন।',
      ar: 'إلكترونيات استهلاكية مبتكرة وشاشات وهواتف ذكية.',
    },
    websiteUrl: 'https://www.samsung.com',
    status: 'featured',
    isFeatured: true,
    productCount: 220,
  },
  {
    id: 'brand-anker',
    slug: 'anker',
    name: 'Anker',
    description: {
      en: 'Global leader in mobile charging and portable power stations.',
      bn: 'মোবাইল চার্জিং এবং পোর্টেবল পাওয়ারের শীর্ষস্থানীয় প্রযুক্তি।',
      ar: 'الرائد العالمي في الشحن المتنقل ومحطات الطاقة المحمولة.',
    },
    websiteUrl: 'https://www.anker.com',
    status: 'active',
    isFeatured: false,
    productCount: 84,
  },
  {
    id: 'brand-bose',
    slug: 'bose',
    name: 'Bose',
    description: {
      en: 'Premium acoustic systems and active noise cancellation technologies.',
      bn: 'প্রিমিয়াম অ্যাকোস্টিক সিস্টেম এবং অ্যাক্টিভ নয়েজ ক্যান্সেলেশন প্রযুক্তি।',
      ar: 'أنظمة صوتية متميزة وتقنيات عزل الضوضاء.',
    },
    websiteUrl: 'https://www.bose.com',
    status: 'active',
    isFeatured: false,
    productCount: 52,
  },
  {
    id: 'brand-logitech',
    slug: 'logitech',
    name: 'Logitech',
    description: {
      en: 'Productivity accessories and professional esports peripherals.',
      bn: 'প্রোডাক্টিভিটি অ্যাক্সেসরিজ এবং পেশাদার এস্পোর্টস পেরিফেরাল।',
      ar: 'ملحقات الإنتاجية والألعاب الاحترافية.',
    },
    websiteUrl: 'https://www.logitech.com',
    status: 'active',
    isFeatured: false,
    productCount: 115,
  },
];
