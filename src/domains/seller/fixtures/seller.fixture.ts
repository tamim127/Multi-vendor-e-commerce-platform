/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER PROFILE FIXTURES
 * ==============================================================================
 * Deterministic demo seller accounts for evaluating multi-vendor capabilities.
 */

import type { SellerProfile } from '../types/seller';
import type { SellerApplicationRecord } from '../types/application';

export const DEMO_SELLER_PROFILE: SellerProfile = {
  id: 'seller-tech-direct',
  slug: 'tech-direct-express',
  name: 'TechDirect Express',
  email: 'operations@techdirect-express.demo',
  status: 'approved',
  tier: 'enterprise',
  logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150',
  bannerUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
  tagline: 'Leading distributor of certified high-performance consumer technology.',
  description:
    'TechDirect Express is an authorized enterprise hardware distributor providing enterprise-grade laptops, audio equipment, and computing accessories with rapid same-day fulfillment.',
  rating: {
    average: 4.8,
    count: 8900,
    positiveFeedbackPercent: 97.8,
  },
  badges: ['top_rated', 'fast_shipper', 'authorized_dealer'],
  isVerified: true,
  businessInfo: {
    legalBusinessName: 'TechDirect Commercial LLC',
    registrationNumber: 'TX-89234190',
    taxIdentificationNumber: 'US-74-9823419',
    businessType: 'llc',
    countryOfRegistration: 'US',
    businessAddress: {
      street: '4200 Logistics Parkway',
      street2: 'Dock 14',
      city: 'Austin',
      state: 'TX',
      postalCode: '78744',
      country: 'US',
    },
    contactPerson: {
      name: 'Marcus Vance',
      email: 'm.vance@techdirect-express.demo',
      phone: '+1 512-555-0142',
      role: 'Director of Merchant Operations',
    },
  },
  fulfillmentSettings: {
    defaultFulfillmentType: 'marketplace_fulfilled',
    standardHandlingDays: 1,
    shipsInternationally: true,
    freeShippingThresholdMinor: 9900, // $99.00
    returnWindowDays: 30,
    restockingFeePercent: 0,
  },
  joinedAt: '2024-03-15T08:00:00Z',
  updatedAt: '2026-02-10T12:00:00Z',
};

export const DEMO_PENDING_APPLICATION: SellerApplicationRecord = {
  applicationId: 'app-demo-99214',
  storeName: 'Nordic Audio Labs',
  storeSlug: 'nordic-audio-labs',
  storeDescription: 'Boutique Scandinavian audio engineering and acoustic headphones.',
  businessCategory: 'Consumer Electronics & Audio',
  businessInfo: {
    legalBusinessName: 'Nordic Sound Systems AB',
    registrationNumber: 'SE-556912-3456',
    taxIdentificationNumber: 'SE556912345601',
    businessType: 'corporation',
    countryOfRegistration: 'SE',
    businessAddress: {
      street: 'Hamngatan 12',
      city: 'Stockholm',
      state: 'Stockholm',
      postalCode: '11147',
      country: 'SE',
    },
    contactPerson: {
      name: 'Astrid Lind',
      email: 'astrid@nordicaudio.demo',
      phone: '+46 8 123 4567',
      role: 'Managing Partner',
    },
  },
  agreedToTerms: true,
  agreedToFeeStructure: true,
  submittedAt: '2026-02-18T14:30:00Z',
  status: 'under_review',
  isDemoSubmission: true,
};
