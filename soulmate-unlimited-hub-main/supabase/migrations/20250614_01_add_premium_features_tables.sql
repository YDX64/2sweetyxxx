-- Add Premium Features Tables Migration
-- Created: 2025-06-14
-- Description: Creates tables for premium features including boost, video profiles, activities, and more

-- =============================================
-- 1. PROFILE BOOSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profile_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('profile', 'super_boost')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. VIDEO PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS video_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL,
  file_size_mb DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. USER ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- =============================================
-- 4. FEATURE USAGE LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 1,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. REWIND ACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS rewind_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'dislike')),
  original_action_timestamp TIMESTAMPTZ NOT NULL,
  rewind_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_used BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================
-- 6. PROFILE VIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_premium_view BOOLEAN NOT NULL DEFAULT FALSE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create unique constraint on computed date
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_daily
ON profile_views(viewer_id, viewed_id, view_date);

-- =============================================
-- 7. LOCATION CHANGES TABLE (Passport Feature)
-- =============================================
CREATE TABLE IF NOT EXISTS location_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_latitude DECIMAL(10, 8),
  original_longitude DECIMAL(11, 8),
  new_latitude DECIMAL(10, 8) NOT NULL,
  new_longitude DECIMAL(11, 8) NOT NULL,
  city_name TEXT,
  country_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profile boosts indexes
CREATE INDEX IF NOT EXISTS idx_profile_boosts_user_id ON profile_boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_boosts_active ON profile_boosts(user_id, is_active, ends_at);

-- Video profiles indexes
CREATE INDEX IF NOT EXISTS idx_video_profiles_user_id ON video_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_video_profiles_status ON video_profiles(status);

-- User activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type_timestamp ON user_activities(activity_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);

-- Feature usage logs indexes
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_date ON feature_usage_logs(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_date ON feature_usage_logs(feature_name, usage_date);

-- Rewind actions indexes
CREATE INDEX IF NOT EXISTS idx_rewind_user_timestamp ON rewind_actions(user_id, rewind_timestamp);
CREATE INDEX IF NOT EXISTS idx_rewind_target_timestamp ON rewind_actions(target_user_id, rewind_timestamp);

-- Profile views indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views(viewer_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_premium ON profile_views(viewed_id, is_premium_view, viewed_at);

-- Location changes indexes (GiST for geographic queries)
CREATE INDEX IF NOT EXISTS idx_location_changes_user_active ON location_changes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_location_changes_location ON location_changes USING GIST (point(new_longitude, new_latitude));

-- =============================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- =============================================

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profile_boosts_updated_at
    BEFORE UPDATE ON profile_boosts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_profiles_updated_at
    BEFORE UPDATE ON video_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_changes_updated_at
    BEFORE UPDATE ON location_changes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();