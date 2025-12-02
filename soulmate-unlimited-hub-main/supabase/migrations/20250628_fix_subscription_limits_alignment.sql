-- Fix Subscription Limits Alignment Migration
-- Created: 2025-06-28
-- Description: Aligns database schema with Supabase functions for subscription limits

-- =============================================
-- Add missing columns to profiles table
-- =============================================

-- Add Supabase function compatible columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_swipes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_super_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_boosts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_rewinds INTEGER DEFAULT 0;

-- Add reset date tracking columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_swipe_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_super_like_reset DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_boost_reset DATE DEFAULT CURRENT_DATE;

-- =============================================
-- Migrate existing data to new columns
-- =============================================

-- Copy existing usage data to new columns
UPDATE profiles 
SET daily_swipes = COALESCE(daily_likes_used, 0),
    daily_super_likes = COALESCE(daily_super_likes_used, 0),
    daily_boosts = COALESCE(daily_boosts_used, 0)
WHERE daily_swipes IS NULL OR daily_super_likes IS NULL OR daily_boosts IS NULL;

-- Set reset dates based on existing data
UPDATE profiles 
SET last_swipe_reset = COALESCE(last_like_reset_date::date, CURRENT_DATE),
    last_super_like_reset = COALESCE(last_like_reset_date::date, CURRENT_DATE),
    last_boost_reset = COALESCE(last_like_reset_date::date, CURRENT_DATE)
WHERE last_swipe_reset IS NULL OR last_super_like_reset IS NULL OR last_boost_reset IS NULL;

-- =============================================
-- Update existing Supabase functions to use correct column names
-- =============================================

-- The reset_daily_usage function should already be using the correct columns
-- No changes needed as it's already aligned

-- =============================================
-- Add indexes for performance
-- =============================================

-- Add indexes for daily usage tracking
CREATE INDEX IF NOT EXISTS idx_profiles_daily_usage 
ON profiles(daily_swipes, daily_super_likes, daily_boosts);

CREATE INDEX IF NOT EXISTS idx_profiles_reset_dates 
ON profiles(last_swipe_reset, last_super_like_reset, last_boost_reset);

-- Add index for subscription tier filtering
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles(subscription_tier) WHERE subscription_tier IS NOT NULL;

-- =============================================
-- Create updated view for backward compatibility
-- =============================================

CREATE OR REPLACE VIEW user_subscription_stats AS
SELECT 
    id,
    subscription_tier,
    subscription_status,
    subscription_expires_at,
    -- Current usage (aligned with Supabase functions)
    daily_swipes as current_daily_likes,
    daily_super_likes as current_daily_super_likes, 
    daily_boosts as current_daily_boosts,
    daily_rewinds as current_daily_rewinds,
    -- Legacy compatibility fields
    daily_likes_used as legacy_daily_likes_used,
    daily_super_likes_used as legacy_daily_super_likes_used,
    daily_boosts_used as legacy_daily_boosts_used,
    -- Reset tracking
    last_swipe_reset,
    last_super_like_reset, 
    last_boost_reset,
    last_like_reset_date as legacy_reset_date,
    -- Subscription tier limits based on current configuration
    CASE subscription_tier
        WHEN 'registered' THEN 10
        WHEN 'silver' THEN 50  
        WHEN 'gold' THEN 100
        WHEN 'platinum' THEN 999
        ELSE 10
    END as daily_likes_limit,
    CASE subscription_tier
        WHEN 'registered' THEN 1
        WHEN 'silver' THEN 5
        WHEN 'gold' THEN 10  
        WHEN 'platinum' THEN 25
        ELSE 1
    END as daily_super_likes_limit,
    CASE subscription_tier
        WHEN 'registered' THEN 0
        WHEN 'silver' THEN 1
        WHEN 'gold' THEN 3
        WHEN 'platinum' THEN 25
        ELSE 0  
    END as daily_boosts_limit,
    -- Remaining counts
    CASE subscription_tier
        WHEN 'registered' THEN GREATEST(0, 10 - daily_swipes)
        WHEN 'silver' THEN GREATEST(0, 50 - daily_swipes)
        WHEN 'gold' THEN GREATEST(0, 100 - daily_swipes)
        WHEN 'platinum' THEN GREATEST(0, 999 - daily_swipes)
        ELSE GREATEST(0, 10 - daily_swipes)
    END as remaining_likes,
    CASE subscription_tier
        WHEN 'registered' THEN GREATEST(0, 1 - daily_super_likes)
        WHEN 'silver' THEN GREATEST(0, 5 - daily_super_likes)
        WHEN 'gold' THEN GREATEST(0, 10 - daily_super_likes)
        WHEN 'platinum' THEN GREATEST(0, 25 - daily_super_likes)
        ELSE GREATEST(0, 1 - daily_super_likes)
    END as remaining_super_likes,
    CASE subscription_tier
        WHEN 'registered' THEN GREATEST(0, 0 - daily_boosts)
        WHEN 'silver' THEN GREATEST(0, 1 - daily_boosts)
        WHEN 'gold' THEN GREATEST(0, 3 - daily_boosts)
        WHEN 'platinum' THEN GREATEST(0, 25 - daily_boosts)
        ELSE GREATEST(0, 0 - daily_boosts)
    END as remaining_boosts
