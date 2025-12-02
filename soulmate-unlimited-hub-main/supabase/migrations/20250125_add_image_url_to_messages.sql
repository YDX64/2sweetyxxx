-- Add image_url column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for message images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images',
  'message-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Storage policy for message images
CREATE POLICY "Users can upload their own message images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'message-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view message images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'message-images');

CREATE POLICY "Users can delete their own message images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'message-images' AND (storage.foldername(name))[1] = auth.uid()::text);