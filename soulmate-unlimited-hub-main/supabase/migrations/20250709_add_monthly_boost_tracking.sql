-- Add monthly boost tracking columns to profiles table

-- Add columns for monthly boost tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS monthly_boosts_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_boost_reset DATE DEFAULT CURRENT_DATE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_boosts ON profiles(monthly_boosts_used);
CREATE INDEX IF NOT EXISTS idx_profiles_last_boost_reset ON profiles(last_boost_reset);

-- Function to reset monthly boosts
CREATE OR REPLACE FUNCTION reset_monthly_boosts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE profiles 
    SET 
        monthly_boosts_used = 0,
        last_boost_reset = CURRENT_DATE
    WHERE last_boost_reset < CURRENT_DATE;
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION reset_monthly_boosts() TO service_role;