-- Bind each employer nomination to its own private participant draft.
ALTER TABLE executive_ai.nominations ADD COLUMN IF NOT EXISTS draft_id uuid;
