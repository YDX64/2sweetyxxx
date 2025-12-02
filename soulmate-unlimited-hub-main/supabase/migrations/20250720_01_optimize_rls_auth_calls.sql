-- =============================================
-- SUPABASE RLS PERFORMANCE OPTIMIZATION - PHASE 1
-- Created: 2025-07-20
-- Description: Fix auth.uid() and current_setting() calls for optimal performance
-- Issue: Functions are re-evaluated for every row causing severe performance degradation
-- Solution: Wrap function calls in subqueries for single evaluation per query
-- =============================================

-- First, let's create a helper function for better performance
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- =============================================
-- PROFILES TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies that use auth.uid() directly
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create optimized policies using subqueries
CREATE POLICY "profiles_users_update_own" ON profiles
    FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "profiles_users_insert_own" ON profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_users_delete_own" ON profiles
    FOR DELETE USING ((select auth.uid()) = id);

CREATE POLICY "profiles_service_role_insert" ON profiles
    FOR INSERT WITH CHECK (
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- USER_ROLES TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Allow admins to manage all roles" ON user_roles;

-- Create optimized policy
CREATE POLICY "user_roles_admin_manage_all" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- USER_PREFERENCES TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Create optimized policies
CREATE POLICY "user_preferences_users_select_own" ON user_preferences
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "user_preferences_users_insert_own" ON user_preferences
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_preferences_users_update_own" ON user_preferences
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- =============================================
-- NOTIFICATIONS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create optimized policies
CREATE POLICY "notifications_users_select_own" ON notifications
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "notifications_users_update_own" ON notifications
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- =============================================
-- SUBSCRIPTIONS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON subscriptions;

-- Create optimized policies
CREATE POLICY "subscriptions_users_select_own" ON subscriptions
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "subscriptions_system_manage_all" ON subscriptions
    FOR ALL USING (
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- USER_SUBSCRIPTIONS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;

-- Create optimized policy
CREATE POLICY "user_subscriptions_users_select_own" ON user_subscriptions
    FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================
-- BOOSTS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own boosts" ON boosts;
DROP POLICY IF EXISTS "Users can insert own boosts" ON boosts;

-- Create optimized policies
CREATE POLICY "boosts_users_select_own" ON boosts
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "boosts_users_insert_own" ON boosts
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- =============================================
-- USER_BOOSTS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own boosts" ON user_boosts;
DROP POLICY IF EXISTS "System can manage boosts" ON user_boosts;

-- Create optimized policies
CREATE POLICY "user_boosts_users_select_own" ON user_boosts
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "user_boosts_system_manage_all" ON user_boosts
    FOR ALL USING (
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- VERIFICATION_REQUESTS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON verification_requests;

-- Create optimized policies
CREATE POLICY "verification_requests_users_select_own" ON verification_requests
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "verification_requests_users_insert_own" ON verification_requests
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "verification_requests_admins_update" ON verification_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- SITE_CONFIGURATION TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage site configuration" ON site_configuration;

-- Create optimized policy
CREATE POLICY "site_configuration_admins_manage" ON site_configuration
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- ANALYTICS_EVENTS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON analytics_events;

-- Create optimized policies
CREATE POLICY "analytics_events_users_select_own" ON analytics_events
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "analytics_events_admins_select_all" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- MODERATOR_PERMISSIONS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_can_view_moderator_permissions" ON moderator_permissions;
DROP POLICY IF EXISTS "admins_can_insert_moderator_permissions" ON moderator_permissions;
DROP POLICY IF EXISTS "admins_can_update_moderator_permissions" ON moderator_permissions;
DROP POLICY IF EXISTS "admins_can_delete_moderator_permissions" ON moderator_permissions;

-- Create optimized policies
CREATE POLICY "moderator_permissions_admins_all" ON moderator_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- AD_PLACEMENTS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "ad_placements_write_admin_only" ON ad_placements;

-- Create optimized policy
CREATE POLICY "ad_placements_admins_write" ON ad_placements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- RATE_LIMIT_TRACKING TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "rate_limit_tracking_user_read_own" ON rate_limit_tracking;
DROP POLICY IF EXISTS "rate_limit_tracking_user_insert_own" ON rate_limit_tracking;
DROP POLICY IF EXISTS "rate_limit_tracking_admin_read_all" ON rate_limit_tracking;

-- Create optimized policies
CREATE POLICY "rate_limit_tracking_users_select_own" ON rate_limit_tracking
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "rate_limit_tracking_users_insert_own" ON rate_limit_tracking
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "rate_limit_tracking_admins_select_all" ON rate_limit_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role IN ('admin', 'moderator')
        )
    );

-- =============================================
-- SECURITY_AUDIT_LOGS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "security_audit_logs_admin_read_only" ON security_audit_logs;
DROP POLICY IF EXISTS "security_audit_logs_admin_modify" ON security_audit_logs;

-- Create optimized policies
CREATE POLICY "security_audit_logs_admins_all" ON security_audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- SUBSCRIPTION_TIERS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "subscription_tiers_write_admin_only" ON subscription_tiers;

-- Create optimized policy
CREATE POLICY "subscription_tiers_admins_write" ON subscription_tiers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (select auth.uid()) 
            AND profiles.role = 'admin'
        )
    );

-- =============================================
-- USER_DAILY_LIMITS TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own limits" ON user_daily_limits;

-- Create optimized policy
CREATE POLICY "user_daily_limits_users_select_own" ON user_daily_limits
    FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================
-- USAGE_HISTORY TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own usage history" ON usage_history;

-- Create optimized policy
CREATE POLICY "usage_history_users_select_own" ON usage_history
    FOR SELECT USING ((select auth.uid()) = user_id);

-- =============================================
-- DISCOVERY_QUEUE TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own discovery queue" ON discovery_queue;
DROP POLICY IF EXISTS "System can manage discovery queue" ON discovery_queue;

-- Create optimized policies
CREATE POLICY "discovery_queue_users_select_own" ON discovery_queue
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "discovery_queue_system_manage_all" ON discovery_queue
    FOR ALL USING (
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- MATCHING_SCORES TABLE OPTIMIZATIONS
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own matching scores" ON matching_scores;
DROP POLICY IF EXISTS "System can manage matching scores" ON matching_scores;

-- Create optimized policies
CREATE POLICY "matching_scores_users_select_own" ON matching_scores
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "matching_scores_system_manage_all" ON matching_scores
    FOR ALL USING (
        (select current_setting('role', true)) = 'service_role'
    );

-- =============================================
-- OPTIMIZATION COMPLETE
-- =============================================

-- Add comment for tracking
COMMENT ON FUNCTION get_current_user_id() IS 'Helper function for RLS performance optimization - 2025-07-20';

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';