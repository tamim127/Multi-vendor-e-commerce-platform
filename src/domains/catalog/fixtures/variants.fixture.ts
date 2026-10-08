/**
 * ==============================================================================
 * CATALOG DOMAIN — VARIANTS FIXTURES
 * ==============================================================================
 * Deterministic mock variants for multi-option products.
 * NOTE: Non-authoritative development/demo seed data only.
 * msrpReference is for reference comparison only; authoritative pricing is in SellerOffer.
 */

import type { ProductVariant } from '../types/variant';

export const MOCK_VARIANTS: ProductVariant[] = [
  // ===================================================
  // MACBOOK PRO 16" VARIANTS (Color x Storage)
  // ===================================================
  {
    id: 'var-mbp-16-blk-512',
    productId: 'prod-macbook-pro-16',
    sku: 'APL-MBP16-M3M-SB-512',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'space-black',
        displayValue: { en: 'Space Black', bn: 'স্পেস ব্ল্যাক', ar: 'الأسود الفلكي' },
        swatch: '#1c1b20',
      },
      {
        attributeKey: 'storage',
        attributeLabel: { en: 'Storage', bn: 'স্টোরেজ', ar: 'سعة التخزين' },
        value: '512gb',
        displayValue: { en: '512 GB SSD', bn: '৫১২ জিবি এসএসডি', ar: '512 جيجابايت' },
      },
    ],
    media: [
      {
        id: 'med-mbp-sb-1',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/mbp16-spaceblack-hero.webp',
        alt: { en: 'MacBook Pro 16 inch Space Black Front View' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 249900, currency: 'USD' }, // $2,499.00
    barcode: '195949012345',
    weight: { value: 2.14, unit: 'kg' },
    dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: 'cm' },
    isDefault: true,
    isActive: true,
  },
  {
    id: 'var-mbp-16-blk-1tb',
    productId: 'prod-macbook-pro-16',
    sku: 'APL-MBP16-M3M-SB-1TB',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'space-black',
        displayValue: { en: 'Space Black', bn: 'স্পেস ব্ল্যাক', ar: 'الأسود الفلكي' },
        swatch: '#1c1b20',
      },
      {
        attributeKey: 'storage',
        attributeLabel: { en: 'Storage', bn: 'স্টোরেজ', ar: 'سعة التخزين' },
        value: '1tb',
        displayValue: { en: '1 TB SSD', bn: '১ টিবি এসএসডি', ar: '1 تيرابايت' },
      },
    ],
    media: [
      {
        id: 'med-mbp-sb-2',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/mbp16-spaceblack-hero.webp',
        alt: { en: 'MacBook Pro 16 inch Space Black 1TB' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 289900, currency: 'USD' }, // $2,899.00
    barcode: '195949012352',
    weight: { value: 2.14, unit: 'kg' },
    dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: 'cm' },
    isDefault: false,
    isActive: true,
  },
  {
    id: 'var-mbp-16-slv-512',
    productId: 'prod-macbook-pro-16',
    sku: 'APL-MBP16-M3M-SL-512',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'silver',
        displayValue: { en: 'Silver', bn: 'সিলভার', ar: 'فضي' },
        swatch: '#e3e4e6',
      },
      {
        attributeKey: 'storage',
        attributeLabel: { en: 'Storage', bn: 'স্টোরেজ', ar: 'سعة التخزين' },
        value: '512gb',
        displayValue: { en: '512 GB SSD', bn: '৫১২ জিবি এসএসডি', ar: '512 جيجابايت' },
      },
    ],
    media: [
      {
        id: 'med-mbp-slv-1',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/mbp16-silver-hero.webp',
        alt: { en: 'MacBook Pro 16 inch Silver Front View' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 249900, currency: 'USD' }, // $2,499.00
    barcode: '195949012369',
    weight: { value: 2.14, unit: 'kg' },
    dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: 'cm' },
    isDefault: false,
    isActive: true,
  },
  {
    id: 'var-mbp-16-slv-1tb',
    productId: 'prod-macbook-pro-16',
    sku: 'APL-MBP16-M3M-SL-1TB',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'silver',
        displayValue: { en: 'Silver', bn: 'সিলভার', ar: 'فضي' },
        swatch: '#e3e4e6',
      },
      {
        attributeKey: 'storage',
        attributeLabel: { en: 'Storage', bn: 'স্টোরেজ', ar: 'سعة التخزين' },
        value: '1tb',
        displayValue: { en: '1 TB SSD', bn: '১ টিবি এসএসডি', ar: '1 تيرابايت' },
      },
    ],
    media: [
      {
        id: 'med-mbp-slv-2',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/mbp16-silver-hero.webp',
        alt: { en: 'MacBook Pro 16 inch Silver 1TB' },
        width: 1200,
        height: 1200,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 289900, currency: 'USD' }, // $2,899.00
    barcode: '195949012376',
    weight: { value: 2.14, unit: 'kg' },
    dimensions: { length: 35.57, width: 24.81, height: 1.68, unit: 'cm' },
    isDefault: false,
    isActive: true,
  },

  // ===================================================
  // SONY WH-1000XM5 VARIANTS (Color)
  // ===================================================
  {
    id: 'var-sony-xm5-blk',
    productId: 'prod-sony-wh1000xm5',
    sku: 'SNY-WH1000XM5-BLK',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'black',
        displayValue: { en: 'Midnight Black', bn: 'মিডনাইট ব্ল্যাক', ar: 'أسود ليلي' },
        swatch: '#111111',
      },
    ],
    media: [
      {
        id: 'med-xm5-blk-1',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/sony-xm5-black.webp',
        alt: { en: 'Sony WH-1000XM5 Headphones in Black' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 39999, currency: 'USD' }, // $399.99
    barcode: '027242923456',
    weight: { value: 250, unit: 'g' },
    isDefault: true,
    isActive: true,
  },
  {
    id: 'var-sony-xm5-slv',
    productId: 'prod-sony-wh1000xm5',
    sku: 'SNY-WH1000XM5-SLV',
    options: [
      {
        attributeKey: 'color',
        attributeLabel: { en: 'Color', bn: 'রং', ar: 'اللون' },
        value: 'silver',
        displayValue: { en: 'Platinum Silver', bn: 'প্লাটিনাম সিলভার', ar: 'فضي بلاتيني' },
        swatch: '#dedbd2',
      },
    ],
    media: [
      {
        id: 'med-xm5-slv-1',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/sony-xm5-silver.webp',
        alt: { en: 'Sony WH-1000XM5 Headphones in Platinum Silver' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 39999, currency: 'USD' }, // $399.99
    barcode: '027242923463',
    weight: { value: 250, unit: 'g' },
    isDefault: false,
    isActive: true,
  },

  // ===================================================
  // NIKE ALPHAFLY 3 VARIANTS (Size)
  // ===================================================
  {
    id: 'var-nike-af3-us9',
    productId: 'prod-nike-alphafly-3',
    sku: 'NKE-AF3-WHT-090',
    options: [
      {
        attributeKey: 'size',
        attributeLabel: { en: 'Shoe Size', bn: 'সাইজ', ar: 'المقاس' },
        value: 'us-9',
        displayValue: { en: 'US 9 / EU 42.5', bn: 'ইউএস ৯', ar: 'مقاس 9' },
      },
    ],
    media: [
      {
        id: 'med-af3-1',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/nike-alphafly-3-hero.webp',
        alt: { en: 'Nike Air Zoom Alphafly 3 Prototype' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 28500, currency: 'USD' }, // $285.00
    barcode: '196974512345',
    weight: { value: 218, unit: 'g' },
    isDefault: true,
    isActive: true,
  },
  {
    id: 'var-nike-af3-us10',
    productId: 'prod-nike-alphafly-3',
    sku: 'NKE-AF3-WHT-100',
    options: [
      {
        attributeKey: 'size',
        attributeLabel: { en: 'Shoe Size', bn: 'সাইজ', ar: 'المقاس' },
        value: 'us-10',
        displayValue: { en: 'US 10 / EU 44', bn: 'ইউএস ১০', ar: 'مقاس 10' },
      },
    ],
    media: [
      {
        id: 'med-af3-2',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/nike-alphafly-3-hero.webp',
        alt: { en: 'Nike Air Zoom Alphafly 3 Prototype US 10' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 28500, currency: 'USD' }, // $285.00
    barcode: '196974512352',
    weight: { value: 225, unit: 'g' },
    isDefault: false,
    isActive: true,
  },
  {
    id: 'var-nike-af3-us11',
    productId: 'prod-nike-alphafly-3',
    sku: 'NKE-AF3-WHT-110',
    options: [
      {
        attributeKey: 'size',
        attributeLabel: { en: 'Shoe Size', bn: 'সাইজ', ar: 'المقاس' },
        value: 'us-11',
        displayValue: { en: 'US 11 / EU 45', bn: 'ইউএস ১১', ar: 'مقاس 11' },
      },
    ],
    media: [
      {
        id: 'med-af3-3',
        type: 'image',
        role: 'primary',
        url: '/assets/mock/products/nike-alphafly-3-hero.webp',
        alt: { en: 'Nike Air Zoom Alphafly 3 Prototype US 11' },
        width: 1000,
        height: 1000,
        order: 0,
      },
    ],
    msrpReference: { amountMinor: 28500, currency: 'USD' }, // $285.00
    barcode: '196974512369',
    weight: { value: 235, unit: 'g' },
    isDefault: false,
    isActive: true,
  },
];
