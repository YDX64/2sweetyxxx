-- Fix Boost Schema Migration
-- Created: 2025-06-25
-- Description: Adds missing columns for boost functionality to profiles table

-- Add missing boost-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_boosts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_boosts_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_boost_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_rewinds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_rewind_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_swipes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_swipe_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_super_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_super_like_reset DATE DEFAULT CURRENT_DATE;

-- Create boosts table if it doesn't exist (for subscriptionService compatibility)
CREATE TABLE IF NOT EXISTS boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for boosts table
CREATE INDEX IF NOT EXISTS idx_boosts_user_id ON boosts(user_id);
CREATE INDEX IF NOT EXISTS idx_boosts_active ON boosts(user_id, is_active, expires_at);

-- Create or replace the RPC functions needed by subscriptionService
CREATE OR REPLACE FUNCTION get_user_usage(user_id UUID)
RETURNS TABLE (
  daily_boosts_used INTEGER,
  monthly_boosts_used INTEGER,
  last_usage_reset_date DATE,
  last_boost_reset_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.daily_boosts_used,
    COALESCE((
      SELECT COUNT(*)::INTEGER 
      FROM profile_boosts pb 
      WHERE pb.user_id = p.id 
      AND pb.created_at >= date_trunc('month', CURRENT_DATE)
    ), 0) AS monthly_boosts_used,
    p.last_swipe_reset AS last_usage_reset_date,
    p.last_boost_reset AS last_boost_reset_date
  FROM profiles p
  WHERE p.id = $1;
END;
$$;

CREATE OR REPLACE FUNCTION increment_boosts(
  user_id UUID,
  daily_count INTEGER,
  monthly_count INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles 
  SET 
    daily_boosts_used = daily_count,
    last_boost_reset = CASE 
      WHEN last_boost_reset < CURRENT_DATE THEN CURRENT_DATE 
      ELSE last_boost_reset 
    END
  WHERE id = user_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_boosts(UUID, INTEGER, INTEGER) TO authenticated;