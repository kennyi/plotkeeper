-- Migration 004: Create monthly_jobs table

CREATE TABLE IF NOT EXISTS monthly_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN (
                    'sow_indoors', 'sow_outdoors', 'plant_out',
                    'harvest', 'prune', 'feed', 'water',
                    'protect', 'prepare', 'order', 'compost',
                    'maintenance', 'divide', 'deadhead'
                  )),
  plant_category  TEXT,
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  -- User can mark a job done for the current year
  is_done         BOOLEAN DEFAULT false,
  done_year       INTEGER,

  -- Is this a user-added custom job, or from the pre-seeded list?
  is_custom       BOOLEAN DEFAULT false,

  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_jobs_month ON monthly_jobs(month);
CREATE INDEX IF NOT EXISTS idx_monthly_jobs_priority ON monthly_jobs(month, priority);
