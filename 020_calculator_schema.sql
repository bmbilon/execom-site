-- =============================================================================
-- 020_calculator_schema.sql
-- Phase 1: Supabase-backed calculator engine — schema migration
-- Execom Homepage Calculator — Province-Aware, Source-Backed Pricing Engine
-- =============================================================================

-- Enable uuid generation if not already enabled
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. regions
-- ---------------------------------------------------------------------------
create table if not exists public.regions (
  id                              uuid primary key default uuid_generate_v4(),
  code                            text not null,
  name                            text not null,
  incorporation_type              text not null default 'provincial',
  registry_agent_required         boolean not null default false,
  uses_nuans                      boolean not null default true,
  gst_hst_type                    text not null default 'GST_only',
  gst_hst_rate                    numeric(5,4) not null default 0.05,
  pst_rate                        numeric(5,4),
  wcb_avg_rate_pct                numeric(5,4),
  residency_director_requirement  boolean not null default false,
  extra_prov_registration_required boolean not null default false,
  annual_return_fee               numeric(10,2),
  annual_return_gov_fee           numeric(10,2),
  filing_floor                    numeric(10,2) not null default 0,
  notes                           text,
  effective_date                  date not null default current_date,
  superseded_date                 date,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

create unique index if not exists regions_code_effective_idx
  on public.regions (code, effective_date)
  where superseded_date is null;

comment on table public.regions is 'Province/jurisdiction metadata. All benchmarks join back to a region. Time-versioned: never mutate, always supersede.';

-- ---------------------------------------------------------------------------
-- 2. benchmark_categories
-- ---------------------------------------------------------------------------
create table if not exists public.benchmark_categories (
  id                    uuid primary key default uuid_generate_v4(),
  slug                  text not null unique,
  label                 text not null,
  category_group        text not null,
  applies_to_scenarios  text[] not null default '{}',
  is_one_time           boolean not null default false,
  recurrence_unit       text,
  requires_sred         boolean not null default false,
  is_optional           boolean not null default false,
  description           text,
  created_at            timestamptz not null default now()
);

comment on table public.benchmark_categories is 'Taxonomy of all cost types modeled in the calculator engine.';

-- ---------------------------------------------------------------------------
-- 3. sources
-- ---------------------------------------------------------------------------
create table if not exists public.sources (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  publisher         text,
  url               text,
  citation_label    text not null,
  accessed_date     date,
  published_date    date,
  region_code       text,
  source_type       text not null,
  trust_tier        int not null check (trust_tier between 1 and 4),
  excerpt           text,
  claim_supported   text,
  is_primary        boolean not null default false,
  notes             text,
  active            boolean not null default true,
  review_due_date   date,
  created_at        timestamptz not null default now()
);

comment on table public.sources is 'Full citation metadata for every benchmark. Trust tiers: 1=government, 2=firm published, 3=aggregator, 4=community.';

-- ---------------------------------------------------------------------------
-- 4. benchmark_values
-- ---------------------------------------------------------------------------
create table if not exists public.benchmark_values (
  id                        uuid primary key default uuid_generate_v4(),
  benchmark_category_id     uuid not null references public.benchmark_categories(id),
  region_id                 uuid references public.regions(id),
  scenario                  text not null default 'all',
  value_low                 numeric(12,2),
  value_median              numeric(12,2),
  value_high                numeric(12,2),
  unit                      text not null default 'CAD',
  engagement_structure      text,
  includes                  text,
  excludes                  text,
  confidence_score          int check (confidence_score between 1 and 5),
  source_freshness          text default 'current_2026',
  notes                     text,
  effective_date            date not null default current_date,
  superseded_date           date,
  version                   int not null default 1,
  manual_override           boolean not null default false,
  admin_notes               text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists bv_category_region_idx
  on public.benchmark_values (benchmark_category_id, region_id)
  where superseded_date is null;

create index if not exists bv_scenario_idx
  on public.benchmark_values (scenario)
  where superseded_date is null;

comment on table public.benchmark_values is 'Core data table. Every dollar figure, percentage, and timeline. Time-versioned: never mutate rows, always supersede and create new.';

-- ---------------------------------------------------------------------------
-- 5. benchmark_source_links (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.benchmark_source_links (
  id                  uuid primary key default uuid_generate_v4(),
  benchmark_value_id  uuid not null references public.benchmark_values(id),
  source_id           uuid not null references public.sources(id),
  relevance_note      text,
  is_primary_source   boolean not null default false
);

create unique index if not exists bsl_unique_idx
  on public.benchmark_source_links (benchmark_value_id, source_id);

comment on table public.benchmark_source_links is 'Many-to-many join: each benchmark value can have multiple supporting sources.';

-- ---------------------------------------------------------------------------
-- 6. execom_tier_assumptions
-- ---------------------------------------------------------------------------
create table if not exists public.execom_tier_assumptions (
  id                            uuid primary key default uuid_generate_v4(),
  tier_slug                     text not null,
  tier_label                    text not null,
  price_low                     numeric(10,2) not null,
  price_median                  numeric(10,2) not null,
  price_high                    numeric(10,2) not null,
  founder_tax_displaced_low     numeric(10,2),
  founder_tax_displaced_high    numeric(10,2),
  roi_multiple_low              numeric(5,2),
  roi_multiple_high             numeric(5,2),
  replaces_categories           text[] not null default '{}',
  does_not_replace              text[] not null default '{}',
  target_segment                text[] not null default '{}',
  timeline_weeks                numeric(5,1),
  headline_saving_description   text,
  effective_date                date not null default current_date,
  superseded_date               date,
  created_at                    timestamptz not null default now()
);

create unique index if not exists eta_slug_effective_idx
  on public.execom_tier_assumptions (tier_slug, effective_date)
  where superseded_date is null;

comment on table public.execom_tier_assumptions is 'What each execom tier includes, its price, and the ROI story it tells. Time-versioned.';

-- ---------------------------------------------------------------------------
-- 7. methodology_configs
-- ---------------------------------------------------------------------------
create table if not exists public.methodology_configs (
  id              uuid primary key default uuid_generate_v4(),
  key             text not null,
  label           text not null,
  value           jsonb not null,
  description     text,
  scenario_scope  text,
  effective_date  date not null default current_date,
  superseded_date date,
  created_at      timestamptz not null default now()
);

create unique index if not exists mc_key_effective_idx
  on public.methodology_configs (key, effective_date)
  where superseded_date is null;

comment on table public.methodology_configs is 'Global calculation assumptions. Admins can adjust these without changing benchmark values.';

-- ---------------------------------------------------------------------------
-- 8. calculator_runs
-- ---------------------------------------------------------------------------
create table if not exists public.calculator_runs (
  id                            uuid primary key default uuid_generate_v4(),
  session_id                    text,
  user_id                       uuid,
  created_at                    timestamptz not null default now(),
  inputs                        jsonb not null,
  outputs                       jsonb not null,
  province_code                 text,
  business_model_segment        text,
  includes_sred                 boolean not null default false,
  benchmark_version_snapshot    text,
  methodology_config_snapshot   jsonb,
  recommended_tier              text,
  lead_captured                 boolean not null default false,
  crm_synced                    boolean not null default false,
  crm_contact_id                text,
  ip_region                     text
);

create index if not exists cr_province_idx on public.calculator_runs (province_code);
create index if not exists cr_created_idx on public.calculator_runs (created_at desc);

comment on table public.calculator_runs is 'Stores each calculator session for analytics, lead capture, and CRM sync.';

-- ---------------------------------------------------------------------------
-- Row-level security (public read for calculator, authenticated write for runs)
-- ---------------------------------------------------------------------------
alter table public.regions enable row level security;
alter table public.benchmark_categories enable row level security;
alter table public.benchmark_values enable row level security;
alter table public.sources enable row level security;
alter table public.benchmark_source_links enable row level security;
alter table public.execom_tier_assumptions enable row level security;
alter table public.methodology_configs enable row level security;
alter table public.calculator_runs enable row level security;

-- Public read access for all reference tables (calculator runs on the homepage)
create policy "Public read regions" on public.regions for select using (true);
create policy "Public read benchmark_categories" on public.benchmark_categories for select using (true);
create policy "Public read benchmark_values" on public.benchmark_values for select using (true);
create policy "Public read sources" on public.sources for select using (true);
create policy "Public read benchmark_source_links" on public.benchmark_source_links for select using (true);
create policy "Public read execom_tier_assumptions" on public.execom_tier_assumptions for select using (true);
create policy "Public read methodology_configs" on public.methodology_configs for select using (true);

-- Calculator runs: anyone can insert (anonymous homepage visitors), only staff can read
create policy "Public insert calculator_runs" on public.calculator_runs for insert with check (true);
create policy "Staff read calculator_runs" on public.calculator_runs for select using (
  auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- Updated_at trigger function (reuse if exists from earlier migrations)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger regions_updated_at
  before update on public.regions
  for each row execute function public.set_updated_at();

create trigger benchmark_values_updated_at
  before update on public.benchmark_values
  for each row execute function public.set_updated_at();
