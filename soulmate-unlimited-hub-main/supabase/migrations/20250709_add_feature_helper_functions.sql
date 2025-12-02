-- Add helper functions for feature limits and subscription tier management

-- Function to get user's subscription tier with fallback to role
CREATE OR REPLACE FUNCTION get_user_subscription_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_subscription_tier TEXT;
    v_role TEXT;
BEGIN
    -- Get both subscription_tier and role
    SELECT subscription_tier, role
    INTO v_subscription_tier, v_role
    FROM profiles
    WHERE id = p_user_id;
    
    -- Return subscription_tier if available, otherwise fallback to role
    RETURN COALESCE(v_subscription_tier, v_role, 'registered');
END;
$$;

-- Function to get feature limits based on user's tier
CREATE OR REPLACE FUNCTION get_feature_limit(p_user_id UUID, p_feature TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_tier TEXT;
    v_limit INTEGER;
BEGIN
    -- Get user's tier
    v_tier := get_user_subscription_tier(p_user_id);
    
    -- Return limits based on tier and feature
    CASE p_feature
        WHEN 'daily_likes' THEN
            v_limit := CASE v_tier
                WHEN 'registered' THEN 10
                WHEN 'silver' THEN 50
                WHEN 'gold' THEN 100
                WHEN 'platinum' THEN 999
                WHEN 'moderator' THEN 999
                WHEN 'admin' THEN 999
                ELSE 10
            END;
        
        WHEN 'daily_superlikes' THEN
            v_limit := CASE v_tier
                WHEN 'registered' THEN 1
                WHEN 'silver' THEN 5
                WHEN 'gold' THEN 10
                WHEN 'platinum' THEN 25
                WHEN 'moderator' THEN 999
                WHEN 'admin' THEN 999
                ELSE 1
            END;
        
        WHEN 'daily_rewinds' THEN
            v_limit := CASE v_tier
                WHEN 'registered' THEN 0
                WHEN 'silver' THEN 1
                WHEN 'gold' THEN 3
                WHEN 'platinum' THEN 999
                WHEN 'moderator' THEN 999
                WHEN 'admin' THEN 999
                ELSE 0
            END;
        
        WHEN 'monthly_boosts', 'boosts' THEN
            v_limit := CASE v_tier
                WHEN 'registered' THEN 0
                WHEN 'silver' THEN 1
                WHEN 'gold' THEN 3
                WHEN 'platinum' THEN 10
                WHEN 'moderator' THEN 999
                WHEN 'admin' THEN 999
                ELSE 0
            END;
        
        WHEN 'max_photos' THEN
            v_limit := CASE v_tier
                WHEN 'registered' THEN 6
                WHEN 'silver' THEN 10
                WHEN 'gold' THEN 10
                WHEN 'platinum' THEN 15
                WHEN 'moderator' THEN 25
                WHEN 'admin' THEN 25
                ELSE 6
            END;
        
        ELSE
            v_limit := 0;
    END CASE;
    
    RETURN v_limit;
END;
$$;

-- Function to track feature usage (optional - for analytics)
CREATE OR REPLACE FUNCTION track_feature_usage(
    p_user_id UUID,
    p_feature_name TEXT,
    p_tier TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_tier TEXT;
BEGIN
    -- Get tier if not provided
    IF p_tier IS NULL THEN
        v_tier := get_user_subscription_tier(p_user_id);
    ELSE
        v_tier := p_tier;
    END IF;
    
    -- Check if feature_usage_logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_usage_logs') THEN
        -- Insert or update usage log
        INSERT INTO feature_usage_logs (
            user_id,
            feature_name,
            usage_date,
            usage_count,
            subscription_tier
        ) VALUES (
            p_user_id,
            p_feature_name,
            CURRENT_DATE,
            1,
            v_tier
        )
        ON CONFLICT (user_id, feature_name, usage_date) 
        DO UPDATE SET 
            usage_count = feature_usage_logs.usage_count + 1,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Also log to user_activities if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities') THEN
        INSERT INTO user_activities (user_id, activity_type, activity_data)
        VALUES (
            p_user_id,
            'feature_used',
            jsonb_build_object(
                'feature', p_feature_name,
                'tier', v_tier,
                'timestamp', CURRENT_TIMESTAMP
            )
        );
    END IF;
END;
$$;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION has_feature_access(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_tier TEXT;
    v_tier_level INTEGER;
    v_required_level INTEGER;
BEGIN
    -- Get user's tier
    v_tier := get_user_subscription_tier(p_user_id);
    
    -- Map tier to level
    v_tier_level := CASE v_tier
        WHEN 'registered' THEN 0
        WHEN 'silver' THEN 1
        WHEN 'gold' THEN 2
        WHEN 'platinum' THEN 3
        WHEN 'moderator' THEN 4
        WHEN 'admin' THEN 5
        ELSE 0
    END;
    
    -- Get required level for feature
    v_required_level := CASE p_feature
        -- Silver features
        WHEN 'see_who_likes_you' THEN 1
        WHEN 'advanced_filters' THEN 1
        WHEN 'read_receipts' THEN 1
        WHEN 'monthly_boosts' THEN 1
        WHEN 'rewind_feature' THEN 1
        WHEN 'voice_calls' THEN 1
        WHEN 'video_calls' THEN 1
        WHEN 'no_ads' THEN 1
        
        -- Gold features
        WHEN 'unlimited_messages' THEN 2
        WHEN 'priority_messages' THEN 2
        WHEN 'invisible_browsing' THEN 2
        WHEN 'location_change' THEN 2
        WHEN 'passport_feature' THEN 2
        WHEN 'video_profile' THEN 2
        WHEN 'profile_boost' THEN 2
        WHEN 'top_picks_access' THEN 2
        WHEN 'who_viewed_profile' THEN 2
        
        -- Platinum features
        WHEN 'multi_language_chat' THEN 3
        
        -- Admin features
        WHEN 'admin_panel' THEN 5
        WHEN 'user_management' THEN 5
        WHEN 'content_moderation' THEN 4 -- Moderators can access
        WHEN 'system_settings' THEN 5
        WHEN 'analytics' THEN 4 -- Moderators can access
        
        ELSE 0
    END;
    
    RETURN v_tier_level >= v_required_level;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_subscription_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_limit(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_feature_usage(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_feature_access(UUID, TEXT) TO authenticated;