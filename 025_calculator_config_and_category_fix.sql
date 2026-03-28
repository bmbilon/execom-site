-- =============================================================================
-- 025_calculator_config_and_category_fix.sql
-- Purpose:
--   1) Move retirement match rates into methodology_configs
--      (replaces hardcoded 0.04/0.06 in calculatorService)
--   2) Correct software_stack_annual category classification
-- =============================================================================

BEGIN;

-- --------------------------------------------------
-- 1. Add retirement match rate configs
-- --------------------------------------------------
-- Schema: methodology_configs has (key text, label text NOT NULL,
--   value jsonb NOT NULL, description text, scenario_scope text,
--   effective_date date, superseded_date date)
-- Unique index: (key, effective_date) WHERE superseded_date IS NULL

INSERT INTO public.methodology_configs (
  key, label, value, description, scenario_scope, effective_date
)
VALUES
  (
    'retirement_gap_match_rate_low',
    'Retirement Gap Match Rate (Low)',
    '0.04',
    'Lower bound employer RRSP matching assumption (4% of salary) used by retirement_contribution_gap calculation',
    'all',
    '2026-01-01'
  ),
  (
    'retirement_gap_match_rate_high',
    'Retirement Gap Match Rate (High)',
    '0.06',
    'Upper bound employer RRSP matching assumption (6% of salary) used by retirement_contribution_gap calculation',
    'all',
    '2026-01-01'
  )
ON CONFLICT (key, effective_date) WHERE superseded_date IS NULL
DO UPDATE SET
  value       = EXCLUDED.value,
  description = EXCLUDED.description;

-- --------------------------------------------------
-- 2. Correct SaaS stack classification
-- --------------------------------------------------
-- software_stack_annual was grouped under 'compliance' in 022;
-- it belongs under 'operating' (SaaS tooling is not compliance).

UPDATE public.benchmark_categories
SET category_group = 'operating'
WHERE slug = 'software_stack_annual'
  AND category_group = 'compliance';

COMMIT;
