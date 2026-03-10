-- ── Planting photos ──────────────────────────────────────────────────────────
-- Stores the photo gallery for each planting (bed_plantings row).
-- Sorted oldest-first in the lightbox so swiping through shows growth over time.

CREATE TABLE IF NOT EXISTS planting_photos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id  UUID        NOT NULL REFERENCES bed_plantings(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES auth.users(id),
  photo_url    TEXT        NOT NULL,
  storage_path TEXT,                        -- path within the storage bucket
  taken_at     DATE        NOT NULL DEFAULT CURRENT_DATE,
  plant_status TEXT,                        -- planting status at time of photo
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planting_photos_planting_id_taken_at
  ON planting_photos(planting_id, taken_at);

-- ── Bed photos ────────────────────────────────────────────────────────────────
-- Stores the photo gallery for each garden bed.
-- Date only — no status field needed for beds.

CREATE TABLE IF NOT EXISTS bed_photos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id       UUID        NOT NULL REFERENCES garden_beds(id) ON DELETE CASCADE,
  user_id      UUID        REFERENCES auth.users(id),
  photo_url    TEXT        NOT NULL,
  storage_path TEXT,                        -- path within the storage bucket
  taken_at     DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bed_photos_bed_id_taken_at
  ON bed_photos(bed_id, taken_at);

-- ── Storage bucket (run this separately in Supabase Storage dashboard) ────────
-- Bucket name: plant-images   (public, 10MB file limit, images only)
-- Bucket name: bed-images     (public, 10MB file limit, images only)
--
-- Alternatively create a single 'garden-photos' bucket and use path prefixes:
--   plantings/{planting_id}/{timestamp}.{ext}
--   beds/{bed_id}/{timestamp}.{ext}
