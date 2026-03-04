-- Migration 011: App feedback table
-- Lets Ian log thoughts, bugs, and suggestions from within the app.
-- Queried directly in Supabase dashboard — no UI list needed yet.

CREATE TABLE app_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'suggestion', 'question', 'observation')),
  page_context  TEXT,        -- e.g. '/beds/123', '/dashboard'
  message       TEXT NOT NULL,
  status        TEXT DEFAULT 'open' CHECK (status IN ('open', 'noted', 'done', 'wontfix')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reading feedback in chronological order
CREATE INDEX idx_feedback_created ON app_feedback(created_at DESC);
