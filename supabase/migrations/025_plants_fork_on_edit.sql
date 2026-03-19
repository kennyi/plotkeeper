-- Migration 025: Fork-on-edit for plants
-- Adds forked_from column so a user-owned copy can track the shared library
-- record it was derived from. No RLS changes needed — existing policies already
-- prevent users from updating shared plants (created_by = null fails the check).

ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS forked_from UUID REFERENCES plants(id) ON DELETE SET NULL;
