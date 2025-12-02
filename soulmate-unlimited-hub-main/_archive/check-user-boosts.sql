-- Check boost limits for user: coldwar6464x@gmail.com

-- 1. Get user profile and subscription info
SELECT 
    p.id,
    p.email,
    p.username,
    p.role,
    p.subscription_tier,
    p.monthly_boosts_used,
    p.daily_boosts_used,
    p.last_boost_reset,
    EXTRACT(DAY FROM NOW() - COALESCE(p.last_boost_reset, NOW() - INTERVAL '31 days')) as days_since_reset
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 2. Get subscription tier limits
WITH user_info AS (
    SELECT 
        p.id,
        p.email,
        COALESCE(p.subscription_tier, p.role, 'registered') as tier,
        p.monthly_boosts_used
    FROM profiles p
    WHERE p.email = 'coldwar6464x@gmail.com'
)
SELECT 
    ui.email,
    ui.tier,
    CASE ui.tier
        WHEN 'registered' THEN 0
        WHEN 'silver' THEN 1
        WHEN 'gold' THEN 3
        WHEN 'platinum' THEN 10
        WHEN 'moderator' THEN 999
        WHEN 'admin' THEN 999
        ELSE 0
    END as monthly_boost_limit,
    ui.monthly_boosts_used
FROM user_info ui;

-- 3. Check monthly boost usage from profile_boosts table
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
SELECT 
    COUNT(*) as boosts_used_this_month,
    MAX(started_at) as last_boost_date
FROM profile_boosts pb
WHERE pb.user_id = (SELECT id FROM user_id)
AND pb.started_at >= DATE_TRUNC('month', NOW());

-- 4. Check if user has any active boosts
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
SELECT 
    pb.id,
    pb.boost_type,
    pb.duration_minutes,
    pb.started_at,
    pb.ends_at,
    pb.is_active,
    CASE 
        WHEN pb.ends_at > NOW() THEN pb.ends_at - NOW()
        ELSE INTERVAL '0 minutes'
    END as time_remaining
FROM profile_boosts pb
WHERE pb.user_id = (SELECT id FROM user_id)
AND pb.is_active = true
AND pb.ends_at > NOW();

-- 5. Summary - Remaining boosts calculation
WITH user_data AS (
    SELECT 
        p.id,
        p.email,
        p.username,
        COALESCE(p.subscription_tier, p.role, 'registered') as tier,
        COALESCE(p.monthly_boosts_used, 0) as monthly_boosts_used,
        p.last_boost_reset
    FROM profiles p
    WHERE p.email = 'coldwar6464x@gmail.com'
),
boost_usage AS (
    SELECT 
        COUNT(*) as actual_boosts_this_month
    FROM profile_boosts pb
    WHERE pb.user_id = (SELECT id FROM user_data)
    AND pb.started_at >= DATE_TRUNC('month', NOW())
),
active_boost AS (
    SELECT 
        COUNT(*) as active_count,
        MAX(ends_at) as active_until
    FROM profile_boosts pb
    WHERE pb.user_id = (SELECT id FROM user_data)
    AND pb.is_active = true
    AND pb.ends_at > NOW()
)
SELECT 
    ud.email,
    ud.username,
    ud.tier as subscription_tier,
    CASE ud.tier
        WHEN 'registered' THEN 0
        WHEN 'silver' THEN 1
        WHEN 'gold' THEN 3
        WHEN 'platinum' THEN 10
        WHEN 'moderator' THEN 999
        WHEN 'admin' THEN 999
        ELSE 0
    END as monthly_boost_limit,
    bu.actual_boosts_this_month as boosts_used_this_month,
    CASE ud.tier
        WHEN 'registered' THEN 0
        WHEN 'silver' THEN GREATEST(0, 1 - bu.actual_boosts_this_month)
        WHEN 'gold' THEN GREATEST(0, 3 - bu.actual_boosts_this_month)
        WHEN 'platinum' THEN GREATEST(0, 10 - bu.actual_boosts_this_month)
        WHEN 'moderator' THEN 999
        WHEN 'admin' THEN 999
        ELSE 0
    END as remaining_boosts,
    CASE 
        WHEN ab.active_count > 0 THEN true
        ELSE false
    END as has_active_boost,
    ab.active_until,
    CASE
        WHEN ud.tier = 'registered' THEN 'No boosts available for free users'
        WHEN ab.active_count > 0 THEN 'Already has an active boost until ' || ab.active_until::text
        WHEN bu.actual_boosts_this_month >= CASE ud.tier
            WHEN 'silver' THEN 1
            WHEN 'gold' THEN 3
            WHEN 'platinum' THEN 10
            ELSE 0
        END THEN 'Monthly boost limit reached'
        ELSE 'Can activate boost'
    END as boost_status
FROM user_data ud
CROSS JOIN boost_usage bu
CROSS JOIN active_boost ab;

-- 6. Check user roles (for verification)
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
SELECT 
    ur.role,
    ur.created_at
FROM user_roles ur
WHERE ur.user_id = (SELECT id FROM user_id)
ORDER BY ur.created_at DESC;