-- Fix Gold subscription sync issue for rewind feature
-- Replace YOUR_EMAIL_HERE with your actual email address

-- First, check current status
SELECT 
    id,
    email,
    role,
    subscription_tier,
    subscription_status
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE';

-- Update profile to ensure Gold subscription is properly set
UPDATE profiles 
SET 
    role = 'gold',
    subscription_tier = 'gold',
    subscription_status = 'active'
WHERE email = 'YOUR_EMAIL_HERE';

-- Also ensure the subscribers table is updated
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
    id,
    email,
    true,
    'gold',
    (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamp,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (user_id) 
DO UPDATE SET
    subscribed = true,
    subscription_tier = 'gold',
    subscription_end = (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamp,
    updated_at = CURRENT_TIMESTAMP;

-- Verify the fix
SELECT 
    p.id,
    p.email,
    p.role,
    p.subscription_tier,
    p.subscription_status,
    s.subscribed,
    s.subscription_tier as sub_tier,
    s.subscription_end
FROM profiles p
LEFT JOIN subscribers s ON p.id = s.user_id
WHERE p.email = 'YOUR_EMAIL_HERE';

-- Check if user has any swipes to rewind
SELECT 
    id,
    user_id,
    target_user_id,
    direction,
    created_at
FROM swipes
WHERE user_id = (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL_HERE')
ORDER BY created_at DESC
LIMIT 5;