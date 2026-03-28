-- =============================================================================
-- 023_verified_source_migration.sql
-- Schema additions for the verified-source-audit model
-- Adds citability, source-type columns, compliance flags on regions,
-- and confidence metadata on methodology configs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. benchmark_values: source trust metadata
-- ---------------------------------------------------------------------------
alter table public.benchmark_values
  add column if not exists source_type text default 'unclassified',
  add column if not exists is_citable boolean not null default true;

comment on column public.benchmark_values.source_type is
  'Provenance: government_official, institutional_research, law_firm_published_pricing, insurance_brokerage, methodology_assumption, unclassified';
comment on column public.benchmark_values.is_citable is
  'true = may appear in the "sources used" UI section; false = methodology/internal only';

create index if not exists bv_citable_idx
  on public.benchmark_values (is_citable)
  where superseded_date is null;

-- ---------------------------------------------------------------------------
-- 2. regions: compliance risk flags
-- ---------------------------------------------------------------------------
alter table public.regions
  add column if not exists compliance_risk_flags jsonb not null default '[]'::jsonb;

comment on column public.regions.compliance_risk_flags is
  'Array of province-specific compliance warnings surfaced in scenario notes, e.g. Ontario CRA annual return no longer accepted.';

-- ---------------------------------------------------------------------------
-- 3. methodology_configs: confidence and source classification
-- ---------------------------------------------------------------------------
alter table public.methodology_configs
  add column if not exists confidence_score int not null default 3,
  add column if not exists source_type text not null default 'internal_methodology';

comment on column public.methodology_configs.confidence_score is
  '1 = internal assumption only; 2 = weak/demoted benchmark; 3 = reasonable default; 4-5 = verified but stored as config';
comment on column public.methodology_configs.source_type is
  'Provenance: government_official, institutional_research, methodology_assumption, demoted_benchmark';
