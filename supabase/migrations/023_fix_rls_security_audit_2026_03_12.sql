-- Migration: 023_fix_rls_security_audit_2026_03_12.sql
-- Date: 2026-03-12
-- Fixes identified in RLS security audit:
--   1. bed_photos         — RLS was disabled, no policies
--   2. planting_photos    — RLS was disabled, no policies
--   3. custom_tasks       — Policy used public role with qual=true (world-open)
--   4. planting_task_events — Policy used public role with qual=true (world-open)
--   5. plants             — authenticated_all policy nullified all row-scoping
--   6. planting_health_logs — Policy used public role instead of authenticated

-- ============================================================
-- 1. bed_photos — enable RLS + scope to owner
-- ============================================================
ALTER TABLE bed_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_rows ON bed_photos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. planting_photos — enable RLS + scope to owner
-- ============================================================
ALTER TABLE planting_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_rows ON planting_photos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. custom_tasks — replace open public policy with authenticated
-- ============================================================
DROP POLICY allow_all_custom_tasks ON custom_tasks;

CREATE POLICY own_rows ON custom_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. planting_task_events — replace open public policy with authenticated
-- ============================================================
DROP POLICY allow_all_planting_task_events ON planting_task_events;

CREATE POLICY own_rows ON planting_task_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. plants — drop authenticated_all (it nullified all row-scoping);
--            rebuild update_own_plants with explicit WITH CHECK
-- ============================================================
DROP POLICY authenticated_all ON plants;

DROP POLICY update_own_plants ON plants;
CREATE POLICY update_own_plants ON plants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- 6. planting_health_logs — replace public-role policy with
--    authenticated + explicit WITH CHECK
-- ============================================================
DROP POLICY "Users manage own health logs" ON planting_health_logs;

CREATE POLICY own_rows ON planting_health_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
