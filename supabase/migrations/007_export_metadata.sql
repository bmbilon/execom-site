-- ============================================================================
-- Migration 007: Export bundle metadata for provincial packaging
-- Adds export_metadata jsonb column and expands status CHECK to include 'skipped'
-- ============================================================================

-- Add export_metadata column for structured provincial export info
ALTER TABLE export_bundles ADD COLUMN IF NOT EXISTS export_metadata jsonb;

-- Expand status CHECK to include 'skipped' for graceful empty-form handling
ALTER TABLE export_bundles DROP CONSTRAINT IF EXISTS export_bundles_status_check;

-- The status column may not have a named CHECK — handle both cases
DO $$ BEGIN
  ALTER TABLE export_bundles
    ADD CONSTRAINT export_bundles_status_check
    CHECK (status IN ('generating', 'ready', 'failed', 'superseded', 'skipped'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
