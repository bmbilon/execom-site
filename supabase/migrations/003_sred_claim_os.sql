-- 003_sred_claim_os.sql
-- Full schema evolution: MVP portal → SR&ED Claim OS
-- Additive migration — does not drop or recreate 001 tables.
-- Run AFTER 001_sred_portal.sql and 002_auth_trigger.sql.

-- ============================================================
-- 1. EXTEND EXISTING TABLES
-- ============================================================

-- companies → organizations (rename concept, keep table name)
alter table companies
  add column if not exists operating_name text,
  add column if not exists province text default 'AB',
  add column if not exists street text,
  add column if not exists city text,
  add column if not exists postal_code text;

-- claim_years: add filing-critical metadata
alter table claim_years
  add column if not exists tax_year_start date,
  add column if not exists tax_year_end date,
  add column if not exists filing_deadline date,
  add column if not exists method_election text default 'proxy'
    check (method_election in ('proxy','traditional')),
  add column if not exists associated_corp_flag boolean default false,
  add column if not exists province_programs jsonb default '["AB"]'::jsonb;

-- projects: add T661-aligned fields
alter table projects
  add column if not exists field_code text,
  add column if not exists continuation_flag boolean default false,
  add column if not exists collaboration_flag boolean default false,
  add column if not exists project_type text default 'experimental_development'
    check (project_type in ('basic_research','applied_research','experimental_development'));

-- costs: add classification and split fields
alter table costs
  add column if not exists likely_category text,
  add column if not exists confidence_score numeric(3,2),
  add column if not exists related_party_flag boolean default false,
  add column if not exists excluded_flag boolean default false,
  add column if not exists classification_rationale text,
  add column if not exists allocation_percent numeric(5,2) default 100.00,
  add column if not exists province_code text default 'AB',
  add column if not exists province_percent numeric(5,2) default 100.00,
  add column if not exists review_status text default 'pending'
    check (review_status in ('pending','confirmed','excluded','flagged')),
  add column if not exists gl_account text,
  add column if not exists currency text default 'CAD',
  add column if not exists gross_amount numeric(12,2),
  add column if not exists tax_amount numeric(12,2),
  add column if not exists net_amount numeric(12,2);

-- evidence: add richer metadata
alter table evidence
  add column if not exists source_type text,
  add column if not exists external_url text,
  add column if not exists evidence_date date,
  add column if not exists evidence_category text,
  add column if not exists extracted_summary text,
  add column if not exists metadata_json jsonb;

-- ============================================================
-- 2. NEW TABLES: CLAIM CONTACTS
-- ============================================================

create table if not exists claim_contacts (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  contact_role  text not null check (contact_role in ('claimant','preparer','technical','financial')),
  name          text not null,
  title         text,
  email         text,
  phone         text,
  created_at    timestamptz default now()
);

-- ============================================================
-- 3. NEW TABLES: PROJECT NARRATIVE SECTIONS
-- ============================================================

create table if not exists project_narrative_sections (
  id                      uuid primary key default gen_random_uuid(),
  project_id              uuid not null references projects(id) on delete cascade,
  section_key             text not null
    check (section_key in (
      'technical_uncertainty',
      'systematic_investigation',
      'advancement',
      'project_logistics',
      'evidence_retained'
    )),
  raw_text                text,
  ai_draft_text           text,
  approved_text           text,
  evidence_coverage_score numeric(3,2) default 0.00,
  review_status           text default 'draft'
    check (review_status in ('draft','ai_drafted','edited','approved','flagged')),
  updated_at              timestamptz default now(),
  unique (project_id, section_key)
);

-- ============================================================
-- 4. NEW TABLES: PROJECT PEOPLE
-- ============================================================

create table if not exists project_people (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  person_type   text not null check (person_type in ('employee','contractor','subcontractor','consultant')),
  name          text not null,
  role          text,
  employer_type text check (employer_type in ('claimant','arms_length','non_arms_length')),
  notes         text,
  created_at    timestamptz default now()
);

-- ============================================================
-- 5. NEW TABLES: PROJECT EVIDENCE LINKS
-- ============================================================

