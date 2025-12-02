-- Add Row Level Security Policies Migration
-- Created: 2025-06-14
-- Description: Creates RLS policies for all premium feature tables

-- =============================================
-- ENABLE RLS ON ALL PREMIUM TABLES
-- =============================================

ALTER TABLE profile_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewind_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_changes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILE BOOSTS POLICIES
-- =============================================

-- Users can view their own boosts
CREATE POLICY "Users can view own profile boosts" ON profile_boosts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own boosts
CREATE POLICY "Users can create own profile boosts" ON profile_boosts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own boosts
CREATE POLICY "Users can update own profile boosts" ON profile_boosts
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all boosts
CREATE POLICY "Admins can view all profile boosts" ON profile_boosts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- VIDEO PROFILES POLICIES
-- =============================================

-- Users can view their own video profiles
CREATE POLICY "Users can view own video profiles" ON video_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own video profiles
CREATE POLICY "Users can create own video profiles" ON video_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own video profiles
CREATE POLICY "Users can update own video profiles" ON video_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Other users can view approved video profiles
CREATE POLICY "Users can view approved video profiles" ON video_profiles
    FOR SELECT USING (status = 'approved');

-- Admins and moderators can view and manage all video profiles
CREATE POLICY "Admins can manage all video profiles" ON video_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- USER ACTIVITIES POLICIES
-- =============================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can create own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all activities
CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- FEATURE USAGE LOGS POLICIES
-- =============================================

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs" ON feature_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage logs
CREATE POLICY "Users can create own usage logs" ON feature_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage logs
CREATE POLICY "Users can update own usage logs" ON feature_usage_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all usage logs
CREATE POLICY "Admins can view all usage logs" ON feature_usage_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- REWIND ACTIONS POLICIES
-- =============================================

-- Users can view their own rewind actions
CREATE POLICY "Users can view own rewind actions" ON rewind_actions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own rewind actions
CREATE POLICY "Users can create own rewind actions" ON rewind_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rewind actions
CREATE POLICY "Users can update own rewind actions" ON rewind_actions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all rewind actions
CREATE POLICY "Admins can view all rewind actions" ON rewind_actions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- PROFILE VIEWS POLICIES
-- =============================================

-- Users can view who viewed their profile (premium feature)
CREATE POLICY "Users can view their profile viewers" ON profile_views
    FOR SELECT USING (auth.uid() = viewed_id);

-- Users can see their own viewing history
CREATE POLICY "Users can view own viewing history" ON profile_views
    FOR SELECT USING (auth.uid() = viewer_id);

-- Users can create profile view records
CREATE POLICY "Users can create profile views" ON profile_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Admins can view all profile views
CREATE POLICY "Admins can view all profile views" ON profile_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- LOCATION CHANGES POLICIES (Passport Feature)
-- =============================================

-- Users can view their own location changes
CREATE POLICY "Users can view own location changes" ON location_changes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own location changes
CREATE POLICY "Users can create own location changes" ON location_changes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own location changes
CREATE POLICY "Users can update own location changes" ON location_changes
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all location changes
CREATE POLICY "Admins can view all location changes" ON location_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- SERVICE ROLE POLICIES (for backend operations)
-- =============================================

-- Allow service role to perform all operations on all tables
-- This is needed for scheduled functions and administrative tasks

CREATE POLICY "Service role can manage profile boosts" ON profile_boosts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage video profiles" ON video_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user activities" ON user_activities
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage feature usage logs" ON feature_usage_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage rewind actions" ON rewind_actions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage profile views" ON profile_views
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage location changes" ON location_changes
    FOR ALL USING (auth.role() = 'service_role');