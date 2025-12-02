-- =============================================
-- SUPABASE RLS PERFORMANCE OPTIMIZATION - PHASE 3
-- Created: 2025-07-20
-- Description: Add performance indexes for frequently queried columns
-- Purpose: Optimize query performance after RLS policy consolidation
-- Focus: Geolocation, user relationships, and frequent lookup patterns
-- =============================================

-- =============================================
-- PROFILES TABLE INDEXES
-- =============================================

-- Composite index for location-based queries (most critical for dating app)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_location_active 
ON profiles (latitude, longitude, is_active) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_active = true;

-- Index for age and gender filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_age_gender_active 
ON profiles (age, gender, is_active) 
WHERE is_active = true;

-- Index for subscription tier queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles (subscription_tier) 
WHERE subscription_tier IS NOT NULL;

-- Index for online status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_seen 
ON profiles (last_seen) 
WHERE last_seen IS NOT NULL;

-- Composite index for matching algorithms
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_matching_criteria 
ON profiles (age, gender, interested_in, relationship_type, is_active) 
WHERE is_active = true;

-- =============================================
-- USER_ROLES TABLE INDEXES
-- =============================================

-- Index for role-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role 
ON user_roles (role);

-- Composite index for user role lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_role 
ON user_roles (user_id, role);

-- =============================================
-- SWIPES TABLE INDEXES
-- =============================================

-- Index for user's swipe history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_swipes_user_id 
ON swipes (user_id);

-- Index for target user swipes (who swiped on them)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_swipes_target_user_id 
ON swipes (target_user_id);

-- Composite index for match detection
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_swipes_match_detection 
ON swipes (user_id, target_user_id, direction);

-- Index for swipe direction filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_swipes_direction_created 
ON swipes (direction, created_at);

-- =============================================
-- MATCHES TABLE INDEXES
-- =============================================

-- Index for user's matches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user1_id 
ON matches (user1_id);

-- Index for user's matches (reverse)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_user2_id 
ON matches (user2_id);

-- Composite index for match status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_users_created 
ON matches (user1_id, user2_id, created_at);

-- =============================================
-- CONVERSATIONS TABLE INDEXES
-- =============================================

-- Index for user's conversations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user1_id 
ON conversations (user1_id);

-- Index for user's conversations (reverse)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user2_id 
ON conversations (user2_id);

-- Index for last message time ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_last_message 
ON conversations (last_message_at DESC NULLS LAST);

-- =============================================
-- MESSAGES TABLE INDEXES
-- =============================================

-- Index for conversation messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id 
ON messages (conversation_id, created_at DESC);

-- Index for sender queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id 
ON messages (sender_id);

-- Index for unread messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_read_status 
ON messages (conversation_id, is_read, created_at) 
WHERE is_read = false;

-- =============================================
-- SUBSCRIPTIONS TABLE INDEXES
-- =============================================

-- Index for user subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id 
ON subscriptions (user_id);

-- Index for active subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_active 
ON subscriptions (subscribed, subscription_end) 
WHERE subscribed = true;

-- Index for subscription tier
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_tier 
ON subscriptions (subscription_tier);

-- =============================================
-- PROFILE_VIEWS TABLE INDEXES
-- =============================================

-- Index for viewer's history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_views_viewer_id 
ON profile_views (viewer_id, created_at DESC);

-- Index for who viewed a profile
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_views_viewed_profile 
ON profile_views (viewed_profile_id, created_at DESC);

-- Composite index for duplicate view prevention
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_views_unique_daily 
ON profile_views (viewer_id, viewed_profile_id, date(created_at));

-- =============================================
-- NOTIFICATIONS TABLE INDEXES
-- =============================================

