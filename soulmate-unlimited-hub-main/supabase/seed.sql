-- Seed data for testing
-- This file adds test data to the database

-- First, ensure we have a test admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID (yunusd64@gmail.com)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'yunusd64@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Update or insert profile with admin role
    INSERT INTO public.profiles (
      id, 
      name, 
      email, 
      age, 
      gender, 
      role, 
      bio,
      relationship_type,
      updated_at
    ) VALUES (
      admin_user_id,
      'Admin User',
      'yunusd64@gmail.com',
      30,
      'male',
      'admin',
      'System Administrator',
      'serious',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      name = COALESCE(profiles.name, 'Admin User'),
      age = COALESCE(profiles.age, 30),
      gender = COALESCE(profiles.gender, 'male'),
      relationship_type = COALESCE(profiles.relationship_type, 'serious'),
      updated_at = NOW();
  END IF;
END $$;

-- Add some test users
INSERT INTO public.profiles (id, name, email, age, gender, role, bio, relationship_type, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Test User 1', 'test1@example.com', 25, 'female', 'registered', 'Looking for love', 'serious', NOW(), NOW()),
  (gen_random_uuid(), 'Test User 2', 'test2@example.com', 28, 'male', 'registered', 'Ready to mingle', 'casual', NOW(), NOW()),
  (gen_random_uuid(), 'Test User 3', 'test3@example.com', 22, 'female', 'registered', 'New to dating', 'friendship', NOW(), NOW()),
  (gen_random_uuid(), 'Test User 4', 'test4@example.com', 35, 'male', 'registered', 'Seeking partner', 'marriage', NOW(), NOW()),
  (gen_random_uuid(), 'Test User 5', 'test5@example.com', 27, 'female', 'registered', 'Happy and single', 'casual', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Add some test subscriptions
INSERT INTO public.subscribers (id, user_id, tier, subscribed, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  CASE 
    WHEN random() < 0.3 THEN 'silver'
    WHEN random() < 0.6 THEN 'gold'
    ELSE 'registered'
  END,
  CASE 
    WHEN random() < 0.5 THEN true
    ELSE false
  END,
  NOW(),
  NOW()
FROM public.profiles
WHERE email LIKE 'test%@example.com'
ON CONFLICT DO NOTHING;

-- Update subscriber count
UPDATE public.profiles
SET role = s.tier
FROM public.subscribers s
WHERE profiles.id = s.user_id AND s.subscribed = true;