export type VerificationMethod = 'email' | 'phone' | 'id_document';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface VerificationRequest {
  id: string;
  user_id: string;
  verification_method: VerificationMethod;
  verification_data?: any;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  verified: boolean;
  subscription_tier: string;
  ads_disabled: boolean;
  // ... other profile fields
}