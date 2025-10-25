// Premium Features Type Definitions
// Updated: 2025-06-14
// Description: TypeScript interfaces for premium features and subscriptions

import { SubscriptionTier } from './subscription';

// =============================================
// BOOST FEATURE TYPES
// =============================================
export interface BoostFeature {
  type: 'profile' | 'super_boost';
  duration_minutes: number;
  price?: number;
  description: string;
  available_tiers: SubscriptionTier[];
}

export interface ActiveBoost {
  id: string;
  boost_type: 'profile' | 'super_boost';
  ends_at: string;
  remaining_minutes: number;
  is_active: boolean;
}

export interface BoostUsage {
  daily_used: number;
  daily_limit: number;
  can_use: boolean;
  next_reset: string;
}

// =============================================
// REWIND FEATURE TYPES
// =============================================
export interface RewindFeature {
  available: boolean;
  daily_limit: number;
  cost?: number;
  description: string;
}

export interface RewindUsage {
  daily_used: number;
  daily_limit: number;
  can_use: boolean;
  last_rewind?: string;
}

export interface RewindResult {
  success: boolean;
  rewind_id?: string;
  original_action?: 'like' | 'dislike';
  error?: string;
}

// =============================================
// PASSPORT FEATURE TYPES
// =============================================
export interface PassportFeature {
  available: boolean;
  can_change_location: boolean;
  max_changes_per_month?: number;
  description: string;
}

export interface LocationChangeRequest {
  latitude: number;
  longitude: number;
  city_name?: string;
  country_code?: string;
  duration_days?: number;
}

export interface ActiveLocationChange {
  id: string;
  new_latitude: number;
  new_longitude: number;
  city_name: string | null;
  country_code: string | null;
  started_at: string;
  ends_at: string | null;
  is_active: boolean;
}

// =============================================
// SEE WHO LIKES YOU FEATURE
// =============================================
export interface SeeWhoLikesYouFeature {
  available: boolean;
  total_likes: number;
  new_likes: number;
  can_see_profiles: boolean;
  description: string;
}

export interface LikeProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio?: string;
  liked_at: string;
  is_super_like: boolean;
}

// =============================================
// ADVANCED FILTERS
// =============================================
export interface AdvancedFilters {
  available: boolean;
  filters: {
    education?: string[];
    profession?: string[];
    religion?: string[];
    height_range?: [number, number];
    body_type?: string[];
    smoking?: string[];
    drinking?: string[];
    children?: string[];
    relationship_goals?: string[];
  };
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
  is_default: boolean;
}

// =============================================
// VIDEO PROFILE FEATURE
// =============================================
export interface VideoProfileFeature {
  available: boolean;
  max_duration_seconds: number;
  max_file_size_mb: number;
  allowed_formats: string[];
  moderation_required: boolean;
}

export interface VideoProfile {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  file_size_mb: number;
  status: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  created_at: string;
}

// =============================================
// READ RECEIPTS FEATURE
// =============================================
export interface ReadReceiptsFeature {
  available: boolean;
  enabled_by_user: boolean;
  description: string;
}

export interface MessageReadStatus {
  message_id: string;
  read_at: string | null;
  delivered_at: string | null;
  is_read: boolean;
}

// =============================================
// PREMIUM STATS AND ANALYTICS
// =============================================
export interface PremiumStats {
  profile_views_today: number;
  profile_views_week: number;
  profile_views_month: number;
  likes_received_today: number;
  likes_received_week: number;
  likes_received_month: number;
  super_likes_received_today: number;
  super_likes_received_week: number;
  matches_today: number;
  matches_week: number;
  matches_month: number;
  boost_effectiveness?: {
    views_during_boost: number;
    likes_during_boost: number;
    matches_during_boost: number;
  };
}

export interface FeatureUsageStats {
  feature_name: string;
  usage_count: number;
  last_used: string | null;
  daily_limit: number;
  monthly_limit?: number;
  subscription_tier: SubscriptionTier;
}

// =============================================
// PREMIUM SUBSCRIPTION DETAILS
// =============================================
export interface PremiumSubscriptionDetails {
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  expires_at: string | null;
  auto_renew: boolean;
  payment_method?: string;
  next_billing_date?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
}

export interface SubscriptionBenefits {
  unlimited_likes: boolean;
  unlimited_rewinds: boolean;
  boost_count: number;
  super_likes_count: number;
  see_who_likes_you: boolean;
  advanced_filters: boolean;
  passport: boolean;
  read_receipts: boolean;
  video_profile: boolean;
  priority_support: boolean;
  no_ads: boolean;
  incognito_mode: boolean;
}

// =============================================
// FEATURE GATE TYPES
// =============================================
export interface FeatureGate {
  feature_key: string;
  is_available: boolean;
  required_tier: SubscriptionTier;
  usage_count?: number;
  usage_limit?: number;
  reset_period?: 'daily' | 'weekly' | 'monthly';
  next_reset?: string;
  trial_available?: boolean;
  trial_count?: number;
  trial_limit?: number;
}

export interface FeatureAccess {
  can_access: boolean;
  reason?: 'tier_required' | 'limit_reached' | 'trial_expired' | 'subscription_expired';
  required_tier?: SubscriptionTier;
  upgrade_url?: string;
  trial_available?: boolean;
  remaining_uses?: number;
}

// =============================================
// PREMIUM FEATURE CONFIGURATION
// =============================================
export interface PremiumFeatureConfig {
  boosts: BoostFeature[];
  rewind: RewindFeature;
  passport: PassportFeature;
  see_who_likes_you: SeeWhoLikesYouFeature;
  advanced_filters: AdvancedFilters;
  video_profile: VideoProfileFeature;
  read_receipts: ReadReceiptsFeature;
  daily_limits: Record<SubscriptionTier, {
    likes: number;
    super_likes: number;
    boosts: number;
    rewinds: number;
  }>;
}

// =============================================
// UTILITY TYPES
// =============================================
export type PremiumFeatureName = 
  | 'boost'
  | 'rewind' 
  | 'passport'
  | 'see_who_likes_you'
  | 'advanced_filters'
  | 'video_profile'
  | 'read_receipts'
  | 'unlimited_likes'
  | 'super_likes'
  | 'incognito_mode'
  | 'priority_support';

export interface PremiumFeatureStatus {
  [key: string]: {
    available: boolean;
    used_today: number;
    limit_today: number;
    last_used?: string;
    next_reset?: string;
  };
}

export interface UpgradePrompt {
  feature: PremiumFeatureName;
  required_tier: SubscriptionTier;
  title: string;
  description: string;
  benefits: string[];
  price: number;
  currency: string;
  cta_text: string;
  upgrade_url: string;
}

// All types are exported above individually