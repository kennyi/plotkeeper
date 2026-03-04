-- Migration 001: Create plants table
-- PlotKeeper — Master plant library

CREATE TABLE IF NOT EXISTS plants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  latin_name            TEXT,
  category              TEXT NOT NULL CHECK (category IN (
                          'vegetable', 'flower', 'herb', 'fruit',
                          'perennial', 'annual', 'bulb', 'shrub'
                        )),
  subcategory           TEXT,
  description           TEXT,

  -- Sowing & planting windows (month numbers: 1=Jan, 12=Dec)
  -- Calibrated for Kildare, Ireland (last frost ~April 20, first frost ~Oct 30)
  sow_indoors_start     INTEGER CHECK (sow_indoors_start BETWEEN 1 AND 12),
  sow_indoors_end       INTEGER CHECK (sow_indoors_end BETWEEN 1 AND 12),
  sow_outdoors_start    INTEGER CHECK (sow_outdoors_start BETWEEN 1 AND 12),
  sow_outdoors_end      INTEGER CHECK (sow_outdoors_end BETWEEN 1 AND 12),
  transplant_start      INTEGER CHECK (transplant_start BETWEEN 1 AND 12),
  transplant_end        INTEGER CHECK (transplant_end BETWEEN 1 AND 12),
  harvest_start         INTEGER CHECK (harvest_start BETWEEN 1 AND 12),
  harvest_end           INTEGER CHECK (harvest_end BETWEEN 1 AND 12),

  -- Greenhouse/indoor to outdoor timing
  weeks_indoors_min     INTEGER,
  weeks_indoors_max     INTEGER,
  hardening_off_days    INTEGER DEFAULT 7,

  -- Germination
  germination_days_min  INTEGER,
  germination_days_max  INTEGER,
  germination_temp_min  INTEGER,  -- celsius
  germination_temp_max  INTEGER,

  -- Spacing (centimetres)
  spacing_cm            INTEGER,
  row_spacing_cm        INTEGER,
  sowing_depth_cm       DECIMAL(4,1),

  -- Plant size
  height_cm_min         INTEGER,
  height_cm_max         INTEGER,

  -- Growing requirements
  sun_requirement       TEXT CHECK (sun_requirement IN ('full_sun', 'partial_shade', 'full_shade')),
  water_needs           TEXT CHECK (water_needs IN ('low', 'medium', 'high')),
  soil_preference       TEXT,

  -- Ireland-specific
  hardiness_zone        TEXT,        -- RHS H-scale: H1a through H7
  frost_tolerant        BOOLEAN DEFAULT false,
  frost_tender          BOOLEAN DEFAULT false,
  slug_risk             TEXT CHECK (slug_risk IN ('low', 'medium', 'high')),

  -- Perennial info
  is_perennial          BOOLEAN DEFAULT false,
  lifespan_years        INTEGER,
  prune_month           INTEGER,
  divide_month          INTEGER,

  -- Cut flower specific
  is_cut_flower         BOOLEAN DEFAULT false,
  vase_life_days        INTEGER,
  succession_sow        BOOLEAN DEFAULT false,
  succession_interval_weeks INTEGER,

  -- Companion planting
  companion_plants      TEXT[],
  avoid_near            TEXT[],

  -- Pests
  common_pests          TEXT[],
  common_diseases       TEXT[],

  -- Notes
  notes                 TEXT,
  growing_tips          TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for calendar queries
CREATE INDEX IF NOT EXISTS idx_plants_sow_indoors ON plants(sow_indoors_start, sow_indoors_end);
CREATE INDEX IF NOT EXISTS idx_plants_sow_outdoors ON plants(sow_outdoors_start, sow_outdoors_end);
CREATE INDEX IF NOT EXISTS idx_plants_transplant ON plants(transplant_start, transplant_end);
CREATE INDEX IF NOT EXISTS idx_plants_harvest ON plants(harvest_start, harvest_end);
CREATE INDEX IF NOT EXISTS idx_plants_category ON plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_is_cut_flower ON plants(is_cut_flower);
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
