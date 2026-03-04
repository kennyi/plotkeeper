-- Migration 014: User-created plants
-- Adds is_user_created + created_by columns to plants table.
-- Updates RLS so shared library plants are visible to all authenticated users
-- but user-created plants are only visible to their creator.

-- ── 1. Add columns ───────────────────────────────────────────────────────────

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS is_user_created BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 2. Update RLS policies ───────────────────────────────────────────────────
-- Drop the broad read-all policy added in migration 013

DROP POLICY IF EXISTS "read_plants" ON plants;

-- Shared library plants visible to all authenticated users.
-- User-created plants visible only to their creator.
CREATE POLICY "select_plants" ON plants
  FOR SELECT TO authenticated
  USING (is_user_created = false OR auth.uid() = created_by);

-- Only authenticated users can insert their own plants.
CREATE POLICY "insert_own_plants" ON plants
  FOR INSERT TO authenticated
  WITH CHECK (is_user_created = true AND auth.uid() = created_by);

-- Users can update/delete their own plants only.
CREATE POLICY "update_own_plants" ON plants
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "delete_own_plants" ON plants
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);