-- Index for user notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id 
ON notifications (user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread 
ON notifications (user_id, is_read, created_at) 
WHERE is_read = false;

-- Index for notification type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type 
ON notifications (notification_type);

-- =============================================
-- PROFILE_BOOSTS TABLE INDEXES
-- =============================================

-- Index for user boosts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_boosts_user_id 
ON profile_boosts (user_id);

-- Index for active boosts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_boosts_active 
ON profile_boosts (user_id, expires_at) 
WHERE expires_at > NOW();

-- Index for boost expiration cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profile_boosts_expires_at 
ON profile_boosts (expires_at);

-- =============================================
-- USER_PREFERENCES TABLE INDEXES
-- =============================================

-- Index for user preferences
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences (user_id);

-- Index for distance preferences (for location matching)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_max_distance 
ON user_preferences (max_distance);

-- =============================================
-- ANALYTICS_EVENTS TABLE INDEXES
-- =============================================

-- Index for user analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id 
ON analytics_events (user_id, created_at DESC);

-- Index for event type analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_type_created 
ON analytics_events (event_type, created_at DESC);

-- Index for daily analytics aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_daily 
ON analytics_events (date(created_at), event_type);

-- =============================================
-- FEATURE_USAGE_LOGS TABLE INDEXES
-- =============================================

-- Index for user feature usage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_usage_logs_user_id 
ON feature_usage_logs (user_id, created_at DESC);

-- Index for feature usage analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_usage_logs_feature 
ON feature_usage_logs (feature_name, created_at DESC);

-- Index for daily limits checking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feature_usage_logs_daily_limits 
ON feature_usage_logs (user_id, feature_name, date(created_at));

-- =============================================
-- LOCATION_CHANGES TABLE INDEXES
-- =============================================

-- Index for user location history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_changes_user_id 
ON location_changes (user_id, created_at DESC);

-- Index for location tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_changes_location 
ON location_changes (latitude, longitude, created_at);

-- =============================================
-- VIDEO_PROFILES TABLE INDEXES
-- =============================================

-- Index for user video profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_profiles_user_id 
ON video_profiles (user_id);

-- Index for approved videos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_profiles_approved 
ON video_profiles (status, is_active) 
WHERE status = 'approved' AND is_active = true;

-- =============================================
-- GEOSPATIAL OPTIMIZATION
-- =============================================

-- Add PostGIS extension if not exists (for advanced geospatial queries)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Create a more efficient geospatial index using PostGIS (if available)
-- This would be for advanced location-based matching
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_geolocation 
-- ON profiles USING GIST (ST_Point(longitude, latitude));

-- =============================================
-- PARTIAL INDEXES FOR PERFORMANCE
-- =============================================

-- Index only active profiles for dating matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_only 
ON profiles (id, created_at) 
WHERE is_active = true AND deleted_at IS NULL;

-- Index only premium users for special features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_premium_users 
ON profiles (id, subscription_tier) 
WHERE subscription_tier IN ('silver', 'gold', 'platinum');

-- Index only verified profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verified_only 
ON profiles (id, verification_status) 
WHERE verified = true;

-- =============================================
-- CLEANUP AND MAINTENANCE
-- =============================================

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE swipes;
ANALYZE matches;
ANALYZE conversations;
ANALYZE messages;
ANALYZE subscriptions;
ANALYZE profile_views;
ANALYZE notifications;
ANALYZE user_preferences;
ANALYZE analytics_events;

-- =============================================
-- PERFORMANCE MONITORING FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION index_usage_stats()
RETURNS TABLE (
    table_name text,
    index_name text,
    index_scans bigint,
    tuples_read bigint,
    tuples_fetched bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        indexname as index_name,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
END;
$$;

-- Create function to monitor slow queries
CREATE OR REPLACE FUNCTION slow_query_monitor()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time double precision,
    mean_time double precision,
    max_time double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.max_exec_time
    FROM pg_stat_statements 
    WHERE pg_stat_statements.query LIKE '%public.%'
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
EXCEPTION 
    WHEN undefined_table THEN
        RAISE NOTICE 'pg_stat_statements extension not available';
        RETURN;
END;
$$;

-- Add comments for tracking
COMMENT ON FUNCTION index_usage_stats() IS 'Monitor index usage statistics - 2025-07-20';
COMMENT ON FUNCTION slow_query_monitor() IS 'Monitor slow query performance - 2025-07-20';

-- =============================================
-- FINAL OPTIMIZATION
-- =============================================

-- Refresh all materialized views if any exist
-- REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS any_materialized_views;

-- Update query planner statistics
VACUUM ANALYZE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';