FROM profiles;

-- Grant permissions
GRANT SELECT ON user_subscription_stats TO authenticated;

-- =============================================
-- Create function to get user limits by tier
-- =============================================

CREATE OR REPLACE FUNCTION get_user_subscription_limits(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription_tier TEXT;
    v_daily_swipes INTEGER;
    v_daily_super_likes INTEGER; 
    v_daily_boosts INTEGER;
    v_daily_rewinds INTEGER;
    v_limits jsonb;
    v_usage jsonb;
    v_remaining jsonb;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, daily_swipes, daily_super_likes, daily_boosts, daily_rewinds
    INTO v_subscription_tier, v_daily_swipes, v_daily_super_likes, v_daily_boosts, v_daily_rewinds
    FROM profiles 
    WHERE id = p_user_id;
    
    -- Return null if user not found
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Set default tier if null
    v_subscription_tier := COALESCE(v_subscription_tier, 'registered');
    
    -- Get limits based on tier
    v_limits := CASE v_subscription_tier
        WHEN 'registered' THEN jsonb_build_object('dailyLikes', 10, 'dailySuperLikes', 1, 'dailyBoosts', 0)
        WHEN 'silver' THEN jsonb_build_object('dailyLikes', 50, 'dailySuperLikes', 5, 'dailyBoosts', 1)  
        WHEN 'gold' THEN jsonb_build_object('dailyLikes', 100, 'dailySuperLikes', 10, 'dailyBoosts', 3)
        WHEN 'platinum' THEN jsonb_build_object('dailyLikes', 999, 'dailySuperLikes', 25, 'dailyBoosts', 25)
        ELSE jsonb_build_object('dailyLikes', 10, 'dailySuperLikes', 1, 'dailyBoosts', 0)
    END;
    
    -- Current usage
    v_usage := jsonb_build_object(
        'dailyLikes', COALESCE(v_daily_swipes, 0),
        'dailySuperLikes', COALESCE(v_daily_super_likes, 0), 
        'dailyBoosts', COALESCE(v_daily_boosts, 0),
        'dailyRewinds', COALESCE(v_daily_rewinds, 0)
    );
    
    -- Calculate remaining
    v_remaining := jsonb_build_object(
        'likes', GREATEST(0, (v_limits->>'dailyLikes')::int - COALESCE(v_daily_swipes, 0)),
        'superLikes', GREATEST(0, (v_limits->>'dailySuperLikes')::int - COALESCE(v_daily_super_likes, 0)),
        'boosts', GREATEST(0, (v_limits->>'dailyBoosts')::int - COALESCE(v_daily_boosts, 0))
    );
    
    -- Return complete info
    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'subscription_tier', v_subscription_tier,
        'limits', v_limits,
        'usage', v_usage, 
        'remaining', v_remaining,
        'generated_at', NOW()
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_subscription_limits(UUID) TO authenticated;
