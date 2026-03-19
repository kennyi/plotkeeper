-- Migration: 024_add_user_id_and_plant_id_indexes.sql
-- Date: 2026-03-12
-- Adds missing indexes identified in performance audit.
--
-- RLS policies on every user-owned table evaluate `auth.uid() = user_id` on
-- every single request. Without an index, Postgres does a full sequential scan
-- of the table for every query, even ones returning a single row.
-- These indexes let Postgres jump directly to the rows owned by the
-- authenticated user.

-- garden_beds: composite (user_id, is_active) because virtually every query
-- filters both — active beds for a specific user.
CREATE INDEX idx_garden_beds_user_id
  ON garden_beds (user_id, is_active);

-- bed_plantings: index on plant_id for FK joins.
-- Queries like getActivePlantingsWithBeds() join bed_plantings → plants on
-- plant_id. Without this, each join requires a full scan of bed_plantings.
CREATE INDEX idx_bed_plantings_plant_id
  ON bed_plantings (plant_id);

-- monthly_jobs: composite (user_id, month) because every query filters both —
-- jobs for a specific user in a specific month.
CREATE INDEX idx_monthly_jobs_user_id
  ON monthly_jobs (user_id, month);

-- journal_entries: user_id alone — journal queries vary more in their
-- secondary filters (date range, bed, plant) so a simple index is appropriate.
CREATE INDEX idx_journal_entries_user_id
  ON journal_entries (user_id);

-- planting_health_logs: user_id for RLS evaluation.
CREATE INDEX idx_planting_health_logs_user_id
  ON planting_health_logs (user_id);

-- tools: user_id for RLS evaluation (no UI yet but index should be in place
-- before the table is queried at scale).
CREATE INDEX idx_tools_user_id
  ON tools (user_id);

-- app_feedback: user_id for RLS evaluation.
CREATE INDEX idx_app_feedback_user_id
  ON app_feedback (user_id);

-- bed_photos / planting_photos: user_id for the RLS policies added in
-- migration 023 (previously RLS was disabled on both tables).
CREATE INDEX idx_bed_photos_user_id
  ON bed_photos (user_id);

CREATE INDEX idx_planting_photos_user_id
  ON planting_photos (user_id);
