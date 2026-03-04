-- Migration 005: Create journal_entries table

CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type      TEXT CHECK (entry_type IN (
                    'harvest', 'observation', 'problem',
                    'note', 'weather', 'purchase'
                  )),

  -- Optional links
  bed_id          UUID REFERENCES garden_beds(id),
  plant_id        UUID REFERENCES plants(id),

  title           TEXT,
  notes           TEXT NOT NULL,

  -- Harvest-specific
  quantity_value  DECIMAL(8,2),
  quantity_unit   TEXT,

  -- Problem-specific
  symptoms        TEXT,
  diagnosis       TEXT,
  treatment       TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_bed ON journal_entries(bed_id);
CREATE INDEX IF NOT EXISTS idx_journal_plant ON journal_entries(plant_id);
