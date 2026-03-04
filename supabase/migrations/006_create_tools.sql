-- Migration 006: Create tools table

CREATE TABLE IF NOT EXISTS tools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN (
                'digging', 'cutting', 'watering', 'measuring',
                'protection', 'sowing', 'spreading', 'other'
              )),
  brand       TEXT,
  condition   TEXT DEFAULT 'good' CHECK (condition IN (
                'excellent', 'good', 'fair', 'needs_repair', 'replace_soon'
              )),
  owned       BOOLEAN DEFAULT true,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