create table if not exists project_evidence_links (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references projects(id) on delete cascade,
  evidence_id           uuid not null references evidence(id) on delete cascade,
  narrative_section_key text,
  support_strength      text default 'moderate'
    check (support_strength in ('strong','moderate','weak')),
  note                  text,
  created_at            timestamptz default now(),
  unique (project_id, evidence_id, narrative_section_key)
);

-- ============================================================
-- 6. NEW TABLES: COST IMPORTS
-- ============================================================

create table if not exists cost_imports (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  source_type   text not null
    check (source_type in ('payroll_csv','gl_export','ap_export','time_tracking','manual','github','jira','linear')),
  source_name   text,
  imported_at   timestamptz default now(),
  status        text default 'pending'
    check (status in ('pending','processing','complete','failed')),
  row_count     integer,
  metadata_json jsonb
);

-- Link cost lines to imports
alter table costs
  add column if not exists cost_import_id uuid references cost_imports(id);

-- ============================================================
-- 6b. NEW TABLES: COST LINE ITEMS (staging table for raw imports)
-- ============================================================

-- Raw imported lines before classification and project assignment.
-- Each row is one line from a payroll CSV, GL export, or AP file.
-- The user classifies, splits, and promotes these into `costs`.
create table if not exists cost_line_items (
  id               uuid primary key default gen_random_uuid(),
  cost_import_id   uuid not null references cost_imports(id) on delete cascade,
  claim_year_id    uuid not null references claim_years(id) on delete cascade,
  line_date        date,
  vendor_or_employee text,
  description      text,
  gl_account       text,
  gross_amount     numeric(12,2),
  tax_amount       numeric(12,2),
  net_amount       numeric(12,2),
  currency         text default 'CAD',
  raw_payload_json jsonb,
  -- classification (updated after AI or manual review)
  likely_category  text,
  confidence_score numeric(3,2),
  related_party_flag boolean default false,
  excluded_flag    boolean default false,
  rationale        text,
  -- promotion status: once promoted, links to a `costs` row
  promoted_cost_id uuid references costs(id),
  status           text default 'pending'
    check (status in ('pending','classified','promoted','excluded')),
  created_at       timestamptz default now()
);

-- ============================================================
-- 7. NEW TABLES: COST PROJECT SPLITS
-- ============================================================

-- For costs allocated across multiple projects
create table if not exists cost_project_splits (
  id                uuid primary key default gen_random_uuid(),
  cost_id           uuid not null references costs(id) on delete cascade,
  project_id        uuid not null references projects(id) on delete cascade,
  allocation_percent numeric(5,2) not null,
  allocation_amount  numeric(12,2) not null,
  province_code     text default 'AB',
  province_percent  numeric(5,2) default 100.00,
  review_status     text default 'pending'
    check (review_status in ('pending','confirmed','excluded','flagged')),
  created_at        timestamptz default now(),
  unique (cost_id, project_id)
);

-- ============================================================
-- 8. NEW TABLES: ASSISTANCE ITEMS
-- ============================================================

create table if not exists assistance_items (
  id                uuid primary key default gen_random_uuid(),
  claim_year_id     uuid not null references claim_years(id) on delete cascade,
  assistance_type   text not null
    check (assistance_type in ('government_grant','government_assistance','non_government_assistance','contract_payment')),
  source_name       text not null,
  amount            numeric(12,2) not null,
  linked_project_id uuid references projects(id),
  treatment_notes   text,
  created_at        timestamptz default now()
);

-- ============================================================
-- 9. NEW TABLES: FEDERAL CALCULATION
-- ============================================================

create table if not exists federal_claim_snapshots (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  snapshot_type text default 'draft'
    check (snapshot_type in ('draft','final','amendment')),
  payload_json  jsonb not null,
  created_at    timestamptz default now()
);

