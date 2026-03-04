-- Migration 015: add photo_url to plants, garden_beds, bed_plantings

ALTER TABLE plants        ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE garden_beds   ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE bed_plantings ADD COLUMN IF NOT EXISTS photo_url TEXT;
