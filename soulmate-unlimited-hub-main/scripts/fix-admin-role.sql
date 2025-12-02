-- Check current user roles
SELECT 
  p.id,
  p.email,
  p.name,
  ur.role as user_role,
  p.subscription_tier
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

-- Verify the change
SELECT 
  p.id,
  p.email,
  p.name,
  ur.role as user_role,
  p.subscription_tier
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.email = 'yunusd64@gmail.com';