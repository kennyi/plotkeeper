# PlotKeeper — Database Schema

## Overview

All tables live in Supabase (PostgreSQL). No Row Level Security (RLS) in Phase 1–2 since there's no auth. The schema is designed to support the full feature vision so later phases don't require structural changes, just filling in fields that are currently nullable.

---

## Tables

### 1. `plants` — Master Plant Library

Pre-seeded reference data for vegetables, flowers, herbs, and perennials. Ireland/Kildare calibrated.

```sql
CREATE TABLE plants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  latin_name            TEXT,
  category              TEXT NOT NULL CHECK (category IN (
                          'vegetable', 'flower', 'herb', 'fruit',
                          'perennial', 'annual', 'bulb', 'shrub'
                        )),
  subcategory           TEXT,  -- e.g. 'brassica', 'allium', 'cut_flower', 'root_veg'
  description           TEXT,

  -- Sowing & planting windows (month numbers: 1=Jan, 12=Dec)
  -- Calibrated for Kildare, Ireland
  sow_indoors_start     INTEGER CHECK (sow_indoors_start BETWEEN 1 AND 12),
  sow_indoors_end       INTEGER CHECK (sow_indoors_end BETWEEN 1 AND 12),
  sow_outdoors_start    INTEGER CHECK (sow_outdoors_start BETWEEN 1 AND 12),
  sow_outdoors_end      INTEGER CHECK (sow_outdoors_end BETWEEN 1 AND 12),
  transplant_start      INTEGER CHECK (transplant_start BETWEEN 1 AND 12),
  transplant_end        INTEGER CHECK (transplant_end BETWEEN 1 AND 12),
  harvest_start         INTEGER CHECK (harvest_start BETWEEN 1 AND 12),
  harvest_end           INTEGER CHECK (harvest_end BETWEEN 1 AND 12),

  -- Greenhouse/indoor to outdoor timing
  weeks_indoors_min     INTEGER,  -- minimum weeks to grow indoors before planting out
  weeks_indoors_max     INTEGER,
  hardening_off_days    INTEGER DEFAULT 7,  -- days to harden off before full outdoor exposure

  -- Germination
  germination_days_min  INTEGER,
  germination_days_max  INTEGER,
  germination_temp_min  INTEGER,  -- celsius
  germination_temp_max  INTEGER,

  -- Spacing (centimetres)
  spacing_cm            INTEGER,      -- between plants in a row
  row_spacing_cm        INTEGER,      -- between rows
  sowing_depth_cm       DECIMAL(4,1),

  -- Plant size
  height_cm_min         INTEGER,
  height_cm_max         INTEGER,

  -- Growing requirements
  sun_requirement       TEXT CHECK (sun_requirement IN ('full_sun', 'partial_shade', 'full_shade')),
  water_needs           TEXT CHECK (water_needs IN ('low', 'medium', 'high')),
  soil_preference       TEXT,  -- e.g. 'well-drained', 'moisture-retentive', 'any'

  -- Ireland-specific
  hardiness_zone        TEXT,        -- RHS H-scale: H1a through H7
  frost_tolerant        BOOLEAN DEFAULT false,
  frost_tender          BOOLEAN DEFAULT false,  -- needs protection below 0°C
  slug_risk             TEXT CHECK (slug_risk IN ('low', 'medium', 'high')),

  -- Perennial info
  is_perennial          BOOLEAN DEFAULT false,
  lifespan_years        INTEGER,     -- null = annual, 2 = biennial, etc.
  prune_month           INTEGER,     -- best month to prune/cut back
  divide_month          INTEGER,     -- best month to divide

  -- Cut flower specific
  is_cut_flower         BOOLEAN DEFAULT false,
  vase_life_days        INTEGER,
  succession_sow        BOOLEAN DEFAULT false,  -- can be succession sown for continuous supply
  succession_interval_weeks INTEGER,

  -- Companion planting (stored as text arrays)
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
```

**Seed data will include (Phase 1):**

Vegetables: Onion, Leek, Potato (Early/Maincrop), Tomato, Carrot, Parsnip, Courgette, Cabbage, Kale, Chard, Beetroot, Lettuce, Spinach, Peas, Broad Beans, French Beans, Runner Beans, Garlic, Shallot, Broccoli, Cauliflower, Cucumber, Pumpkin/Squash, Sweetcorn, Celery, Fennel, Parsley, Coriander, Basil, Chive, Mint, Thyme, Rosemary, Sage

