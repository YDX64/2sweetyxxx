// Database Types for Premium Features
// Updated: 2025-06-14
// Description: TypeScript interfaces for all premium feature tables

import { Tables, TablesUpdate, TablesInsert } from '@/integrations/supabase/types';

// =============================================
// PROFILE BOOSTS
// =============================================
export type ProfileBoost = Tables<'profile_boosts'>;
export type ProfileBoostUpdate = TablesUpdate<'profile_boosts'>;
export type ProfileBoostInsert = TablesInsert<'profile_boosts'>;

export type BoostType = 'profile' | 'super_boost';

export interface ProfileBoostInterface {
  id: string;
  user_id: string;
  boost_type: BoostType;
  duration_minutes: number;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// =============================================
// VIDEO PROFILES
// =============================================
export type VideoProfile = Tables<'video_profiles'>;
export type VideoProfileUpdate = TablesUpdate<'video_profiles'>;
export type VideoProfileInsert = TablesInsert<'video_profiles'>;

export type VideoStatus = 'pending' | 'approved' | 'rejected';

export interface VideoProfileInterface {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  file_size_mb: number;
  status: VideoStatus;
  moderation_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// =============================================
// USER ACTIVITIES
// =============================================
export type UserActivity = Tables<'user_activities'>;
export type UserActivityUpdate = TablesUpdate<'user_activities'>;
export type UserActivityInsert = TablesInsert<'user_activities'>;

export interface UserActivityInterface {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any> | null;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'swipe'
  | 'match'
  | 'message'
  | 'boost_activated'
  | 'rewind_performed'
  | 'daily_reset'
  | 'subscription_change'
  | 'profile_update'
  | 'photo_upload'
  | 'video_upload'
  | 'location_change';

// =============================================
// FEATURE USAGE LOGS
// =============================================
export type FeatureUsageLog = Tables<'feature_usage_logs'>;
export type FeatureUsageLogUpdate = TablesUpdate<'feature_usage_logs'>;
export type FeatureUsageLogInsert = TablesInsert<'feature_usage_logs'>;

export interface FeatureUsageLogInterface {
  id: string;
  user_id: string;
  feature_name: string;
  usage_count: number;
  usage_date: string;
  subscription_tier: string | null;
  created_at: string | null;
}

export type FeatureName =
  | 'boost'
  | 'super_like'
  | 'rewind'
  | 'passport'
  | 'see_who_likes_you'
  | 'advanced_filters'
  | 'read_receipts'
  | 'video_call'
  | 'voice_call'
  | 'translation'
  | 'invisible_browsing'
  | 'video_profile'
  | 'unlimited_likes';

// =============================================
// REWIND ACTIONS
// =============================================
export type RewindAction = Tables<'rewind_actions'>;
export type RewindActionUpdate = TablesUpdate<'rewind_actions'>;
export type RewindActionInsert = TablesInsert<'rewind_actions'>;

export type SwipeActionType = 'like' | 'dislike';

export interface RewindActionInterface {
  id: string;
  user_id: string;
  target_user_id: string;
  action_type: SwipeActionType;
  original_action_timestamp: string;
  rewind_timestamp: string;
  is_used: boolean;
}

// =============================================
// PROFILE VIEWS
// =============================================
export type ProfileView = Tables<'profile_views'>;
export type ProfileViewUpdate = TablesUpdate<'profile_views'>;
export type ProfileViewInsert = TablesInsert<'profile_views'>;

export interface ProfileViewInterface {
  id: string;
  viewer_id: string;
  viewed_id: string;
  viewed_at: string;
  is_premium_view: boolean;
  view_date: string;
}

// =============================================
// LOCATION CHANGES (Passport Feature)
// =============================================
export type LocationChange = Tables<'location_changes'>;
export type LocationChangeUpdate = TablesUpdate<'location_changes'>;
export type LocationChangeInsert = TablesInsert<'location_changes'>;

export interface LocationChangeInterface {
  id: string;
  user_id: string;
  original_latitude: number | null;
  original_longitude: number | null;
  new_latitude: number;
  new_longitude: number;
  city_name: string | null;
  country_code: string | null;
  is_active: boolean;
  started_at: string;
  ends_at: string | null;
  created_at: string | null;
}

// =============================================
// DATABASE FUNCTIONS RESPONSE TYPES
// =============================================
export interface ActivateBoostResponse {
  success: boolean;
  boost_id?: string;
  ends_at?: string;
  duration_minutes?: number;
  error?: string;
  daily_boosts?: number;
  max_daily_boosts?: number;
}

export interface PerformRewindResponse {
  success: boolean;
  rewind_id?: string;
  original_action?: SwipeActionType;
  rewound_at?: string;
  error?: string;
  daily_rewinds?: number;
  max_daily_rewinds?: number;
  target_user_id?: string;
  notifications_deleted?: number;
  match_deleted?: boolean;
}

export interface UserPremiumStats {
  user_id: string;
  active_boost: {
    id: string;
    boost_type: BoostType;
    ends_at: string;
    remaining_minutes: number;
  } | null;
  usage_today: {
    swipes: number;
    super_likes: number;
    boosts: number;
    rewinds: number;
  };
  profile_views_30d: number;
  monthly_feature_usage: Record<string, number>;
  generated_at: string;
}

// =============================================
// UTILITY TYPES
// =============================================

// Premium feature availability by subscription tier
export interface PremiumFeatureAvailability {
  boost: boolean;
  rewind: boolean;
  passport: boolean;
  see_who_likes_you: boolean;
  advanced_filters: boolean;
  video_profile: boolean;
  unlimited_likes: boolean;
  read_receipts: boolean;
  voice_calls: boolean;
  video_calls: boolean;
  translation: boolean;
}

// Usage limits by subscription tier
export interface SubscriptionLimits {
  daily_likes: number;
  daily_super_likes: number;
  daily_boosts: number;
  daily_rewinds: number;
  max_photos: number;
  max_distance: number;
}

// Boost configuration
export interface BoostConfig {
  type: BoostType;
  duration_minutes: number;
  price?: number;
  description?: string;
}

// Location coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Premium feature usage tracking
export interface FeatureUsageStats {
  feature_name: FeatureName;
  total_usage: number;
  usage_today: number;
  last_used: string | null;
  subscription_tier: string;
}

// All types are already exported above individually