-- This script ensures your Gold subscription is properly synced across all tables

-- First, let's check your current subscription status
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

-- Update your profile to ensure Gold subscription is active
UPDATE profiles 
SET 
    role = 'gold',
    subscription_tier = 'gold',
    subscription_status = 'active'
WHERE email = 'YOUR_EMAIL_HERE';

-- Ensure subscribers table is also updated
INSERT INTO subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
    id,
    email,
    true,
    'gold',
    (CURRENT_DATE + INTERVAL '30 days')::timestamp
FROM profiles
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (user_id) 
DO UPDATE SET
    subscribed = true,
    subscription_tier = 'gold',
    subscription_end = (CURRENT_DATE + INTERVAL '30 days')::timestamp,
    updated_at = NOW();

-- Verify the update
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