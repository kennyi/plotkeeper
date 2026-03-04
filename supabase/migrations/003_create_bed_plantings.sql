-- Migration 003: Create bed_plantings table

CREATE TABLE IF NOT EXISTS bed_plantings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id                UUID NOT NULL REFERENCES garden_beds(id) ON DELETE CASCADE,

  -- Either link to plant library OR use custom name
  plant_id              UUID REFERENCES plants(id),
  custom_plant_name     TEXT,

  -- Position within bed
  row_number            INTEGER,
  row_label             TEXT,

  -- Quantity
  quantity              INTEGER,
  area_m2               DECIMAL(5,2),

  -- Key dates
  seeds_started_date    DATE,
  sown_outdoors_date    DATE,
  planted_out_date      DATE,
  expected_harvest_date DATE,
  actual_harvest_date   DATE,
  removed_date          DATE,

  -- Status lifecycle
  status                TEXT DEFAULT 'planned' CHECK (status IN (
                          'planned',
                          'seeds_started',
                          'germinating',
                          'growing',
                          'ready',
                          'harvested',
                          'finished',
                          'failed'
                        )),

  -- Crop rotation
  growing_year          INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  plant_family          TEXT,

  notes                 TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bed_plantings_bed_id ON bed_plantings(bed_id);
CREATE INDEX IF NOT EXISTS idx_bed_plantings_year ON bed_plantings(growing_year);
CREATE INDEX IF NOT EXISTS idx_bed_plantings_status ON bed_plantings(status);
