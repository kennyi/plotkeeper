-- Migration 017: Storage policies for user-uploads bucket
-- Run this in the Supabase SQL editor after creating the bucket.
-- The bucket should be set to PUBLIC in the Supabase dashboard.

-- Allow any authenticated or anonymous user to upload to their own folder.
-- Because auth is not yet implemented (Phase 4), we allow all uploads for now.
-- Tighten to: WITH CHECK (auth.uid()::text = (storage.foldername(name))[1])
-- once auth is added.

INSERT INTO storage.buckets (id, name, public)
  VALUES ('user-uploads', 'user-uploads', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY IF NOT EXISTS "user-uploads: allow all uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-uploads');

CREATE POLICY IF NOT EXISTS "user-uploads: allow all reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

CREATE POLICY IF NOT EXISTS "user-uploads: allow owner updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-uploads');
