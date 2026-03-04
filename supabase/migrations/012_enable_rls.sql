-- Migration 012: Enable Row Level Security
--
-- Locks down all tables so only authenticated users can access data.
-- For now (single-user app) any authenticated user can do anything.
-- When going multi-user, replace these policies with user-scoped ones
-- using auth.uid() = user_id after adding user_id columns.

-- ── Enable RLS on all tables ─────────────────────────────────────────────────

ALTER TABLE plants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_beds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_plantings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_feedback        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools               ENABLE ROW LEVEL SECURITY;

-- ── Policies: allow all for any authenticated user ───────────────────────────

CREATE POLICY "authenticated_all" ON plants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON garden_beds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON bed_plantings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON monthly_jobs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON journal_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON garden_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON app_feedback
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all" ON tools
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
