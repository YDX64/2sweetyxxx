-- Fix for Stripe customer ID mapping issue
-- This script helps map Stripe customers to Supabase users

-- 1. Check for users without stripe_customer_id
SELECT 
  p.id,
  p.email,
  p.role,
  s.stripe_customer_id
FROM profiles p
LEFT JOIN subscribers s ON p.id = s.user_id
WHERE s.stripe_customer_id IS NULL
  AND p.role IN ('silver', 'gold', 'platinum');

-- 2. To manually update a user's stripe_customer_id (if you know it from Stripe dashboard)
-- UPDATE subscribers 
-- SET stripe_customer_id = 'cus_XXXXXXXXXXXXX'  -- Replace with actual Stripe customer ID
-- WHERE user_id = (SELECT id FROM profiles WHERE email = 'coldwar6464x@gmail.com');

-- 3. Alternative: Update the webhook to better handle metadata
-- The issue is that Stripe needs to know which Supabase user is making the payment
-- This should be passed via metadata during checkout creation