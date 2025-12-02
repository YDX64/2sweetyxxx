-- Create moderator permissions table
CREATE TABLE IF NOT EXISTS moderator_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission text NOT NULL,
  granted_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, permission)
);

-- Create indexes for performance
CREATE INDEX idx_moderator_permissions_user_id ON moderator_permissions(user_id);
CREATE INDEX idx_moderator_permissions_permission ON moderator_permissions(permission);

-- Enable RLS
ALTER TABLE moderator_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can view moderator permissions
CREATE POLICY "admins_can_view_moderator_permissions" ON moderator_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert moderator permissions
CREATE POLICY "admins_can_insert_moderator_permissions" ON moderator_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update moderator permissions
CREATE POLICY "admins_can_update_moderator_permissions" ON moderator_permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete moderator permissions
CREATE POLICY "admins_can_delete_moderator_permissions" ON moderator_permissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON moderator_permissions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;