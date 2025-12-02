-- Add Performance Indexes Migration
-- Created: 2025-06-14
-- Description: Creates additional performance indexes and optimizations for premium features

-- =============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================

-- Composite index for active boosts with user and time
CREATE INDEX IF NOT EXISTS idx_profile_boosts_user_active_time 
ON profile_boosts(user_id, is_active, ends_at) 
WHERE is_active = true;

-- Composite index for video profile moderation
CREATE INDEX IF NOT EXISTS idx_video_profiles_status_created 
ON video_profiles(status, created_at) 
WHERE status IN ('pending', 'rejected');

-- Composite index for recent user activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type_recent 
ON user_activities(user_id, activity_type, timestamp) 
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Composite index for daily feature usage queries
CREATE INDEX IF NOT EXISTS idx_feature_usage_date_feature_user 
ON feature_usage_logs(usage_date, feature_name, user_id);

-- Composite index for recent rewind actions
CREATE INDEX IF NOT EXISTS idx_rewind_actions_user_recent 
ON rewind_actions(user_id, rewind_timestamp) 
WHERE rewind_timestamp > NOW() - INTERVAL '24 hours';

-- Composite index for profile views analytics
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_recent_premium 
ON profile_views(viewed_id, viewed_at, is_premium_view) 
WHERE viewed_at > NOW() - INTERVAL '30 days';

-- Composite index for active location changes
CREATE INDEX IF NOT EXISTS idx_location_changes_user_active_time 
ON location_changes(user_id, is_active, started_at) 
WHERE is_active = true;

-- =============================================
-- PARTIAL INDEXES FOR PREMIUM FEATURES
-- =============================================

-- Index for premium users only
CREATE INDEX IF NOT EXISTS idx_profiles_premium_users 
ON profiles(id, subscription_tier, created_at) 
WHERE subscription_tier IN ('silver', 'gold', 'platinum');

-- Index for active premium features
CREATE INDEX IF NOT EXISTS idx_profiles_premium_features 
ON profiles(id, subscription_tier, daily_boosts, daily_rewinds) 
WHERE subscription_tier != 'free';

-- Index for users with active boosts
CREATE INDEX IF NOT EXISTS idx_profiles_with_active_boosts 
ON profiles(id, subscription_tier) 
WHERE EXISTS (
    SELECT 1 FROM profile_boosts 
    WHERE profile_boosts.user_id = profiles.id 
    AND profile_boosts.is_active = true 
    AND profile_boosts.ends_at > NOW()
);

-- =============================================
-- FUNCTION-BASED INDEXES
-- =============================================

-- Index for distance calculations (using Earth distance)
CREATE INDEX IF NOT EXISTS idx_profiles_location_earth 
ON profiles USING GIST (ll_to_earth(latitude, longitude)) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index for age calculation
CREATE INDEX IF NOT EXISTS idx_profiles_age_calculated 
ON profiles((EXTRACT(YEAR FROM AGE(birth_date)))) 
WHERE birth_date IS NOT NULL;

-- Index for profile completion percentage
CREATE INDEX IF NOT EXISTS idx_profiles_completion_score 
ON profiles((
    CASE 
        WHEN bio IS NOT NULL THEN 1 ELSE 0 END +
    CASE 
        WHEN jsonb_array_length(photos) > 0 THEN 1 ELSE 0 END +
    CASE 
        WHEN interests IS NOT NULL AND jsonb_array_length(interests) > 0 THEN 1 ELSE 0 END +
    CASE 
        WHEN occupation IS NOT NULL THEN 1 ELSE 0 END +
    CASE 
        WHEN education IS NOT NULL THEN 1 ELSE 0 END
));

-- =============================================
-- HASH INDEXES FOR EXACT MATCHES
-- =============================================

-- Hash index for subscription tier lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_hash 
ON profiles USING HASH (subscription_tier);

-- Hash index for boost type lookups
CREATE INDEX IF NOT EXISTS idx_profile_boosts_type_hash 
ON profile_boosts USING HASH (boost_type);

-- Hash index for video status lookups
CREATE INDEX IF NOT EXISTS idx_video_profiles_status_hash 
ON video_profiles USING HASH (status);

-- Hash index for activity type lookups
CREATE INDEX IF NOT EXISTS idx_user_activities_type_hash 
ON user_activities USING HASH (activity_type);

-- =============================================
-- TEXT SEARCH INDEXES
-- =============================================

-- Full text search index for user bios
CREATE INDEX IF NOT EXISTS idx_profiles_bio_fts 
ON profiles USING GIN (to_tsvector('english', bio)) 
WHERE bio IS NOT NULL;

-- Full text search index for occupation
CREATE INDEX IF NOT EXISTS idx_profiles_occupation_fts 
ON profiles USING GIN (to_tsvector('english', occupation)) 
WHERE occupation IS NOT NULL;

-- GIN index for interests array searches
CREATE INDEX IF NOT EXISTS idx_profiles_interests_gin 
ON profiles USING GIN (interests) 
WHERE interests IS NOT NULL;

-- =============================================
-- EXPRESSION INDEXES FOR PREMIUM CALCULATIONS
-- =============================================

-- Index for users who can use boost today
CREATE INDEX IF NOT EXISTS idx_profiles_can_boost_today 
ON profiles((
    CASE 
        WHEN subscription_tier = 'free' THEN 0
        WHEN subscription_tier = 'silver' THEN 1
        WHEN subscription_tier = 'gold' THEN 3
        WHEN subscription_tier = 'platinum' THEN 5
        ELSE 0
    END - daily_boosts
)) 
WHERE (
    CASE 
        WHEN subscription_tier = 'free' THEN 0
        WHEN subscription_tier = 'silver' THEN 1
        WHEN subscription_tier = 'gold' THEN 3
        WHEN subscription_tier = 'platinum' THEN 5
        ELSE 0
    END - daily_boosts
) > 0;

