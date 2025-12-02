-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE subscription_type AS ENUM ('free', 'silver', 'gold', 'platinum');
CREATE TYPE user_role AS ENUM ('registered', 'moderator', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE relationship_type AS ENUM ('casual', 'serious', 'marriage', 'friendship');

-- Profiles table (main user data)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    birth_date DATE,
    gender gender_type,
    interested_in gender_type[],
    relationship_type relationship_type,
    location POINT,
    city TEXT,
    country TEXT,
    photos TEXT[],
    height INTEGER,
    education TEXT,
    occupation TEXT,
    languages TEXT[],
    interests TEXT[],
    drinking TEXT,
    smoking TEXT,
    exercise TEXT,
    pets TEXT,
    kids TEXT,
    religion TEXT,
    politics TEXT,
    verified BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    show_online_status BOOLEAN DEFAULT TRUE,
    
    -- Feature flags
    birth_date_locked BOOLEAN DEFAULT FALSE,
    gender_locked BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    daily_likes_used INTEGER DEFAULT 0,
    daily_super_likes_used INTEGER DEFAULT 0,
    daily_boosts_used INTEGER DEFAULT 0,
    monthly_boosts_used INTEGER DEFAULT 0,
    last_usage_reset_date TIMESTAMPTZ DEFAULT NOW(),
    last_boost_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Boost feature
    is_boosted BOOLEAN DEFAULT FALSE,
    boost_expires_at TIMESTAMPTZ,
    
    -- Subscription info (denormalized for performance)
    subscription_tier subscription_type DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ
);

-- Indexes for profiles
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_interested_in ON profiles USING GIN (interested_in);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);
CREATE INDEX idx_profiles_is_boosted ON profiles(is_boosted, boost_expires_at);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier, subscription_expires_at);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type subscription_type NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active, end_date);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'registered',
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES profiles(id),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    participant1_last_read TIMESTAMPTZ,
    participant2_last_read TIMESTAMPTZ,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_by UUID REFERENCES profiles(id),
    UNIQUE(participant1_id, participant2_id)
);

CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    translated_content JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE NOT is_read;

-- Swipes table
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    swiped_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_swipes_direction ON swipes(direction);

-- Super likes table
CREATE TABLE super_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_seen BOOLEAN DEFAULT FALSE,
    UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX idx_super_likes_to_user ON super_likes(to_user_id, is_seen);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_unmatched BOOLEAN DEFAULT FALSE,
    unmatched_by UUID REFERENCES profiles(id),
    unmatched_at TIMESTAMPTZ,
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_matches_user1 ON matches(user1_id) WHERE NOT is_unmatched;
CREATE INDEX idx_matches_user2 ON matches(user2_id) WHERE NOT is_unmatched;

-- Profile views table
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    viewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    duration INTEGER DEFAULT 0,
    UNIQUE(viewer_id, viewed_id)
);

CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_id, created_at DESC);

-- Guests (likes received) table
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_seen BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, guest_id)
);

CREATE INDEX idx_guests_user ON guests(user_id, is_seen);

-- Call sessions table
CREATE TABLE call_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER,
    call_type TEXT CHECK (call_type IN ('audio', 'video')),
    status TEXT CHECK (status IN ('pending', 'active', 'ended', 'missed', 'rejected'))
);

CREATE INDEX idx_call_sessions_caller ON call_sessions(caller_id);
CREATE INDEX idx_call_sessions_receiver ON call_sessions(receiver_id);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 100,
    max_distance INTEGER DEFAULT 50,
    preferred_gender gender_type[],
    preferred_relationship_type relationship_type[],
    show_age BOOLEAN DEFAULT TRUE,
    show_distance BOOLEAN DEFAULT TRUE,
    allow_messages_from TEXT DEFAULT 'matches',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    hide_profile BOOLEAN DEFAULT FALSE,
    hide_online_status BOOLEAN DEFAULT FALSE,
    auto_translate BOOLEAN DEFAULT TRUE,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status, created_at);

-- Blocks table
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();