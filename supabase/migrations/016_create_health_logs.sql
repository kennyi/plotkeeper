-- Migration 016: planting health logs + current_health snapshot on bed_plantings

CREATE TABLE IF NOT EXISTS planting_health_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id    UUID NOT NULL REFERENCES bed_plantings(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  logged_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  health_status  TEXT NOT NULL CHECK (health_status IN (
                   'thriving', 'healthy', 'ok', 'struggling', 'critical', 'dormant'
                 )),
  notes          TEXT,
  photo_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bed_plantings
  ADD COLUMN IF NOT EXISTS current_health TEXT
  CHECK (current_health IN ('thriving', 'healthy', 'ok', 'struggling', 'critical', 'dormant'));

ALTER TABLE planting_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own health logs" ON planting_health_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_logs_planting ON planting_health_logs(planting_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_date     ON planting_health_logs(logged_at DESC);
