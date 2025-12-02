-- Fix Notifications Insert Policy
-- Created: 2025-07-18
-- Description: Add missing INSERT policy to allow users to create notifications for others

-- Allow authenticated users to create notifications for others
-- This is needed for super likes, likes, matches, etc.
CREATE POLICY "Users can create notifications for others" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add helpful comment
COMMENT ON POLICY "Users can create notifications for others" ON notifications IS 'Allows authenticated users to create notifications for other users (super likes, matches, etc.)';