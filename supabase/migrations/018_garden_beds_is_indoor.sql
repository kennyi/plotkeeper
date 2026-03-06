-- Migration 018: Add is_indoor flag to garden_beds
-- Simple boolean to distinguish indoor growing spaces (polytunnel, greenhouse,
-- windowsill) from outdoor beds.

ALTER TABLE garden_beds
  ADD COLUMN IF NOT EXISTS is_indoor BOOLEAN NOT NULL DEFAULT false;