-- Index for users who can rewind today
CREATE INDEX IF NOT EXISTS idx_profiles_can_rewind_today 
ON profiles((
    CASE 
        WHEN subscription_tier = 'free' THEN 0
        WHEN subscription_tier = 'silver' THEN 1
        WHEN subscription_tier = 'gold' THEN 3
        WHEN subscription_tier = 'platinum' THEN 999
        ELSE 0
    END - daily_rewinds
)) 
WHERE (
    CASE 
        WHEN subscription_tier = 'free' THEN 0
        WHEN subscription_tier = 'silver' THEN 1
        WHEN subscription_tier = 'gold' THEN 3
        WHEN subscription_tier = 'platinum' THEN 999
        ELSE 0
    END - daily_rewinds
) > 0;

-- =============================================
-- CLUSTERING FOR BETTER PERFORMANCE
-- =============================================

-- Cluster profile_boosts by user_id for better locality
CLUSTER profile_boosts USING idx_profile_boosts_user_id;

-- Cluster user_activities by timestamp for better time-based queries
CLUSTER user_activities USING idx_user_activities_timestamp;

-- Cluster feature_usage_logs by user and date
CLUSTER feature_usage_logs USING idx_feature_usage_user_date;

-- =============================================
-- VACUUM AND ANALYZE
-- =============================================

-- Analyze all new tables for optimal query planning
ANALYZE profile_boosts;
ANALYZE video_profiles;
ANALYZE user_activities;
ANALYZE feature_usage_logs;
ANALYZE rewind_actions;
ANALYZE profile_views;
ANALYZE location_changes;

-- =============================================
-- STATISTICS TARGETS FOR BETTER ESTIMATES
-- =============================================

-- Increase statistics target for frequently queried columns
ALTER TABLE profile_boosts ALTER COLUMN user_id SET STATISTICS 1000;
ALTER TABLE profile_boosts ALTER COLUMN boost_type SET STATISTICS 1000;

ALTER TABLE video_profiles ALTER COLUMN status SET STATISTICS 1000;
ALTER TABLE video_profiles ALTER COLUMN user_id SET STATISTICS 1000;

ALTER TABLE user_activities ALTER COLUMN activity_type SET STATISTICS 1000;
ALTER TABLE user_activities ALTER COLUMN user_id SET STATISTICS 1000;

ALTER TABLE feature_usage_logs ALTER COLUMN feature_name SET STATISTICS 1000;
ALTER TABLE feature_usage_logs ALTER COLUMN usage_date SET STATISTICS 1000;

ALTER TABLE profile_views ALTER COLUMN viewed_id SET STATISTICS 1000;
ALTER TABLE profile_views ALTER COLUMN viewer_id SET STATISTICS 1000;

-- =============================================
-- MAINTENANCE FUNCTIONS
-- =============================================

-- Function to update statistics for premium tables
CREATE OR REPLACE FUNCTION update_premium_table_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update statistics for all premium tables
    ANALYZE profile_boosts;
    ANALYZE video_profiles;
    ANALYZE user_activities;
    ANALYZE feature_usage_logs;
    ANALYZE rewind_actions;
    ANALYZE profile_views;
    ANALYZE location_changes;
    
    -- Log the maintenance activity
    INSERT INTO user_activities (
        user_id, 
        activity_type, 
        activity_data
    ) 
    SELECT 
        '00000000-0000-0000-0000-000000000000'::UUID,
        'system_maintenance',
        jsonb_build_object(
            'action', 'update_statistics',
            'timestamp', NOW(),
            'tables', ARRAY['profile_boosts', 'video_profiles', 'user_activities', 'feature_usage_logs', 'rewind_actions', 'profile_views', 'location_changes']
        );
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION update_premium_table_stats() TO service_role;

-- =============================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================

-- View for monitoring boost usage
CREATE OR REPLACE VIEW boost_usage_stats AS
SELECT 
    DATE(created_at) as usage_date,
    boost_type,
    COUNT(*) as total_boosts,
    COUNT(CASE WHEN is_active THEN 1 END) as active_boosts,
    AVG(duration_minutes) as avg_duration,
    COUNT(DISTINCT user_id) as unique_users
FROM profile_boosts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), boost_type
ORDER BY usage_date DESC, boost_type;

-- View for monitoring premium feature usage
CREATE OR REPLACE VIEW premium_feature_stats AS
SELECT 
    feature_name,
    usage_date,
    subscription_tier,
    SUM(usage_count) as total_usage,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(usage_count) as avg_usage_per_user
FROM feature_usage_logs
WHERE usage_date > CURRENT_DATE - INTERVAL '30 days'
GROUP BY feature_name, usage_date, subscription_tier
ORDER BY usage_date DESC, feature_name, subscription_tier;

-- View for monitoring video profile moderation
CREATE OR REPLACE VIEW video_moderation_stats AS
SELECT 
    status,
    DATE(created_at) as upload_date,
    COUNT(*) as total_videos,
    AVG(duration_seconds) as avg_duration,
    AVG(file_size_mb) as avg_file_size,
    COUNT(DISTINCT user_id) as unique_uploaders
FROM video_profiles
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status, DATE(created_at)
ORDER BY upload_date DESC, status;

-- Grant select permissions on monitoring views
GRANT SELECT ON boost_usage_stats TO authenticated;
GRANT SELECT ON premium_feature_stats TO authenticated;
GRANT SELECT ON video_moderation_stats TO authenticated;