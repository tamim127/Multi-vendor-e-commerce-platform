/**
 * ==============================================================================
 * PRODUCT DETAIL PAGE — DEMO FEEDBACK FIXTURES
 * ==============================================================================
 * Deterministic demonstration reviews and customer questions & answers.
 * NOTE: Non-authoritative demonstration fixtures. Real reviews and Q&A are
 * provided by production moderation and review services in future phases.
 */

import type { DemoQaItem, DemoReview } from '../types';

export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: 'rev-mbp-1',
    productId: 'prod-macbook-pro-16',
    authorName: 'Alex Mercer',
    rating: 5,
    title: 'Unbelievable performance for machine learning & 8K editing',
    comment:
      'The M3 Max handles massive Xcode compilation suites and local LLM inference without even spinning up the fans loudly. Liquid Retina XDR display is astonishingly sharp.',
    createdAt: '2026-08-14T10:30:00Z',
    isVerifiedBuyer: true,
    helpfulCount: 38,
  },
  {
    id: 'rev-mbp-2',
    productId: 'prod-macbook-pro-16',
    authorName: 'Dr. Elena Rostova',
    rating: 5,
    title: 'Worth every dollar for scientific computing',
    comment:
      'Battery longevity during intensive tasks is beyond anything on x86 architectures. Thermal engineering is top-tier.',
    createdAt: '2026-09-02T14:15:00Z',
    isVerifiedBuyer: true,
    helpfulCount: 19,
  },
  {
    id: 'rev-mbp-3',
    productId: 'prod-macbook-pro-16',
    authorName: 'Marcus Vance',
    rating: 4,
    title: 'Sensational machine, but quite heavy',
    comment:
      'The chassis is substantial at 4.8 lbs. If portability is your number one priority, check the 14-inch. Otherwise, this is peak computing.',
    createdAt: '2026-09-20T09:00:00Z',
    isVerifiedBuyer: true,
    helpfulCount: 7,
  },
  {
    id: 'rev-sony-1',
    productId: 'prod-sony-wh1000xm5',
    authorName: 'Sarah Jenkins',
    rating: 5,
    title: 'Best-in-class Active Noise Cancellation',
    comment:
      'Commuting on the subway is dead quiet. Microphone clarity on Zoom calls has improved drastically compared to the XM4.',
    createdAt: '2026-07-11T12:00:00Z',
    isVerifiedBuyer: true,
    helpfulCount: 42,
  },
  {
    id: 'rev-samsung-1',
    productId: 'prod-samsung-galaxy-s24-ultra',
    authorName: 'Kenji Takahashi',
    rating: 5,
    title: 'Flat display and titanium frame are perfection',
    comment:
      'The anti-reflective glass coating makes outdoor sunlight visibility unmatched. S-Pen latency is imperceptible.',
    createdAt: '2026-08-28T16:20:00Z',
    isVerifiedBuyer: true,
    helpfulCount: 27,
  },
];

export const DEMO_QA: DemoQaItem[] = [
  {
    id: 'qa-mbp-1',
    productId: 'prod-macbook-pro-16',
    question: 'Does this model support 3 external 6K displays concurrently?',
    askedBy: 'DevOpsLead',
    askedAt: '2026-08-10T11:00:00Z',
    answer:
      'Yes. The Apple M3 Max silicon supports up to four external displays (three 6K @ 60Hz and one 4K @ 144Hz via HDMI).',
    answeredBy: 'Apple Authorized Specialist',
    isMerchantAnswer: true,
    answeredAt: '2026-08-10T15:30:00Z',
    helpfulCount: 16,
  },
  {
    id: 'qa-mbp-2',
    productId: 'prod-macbook-pro-16',
    question: 'Is the power adapter included with MagSafe 3 cable?',
    askedBy: 'Clara Oswald',
    askedAt: '2026-08-18T08:20:00Z',
    answer:
      'Yes, the 140W USB-C Power Adapter and a color-matched 2-meter USB-C to MagSafe 3 Cable are included in the box.',
    answeredBy: 'Marketplace Logistics Support',
    isMerchantAnswer: true,
    answeredAt: '2026-08-18T09:45:00Z',
    helpfulCount: 9,
  },
  {
    id: 'qa-sony-1',
    productId: 'prod-sony-wh1000xm5',
    question: 'Can I connect two devices at the same time via Bluetooth multipoint?',
    askedBy: 'Audiophile_99',
    askedAt: '2026-07-15T14:00:00Z',
    answer:
      'Yes, multipoint connection is supported for seamless switching between phone and laptop.',
    answeredBy: 'Audio Tech Official',
    isMerchantAnswer: true,
    answeredAt: '2026-07-15T16:10:00Z',
    helpfulCount: 22,
  },
];
