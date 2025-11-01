// Supabase Client Types
// Updated: 2025-06-14
// Description: Enhanced Supabase client types and function signatures

import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

// =============================================
// SUPABASE CLIENT TYPE
// =============================================
export type SupabaseClient = typeof supabase;

// =============================================
// DATABASE FUNCTION TYPES
// =============================================

// Activate Boost Function
export interface ActivateBoostParams {
  p_user_id: string;
  p_boost_type?: 'profile' | 'super_boost';
  p_duration_minutes?: number;
}

export interface ActivateBoostResult {
  success: boolean;
  boost_id?: string;
  ends_at?: string;
  duration_minutes?: number;
  error?: string;
  daily_boosts?: number;
  max_daily_boosts?: number;
}

// Perform Rewind Function
export interface PerformRewindParams {
  p_user_id: string;
  p_target_user_id: string;
}

export interface PerformRewindResult {
  success: boolean;
  rewind_id?: string;
  original_action?: 'like' | 'dislike';
  rewound_at?: string;
  error?: string;
  daily_rewinds?: number;
  max_daily_rewinds?: number;
}

// Track Feature Usage Function
export interface TrackFeatureUsageParams {
  p_user_id: string;
  p_feature_name: string;
  p_subscription_tier?: string | null;
}

// Get User Premium Stats Function
export interface GetUserPremiumStatsParams {
  p_user_id: string;
}

export interface UserPremiumStatsResult {
  user_id: string;
  active_boost: {
    id: string;
    boost_type: 'profile' | 'super_boost';
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
// DATABASE TABLE HELPERS
// =============================================

// Profile Boosts
export type ProfileBoostRow = Database['public']['Tables']['profile_boosts']['Row'];
export type ProfileBoostInsert = Database['public']['Tables']['profile_boosts']['Insert'];
export type ProfileBoostUpdate = Database['public']['Tables']['profile_boosts']['Update'];

// Video Profiles
export type VideoProfileRow = Database['public']['Tables']['video_profiles']['Row'];
export type VideoProfileInsert = Database['public']['Tables']['video_profiles']['Insert'];
export type VideoProfileUpdate = Database['public']['Tables']['video_profiles']['Update'];

// User Activities
export type UserActivityRow = Database['public']['Tables']['user_activities']['Row'];
export type UserActivityInsert = Database['public']['Tables']['user_activities']['Insert'];
export type UserActivityUpdate = Database['public']['Tables']['user_activities']['Update'];

// Feature Usage Logs
export type FeatureUsageLogRow = Database['public']['Tables']['feature_usage_logs']['Row'];
export type FeatureUsageLogInsert = Database['public']['Tables']['feature_usage_logs']['Insert'];
export type FeatureUsageLogUpdate = Database['public']['Tables']['feature_usage_logs']['Update'];

// Rewind Actions
export type RewindActionRow = Database['public']['Tables']['rewind_actions']['Row'];
export type RewindActionInsert = Database['public']['Tables']['rewind_actions']['Insert'];
export type RewindActionUpdate = Database['public']['Tables']['rewind_actions']['Update'];

// Profile Views
export type ProfileViewRow = Database['public']['Tables']['profile_views']['Row'];
export type ProfileViewInsert = Database['public']['Tables']['profile_views']['Insert'];
export type ProfileViewUpdate = Database['public']['Tables']['profile_views']['Update'];

// Location Changes
export type LocationChangeRow = Database['public']['Tables']['location_changes']['Row'];
export type LocationChangeInsert = Database['public']['Tables']['location_changes']['Insert'];
export type LocationChangeUpdate = Database['public']['Tables']['location_changes']['Update'];

// =============================================
// ENHANCED CLIENT FUNCTIONS
// =============================================

// Type-safe function call wrapper
export interface SupabaseFunctionCall<T = any> {
  data: T | null;
  error: any;
}

// Database function signatures
export interface DatabaseFunctions {
  activate_boost: (params: ActivateBoostParams) => Promise<SupabaseFunctionCall<ActivateBoostResult>>;
  perform_rewind: (params: PerformRewindParams) => Promise<SupabaseFunctionCall<PerformRewindResult>>;
  track_feature_usage: (params: TrackFeatureUsageParams) => Promise<SupabaseFunctionCall<void>>;
  get_user_premium_stats: (params: GetUserPremiumStatsParams) => Promise<SupabaseFunctionCall<UserPremiumStatsResult>>;
  reset_daily_usage: () => Promise<SupabaseFunctionCall<void>>;
  cleanup_expired_data: () => Promise<SupabaseFunctionCall<void>>;
}

// =============================================
// REAL-TIME SUBSCRIPTION TYPES
// =============================================

// Profile Boosts realtime
export interface ProfileBoostRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: ProfileBoostRow;
  old?: ProfileBoostRow;
  errors?: any;
}

// User Activities realtime
export interface UserActivityRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: UserActivityRow;
  old?: UserActivityRow;
  errors?: any;
}

// Profile Views realtime
export interface ProfileViewRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: ProfileViewRow;
  old?: ProfileViewRow;
  errors?: any;
}

// =============================================
// ERROR HANDLING TYPES
// =============================================

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface DatabaseOperationResult<T = any> {
  data: T | null;
  error: SupabaseError | null;
  count?: number | null;
}

// =============================================
// QUERY BUILDER HELPERS
// =============================================

// Generic query builder type - simplified to avoid complex type issues
export type SupabaseQueryBuilder<T = any> = any;

// Filter helpers for premium features
export interface BoostFilters {
  user_id?: string;
  is_active?: boolean;
  boost_type?: 'profile' | 'super_boost';
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ActivityFilters {
  user_id?: string;
  activity_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
}

export interface ProfileViewFilters {
  viewer_id?: string;
  viewed_id?: string;
  is_premium_view?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

// =============================================
// UTILITY TYPES
// =============================================

// Generic database response type
export type DatabaseResponse<T> = {
  data: T[];
  error: SupabaseError | null;
  count: number | null;
};

// Single record response type
export type SingleRecordResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
};

// Mutation response type
export type MutationResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
  status: number;
  statusText: string;
};

// =============================================
// SUBSCRIPTION HELPERS
// =============================================

export interface RealtimeSubscriptionConfig {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

export interface RealtimeChannel {
  subscribe: () => void;
  unsubscribe: () => void;
  on: (event: string, callback: (payload: any) => void) => void;
}

// =============================================
// EXPORTS
// =============================================
export type { Database } from '@/integrations/supabase/types';
export { supabase } from '@/integrations/supabase/client';