create table if not exists federal_line_values (
  id                  uuid primary key default gen_random_uuid(),
  claim_year_id       uuid not null references claim_years(id) on delete cascade,
  snapshot_id         uuid references federal_claim_snapshots(id),
  form_code           text not null default 'T661',
  line_code           text not null,
  value               numeric(14,2),
  explanation         text,
  created_at          timestamptz default now(),
  unique (claim_year_id, snapshot_id, form_code, line_code)
);

create table if not exists federal_calculation_steps (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  snapshot_id   uuid references federal_claim_snapshots(id),
  step_order    integer not null,
  step_name     text not null,
  input_value   numeric(14,2),
  adjustment    numeric(14,2),
  output_value  numeric(14,2),
  explanation   text,
  created_at    timestamptz default now()
);

-- ============================================================
-- 10. NEW TABLES: PROVINCIAL CALCULATION
-- ============================================================

create table if not exists provincial_claim_snapshots (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  province_code text not null default 'AB',
  snapshot_type text default 'draft'
    check (snapshot_type in ('draft','final','amendment')),
  payload_json  jsonb not null,
  created_at    timestamptz default now()
);

create table if not exists provincial_line_values (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  snapshot_id   uuid references provincial_claim_snapshots(id),
  province_code text not null default 'AB',
  form_code     text not null,
  line_code     text not null,
  value         numeric(14,2),
  explanation   text,
  created_at    timestamptz default now(),
  unique (claim_year_id, snapshot_id, province_code, form_code, line_code)
);

create table if not exists provincial_project_breakdowns (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  snapshot_id   uuid references provincial_claim_snapshots(id),
  project_id    uuid not null references projects(id),
  province_code text not null default 'AB',
  alberta_expenditures   numeric(14,2),
  non_alberta_share      numeric(14,2),
  alberta_salaries       numeric(14,2),
  federal_proxy_in_ab    numeric(14,2),
  alberta_proxy_amount   numeric(14,2),
  created_at    timestamptz default now()
);

-- ============================================================
-- 11. NEW TABLES: REVIEW ISSUES (FORM-NATIVE)
-- ============================================================

create table if not exists review_issues (
  id                uuid primary key default gen_random_uuid(),
  claim_year_id     uuid not null references claim_years(id) on delete cascade,
  project_id        uuid references projects(id),
  issue_type        text not null,
  severity          text not null check (severity in ('blocker','warning','info')),
  source_area       text not null,
  message           text not null,
  resolution_status text default 'open'
    check (resolution_status in ('open','resolved','dismissed','deferred')),
  resolution_note   text,
  rule_key          text,
  created_at        timestamptz default now(),
  resolved_at       timestamptz
);

-- ============================================================
-- 12. NEW TABLES: CLAIM SNAPSHOTS + EXPORT BUNDLES
-- ============================================================

create table if not exists claim_snapshots (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  snapshot_type text not null
    check (snapshot_type in ('pre_export','pre_review','manual','amendment')),
  payload_json  jsonb not null,
  created_at    timestamptz default now()
);

create table if not exists export_bundles (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid not null references claim_years(id) on delete cascade,
  version_label text not null,
  export_type   text not null
    check (export_type in ('t661_package','schedule_31','alberta_package','narrative_pack','evidence_appendix','cost_support','reviewer_memo','full_bundle')),
  status        text default 'generating'
    check (status in ('generating','ready','failed','superseded')),
  snapshot_id   uuid references claim_snapshots(id),
  storage_key   text,
  file_size     bigint,
  generated_by  uuid references profiles(id),
  created_at    timestamptz default now()
);

-- ============================================================
-- 13. ENABLE RLS ON NEW TABLES
-- ============================================================

alter table claim_contacts              enable row level security;
alter table project_narrative_sections  enable row level security;
alter table project_people              enable row level security;
alter table project_evidence_links      enable row level security;
alter table cost_imports                enable row level security;
alter table cost_line_items             enable row level security;
alter table cost_project_splits         enable row level security;
alter table assistance_items            enable row level security;
alter table federal_claim_snapshots     enable row level security;
alter table federal_line_values         enable row level security;
alter table federal_calculation_steps   enable row level security;
alter table provincial_claim_snapshots  enable row level security;
alter table provincial_line_values      enable row level security;
alter table provincial_project_breakdowns enable row level security;
alter table review_issues               enable row level security;
alter table claim_snapshots             enable row level security;
alter table export_bundles              enable row level security;

