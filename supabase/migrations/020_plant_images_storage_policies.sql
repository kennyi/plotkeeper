-- Migration 020: Storage RLS policies for the plant-images bucket.
--
-- A "public" Supabase bucket means objects are publicly *readable* via URL,
-- but INSERT / DELETE are still governed by RLS policies. Without these,
-- all uploads return a 403 / RLS violation error even from a server action.
--
-- Run this in Supabase Dashboard → SQL Editor.

DROP POLICY IF EXISTS "plant-images: allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "plant-images: allow all reads"   ON storage.objects;
DROP POLICY IF EXISTS "plant-images: allow all deletes" ON storage.objects;

-- Allow uploads (tighten to auth.uid() once auth is live in Phase 4)
CREATE POLICY "plant-images: allow all uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'plant-images');

-- Allow public reads
CREATE POLICY "plant-images: allow all reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-images');

-- Allow deletes (needed when removing photos from the gallery)
CREATE POLICY "plant-images: allow all deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'plant-images');
