-- Migration 007: Create garden_settings table

CREATE TABLE IF NOT EXISTS garden_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
