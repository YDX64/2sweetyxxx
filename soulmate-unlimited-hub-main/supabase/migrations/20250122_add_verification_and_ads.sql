-- Add verified field to profiles table
ALTER TABLE profiles 
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- Add index for faster filtering by verified status
CREATE INDEX idx_profiles_verified ON profiles(verified) WHERE verified = true;

-- Create verification_requests table for tracking verification attempts
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('email', 'phone', 'id_document')),
  verification_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for verification requests
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- RLS policies for verification_requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own verification requests
CREATE POLICY "Users can create verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins/moderators can update verification requests
CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'moderator')
    )
  );

-- Add ads_disabled field to track ad preferences
ALTER TABLE profiles
ADD COLUMN ads_disabled BOOLEAN DEFAULT FALSE;

-- Create function to automatically disable ads for Silver+ users
CREATE OR REPLACE FUNCTION update_ads_disabled()
RETURNS TRIGGER AS $$
BEGIN
  -- Disable ads for Silver tier and above
  IF NEW.subscription_tier IN ('silver', 'gold', 'platinum', 'moderator', 'admin') THEN
    NEW.ads_disabled := TRUE;
  ELSE
    NEW.ads_disabled := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ads_disabled based on subscription tier
CREATE TRIGGER update_ads_disabled_trigger
BEFORE INSERT OR UPDATE OF subscription_tier ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_ads_disabled();

-- Update existing profiles to set ads_disabled based on their current tier
UPDATE profiles
SET ads_disabled = CASE 
  WHEN subscription_tier IN ('silver', 'gold', 'platinum', 'moderator', 'admin') THEN TRUE
  ELSE FALSE
END;