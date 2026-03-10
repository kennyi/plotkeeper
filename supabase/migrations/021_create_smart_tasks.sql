-- ── Smart Tasks System ──────────────────────────────────────────────────────
-- Adds care-frequency fields to plants and two new tables:
--   planting_task_events  — one row per completed task (water, feed, prune, etc.)
--   custom_tasks          — user-added one-off tasks not tied to a planting

-- Add optional care-frequency columns to the plant library.
-- Values are per-plant defaults; not all plants have these filled in initially.
ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS feeding_frequency_days  int,
  ADD COLUMN IF NOT EXISTS pruning_frequency_days  int;

-- ── planting_task_events ─────────────────────────────────────────────────────
-- Records every time a user completes a care action for a specific planting.
-- The most-recent row per (planting_id, event_type) is used to decide when the
-- next reminder should fire.
CREATE TABLE IF NOT EXISTS planting_task_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  planting_id   uuid        NOT NULL REFERENCES bed_plantings(id) ON DELETE CASCADE,
  event_type    text        NOT NULL
                  CHECK (event_type IN (
                    'watered', 'fed', 'pruned',
                    'harvested', 'hardened_off', 'transplanted'
                  )),
  completed_at  timestamptz NOT NULL DEFAULT now(),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_events_planting ON planting_task_events (planting_id);
CREATE INDEX IF NOT EXISTS idx_task_events_user     ON planting_task_events (user_id);

ALTER TABLE planting_task_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_planting_task_events"
  ON planting_task_events FOR ALL USING (true) WITH CHECK (true);

-- ── custom_tasks ─────────────────────────────────────────────────────────────
-- Simple one-off tasks the user adds manually (things the app can't predict).
CREATE TABLE IF NOT EXISTS custom_tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  due_date    date,
  is_done     boolean     NOT NULL DEFAULT false,
  done_at     timestamptz,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_tasks_user ON custom_tasks (user_id);

ALTER TABLE custom_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_custom_tasks"
  ON custom_tasks FOR ALL USING (true) WITH CHECK (true);
