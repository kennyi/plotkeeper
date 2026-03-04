-- Migration 013: User-scoped data isolation
--
-- Adds user_id to all user-owned tables and tightens RLS policies so each
-- user only sees and modifies their own rows.
--
-- The `plants` table is a shared reference library — no user_id needed.
-- `bed_plantings` derives ownership through garden_beds (no user_id column
-- needed — policy joins via bed_id → garden_beds.user_id).
--
-- ⚠️  BEFORE RUNNING: replace the placeholder UUID below with Ian's real
-- auth.uid(). Find it at: Dashboard → Authentication → Users → click your
-- account → copy the UUID at the top.
--
-- Replace every occurrence of:
--   '00000000-0000-0000-0000-000000000000'
-- with your real UUID, then run this entire migration.

DO $$
DECLARE
  ian_uid UUID := '00000000-0000-0000-0000-000000000000'; -- ← REPLACE THIS
BEGIN

-- ── 1. Add user_id columns ──────────────────────────────────────────────────

ALTER TABLE garden_beds
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE monthly_jobs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE garden_settings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE app_feedback
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 1b. Fix garden_settings unique constraint to be per-user ────────────────
-- Previously unique on setting_key alone; now each user has their own set.

ALTER TABLE garden_settings DROP CONSTRAINT IF EXISTS garden_settings_setting_key_key;
ALTER TABLE garden_settings
  ADD CONSTRAINT garden_settings_user_id_setting_key_key
  UNIQUE (user_id, setting_key);

-- ── 2. Backfill Ian's existing data ─────────────────────────────────────────

UPDATE garden_beds      SET user_id = ian_uid WHERE user_id IS NULL;
UPDATE monthly_jobs     SET user_id = ian_uid WHERE user_id IS NULL;
UPDATE journal_entries  SET user_id = ian_uid WHERE user_id IS NULL;
UPDATE garden_settings  SET user_id = ian_uid WHERE user_id IS NULL;
UPDATE app_feedback     SET user_id = ian_uid WHERE user_id IS NULL;
UPDATE tools            SET user_id = ian_uid WHERE user_id IS NULL;

END $$;

-- ── 3. Drop the old "allow all authenticated" policies ──────────────────────

DROP POLICY IF EXISTS "authenticated_all" ON garden_beds;
DROP POLICY IF EXISTS "authenticated_all" ON bed_plantings;
DROP POLICY IF EXISTS "authenticated_all" ON monthly_jobs;
DROP POLICY IF EXISTS "authenticated_all" ON journal_entries;
DROP POLICY IF EXISTS "authenticated_all" ON garden_settings;
DROP POLICY IF EXISTS "authenticated_all" ON app_feedback;
DROP POLICY IF EXISTS "authenticated_all" ON tools;
-- plants policy stays — it's the shared library (no user_id)

-- ── 4. Create user-scoped policies ──────────────────────────────────────────

-- garden_beds: own rows only
CREATE POLICY "own_rows" ON garden_beds
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- bed_plantings: access through parent bed ownership (no user_id column needed)
CREATE POLICY "own_rows" ON bed_plantings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM garden_beds
      WHERE garden_beds.id = bed_plantings.bed_id
        AND garden_beds.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM garden_beds
      WHERE garden_beds.id = bed_plantings.bed_id
        AND garden_beds.user_id = auth.uid()
    )
  );

-- monthly_jobs: own rows only
CREATE POLICY "own_rows" ON monthly_jobs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- journal_entries: own rows only
CREATE POLICY "own_rows" ON journal_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- garden_settings: own rows only
CREATE POLICY "own_rows" ON garden_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- app_feedback: own rows only
CREATE POLICY "own_rows" ON app_feedback
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tools: own rows only
CREATE POLICY "own_rows" ON tools
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- plants: shared library — authenticated users can read, only service role writes
-- (Ian can still add plants via Supabase dashboard or a future admin action)
CREATE POLICY "read_plants" ON plants
  FOR SELECT TO authenticated USING (true);
