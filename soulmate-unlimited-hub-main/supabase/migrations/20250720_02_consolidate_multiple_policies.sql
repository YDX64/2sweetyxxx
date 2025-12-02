-- =============================================
-- SUPABASE RLS PERFORMANCE OPTIMIZATION - PHASE 2
-- Created: 2025-07-20
-- Description: Consolidate multiple permissive policies for optimal performance
-- Issue: Multiple policies for same role+action combinations cause redundant evaluations
-- Solution: Merge overlapping policies into single consolidated policies
-- =============================================

-- =============================================
-- PROFILE_BOOSTS TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Users can view own profile boosts" ON profile_boosts;
DROP POLICY IF EXISTS "Users can create own profile boosts" ON profile_boosts;
DROP POLICY IF EXISTS "Users can update own profile boosts" ON profile_boosts;
DROP POLICY IF EXISTS "Admins can view all profile boosts" ON profile_boosts;
DROP POLICY IF EXISTS "Service role can manage profile boosts" ON profile_boosts;

-- Create consolidated policies
CREATE POLICY "profile_boosts_unified_select" ON profile_boosts
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "profile_boosts_unified_insert" ON profile_boosts
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "profile_boosts_unified_update" ON profile_boosts
    FOR UPDATE USING (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- VIDEO_PROFILES TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Users can view own video profiles" ON video_profiles;
DROP POLICY IF EXISTS "Users can view approved video profiles" ON video_profiles;
DROP POLICY IF EXISTS "Users can create own video profiles" ON video_profiles;
DROP POLICY IF EXISTS "Users can update own video profiles" ON video_profiles;
DROP POLICY IF EXISTS "Admins can manage all video profiles" ON video_profiles;
DROP POLICY IF EXISTS "Service role can manage video profiles" ON video_profiles;

-- Create consolidated policies
CREATE POLICY "video_profiles_unified_select" ON video_profiles
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        (status = 'approved' AND is_active = true) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "video_profiles_unified_insert" ON video_profiles
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "video_profiles_unified_update" ON video_profiles
    FOR UPDATE USING (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "video_profiles_unified_delete" ON video_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- FEATURE_USAGE_LOGS TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Users can view own usage logs" ON feature_usage_logs;
DROP POLICY IF EXISTS "Users can create own usage logs" ON feature_usage_logs;
DROP POLICY IF EXISTS "Users can update own usage logs" ON feature_usage_logs;
DROP POLICY IF EXISTS "Admins can view all usage logs" ON feature_usage_logs;
DROP POLICY IF EXISTS "Service role can manage feature usage logs" ON feature_usage_logs;

-- Create consolidated policies
CREATE POLICY "feature_usage_logs_unified_select" ON feature_usage_logs
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "feature_usage_logs_unified_insert" ON feature_usage_logs
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "feature_usage_logs_unified_update" ON feature_usage_logs
    FOR UPDATE USING (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- LOCATION_CHANGES TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Users can view own location changes" ON location_changes;
DROP POLICY IF EXISTS "Users can create own location changes" ON location_changes;
DROP POLICY IF EXISTS "Users can update own location changes" ON location_changes;
DROP POLICY IF EXISTS "Admins can view all location changes" ON location_changes;
DROP POLICY IF EXISTS "Service role can manage location changes" ON location_changes;

-- Create consolidated policies
CREATE POLICY "location_changes_unified_select" ON location_changes
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "location_changes_unified_insert" ON location_changes
    FOR INSERT WITH CHECK (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "location_changes_unified_update" ON location_changes
    FOR UPDATE USING (
        (select auth.uid()) = user_id OR
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- PROFILE_VIEWS TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Users can view own viewing history" ON profile_views;
DROP POLICY IF EXISTS "Users can view their profile viewers" ON profile_views;
DROP POLICY IF EXISTS "Users can create profile views" ON profile_views;
DROP POLICY IF EXISTS "Admins can view all profile views" ON profile_views;
DROP POLICY IF EXISTS "Service role can manage profile views" ON profile_views;

-- Create consolidated policies
CREATE POLICY "profile_views_unified_select" ON profile_views
    FOR SELECT USING (
        (select auth.uid()) = viewer_id OR
        (select auth.uid()) = viewed_profile_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        ) OR
        (select current_setting('role', true)) = 'service_role'
    );

CREATE POLICY "profile_views_unified_insert" ON profile_views
    FOR INSERT WITH CHECK (
        (select auth.uid()) = viewer_id OR
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- USER_PREFERENCES TABLE CONSOLIDATION
-- =============================================

-- Drop duplicate policies (some already optimized in previous migration)
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- The main policies were already optimized in the previous migration
-- Just ensure no duplicates remain

-- =============================================
-- USER_ROLES TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "Allow users to read their own roles" ON user_roles;

-- Create consolidated policy for reading roles
CREATE POLICY "user_roles_unified_select" ON user_roles
    FOR SELECT USING (
        (select auth.uid()) = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- AD_PLACEMENTS TABLE CONSOLIDATION
-- =============================================

-- Drop multiple overlapping policies
DROP POLICY IF EXISTS "ad_placements_read_authenticated" ON ad_placements;

-- Create unified policy for ad placements
CREATE POLICY "ad_placements_unified_select" ON ad_placements
    FOR SELECT USING (
        is_active = true OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- ANALYTICS_EVENTS TABLE CONSOLIDATION
-- Already optimized in previous migration, ensuring no duplicates

-- =============================================
-- DISCOVERY_QUEUE TABLE CONSOLIDATION
-- Already optimized in previous migration, ensuring no duplicates

-- =============================================
-- MATCHING_SCORES TABLE CONSOLIDATION
-- Already optimized in previous migration, ensuring no duplicates

-- =============================================
-- PROFILES TABLE CONSOLIDATION
-- =============================================

-- Drop any remaining duplicate policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create unified read policy for profiles
CREATE POLICY "profiles_unified_select" ON profiles
    FOR SELECT USING (
        true -- All users can view profiles (public dating app)
    );

-- =============================================
-- CREATE PERFORMANCE MONITORING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION rls_performance_report()
RETURNS TABLE (
    table_name text,
    policy_count bigint,
    optimization_status text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        COUNT(*) as policy_count,
        CASE 
            WHEN COUNT(*) <= 3 THEN 'Optimized'
            WHEN COUNT(*) <= 5 THEN 'Good'
            ELSE 'Needs Review'
        END as optimization_status
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
    ORDER BY policy_count DESC;
END;
$$;

-- Add comment for tracking
COMMENT ON FUNCTION rls_performance_report() IS 'Monitor RLS policy count per table - 2025-07-20';

-- =============================================
-- CLEANUP AND VERIFICATION
-- =============================================

-- Analyze tables for better query planning
ANALYZE profiles;
ANALYZE user_roles;
ANALYZE user_preferences;
ANALYZE notifications;
ANALYZE subscriptions;
ANALYZE profile_boosts;
ANALYZE video_profiles;
ANALYZE feature_usage_logs;
ANALYZE location_changes;
ANALYZE profile_views;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';