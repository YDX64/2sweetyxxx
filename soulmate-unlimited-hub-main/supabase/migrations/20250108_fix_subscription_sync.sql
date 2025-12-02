-- Fix subscription synchronization issues
-- This migration ensures subscription data is properly synced across tables

-- 1. Add missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'registered',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

-- 2. Create a function to sync subscription data
CREATE OR REPLACE FUNCTION sync_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
  -- When role is updated in profiles, sync subscription_tier
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.subscription_tier = NEW.role;
    NEW.subscription_status = CASE 
      WHEN NEW.role IN ('silver', 'gold', 'platinum', 'admin', 'moderator') THEN 'active'
      ELSE 'inactive'
    END;
  END IF;
  
  -- Sync with subscribers table
  INSERT INTO subscribers (
    user_id,
    email,
    subscribed,
    subscription_tier,
    subscription_end,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.role IN ('silver', 'gold', 'platinum', 'admin', 'moderator'),
    NEW.role,
    CASE 
      WHEN NEW.role IN ('silver', 'gold', 'platinum') THEN (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamp
      ELSE NULL
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscribed = EXCLUDED.subscribed,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_end = CASE 
      WHEN EXCLUDED.subscription_tier IN ('silver', 'gold', 'platinum') 
        AND (subscribers.subscription_end IS NULL OR subscribers.subscription_end < CURRENT_TIMESTAMP)
      THEN EXCLUDED.subscription_end
      ELSE subscribers.subscription_end
    END,
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to auto-sync on profile updates
DROP TRIGGER IF EXISTS sync_subscription_on_profile_update ON profiles;
CREATE TRIGGER sync_subscription_on_profile_update
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_subscription_data();

-- 4. Fix existing data - sync all current subscriptions
UPDATE profiles 
SET 
  subscription_tier = COALESCE(subscription_tier, role),
  subscription_status = CASE 
    WHEN role IN ('silver', 'gold', 'platinum', 'admin', 'moderator') THEN 'active'
    ELSE 'inactive'
  END
WHERE subscription_tier IS NULL OR subscription_tier != role;

-- 5. Ensure all premium users have entries in subscribers table
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
  p.id,
  p.email,
  true,
  p.role,
  COALESCE(s.subscription_end, (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamp),
  COALESCE(s.created_at, CURRENT_TIMESTAMP),
  CURRENT_TIMESTAMP
FROM profiles p
LEFT JOIN subscribers s ON p.id = s.user_id
WHERE p.role IN ('silver', 'gold', 'platinum', 'admin', 'moderator')
ON CONFLICT (user_id) DO UPDATE SET
  subscribed = true,
  subscription_tier = EXCLUDED.subscription_tier,
  updated_at = CURRENT_TIMESTAMP;

-- 6. Create function to handle Stripe webhook updates
CREATE OR REPLACE FUNCTION handle_stripe_subscription_update(
  p_user_id uuid,
  p_tier text,
  p_status text,
  p_subscription_id text DEFAULT NULL,
  p_subscription_end timestamp DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Update profiles table
  UPDATE profiles 
  SET 
    role = p_tier,
    subscription_tier = p_tier,
    subscription_status = p_status,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_user_id;
  
  -- Update subscribers table
  INSERT INTO subscribers (
    user_id,
    email,
    subscribed,
    subscription_tier,
    subscription_end,
    stripe_subscription_id,
    created_at,
    updated_at
  )
  SELECT 
    p_user_id,
    email,
    p_status = 'active',
    p_tier,
    p_subscription_end,
    p_subscription_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM profiles
  WHERE id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    subscribed = p_status = 'active',
    subscription_tier = p_tier,
    subscription_end = COALESCE(p_subscription_end, subscribers.subscription_end),
    stripe_subscription_id = COALESCE(p_subscription_id, subscribers.stripe_subscription_id),
    updated_at = CURRENT_TIMESTAMP;
    
  -- Update subscriptions table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    INSERT INTO subscriptions (
      user_id,
      status,
      subscription_tier,
      current_period_end,
      stripe_subscription_id,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      p_status,
      p_tier,
      p_subscription_end,
      p_subscription_id,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id) DO UPDATE SET
      status = p_status,
      subscription_tier = p_tier,
      current_period_end = COALESCE(p_subscription_end, subscriptions.current_period_end),
      stripe_subscription_id = COALESCE(p_subscription_id, subscriptions.stripe_subscription_id),
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_tier ON subscribers(subscription_tier);

-- 8. Grant necessary permissions
GRANT EXECUTE ON FUNCTION sync_subscription_data() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_stripe_subscription_update(uuid, text, text, text, timestamp) TO service_role;