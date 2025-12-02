-- Complete Rewind Feature with Notification Cleanup
-- This migration ensures that rewind operations completely remove all traces
-- including notifications sent to other users

-- First, ensure notifications table exists (if not already created)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES profiles(id),
  related_match_id UUID REFERENCES matches(id),
  related_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes for better performance on notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_user_id ON notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_match_id ON notifications(related_match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all notifications (for rewind cleanup)
CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant execute permission on the updated perform_rewind function
GRANT EXECUTE ON FUNCTION perform_rewind(UUID, UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION perform_rewind IS 'Complete rewind operation that removes swipes, matches, and related notifications for true undo functionality'; 