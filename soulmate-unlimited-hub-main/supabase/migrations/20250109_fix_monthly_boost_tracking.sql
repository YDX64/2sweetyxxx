-- Fix monthly boost tracking function
CREATE OR REPLACE FUNCTION increment_boosts(user_id UUID, boost_count INT DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_daily_boosts INT;
    current_monthly_boosts INT;
    max_daily_boosts INT;
    max_monthly_boosts INT;
    user_role TEXT;
    last_daily_reset TIMESTAMPTZ;
    last_monthly_reset TIMESTAMPTZ;
    now_time TIMESTAMPTZ := NOW();
    result JSON;
BEGIN
    -- Get user's current boost usage and role
    SELECT 
        COALESCE(p.daily_boosts_used, 0),
        COALESCE(p.monthly_boosts_used, 0),
        COALESCE(p.last_usage_reset_date, now_time - interval '1 day'),
        COALESCE(p.last_boost_reset, now_time - interval '1 month'),
        COALESCE(p.role, 'registered')
    INTO 
        current_daily_boosts,
        current_monthly_boosts,
        last_daily_reset,
        last_monthly_reset,
        user_role
    FROM profiles p
    WHERE p.id = user_id;

    -- Determine max boosts based on role
    max_daily_boosts := CASE user_role
        WHEN 'platinum' THEN 5
        WHEN 'gold' THEN 3
        WHEN 'silver' THEN 1
        ELSE 0
    END;

    -- Monthly boosts are the same as daily for now
    max_monthly_boosts := max_daily_boosts * 30;

    -- Reset daily counter if it's a new day
    IF date_trunc('day', last_daily_reset) < date_trunc('day', now_time) THEN
        current_daily_boosts := 0;
        
        -- Update last daily reset
        UPDATE profiles 
        SET last_usage_reset_date = now_time
        WHERE id = user_id;
    END IF;

    -- Reset monthly counter if it's a new month
    IF date_trunc('month', last_monthly_reset) < date_trunc('month', now_time) THEN
        current_monthly_boosts := 0;
        
        -- Update last monthly reset
        UPDATE profiles 
        SET last_boost_reset = now_time
        WHERE id = user_id;
    END IF;

    -- Check if user has boosts available
    IF current_daily_boosts + boost_count > max_daily_boosts THEN
        RETURN json_build_object(
            'success', false,
            'error', 'daily_limit_exceeded',
            'daily_used', current_daily_boosts,
            'daily_limit', max_daily_boosts,
            'monthly_used', current_monthly_boosts,
            'monthly_limit', max_monthly_boosts
        );
    END IF;

    IF current_monthly_boosts + boost_count > max_monthly_boosts THEN
        RETURN json_build_object(
            'success', false,
            'error', 'monthly_limit_exceeded',
            'daily_used', current_daily_boosts,
            'daily_limit', max_daily_boosts,
            'monthly_used', current_monthly_boosts,
            'monthly_limit', max_monthly_boosts
        );
    END IF;

    -- Increment both daily and monthly boost counters
    UPDATE profiles
    SET 
        daily_boosts_used = current_daily_boosts + boost_count,
        monthly_boosts_used = current_monthly_boosts + boost_count,
        last_usage_reset_date = CASE 
            WHEN date_trunc('day', last_daily_reset) < date_trunc('day', now_time) 
            THEN now_time 
            ELSE last_usage_reset_date 
        END,
        last_boost_reset = CASE 
            WHEN date_trunc('month', last_monthly_reset) < date_trunc('month', now_time) 
            THEN now_time 
            ELSE last_boost_reset 
        END
    WHERE id = user_id;

    -- Return success with updated counts
    RETURN json_build_object(
        'success', true,
        'daily_used', current_daily_boosts + boost_count,
        'daily_limit', max_daily_boosts,
        'daily_remaining', max_daily_boosts - (current_daily_boosts + boost_count),
        'monthly_used', current_monthly_boosts + boost_count,
        'monthly_limit', max_monthly_boosts,
        'monthly_remaining', max_monthly_boosts - (current_monthly_boosts + boost_count)
    );
END;
$$;

-- Add function to get current usage limits
CREATE OR REPLACE FUNCTION get_usage_limits(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_data RECORD;
    user_role TEXT;
    daily_likes_limit INT;
    daily_super_likes_limit INT;
    daily_boosts_limit INT;
    monthly_boosts_limit INT;
    now_time TIMESTAMPTZ := NOW();
    needs_daily_reset BOOLEAN;
    needs_monthly_reset BOOLEAN;
BEGIN
    -- Get user profile data
    SELECT 
        p.*,
        COALESCE(p.role, 'registered') as user_role
    INTO profile_data
    FROM profiles p
    WHERE p.id = user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not found');
    END IF;

    user_role := profile_data.user_role;

    -- Determine limits based on role
    daily_likes_limit := CASE user_role
        WHEN 'platinum' THEN 999
        WHEN 'gold' THEN 100
        WHEN 'silver' THEN 50
        ELSE 10
    END;

    daily_super_likes_limit := CASE user_role
        WHEN 'platinum' THEN 20
        WHEN 'gold' THEN 10
        WHEN 'silver' THEN 5
        ELSE 1
    END;

    daily_boosts_limit := CASE user_role
        WHEN 'platinum' THEN 5
        WHEN 'gold' THEN 3
        WHEN 'silver' THEN 1
        ELSE 0
    END;

    monthly_boosts_limit := daily_boosts_limit * 30;

    -- Check if reset is needed
    needs_daily_reset := date_trunc('day', profile_data.last_usage_reset_date) < date_trunc('day', now_time);
    needs_monthly_reset := date_trunc('month', profile_data.last_boost_reset) < date_trunc('month', now_time);

    -- Return current usage and limits
    RETURN json_build_object(
        'role', user_role,
        'daily_likes_used', CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_likes_used, 0) END,
        'daily_likes_limit', daily_likes_limit,
        'daily_likes_remaining', daily_likes_limit - (CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_likes_used, 0) END),
        'daily_super_likes_used', CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_super_likes_used, 0) END,
        'daily_super_likes_limit', daily_super_likes_limit,
        'daily_super_likes_remaining', daily_super_likes_limit - (CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_super_likes_used, 0) END),
        'daily_boosts_used', CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_boosts_used, 0) END,
        'daily_boosts_limit', daily_boosts_limit,
        'daily_boosts_remaining', daily_boosts_limit - (CASE WHEN needs_daily_reset THEN 0 ELSE COALESCE(profile_data.daily_boosts_used, 0) END),
        'monthly_boosts_used', CASE WHEN needs_monthly_reset THEN 0 ELSE COALESCE(profile_data.monthly_boosts_used, 0) END,
        'monthly_boosts_limit', monthly_boosts_limit,
        'monthly_boosts_remaining', monthly_boosts_limit - (CASE WHEN needs_monthly_reset THEN 0 ELSE COALESCE(profile_data.monthly_boosts_used, 0) END),
        'last_daily_reset', profile_data.last_usage_reset_date,
        'last_monthly_reset', profile_data.last_boost_reset,
        'needs_daily_reset', needs_daily_reset,
        'needs_monthly_reset', needs_monthly_reset
    );
END;
$$;

-- Create a function to reset usage counters (for testing or manual reset)
CREATE OR REPLACE FUNCTION reset_usage_counters(user_id UUID, reset_type TEXT DEFAULT 'all')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF reset_type = 'daily' OR reset_type = 'all' THEN
        UPDATE profiles
        SET 
            daily_likes_used = 0,
            daily_super_likes_used = 0,
            daily_boosts_used = 0,
            last_usage_reset_date = NOW()
        WHERE id = user_id;
    END IF;

    IF reset_type = 'monthly' OR reset_type = 'all' THEN
        UPDATE profiles
        SET 
            monthly_boosts_used = 0,
            last_boost_reset = NOW()
        WHERE id = user_id;
    END IF;

    RETURN json_build_object(
        'success', true,
        'reset_type', reset_type,
        'timestamp', NOW()
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION increment_boosts TO authenticated;
GRANT EXECUTE ON FUNCTION get_usage_limits TO authenticated;
GRANT EXECUTE ON FUNCTION reset_usage_counters TO authenticated;