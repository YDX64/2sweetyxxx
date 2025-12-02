-- Add Database Functions Migration
-- Created: 2025-06-14
-- Description: Creates Supabase functions for premium features

-- =============================================
-- 1. RESET DAILY USAGE FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reset daily swipe counts
    UPDATE profiles 
    SET daily_swipes = 0, 
        last_swipe_reset = CURRENT_DATE
    WHERE last_swipe_reset < CURRENT_DATE;
    
    -- Reset daily super like counts
    UPDATE profiles 
    SET daily_super_likes = 0,
        last_super_like_reset = CURRENT_DATE
    WHERE last_super_like_reset < CURRENT_DATE;
    
    -- Reset daily boost usage
    UPDATE profiles 
    SET daily_boosts = 0,
        last_boost_reset = CURRENT_DATE
    WHERE last_boost_reset < CURRENT_DATE;
    
    -- Deactivate expired boosts
    UPDATE profile_boosts 
    SET is_active = false
    WHERE is_active = true AND ends_at < NOW();
    
    -- Log the reset operation
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    SELECT id, 'daily_reset', jsonb_build_object(
        'reset_date', CURRENT_DATE,
        'reset_time', NOW()
    )
    FROM profiles
    WHERE last_swipe_reset = CURRENT_DATE;
END;
$$;

-- =============================================
-- 2. ACTIVATE BOOST FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION activate_boost(
    p_user_id UUID,
    p_boost_type TEXT DEFAULT 'profile',
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_subscription TEXT;
    v_daily_boosts INTEGER;
    v_max_daily_boosts INTEGER;
    v_boost_id UUID;
    v_ends_at TIMESTAMPTZ;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, daily_boosts
    INTO v_user_subscription, v_daily_boosts
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Determine max daily boosts based on subscription
    v_max_daily_boosts := CASE 
        WHEN v_user_subscription = 'registered' THEN 0
        WHEN v_user_subscription = 'silver' THEN 1
        WHEN v_user_subscription = 'gold' THEN 3
        WHEN v_user_subscription = 'platinum' THEN 25
        WHEN v_user_subscription = 'moderator' THEN 999
        WHEN v_user_subscription = 'admin' THEN 999
        ELSE 0
    END;
    
    -- Check if user has remaining boosts
    IF v_daily_boosts >= v_max_daily_boosts THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Daily boost limit reached',
            'daily_boosts', v_daily_boosts,
            'max_daily_boosts', v_max_daily_boosts
        );
    END IF;
    
    -- Check if user already has an active boost
    IF EXISTS (
        SELECT 1 FROM profile_boosts 
        WHERE user_id = p_user_id 
        AND is_active = true 
        AND ends_at > NOW()
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User already has an active boost'
        );
    END IF;
    
    -- Calculate end time
    v_ends_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Create boost record
    INSERT INTO profile_boosts (
        user_id,
        boost_type,
        duration_minutes,
        started_at,
        ends_at,
        is_active
    )
    VALUES (
        p_user_id,
        p_boost_type,
        p_duration_minutes,
        NOW(),
        v_ends_at,
        true
    )
    RETURNING id INTO v_boost_id;
    
    -- Update user's daily boost count
    UPDATE profiles 
    SET daily_boosts = daily_boosts + 1
    WHERE id = p_user_id;
    
    -- Log the boost activation
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    VALUES (
        p_user_id,
        'boost_activated',
        jsonb_build_object(
            'boost_id', v_boost_id,
            'boost_type', p_boost_type,
            'duration_minutes', p_duration_minutes,
            'ends_at', v_ends_at
        )
    );
    
    -- Track feature usage
    PERFORM track_feature_usage(p_user_id, 'boost', v_user_subscription);
    
    RETURN jsonb_build_object(
        'success', true,
        'boost_id', v_boost_id,
        'ends_at', v_ends_at,
        'duration_minutes', p_duration_minutes
    );
END;
$$;

-- =============================================
-- 3. PERFORM REWIND FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION perform_rewind(
    p_user_id UUID,
    p_target_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_subscription TEXT;
    v_daily_rewinds INTEGER;
    v_max_daily_rewinds INTEGER;
    v_last_action_id UUID;
    v_last_action_type TEXT;
    v_last_action_timestamp TIMESTAMPTZ;
    v_rewind_id UUID;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, daily_rewinds
    INTO v_user_subscription, v_daily_rewinds
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Determine max daily rewinds based on subscription
    v_max_daily_rewinds := CASE 
        WHEN v_user_subscription = 'registered' THEN 0
        WHEN v_user_subscription = 'silver' THEN 1
        WHEN v_user_subscription = 'gold' THEN 3
        WHEN v_user_subscription = 'platinum' THEN 999
        WHEN v_user_subscription = 'moderator' THEN 999
        WHEN v_user_subscription = 'admin' THEN 999
        ELSE 0
    END;
    
    -- Check if user has remaining rewinds
    IF v_daily_rewinds >= v_max_daily_rewinds THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Daily rewind limit reached',
            'daily_rewinds', v_daily_rewinds,
            'max_daily_rewinds', v_max_daily_rewinds
        );
    END IF;
    
    -- Find the last swipe action on this user (within last 24 hours)
    SELECT id, action_taken, created_at
    INTO v_last_action_id, v_last_action_type, v_last_action_timestamp
    FROM swipes
    WHERE user_id = p_user_id 
    AND target_user_id = p_target_user_id
    AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check if there's a recent action to rewind
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No recent action found to rewind'
        );
    END IF;
    
    -- Delete the swipe record
    DELETE FROM swipes WHERE id = v_last_action_id;
    
    -- If it was a like, also remove from matches if it was mutual
    IF v_last_action_type = 'like' THEN
        DELETE FROM matches 
        WHERE (user1_id = p_user_id AND user2_id = p_target_user_id)
           OR (user1_id = p_target_user_id AND user2_id = p_user_id);
    END IF;
    
    -- Create rewind record
    INSERT INTO rewind_actions (
        user_id,
        target_user_id,
        action_type,
        original_action_timestamp,
        rewind_timestamp,
        is_used
    )
    VALUES (
        p_user_id,
        p_target_user_id,
        v_last_action_type,
        v_last_action_timestamp,
        NOW(),
        true
    )
    RETURNING id INTO v_rewind_id;
    
    -- Update user's daily rewind count
    UPDATE profiles 
    SET daily_rewinds = daily_rewinds + 1
    WHERE id = p_user_id;
    
    -- Log the rewind action
    INSERT INTO user_activities (user_id, activity_type, activity_data)
    VALUES (
        p_user_id,
        'rewind_performed',
        jsonb_build_object(
            'rewind_id', v_rewind_id,
            'target_user_id', p_target_user_id,
            'original_action', v_last_action_type,
            'original_timestamp', v_last_action_timestamp
        )
    );
    
    -- Track feature usage
    PERFORM track_feature_usage(p_user_id, 'rewind', v_user_subscription);
    
    RETURN jsonb_build_object(
        'success', true,
        'rewind_id', v_rewind_id,
        'original_action', v_last_action_type,
        'rewound_at', NOW()
    );
