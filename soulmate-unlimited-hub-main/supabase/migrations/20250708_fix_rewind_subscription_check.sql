-- Fix rewind feature by updating perform_rewind function to handle null subscription_tier
-- This migration updates the function to fallback to role when subscription_tier is null

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
    v_user_role TEXT;
    v_daily_rewinds INTEGER;
    v_max_daily_rewinds INTEGER;
    v_last_action_id UUID;
    v_last_action_type TEXT;
    v_last_action_timestamp TIMESTAMPTZ;
    v_rewind_id UUID;
BEGIN
    -- Get user subscription info with fallback to role
    SELECT subscription_tier, role, COALESCE(daily_rewinds, 0)
    INTO v_user_subscription, v_user_role, v_daily_rewinds
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Use subscription_tier if available, otherwise fallback to role
    v_user_subscription := COALESCE(v_user_subscription, v_user_role, 'registered');
    
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
    
    -- Check if user has access to rewind feature (Silver+ required)
    IF v_max_daily_rewinds = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Rewind özelliği Silver üyelik veya üstü gerektirir',
            'subscription_tier', v_user_subscription
        );
    END IF;
    
    -- Check if user has remaining rewinds
    IF v_daily_rewinds >= v_max_daily_rewinds AND v_max_daily_rewinds < 999 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Günlük rewind limiti doldu',
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
            'error', 'Geri alınacak yakın tarihli swipe yok'
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
    SET daily_rewinds = COALESCE(daily_rewinds, 0) + 1
    WHERE id = p_user_id;
    
    -- Log the rewind action (check if user_activities table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities') THEN
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
    END IF;
    
    -- Track feature usage (check if function exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'track_feature_usage') THEN
        PERFORM track_feature_usage(p_user_id, 'rewind', v_user_subscription);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'rewind_id', v_rewind_id,
        'original_action', v_last_action_type,
        'rewound_at', NOW()
    );
END;
$$;

-- Also add daily_rewinds column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_rewinds INTEGER DEFAULT 0;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_daily_rewinds ON profiles(daily_rewinds);

-- Reset daily rewinds function (if not exists)
CREATE OR REPLACE FUNCTION reset_daily_rewinds()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE profiles SET daily_rewinds = 0;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION perform_rewind(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_rewinds() TO service_role;