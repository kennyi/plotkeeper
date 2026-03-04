-- Migration 002: Create garden_beds table

CREATE TABLE IF NOT EXISTS garden_beds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  bed_type          TEXT NOT NULL CHECK (bed_type IN (
                      'raised_bed', 'ground_bed', 'pot', 'planter',
                      'greenhouse_bed', 'window_box', 'grow_bag'
                    )),

  -- Dimensions (metres, nullable for pots/planters)
  length_m          DECIMAL(5,2),
  width_m           DECIMAL(5,2),
  depth_m           DECIMAL(5,2),

  -- Location & microclimate
  location_label    TEXT,
  sun_exposure      TEXT CHECK (sun_exposure IN ('full_sun', 'partial_shade', 'full_shade', 'variable')),
  wind_exposure     TEXT CHECK (wind_exposure IN ('sheltered', 'moderate', 'exposed')),
  soil_type         TEXT,

  -- Bed purpose/section
  section           TEXT,

  -- Grid position (for future visual designer)
  grid_x            INTEGER,
  grid_y            INTEGER,

  -- Status
  is_active         BOOLEAN DEFAULT true,
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_garden_beds_active ON garden_beds(is_active);
