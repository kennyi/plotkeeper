-- Migration 017: Storage policies for user-uploads bucket
-- Run this in the Supabase SQL editor.
-- If you get "already exists" errors, the policies are already set — that's fine.

-- Create the bucket as public (or update it if it already exists)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('user-uploads', 'user-uploads', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop any existing policies first so this is safe to re-run
DROP POLICY IF EXISTS "user-uploads: allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "user-uploads: allow all reads"   ON storage.objects;
DROP POLICY IF EXISTS "user-uploads: allow owner updates" ON storage.objects;

-- Allow any request to upload (tighten to auth.uid() once auth is live)
CREATE POLICY "user-uploads: allow all uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-uploads');

-- Allow public reads
CREATE POLICY "user-uploads: allow all reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- Allow updates
CREATE POLICY "user-uploads: allow owner updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-uploads');