Cut Flowers: Sweet Pea, Sunflower, Zinnia, Cosmos, Dahlia, Lupin, Foxglove, Nigella, Rudbeckia, Echinacea, Scabious, Ammi, Cerinthe, Cornflower, Larkspur, Calendula, Snapdragon, Stock, Statice

Perennials: Achillea, Astrantia, Geranium (hardy), Salvia, Nepeta, Verbena bonariensis, Kniphofia, Phlox, Helenium, Agastache

---

### 2. `garden_beds` — Beds, Pots, and Planters

```sql
CREATE TABLE garden_beds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,  -- e.g. "Raised Bed 1", "Step Planter Left", "Big Pot"
  bed_type          TEXT NOT NULL CHECK (bed_type IN (
                      'raised_bed', 'ground_bed', 'pot', 'planter',
                      'greenhouse_bed', 'window_box', 'grow_bag'
                    )),

  -- Dimensions (metres, nullable for pots/planters)
  length_m          DECIMAL(5,2),
  width_m           DECIMAL(5,2),
  depth_m           DECIMAL(5,2),  -- soil depth

  -- Calculated (can be computed client-side)
  -- area_m2 = length_m * width_m

  -- Location & microclimate
  location_label    TEXT,          -- e.g. "Back garden south wall", "Front step"
  sun_exposure      TEXT CHECK (sun_exposure IN ('full_sun', 'partial_shade', 'full_shade', 'variable')),
  wind_exposure     TEXT CHECK (wind_exposure IN ('sheltered', 'moderate', 'exposed')),
  soil_type         TEXT,          -- e.g. 'homemade compost mix', 'topsoil and compost', 'multipurpose'

  -- Bed purpose/section
  section           TEXT,          -- e.g. 'vegetable', 'cut_flower', 'perennial', 'herb', 'mixed'

  -- Grid position (for future visual designer)
  grid_x            INTEGER,
  grid_y            INTEGER,

  -- Status
  is_active         BOOLEAN DEFAULT true,
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. `bed_plantings` — What's In Each Bed (With History)

```sql
CREATE TABLE bed_plantings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id                UUID NOT NULL REFERENCES garden_beds(id) ON DELETE CASCADE,

  -- Either link to plant library OR use custom name
  plant_id              UUID REFERENCES plants(id),
  custom_plant_name     TEXT,  -- used when plant isn't in the library

  -- Position within bed
  row_number            INTEGER,         -- which row within the bed (1, 2, 3...)
  row_label             TEXT,            -- e.g. "Front row", "Row A"

  -- Quantity
  quantity              INTEGER,         -- number of plants/seeds
  area_m2               DECIMAL(5,2),    -- alternative: area used rather than count

  -- Key dates
  seeds_started_date    DATE,            -- when seeds were started indoors/greenhouse
  sown_outdoors_date    DATE,            -- when directly sown outside
  planted_out_date      DATE,            -- when transplanted outside
  expected_harvest_date DATE,
  actual_harvest_date   DATE,
  removed_date          DATE,            -- when plant was removed (end of season)

  -- Status lifecycle
  status                TEXT DEFAULT 'planned' CHECK (status IN (
                          'planned',        -- not yet started
                          'seeds_started',  -- seeds sown indoors/greenhouse
                          'germinating',    -- waiting for germination
                          'growing',        -- plants in ground, growing
                          'ready',          -- ready to harvest
                          'harvested',      -- main harvest done
                          'finished',       -- season over, plant removed
                          'failed'          -- didn't germinate or died
                        )),

  -- Crop rotation tracking
  growing_year          INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  plant_family          TEXT,  -- stored here for easy crop rotation lookup e.g. 'solanaceae', 'brassica'

  notes                 TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. `monthly_jobs` — Gardening Tasks by Month

