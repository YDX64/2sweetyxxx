-- Check boost status for user coldwar6464x@gmail.com

-- 1. Get user profile information including subscription tier and boost usage
SELECT 
    p.id,
    p.email,
    p.username,
    p.subscription_tier,
    p.role,
    p.monthly_boosts_used,
    p.last_boost_reset,
    p.daily_boosts_used,
    p.daily_boosts,
    -- Calculate days since last reset
    CURRENT_DATE - p.last_boost_reset AS days_since_reset,
    -- Get month start for comparison
    date_trunc('month', CURRENT_DATE) AS current_month_start
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 2. Get subscription tier limits based on TIER_FEATURES
SELECT 
    CASE 
        WHEN p.subscription_tier = 'registered' THEN 0
        WHEN p.subscription_tier = 'silver' THEN 1
        WHEN p.subscription_tier = 'gold' THEN 3
        WHEN p.subscription_tier = 'platinum' THEN 10
        WHEN p.subscription_tier IN ('admin', 'moderator') THEN 999
        ELSE 0
    END AS monthly_boost_limit,
    p.subscription_tier,
    p.role
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 3. Count boosts used this month from profile_boosts table
SELECT 
    COUNT(*) AS monthly_boosts_from_table,
    MAX(pb.created_at) AS last_boost_date
FROM profile_boosts pb
JOIN profiles p ON pb.user_id = p.id
WHERE p.email = 'coldwar6464x@gmail.com'
AND pb.created_at >= date_trunc('month', CURRENT_DATE);

-- 4. Check for any currently active boosts
SELECT 
    pb.id AS boost_id,
    pb.boost_type,
    pb.duration_minutes,
    pb.started_at,
    pb.ends_at,
    pb.is_active,
    CASE 
        WHEN pb.ends_at > NOW() THEN 'Active'
        ELSE 'Expired'
    END AS status,
    pb.ends_at - NOW() AS time_remaining
FROM profile_boosts pb
JOIN profiles p ON pb.user_id = p.id
WHERE p.email = 'coldwar6464x@gmail.com'
AND pb.is_active = true
ORDER BY pb.created_at DESC
LIMIT 5;

-- 5. Summary with calculated remaining boosts
WITH user_info AS (
    SELECT 
        p.id,
        p.email,
        p.username,
        p.subscription_tier,
        p.role,
        p.monthly_boosts_used,
        CASE 
            WHEN p.subscription_tier = 'registered' THEN 0
            WHEN p.subscription_tier = 'silver' THEN 1
            WHEN p.subscription_tier = 'gold' THEN 3
            WHEN p.subscription_tier = 'platinum' THEN 10
            WHEN p.subscription_tier IN ('admin', 'moderator') THEN 999
            ELSE 0
        END AS monthly_limit
    FROM profiles p
    WHERE p.email = 'coldwar6464x@gmail.com'
),
monthly_usage AS (
    SELECT 
        COUNT(*) AS boosts_used_this_month
    FROM profile_boosts pb
    JOIN profiles p ON pb.user_id = p.id
    WHERE p.email = 'coldwar6464x@gmail.com'
    AND pb.created_at >= date_trunc('month', CURRENT_DATE)
),
active_boost AS (
    SELECT 
        pb.id IS NOT NULL AS has_active_boost,
        pb.ends_at
    FROM profiles p
    LEFT JOIN profile_boosts pb ON pb.user_id = p.id 
        AND pb.is_active = true 
        AND pb.ends_at > NOW()
    WHERE p.email = 'coldwar6464x@gmail.com'
    LIMIT 1
)
SELECT 
    ui.email,
    ui.username,
    ui.subscription_tier,
    ui.role,
    ui.monthly_limit AS monthly_boost_limit,
    mu.boosts_used_this_month,
    ui.monthly_limit - mu.boosts_used_this_month AS remaining_boosts,
    ab.has_active_boost,
    ab.ends_at AS active_boost_ends_at,
    CASE 
        WHEN ab.has_active_boost THEN 'Cannot boost - Active boost exists'
        WHEN mu.boosts_used_this_month >= ui.monthly_limit THEN 'Cannot boost - Monthly limit reached'
        ELSE 'Can boost'
    END AS boost_status
FROM user_info ui
CROSS JOIN monthly_usage mu
CROSS JOIN active_boost ab;

-- 6. Get user role assignments for verification
SELECT 
    ur.role,
    ur.assigned_at,
    ur.assigned_by
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email = 'coldwar6464x@gmail.com'
ORDER BY ur.assigned_at DESC;