-- ============================================================
-- 14. RLS POLICIES ON NEW TABLES
-- All use the same pattern: company access via claim_year or execom staff
-- ============================================================

-- Helper: get company_id from a claim_year_id
create or replace function claim_year_company(cy_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from claim_years where id = cy_id
$$;

-- claim_contacts
create policy "claim_contacts_access" on claim_contacts
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- project_narrative_sections (via project → claim_year)
create policy "narrative_sections_access" on project_narrative_sections
  for all using (
    user_belongs_to_company(
      (select c.company_id from projects p join claim_years c on c.id = p.claim_year_id where p.id = project_id)
    ) or is_execom_staff()
  );

-- project_people
create policy "project_people_access" on project_people
  for all using (
    user_belongs_to_company(
      (select c.company_id from projects p join claim_years c on c.id = p.claim_year_id where p.id = project_id)
    ) or is_execom_staff()
  );

-- project_evidence_links
create policy "evidence_links_access" on project_evidence_links
  for all using (
    user_belongs_to_company(
      (select c.company_id from projects p join claim_years c on c.id = p.claim_year_id where p.id = project_id)
    ) or is_execom_staff()
  );

-- cost_imports
create policy "cost_imports_access" on cost_imports
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- cost_line_items
create policy "cost_line_items_access" on cost_line_items
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- cost_project_splits
create policy "cost_splits_access" on cost_project_splits
  for all using (
    user_belongs_to_company(
      (select c.company_id from costs co join claim_years c on c.id = co.claim_year_id where co.id = cost_id)
    ) or is_execom_staff()
  );

-- assistance_items
create policy "assistance_access" on assistance_items
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- federal_claim_snapshots
create policy "fed_snapshots_access" on federal_claim_snapshots
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- federal_line_values
create policy "fed_lines_access" on federal_line_values
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- federal_calculation_steps
create policy "fed_steps_access" on federal_calculation_steps
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- provincial_claim_snapshots
create policy "prov_snapshots_access" on provincial_claim_snapshots
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- provincial_line_values
create policy "prov_lines_access" on provincial_line_values
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- provincial_project_breakdowns
create policy "prov_breakdowns_access" on provincial_project_breakdowns
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- review_issues
create policy "review_issues_access" on review_issues
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- claim_snapshots
create policy "snapshots_access" on claim_snapshots
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- export_bundles
create policy "bundles_access" on export_bundles
  for all using (
    user_belongs_to_company(claim_year_company(claim_year_id))
    or is_execom_staff()
  );

-- ============================================================
-- 15. INDEXES FOR PERFORMANCE
-- ============================================================

create index if not exists idx_narrative_project on project_narrative_sections(project_id);
create index if not exists idx_people_project on project_people(project_id);
create index if not exists idx_evidence_links_project on project_evidence_links(project_id);
create index if not exists idx_evidence_links_evidence on project_evidence_links(evidence_id);
create index if not exists idx_cost_splits_cost on cost_project_splits(cost_id);
create index if not exists idx_cost_splits_project on cost_project_splits(project_id);
create index if not exists idx_cost_imports_claim on cost_imports(claim_year_id);
create index if not exists idx_cost_line_items_import on cost_line_items(cost_import_id);
create index if not exists idx_cost_line_items_claim on cost_line_items(claim_year_id);
create index if not exists idx_assistance_claim on assistance_items(claim_year_id);
create index if not exists idx_fed_lines_claim on federal_line_values(claim_year_id);
create index if not exists idx_prov_lines_claim on provincial_line_values(claim_year_id);
create index if not exists idx_review_issues_claim on review_issues(claim_year_id);
create index if not exists idx_review_issues_project on review_issues(project_id);
create index if not exists idx_export_bundles_claim on export_bundles(claim_year_id);
create index if not exists idx_claim_contacts_claim on claim_contacts(claim_year_id);
