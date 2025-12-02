-- Test subscription update for coldwar6464x@gmail.com
-- This will temporarily change their subscription to test if UI updates

-- First, let's see current state
SELECT 
  p.id,
  p.email,
  p.role as profile_role,
  s.subscription_tier as subscriber_tier
FROM profiles p
LEFT JOIN subscribers s ON p.id = s.user_id
WHERE p.email = 'coldwar6464x@gmail.com';

-- Update to registered to test
UPDATE profiles 
SET role = 'registered'
WHERE email = 'coldwar6464x@gmail.com';

UPDATE subscribers 
SET subscription_tier = 'registered', subscribed = false
WHERE user_id = (SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com');

-- To restore back to gold:
-- UPDATE profiles SET role = 'gold' WHERE email = 'coldwar6464x@gmail.com';
-- UPDATE subscribers SET subscription_tier = 'gold', subscribed = true WHERE user_id = (SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com');