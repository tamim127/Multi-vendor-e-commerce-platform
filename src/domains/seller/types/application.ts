/**
 * ==============================================================================
 * SELLER DOMAIN — SELLER ONBOARDING & APPLICATION TYPES
 * ==============================================================================
 */

import type { SellerBusinessInfo } from './seller';

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface SellerApplicationInput {
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  businessCategory: string;
  businessInfo: SellerBusinessInfo;
  agreedToTerms: boolean;
  agreedToFeeStructure: boolean;
}

export interface SellerApplicationRecord extends SellerApplicationInput {
  applicationId: string;
  submittedAt: string;
  status: ApplicationStatus;
  reviewerNotes?: string;
  decidedAt?: string;
  isDemoSubmission: boolean;
}
