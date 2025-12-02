-- Complete fix for rewind feature
-- Fixes column name mismatch and action type mapping
-- UPDATED: Now includes notification cleanup for complete rewind

CREATE OR REPLACE FUNCTION perform_rewind(
    p_user_id UUID,
    p_target_user_id UUID DEFAULT NULL
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
    v_last_direction TEXT;
    v_last_action_type TEXT;
    v_last_action_timestamp TIMESTAMPTZ;
    v_actual_target_user_id UUID;
    v_rewind_id UUID;
    v_deleted_match_id UUID;
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
    
    -- Find the last swipe action (within last 24 hours)
    IF p_target_user_id IS NOT NULL THEN
        -- Look for specific target user
        SELECT id, direction, created_at, target_user_id
        INTO v_last_action_id, v_last_direction, v_last_action_timestamp, v_actual_target_user_id
        FROM swipes
        WHERE user_id = p_user_id 
        AND target_user_id = p_target_user_id
        AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 1;
    ELSE
        -- Find the most recent swipe regardless of target
        SELECT id, direction, created_at, target_user_id
        INTO v_last_action_id, v_last_direction, v_last_action_timestamp, v_actual_target_user_id
        FROM swipes
        WHERE user_id = p_user_id 
        AND created_at > NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    -- Check if there's a recent action to rewind
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Geri alınacak yakın tarihli swipe yok'
        );
    END IF;
    
    -- Map direction to action type for rewind_actions table
    v_last_action_type := CASE 
        WHEN v_last_direction = 'right' THEN 'like'
        WHEN v_last_direction = 'left' THEN 'dislike'
        ELSE 'like' -- default fallback
    END;
    
    -- If it was a right swipe (like), check and delete match first to get match ID
    IF v_last_direction = 'right' THEN
        -- Get the match ID before deleting
        SELECT id INTO v_deleted_match_id
        FROM matches 
        WHERE (user1_id = p_user_id AND user2_id = v_actual_target_user_id)
           OR (user1_id = v_actual_target_user_id AND user2_id = p_user_id);
           
        -- Delete the match if it exists
        DELETE FROM matches 
        WHERE (user1_id = p_user_id AND user2_id = v_actual_target_user_id)
           OR (user1_id = v_actual_target_user_id AND user2_id = p_user_id);
    END IF;
    
    -- Delete the swipe record
    DELETE FROM swipes WHERE id = v_last_action_id;
    
    -- Delete related notifications (CRITICAL for complete rewind)
    -- Delete like notifications if it was a like action
    IF v_last_direction = 'right' THEN
        -- Delete like notification sent to target user
        DELETE FROM notifications 
        WHERE type = 'like' 
        AND user_id = v_actual_target_user_id 
        AND related_user_id = p_user_id;
        
        -- Delete super_like notification if exists
        DELETE FROM notifications 
        WHERE type = 'super_like' 
        AND user_id = v_actual_target_user_id 
        AND related_user_id = p_user_id;
        
        -- Delete match notifications if a match was deleted
        IF v_deleted_match_id IS NOT NULL THEN
            DELETE FROM notifications 
            WHERE type = 'match' 
            AND related_match_id = v_deleted_match_id;
        END IF;
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
        v_actual_target_user_id,
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
    
    RETURN jsonb_build_object(
        'success', true,
        'rewind_id', v_rewind_id,
        'original_action', v_last_direction,
        'rewound_at', NOW(),
        'target_user_id', v_actual_target_user_id,
        'notifications_deleted', true,
        'match_deleted', v_deleted_match_id IS NOT NULL
    );
END;
$$;