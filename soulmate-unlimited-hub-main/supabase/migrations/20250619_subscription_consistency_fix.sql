-- Subscription Consistency Fix Migration
-- Created: 2025-06-19
-- Description: Fixes subscription consistency issues between profiles and subscribers tables

-- =============================================
-- 1. SYNC SUBSCRIPTION FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION sync_user_subscription(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_subscriber RECORD;
    v_final_tier TEXT;
    v_final_status TEXT;
    v_final_expires_at TIMESTAMPTZ;
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Get profile data
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Get subscriber data
    SELECT * INTO v_subscriber FROM subscribers WHERE user_id = p_user_id;
    
    -- Determine final subscription values
    -- Priority: Check active subscriber first, then profile data
    IF v_subscriber IS NOT NULL AND v_subscriber.subscribed = true THEN
        -- Active subscription in subscribers table takes precedence
        v_final_tier := COALESCE(v_subscriber.subscription_tier, v_profile.role);
        v_final_status := 'active';
        v_final_expires_at := v_subscriber.subscription_end;
        
        -- Update profile to match subscriber
        IF v_profile.role != v_final_tier OR 
           v_profile.subscription_status != 'active' OR
           v_profile.subscription_expires_at IS DISTINCT FROM v_final_expires_at THEN
            
            UPDATE profiles 
            SET 
                role = v_final_tier,
                subscription_tier = v_final_tier,
                subscription_status = 'active',
                subscription_expires_at = v_final_expires_at,
                updated_at = NOW()
            WHERE id = p_user_id;
            
            v_updated := TRUE;
        END IF;
        
    ELSIF v_profile.role IN ('silver', 'gold', 'platinum', 'admin', 'moderator') THEN
        -- Profile has premium role
        v_final_tier := v_profile.role;
        
        -- Check if subscription is still active based on expiry
        IF v_profile.subscription_expires_at IS NULL OR 
           v_profile.subscription_expires_at > NOW() OR
           v_profile.role IN ('admin', 'moderator') THEN
            v_final_status := 'active';
        ELSE
            v_final_status := 'expired';
        END IF;
        
        v_final_expires_at := v_profile.subscription_expires_at;
        
        -- Update subscription_status if needed
        IF v_profile.subscription_status IS DISTINCT FROM v_final_status THEN
            UPDATE profiles 
            SET 
                subscription_status = v_final_status,
                updated_at = NOW()
            WHERE id = p_user_id;
            
            v_updated := TRUE;
        END IF;
        
        -- Sync to subscribers table if missing or outdated
        IF v_subscriber IS NULL THEN
            INSERT INTO subscribers (
                user_id,
                email,
                subscribed,
                subscription_tier,
                subscription_end,
                created_at,
                updated_at
            ) VALUES (
                p_user_id,
                v_profile.email,
                v_final_status = 'active',
                v_final_tier,
                v_final_expires_at,
                NOW(),
                NOW()
            );
            v_updated := TRUE;
        ELSIF v_subscriber.subscription_tier IS DISTINCT FROM v_final_tier OR
              v_subscriber.subscribed != (v_final_status = 'active') THEN
            UPDATE subscribers
            SET 
                subscribed = (v_final_status = 'active'),
                subscription_tier = v_final_tier,
                subscription_end = v_final_expires_at,
                updated_at = NOW()
            WHERE user_id = p_user_id;
            v_updated := TRUE;
        END IF;
        
    ELSE
        -- No premium subscription found
        v_final_tier := 'registered';
        v_final_status := 'inactive';
        v_final_expires_at := NULL;
        
        -- Ensure profile reflects this
        IF v_profile.role != 'registered' OR 
           v_profile.subscription_status NOT IN ('inactive', NULL) THEN
            UPDATE profiles 
            SET 
                role = 'registered',
                subscription_tier = 'registered',
                subscription_status = 'inactive',
                subscription_expires_at = NULL,
                updated_at = NOW()
            WHERE id = p_user_id;
            
            v_updated := TRUE;
        END IF;
    END IF;
    
    -- Return result
    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'subscription_tier', v_final_tier,
        'subscription_status', v_final_status,
        'subscription_expires_at', v_final_expires_at,
        'updated', v_updated,
        'source', CASE 
            WHEN v_subscriber IS NOT NULL AND v_subscriber.subscribed THEN 'subscribers'
            WHEN v_profile.role != 'registered' THEN 'profiles'
            ELSE 'none'
        END
    );
END;
$$;

