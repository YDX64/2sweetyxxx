-- Fix boost issues for Gold user: coldwar6464x@gmail.com

-- 1. First, let's check the user's current status
SELECT 
    p.id,
    p.email,
    p.username,
    p.role,
    p.subscription_tier,
    p.monthly_boosts_used,
    p.daily_boosts_used,
    p.last_boost_reset,
    CURRENT_DATE,
    DATE_TRUNC('month', CURRENT_DATE) as current_month_start,
    CASE 
        WHEN p.last_boost_reset IS NULL OR p.last_boost_reset < DATE_TRUNC('month', CURRENT_DATE) 
        THEN 'Needs reset - last reset was before this month'
        ELSE 'Reset is current'
    END as reset_status
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 2. Check actual boost usage this month from profile_boosts table
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
SELECT 
    COUNT(*) as actual_boosts_used_this_month,
    MIN(started_at) as first_boost_this_month,
    MAX(started_at) as last_boost_this_month
FROM profile_boosts pb
WHERE pb.user_id = (SELECT id FROM user_id)
AND pb.started_at >= DATE_TRUNC('month', CURRENT_DATE);

-- 3. Fix the user's subscription data and reset monthly counter if needed
-- This will ensure Gold user has correct tier and reset monthly boost counter
UPDATE profiles
SET 
    subscription_tier = 'gold',
    role = 'gold',
    monthly_boosts_used = 0,
    last_boost_reset = CURRENT_TIMESTAMP
WHERE email = 'coldwar6464x@gmail.com'
AND (
    -- Only reset if it's a new month or never been reset
    last_boost_reset IS NULL 
    OR last_boost_reset < DATE_TRUNC('month', CURRENT_DATE)
);

-- 4. Alternative: Set the exact number of boosts used based on actual usage
WITH boost_count AS (
    SELECT 
        p.id,
        COUNT(pb.id) as actual_boosts_this_month
    FROM profiles p
    LEFT JOIN profile_boosts pb ON pb.user_id = p.id 
        AND pb.started_at >= DATE_TRUNC('month', CURRENT_DATE)
    WHERE p.email = 'coldwar6464x@gmail.com'
    GROUP BY p.id
)
UPDATE profiles p
SET 
    monthly_boosts_used = bc.actual_boosts_this_month,
    subscription_tier = 'gold',
    role = 'gold'
FROM boost_count bc
WHERE p.id = bc.id;

-- 5. Verify the fix - check updated status
SELECT 
    p.email,
    p.username,
    p.role,
    p.subscription_tier,
    p.monthly_boosts_used,
    3 as gold_monthly_limit,
    3 - COALESCE(p.monthly_boosts_used, 0) as remaining_boosts,
    p.last_boost_reset,
    CASE 
        WHEN p.monthly_boosts_used >= 3 THEN 'Monthly limit reached'
        ELSE 'Can use boost (' || (3 - COALESCE(p.monthly_boosts_used, 0)) || ' remaining)'
    END as boost_status
FROM profiles p
WHERE p.email = 'coldwar6464x@gmail.com';

-- 6. Make sure user has gold role in user_roles table
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
INSERT INTO user_roles (user_id, role)
SELECT 
    (SELECT id FROM user_id),
    'gold'
WHERE NOT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = (SELECT id FROM user_id) 
    AND role = 'gold'
);

-- 7. Remove any duplicate or incorrect roles
WITH user_id AS (
    SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com'
)
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM user_id)
AND role NOT IN ('gold', 'registered');

-- 8. Final status check
SELECT 
    p.email,
    p.subscription_tier,
    p.monthly_boosts_used,
    3 - COALESCE(p.monthly_boosts_used, 0) as remaining_boosts,
    array_agg(ur.role) as user_roles
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'coldwar6464x@gmail.com'
GROUP BY p.id, p.email, p.subscription_tier, p.monthly_boosts_used;