END;
$$;

-- =============================================
-- 4. TRACK FEATURE USAGE FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION track_feature_usage(
    p_user_id UUID,
    p_feature_name TEXT,
    p_subscription_tier TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subscription_tier TEXT;
BEGIN
    -- Get subscription tier if not provided
    IF p_subscription_tier IS NULL THEN
        SELECT subscription_tier
        INTO v_subscription_tier
        FROM profiles
        WHERE id = p_user_id;
    ELSE
        v_subscription_tier := p_subscription_tier;
    END IF;
    
    -- Insert or update feature usage log
    INSERT INTO feature_usage_logs (
        user_id,
        feature_name,
        usage_count,
        usage_date,
        subscription_tier
    )
    VALUES (
        p_user_id,
        p_feature_name,
        1,
        CURRENT_DATE,
        v_subscription_tier
    )
    ON CONFLICT (user_id, feature_name, usage_date)
    DO UPDATE SET
        usage_count = feature_usage_logs.usage_count + 1,
        created_at = NOW();
END;
$$;

-- =============================================
-- 5. GET USER PREMIUM STATS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION get_user_premium_stats(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_active_boost jsonb;
    v_usage_today jsonb;
    v_profile_views_count INTEGER;
    v_monthly_stats jsonb;
BEGIN
    -- Get active boost info
    SELECT jsonb_build_object(
        'id', id,
        'boost_type', boost_type,
        'ends_at', ends_at,
        'remaining_minutes', EXTRACT(EPOCH FROM (ends_at - NOW()))/60
    )
    INTO v_active_boost
    FROM profile_boosts
    WHERE user_id = p_user_id 
    AND is_active = true 
    AND ends_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get today's usage stats
    SELECT jsonb_build_object(
        'swipes', daily_swipes,
        'super_likes', daily_super_likes,
        'boosts', daily_boosts,
        'rewinds', daily_rewinds
    )
    INTO v_usage_today
    FROM profiles
    WHERE id = p_user_id;
    
    -- Get profile views count (last 30 days)
    SELECT COUNT(*)
    INTO v_profile_views_count
    FROM profile_views
    WHERE viewed_id = p_user_id
    AND viewed_at > NOW() - INTERVAL '30 days';
    
    -- Get monthly feature usage stats
    SELECT jsonb_object_agg(feature_name, total_usage)
    INTO v_monthly_stats
    FROM (
        SELECT 
            feature_name,
            SUM(usage_count) as total_usage
        FROM feature_usage_logs
        WHERE user_id = p_user_id
        AND usage_date > CURRENT_DATE - INTERVAL '30 days'
        GROUP BY feature_name
    ) stats;
    
    -- Build result
    v_result := jsonb_build_object(
        'user_id', p_user_id,
        'active_boost', COALESCE(v_active_boost, 'null'::jsonb),
        'usage_today', v_usage_today,
        'profile_views_30d', v_profile_views_count,
        'monthly_feature_usage', COALESCE(v_monthly_stats, '{}'::jsonb),
        'generated_at', NOW()
    );
    
    RETURN v_result;
END;
$$;

-- =============================================
-- 6. CLEAN UP EXPIRED DATA FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Deactivate expired boosts
    UPDATE profile_boosts 
    SET is_active = false
    WHERE is_active = true AND ends_at < NOW();
    
    -- Deactivate expired location changes
    UPDATE location_changes 
    SET is_active = false
    WHERE is_active = true AND ends_at IS NOT NULL AND ends_at < NOW();
    
    -- Delete old user activities (older than 90 days)
    DELETE FROM user_activities
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    -- Delete old feature usage logs (older than 1 year)
    DELETE FROM feature_usage_logs
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Delete old rewind actions (older than 30 days)
    DELETE FROM rewind_actions
    WHERE rewind_timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete old profile views (older than 1 year)
    DELETE FROM profile_views
    WHERE viewed_at < NOW() - INTERVAL '1 year';
END;
$$;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION activate_boost(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION perform_rewind(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION track_feature_usage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_premium_stats(UUID) TO authenticated;

-- Grant execute permissions for maintenance functions to service role
GRANT EXECUTE ON FUNCTION reset_daily_usage() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_data() TO service_role;