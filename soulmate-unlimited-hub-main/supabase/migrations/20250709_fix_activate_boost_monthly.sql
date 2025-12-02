-- Fix activate_boost function to use monthly boosts instead of daily boosts
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
    v_monthly_boosts INTEGER;
    v_max_monthly_boosts INTEGER;
    v_boost_id UUID;
    v_ends_at TIMESTAMPTZ;
BEGIN
    -- Get user subscription info
    SELECT subscription_tier, monthly_boosts_used
    INTO v_user_subscription, v_monthly_boosts
    FROM profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Determine max monthly boosts based on subscription
    v_max_monthly_boosts := CASE 
        WHEN v_user_subscription = 'registered' THEN 0
        WHEN v_user_subscription = 'silver' THEN 1
        WHEN v_user_subscription = 'gold' THEN 3
        WHEN v_user_subscription = 'platinum' THEN 10
        WHEN v_user_subscription = 'moderator' THEN 999
        WHEN v_user_subscription = 'admin' THEN 999
        ELSE 0
    END;
    
    -- Check if user has remaining boosts
    IF v_monthly_boosts >= v_max_monthly_boosts THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Monthly boost limit reached',
            'monthly_boosts', v_monthly_boosts,
            'max_monthly_boosts', v_max_monthly_boosts
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
    
    -- Update user's monthly boost count
    UPDATE profiles 
    SET monthly_boosts_used = monthly_boosts_used + 1
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION activate_boost(UUID, TEXT, INTEGER) TO authenticated;