-- =============================================
-- 2. GET USER SUBSCRIPTION STATUS
-- =============================================
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    -- First sync the subscription data
    SELECT sync_user_subscription(p_user_id) INTO v_result;
    
    -- If sync failed, return the error
    IF NOT (v_result->>'success')::boolean THEN
        RETURN v_result;
    END IF;
    
    -- Get the synced data
    SELECT jsonb_build_object(
        'user_id', p.id,
        'email', p.email,
        'subscription_tier', p.role,
        'subscription_status', p.subscription_status,
        'subscription_expires_at', p.subscription_expires_at,
        'is_active', 
            CASE 
                WHEN p.role IN ('admin', 'moderator') THEN true
                WHEN p.subscription_status = 'active' AND 
                     (p.subscription_expires_at IS NULL OR p.subscription_expires_at > NOW()) THEN true
                ELSE false
            END,
        'features', 
            CASE p.role
                WHEN 'silver' THEN jsonb_build_object(
                    'daily_likes', 50,
                    'daily_superlikes', 5,
                    'monthly_boosts', 1,
                    'see_who_likes_you', true,
                    'advanced_filters', true,
                    'voice_calls', true,
                    'video_calls', false
                )
                WHEN 'gold' THEN jsonb_build_object(
                    'daily_likes', 100,
                    'daily_superlikes', 10,
                    'monthly_boosts', 3,
                    'see_who_likes_you', true,
                    'advanced_filters', true,
                    'voice_calls', true,
                    'video_calls', true,
                    'invisible_browsing', true,
                    'passport_feature', true
                )
                WHEN 'platinum' THEN jsonb_build_object(
                    'daily_likes', 500,
                    'daily_superlikes', 25,
                    'monthly_boosts', 10,
                    'see_who_likes_you', true,
                    'advanced_filters', true,
                    'voice_calls', true,
                    'video_calls', true,
                    'invisible_browsing', true,
                    'passport_feature', true,
                    'multi_language_chat', true
                )
                WHEN 'admin', 'moderator' THEN jsonb_build_object(
                    'daily_likes', 999,
                    'daily_superlikes', 999,
                    'monthly_boosts', 999,
                    'all_features', true
                )
                ELSE jsonb_build_object(
                    'daily_likes', 10,
                    'daily_superlikes', 1,
                    'monthly_boosts', 0
                )
            END
    ) INTO v_result
    FROM profiles p
    WHERE p.id = p_user_id;
    
    RETURN v_result;
END;
$$;

-- =============================================
-- 3. UPDATE SUBSCRIPTION TIER
-- =============================================
CREATE OR REPLACE FUNCTION update_user_subscription_tier(
    p_user_id UUID,
    p_new_tier TEXT,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate tier
    IF p_new_tier NOT IN ('registered', 'silver', 'gold', 'platinum', 'admin', 'moderator') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid subscription tier'
        );
    END IF;
    
    -- Update profiles table
    UPDATE profiles
    SET 
        role = p_new_tier,
        subscription_tier = p_new_tier,
        subscription_status = CASE 
            WHEN p_new_tier = 'registered' THEN 'inactive'
            ELSE 'active'
        END,
        subscription_expires_at = CASE
            WHEN p_new_tier IN ('admin', 'moderator') THEN NULL
            WHEN p_new_tier = 'registered' THEN NULL
            ELSE COALESCE(p_expires_at, NOW() + INTERVAL '30 days')
        END,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Update or insert into subscribers table
    INSERT INTO subscribers (
        user_id,
        email,
        subscribed,
        subscription_tier,
        subscription_end,
        created_at,
        updated_at
    )
    SELECT 
        p_user_id,
        p.email,
        p_new_tier != 'registered',
        p_new_tier,
        CASE
            WHEN p_new_tier IN ('admin', 'moderator') THEN NULL
            WHEN p_new_tier = 'registered' THEN NULL
            ELSE COALESCE(p_expires_at, NOW() + INTERVAL '30 days')
        END,
        NOW(),
        NOW()
    FROM profiles p
    WHERE p.id = p_user_id
    ON CONFLICT (user_id) DO UPDATE
    SET 
        subscribed = EXCLUDED.subscribed,
        subscription_tier = EXCLUDED.subscription_tier,
        subscription_end = EXCLUDED.subscription_end,
        updated_at = NOW();
    
    -- Return updated status
    RETURN get_user_subscription_status(p_user_id);
END;
$$;

-- =============================================
-- 4. FIX SPECIFIC USER SUBSCRIPTION
-- =============================================
-- Fix yunusd64@gmail.com user's subscription
DO $$
DECLARE
    v_user_id UUID;
    v_result jsonb;
BEGIN
    -- Find user ID
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'yunusd64@gmail.com'
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Update to Gold tier with 30 days validity
        SELECT update_user_subscription_tier(
            v_user_id, 
            'gold', 
            NOW() + INTERVAL '30 days'
        ) INTO v_result;
        
        RAISE NOTICE 'Updated subscription for yunusd64@gmail.com: %', v_result;
    ELSE
        RAISE NOTICE 'User yunusd64@gmail.com not found';
    END IF;
END $$;

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================
GRANT EXECUTE ON FUNCTION sync_user_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_subscription_tier(UUID, TEXT, TIMESTAMPTZ) TO authenticated;

-- =============================================
-- 6. CREATE SCHEDULED JOB TO SYNC SUBSCRIPTIONS
-- =============================================
-- This would run daily to ensure consistency
-- Note: This requires pg_cron extension or external scheduler
/*
SELECT cron.schedule(
    'sync-subscriptions',
    '0 2 * * *', -- Run at 2 AM daily
    $$
    SELECT sync_user_subscription(id) 
    FROM profiles 
    WHERE role != 'registered' 
       OR subscription_status = 'active';
    $$
);
*/