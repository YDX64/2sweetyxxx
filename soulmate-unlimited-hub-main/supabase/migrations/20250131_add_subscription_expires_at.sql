-- Add subscription_expires_at column to profiles table
-- This column tracks when a user's subscription expires

-- Add the column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

-- Update existing premium users with expiration dates from subscribers table
UPDATE profiles p
SET subscription_expires_at = s.subscription_end
FROM subscribers s
WHERE p.id = s.user_id
  AND s.subscribed = true
  AND s.subscription_end IS NOT NULL
  AND p.subscription_tier IN ('silver', 'gold', 'platinum');

-- Create or replace the sync function to include subscription_expires_at
CREATE OR REPLACE FUNCTION sync_subscription_data()
RETURNS TRIGGER AS $$
BEGIN
  -- When role is updated in profiles, sync subscription_tier and status
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.subscription_tier = NEW.role;
    NEW.subscription_status = CASE 
      WHEN NEW.role IN ('silver', 'gold', 'platinum', 'admin', 'moderator') THEN 'active'
      ELSE 'inactive'
    END;
    
    -- Set expiration date for premium tiers
    IF NEW.role IN ('silver', 'gold', 'platinum') AND NEW.subscription_expires_at IS NULL THEN
      NEW.subscription_expires_at = (CURRENT_TIMESTAMP + INTERVAL '30 days')::timestamptz;
    ELSIF NEW.role = 'registered' THEN
      NEW.subscription_expires_at = NULL;
    END IF;
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
    NEW.subscription_expires_at,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id) DO UPDATE SET
    subscribed = EXCLUDED.subscribed,
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_end = EXCLUDED.subscription_end,
    updated_at = CURRENT_TIMESTAMP;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS sync_subscription_trigger ON profiles;
CREATE TRIGGER sync_subscription_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_subscription_data();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at 
ON profiles(subscription_expires_at) 
WHERE subscription_expires_at IS NOT NULL;