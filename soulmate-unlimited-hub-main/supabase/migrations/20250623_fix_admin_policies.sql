-- Fix admin RLS policies for all tables
-- Created: 2025-06-23
-- Description: Add admin bypass policies for all tables to allow admin users to see all data

-- =============================================
-- PROFILES TABLE - Admin Policies
-- =============================================

-- Drop existing admin policy if exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
        OR auth.uid() = id
        OR true -- Allow viewing all profiles for matching
    );

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
        OR auth.uid() = id
    );

-- Admin can delete any profile
CREATE POLICY "Admins can delete any profile" ON profiles
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- SUBSCRIBERS TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscribers;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscribers;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscribers
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON subscribers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON subscribers
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- USER_SUBSCRIPTIONS TABLE - Admin Policies
-- =============================================

-- Drop existing admin policy if exists
DROP POLICY IF EXISTS "Admins can view all user_subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all user_subscriptions" ON user_subscriptions;

-- Admins can view all user subscriptions
CREATE POLICY "Admins can view all user_subscriptions" ON user_subscriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
        OR auth.uid() = user_id
    );

-- Admins can manage all user subscriptions
CREATE POLICY "Admins can manage all user_subscriptions" ON user_subscriptions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- MATCHES TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;

-- Users can view their own matches
CREATE POLICY "Users can view own matches" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Admins can view all matches
CREATE POLICY "Admins can view all matches" ON matches
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- LIKES TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view relevant likes" ON likes;
DROP POLICY IF EXISTS "Admins can view all likes" ON likes;

-- Users can view likes they sent or received
CREATE POLICY "Users can view relevant likes" ON likes
    FOR SELECT USING (auth.uid() = liker_id OR auth.uid() = liked_id);

-- Admins can view all likes
CREATE POLICY "Admins can view all likes" ON likes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- MESSAGES TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

-- Users can view their own messages
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- REPORTS TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON reports;

-- Users can create reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Admins and moderators can manage all reports
CREATE POLICY "Admins can manage all reports" ON reports
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- PROFILE_VIEWS TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view who viewed them" ON profile_views;
DROP POLICY IF EXISTS "Admins can view all profile views" ON profile_views;

-- Users can see who viewed their profile
CREATE POLICY "Users can view who viewed them" ON profile_views
    FOR SELECT USING (auth.uid() = viewed_id);

-- Admins can view all profile views
CREATE POLICY "Admins can view all profile views" ON profile_views
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- SWIPES TABLE - Admin Policies
-- =============================================

-- Enable RLS if not already enabled
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own swipes" ON swipes;
DROP POLICY IF EXISTS "Admins can view all swipes" ON swipes;

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes" ON swipes
    FOR SELECT USING (auth.uid() = swiper_id);

-- Admins can view all swipes
CREATE POLICY "Admins can view all swipes" ON swipes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- =============================================
-- ADMIN FUNCTIONS
-- =============================================

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_statistics()
RETURNS TABLE (
    total_users BIGINT,
    active_users BIGINT,
    premium_users BIGINT,
    total_revenue NUMERIC
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Only allow admins to call this function
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
        (SELECT COUNT(*) FROM profiles WHERE updated_at > NOW() - INTERVAL '7 days')::BIGINT as active_users,
        (SELECT COUNT(*) FROM subscribers WHERE subscribed = true)::BIGINT as premium_users,
        COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'completed'), 0)::NUMERIC as total_revenue;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA FOR TESTING
-- =============================================

-- Update admin user profile if exists
UPDATE profiles 
SET 
    role = 'admin',
    name = COALESCE(name, 'Admin User'),
    age = COALESCE(age, 30),
    gender = COALESCE(gender, 'male'),
    bio = COALESCE(bio, 'System Administrator'),
    relationship_type = COALESCE(relationship_type, 'serious'),
    updated_at = NOW()
WHERE email = 'yunusd64@gmail.com';

-- Insert test users if they don't exist
INSERT INTO profiles (id, name, email, age, gender, role, bio, relationship_type, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'Emma Johnson', 'emma@test.com', 28, 'female', 'registered', 'Love hiking and coffee', 'serious', NOW(), NOW()),
    (gen_random_uuid(), 'James Smith', 'james@test.com', 32, 'male', 'registered', 'Entrepreneur and traveler', 'casual', NOW(), NOW()),
    (gen_random_uuid(), 'Sophia Davis', 'sophia@test.com', 26, 'female', 'registered', 'Artist and dreamer', 'friendship', NOW(), NOW()),
    (gen_random_uuid(), 'Oliver Wilson', 'oliver@test.com', 29, 'male', 'registered', 'Software developer', 'serious', NOW(), NOW()),
    (gen_random_uuid(), 'Isabella Brown', 'isabella@test.com', 24, 'female', 'registered', 'Yoga instructor', 'casual', NOW(), NOW()),
    (gen_random_uuid(), 'Lucas Anderson', 'lucas@test.com', 35, 'male', 'registered', 'Chef and food lover', 'marriage', NOW(), NOW()),
    (gen_random_uuid(), 'Mia Taylor', 'mia@test.com', 27, 'female', 'registered', 'Photographer', 'serious', NOW(), NOW()),
    (gen_random_uuid(), 'Ethan Martinez', 'ethan@test.com', 31, 'male', 'registered', 'Fitness enthusiast', 'casual', NOW(), NOW()),
    (gen_random_uuid(), 'Charlotte Lee', 'charlotte@test.com', 25, 'female', 'registered', 'Teacher and bookworm', 'serious', NOW(), NOW()),
    (gen_random_uuid(), 'Noah White', 'noah@test.com', 30, 'male', 'registered', 'Musician', 'friendship', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Add some test subscriptions
INSERT INTO subscribers (id, user_id, tier, subscribed, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    id,
    CASE 
        WHEN random() < 0.3 THEN 'silver'
        WHEN random() < 0.5 THEN 'gold'
        ELSE 'registered'
    END,
    CASE 
        WHEN random() < 0.4 THEN true
        ELSE false
    END,
    NOW(),
    NOW()
FROM profiles
WHERE email LIKE '%@test.com'
ON CONFLICT DO NOTHING;