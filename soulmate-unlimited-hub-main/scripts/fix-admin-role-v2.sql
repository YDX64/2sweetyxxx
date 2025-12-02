-- Check current user roles
SELECT 
  p.id,
  p.email,
  p.name,
  ur.role as user_role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'yunusd64@gmail.com';

-- Make sure user has admin role
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT 
  id, 
  'admin'::text,
  NOW(),
  NOW()
FROM profiles 
WHERE email = 'yunusd64@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- Also ensure user has platinum subscription for testing
INSERT INTO user_subscriptions (user_id, tier, status, created_at, updated_at)
SELECT 
  id,
  'platinum',
  'active',
  NOW(),
  NOW()
FROM profiles
WHERE email = 'yunusd64@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET
  tier = 'platinum',
  status = 'active',
  updated_at = NOW();

-- Verify the changes
SELECT 
  p.id,
  p.email,
  p.name,
  ur.role as user_role,
  us.tier as subscription_tier,
  us.status as subscription_status
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN user_subscriptions us ON us.user_id = p.id
WHERE p.email = 'yunusd64@gmail.com';