```sql
CREATE TABLE monthly_jobs (
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
  plant_category  TEXT,    -- 'vegetable', 'flower', 'perennial', 'general'
  priority        TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  -- User can mark a job done for the current year
  is_done         BOOLEAN DEFAULT false,
  done_year       INTEGER,

  -- Is this a user-added custom job, or from the pre-seeded list?
  is_custom       BOOLEAN DEFAULT false,

  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed data covers all 12 months for Kildare.** Examples:

| Month | Job | Category |
|---|---|---|
| January | Order seeds — plan what you need for the year | order |
| January | Check stored bulbs and tubers for rot | maintenance |
| February | Sow onions and leeks indoors | sow_indoors |
| February | Chit seed potatoes in egg boxes in a cool bright place | prepare |
| March | Sow tomatoes and peppers indoors (heated propagator) | sow_indoors |
| March | Direct sow broad beans outdoors | sow_outdoors |
| April | Plant first early potatoes outdoors | plant_out |
| April | Harden off seedlings started in February | prepare |
| May | Plant out tomatoes (after last frost, mid-May) | plant_out |
| May | Slug watch — high risk after rain | protect |
| June | Succession sow lettuce and salad every 3 weeks | sow_outdoors |
| July | Harvest garlic when leaves yellow | harvest |
| August | Sow spring onions and spinach for autumn | sow_outdoors |
| September | Plant garlic cloves | plant_out |
| October | Lift and store dahlias before first frost | protect |
| October | Plant spring bulbs (tulips, alliums) | plant_out |
| November | Plant bare root roses and hedging | plant_out |
| December | Clean and oil tools, order seed catalogues | maintenance |

---

### 5. `journal_entries` — Log, Harvests, Notes

```sql
CREATE TABLE journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type      TEXT CHECK (entry_type IN (
                    'harvest',      -- logged a harvest
                    'observation',  -- general observation
                    'problem',      -- pest, disease, issue spotted
                    'note',         -- general note
                    'weather',      -- weather event log
                    'purchase'      -- bought seeds, plants, supplies
                  )),

  -- Optional links to beds/plants
  bed_id          UUID REFERENCES garden_beds(id),
  plant_id        UUID REFERENCES plants(id),

  title           TEXT,
  notes           TEXT NOT NULL,

  -- Harvest-specific
  quantity_value  DECIMAL(8,2),
  quantity_unit   TEXT,  -- 'kg', 'g', 'bunch', 'head', 'count'

  -- Problem-specific
  symptoms        TEXT,
  diagnosis       TEXT,
  treatment       TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. `tools` — Tool Inventory

```sql
CREATE TABLE tools (
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
```

---

### 7. `garden_settings` — App Configuration

Key-value store for garden-wide settings.

```sql
CREATE TABLE garden_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Default seed data:**

| Key | Default Value | Notes |
|---|---|---|
| location_name | Kildare, Ireland | Display name |
| latitude | 53.1581 | For weather API |
| longitude | -6.9108 | For weather API |
| hardiness_zone | H4-H5 | RHS scale |
| last_frost_approx | April 15 | Approximate, update yearly |
| first_frost_approx | October 30 | Approximate |
| soil_type | variable | Can be overridden per bed |
| total_garden_area_m2 | null | Fill in once measured |
| garden_name | My Garden | Display name |

---

## Indexes

```sql
-- Speed up calendar queries
CREATE INDEX idx_plants_sow_indoors ON plants(sow_indoors_start, sow_indoors_end);
CREATE INDEX idx_plants_harvest ON plants(harvest_start, harvest_end);
CREATE INDEX idx_plants_category ON plants(category);
CREATE INDEX idx_plants_is_cut_flower ON plants(is_cut_flower);

-- Speed up bed queries
CREATE INDEX idx_bed_plantings_bed_id ON bed_plantings(bed_id);
CREATE INDEX idx_bed_plantings_year ON bed_plantings(growing_year);
CREATE INDEX idx_bed_plantings_status ON bed_plantings(status);

-- Speed up monthly jobs
CREATE INDEX idx_monthly_jobs_month ON monthly_jobs(month);

-- Speed up journal
CREATE INDEX idx_journal_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_journal_bed ON journal_entries(bed_id);
```

---

## Migrations Strategy

Use numbered SQL migration files tracked in `/supabase/migrations/`:

```
supabase/migrations/
├── 001_create_plants.sql
├── 002_create_garden_beds.sql
├── 003_create_bed_plantings.sql
├── 004_create_monthly_jobs.sql
├── 005_create_journal_entries.sql
├── 006_create_tools.sql
├── 007_create_garden_settings.sql
├── 008_seed_plants.sql           ← large seed file
└── 009_seed_monthly_jobs.sql     ← 12 months of Kildare jobs
```

Run via Supabase dashboard SQL editor or Supabase CLI.
