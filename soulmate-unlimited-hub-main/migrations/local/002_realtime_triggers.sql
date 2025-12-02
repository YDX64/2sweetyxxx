-- PostgreSQL LISTEN/NOTIFY for real-time features

-- Function to notify on profile changes
CREATE OR REPLACE FUNCTION notify_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'profile_changes',
        json_build_object(
            'operation', TG_OP,
            'user_id', NEW.id,
            'data', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_message',
        json_build_object(
            'conversation_id', NEW.conversation_id,
            'sender_id', NEW.sender_id,
            'message', row_to_json(NEW)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on new matches
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify both users
    PERFORM pg_notify(
        'new_match',
        json_build_object(
            'user_id', NEW.user1_id,
            'matched_with', NEW.user2_id,
            'match_id', NEW.id
        )::text
    );
    
    PERFORM pg_notify(
        'new_match',
        json_build_object(
            'user_id', NEW.user2_id,
            'matched_with', NEW.user1_id,
            'match_id', NEW.id
        )::text
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on new guests (likes)
CREATE OR REPLACE FUNCTION notify_new_guest()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'new_guest',
        json_build_object(
            'user_id', NEW.user_id,
            'guest_id', NEW.guest_id,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on super likes
CREATE OR REPLACE FUNCTION notify_super_like()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'super_like',
        json_build_object(
            'to_user_id', NEW.to_user_id,
            'from_user_id', NEW.from_user_id,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on profile views
CREATE OR REPLACE FUNCTION notify_profile_view()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'profile_view',
        json_build_object(
            'viewed_id', NEW.viewed_id,
            'viewer_id', NEW.viewer_id,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on call signals
CREATE OR REPLACE FUNCTION notify_call_signal()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'call_signal',
        json_build_object(
            'session_id', NEW.id,
            'caller_id', NEW.caller_id,
            'receiver_id', NEW.receiver_id,
            'call_type', NEW.call_type,
            'status', NEW.status
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time notifications
CREATE TRIGGER profile_changes_trigger
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION notify_profile_changes();

CREATE TRIGGER new_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION notify_new_message();

CREATE TRIGGER new_match_trigger
    AFTER INSERT ON matches
    FOR EACH ROW EXECUTE FUNCTION notify_new_match();

CREATE TRIGGER new_guest_trigger
    AFTER INSERT ON guests
    FOR EACH ROW EXECUTE FUNCTION notify_new_guest();

CREATE TRIGGER super_like_trigger
    AFTER INSERT ON super_likes
    FOR EACH ROW EXECUTE FUNCTION notify_super_like();

CREATE TRIGGER profile_view_trigger
    AFTER INSERT ON profile_views
    FOR EACH ROW EXECUTE FUNCTION notify_profile_view();

CREATE TRIGGER call_signal_trigger
    AFTER INSERT OR UPDATE ON call_sessions
    FOR EACH ROW EXECUTE FUNCTION notify_call_signal();