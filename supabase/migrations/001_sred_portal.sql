-- 001_sred_portal.sql
-- Full Supabase migration for the SR&ED Portal schema

-- ============================================================
-- TABLES
-- ============================================================

create table companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  legal_name  text,
  bn          text,  -- CRA Business Number e.g. 123456789RC0001
  fiscal_ye_month integer default 12,
  industry    text,
  address     jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references companies(id) on delete cascade,
  email       text not null unique,
  full_name   text not null,
  role        text not null check (role in ('owner','admin','contributor','viewer')),
  is_execom_staff boolean default false,
  invited_by  uuid references profiles(id),
  created_at  timestamptz default now()
);

create table claim_years (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  fiscal_year integer not null,
  status      text not null default 'draft'
              check (status in ('draft','in_progress','ready_for_review','under_review','changes_requested','approved','filed')),
  claim_json  jsonb,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (company_id, fiscal_year)
);

create table files (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid references claim_years(id) on delete cascade,
  uploaded_by   uuid references profiles(id),
  file_name     text not null,
  storage_key   text not null,
  category      text not null check (category in ('payroll','accounting','technical','contract','other')),
  mime_type     text,
  file_size     bigint,
  metadata      jsonb,
  uploaded_at   timestamptz default now()
);

create table projects (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid references claim_years(id) on delete cascade,
  company_id    uuid not null references companies(id),
  name          text not null,
  code          text,
  status        text not null default 'draft'
                check (status in ('draft','complete','flagged')),
  objective     text,
  uncertainty   text,
  work_done     text,
  advancement   text,
  start_date    date,
  end_date      date,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table evidence (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id) on delete cascade,
  claim_year_id uuid not null references claim_years(id),
  file_id       uuid references files(id),
  evidence_type text not null check (evidence_type in ('document','email','commit_log','photo','test_result','report','other')),
  title         text not null,
  description   text,
  date_range    daterange,
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create table costs (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid references projects(id) on delete cascade,
  claim_year_id      uuid not null references claim_years(id),
  file_id            uuid references files(id),
  cost_type          text not null check (cost_type in ('salary','wages','subcontractor','materials','overhead','other')),
  description        text not null,
  amount             numeric(12,2) not null,
  hours              numeric(8,2),
  rate               numeric(10,2),
  employee_name      text,
  vendor_name        text,
  external_reference text,
  period_start       date,
  period_end         date,
  source             text default 'manual' check (source in ('manual','imported')),
  sort_order         integer default 0,
  created_at         timestamptz default now()
);

create table claim_outputs (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid references claim_years(id) on delete cascade,
  output_type   text not null check (output_type in ('xlsx','pdf','json')),
  version       integer not null default 1,
  storage_key   text,
  payload       jsonb,
  generated_by  uuid references profiles(id),
  created_at    timestamptz default now()
);

create table reviews (
  id            uuid primary key default gen_random_uuid(),
  claim_year_id uuid references claim_years(id) on delete cascade,
  requested_by  uuid references profiles(id),
  reviewer_id   uuid references profiles(id),
  status        text not null default 'pending'
                check (status in ('pending','in_review','changes_requested','approved')),
  notes         text,
  requested_at  timestamptz default now(),
  resolved_at   timestamptz
);

create table review_comments (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid references reviews(id) on delete cascade,
  author_id   uuid references profiles(id),
  target_type text check (target_type in ('project','cost','evidence','general')),
  target_id   uuid,
  comment     text not null,
  created_at  timestamptz default now()
);

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_value   jsonb,
  new_value   jsonb,
  created_at  timestamptz default now()
);

-- ============================================================
-- RLS HELPER FUNCTIONS
-- ============================================================

create or replace function get_my_profile()
returns profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from profiles where id = auth.uid()
$$;

create or replace function user_belongs_to_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and company_id = target_company_id
  )
$$;

create or replace function is_execom_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_execom_staff from profiles where id = auth.uid()),
    false
  )
$$;

-- ============================================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================================

alter table companies       enable row level security;
alter table profiles        enable row level security;
alter table claim_years     enable row level security;
alter table files           enable row level security;
alter table projects        enable row level security;
alter table evidence        enable row level security;
alter table costs           enable row level security;
alter table claim_outputs   enable row level security;
alter table reviews         enable row level security;
alter table review_comments enable row level security;
alter table audit_log       enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- companies
create policy "companies_access" on companies
  for all
  using (user_belongs_to_company(id) or is_execom_staff());

-- profiles
create policy "profiles_access" on profiles
  for all
  using (user_belongs_to_company(company_id) or is_execom_staff());

-- claim_years
create policy "claim_years_access" on claim_years
  for all
  using (user_belongs_to_company(company_id) or is_execom_staff());

-- projects
create policy "projects_access" on projects
  for all
  using (user_belongs_to_company(company_id) or is_execom_staff());

-- files
create policy "files_access" on files
  for all
  using (
    user_belongs_to_company(
      (select company_id from claim_years where id = claim_year_id)
    )
    or is_execom_staff()
  );

-- evidence
create policy "evidence_access" on evidence
  for all
  using (
    user_belongs_to_company(
      (select company_id from claim_years where id = claim_year_id)
    )
    or is_execom_staff()
  );

-- costs
create policy "costs_access" on costs
  for all
  using (
    user_belongs_to_company(
      (select company_id from claim_years where id = claim_year_id)
    )
    or is_execom_staff()
  );

-- claim_outputs
create policy "claim_outputs_access" on claim_outputs
  for all
  using (
    user_belongs_to_company(
      (select company_id from claim_years where id = claim_year_id)
    )
    or is_execom_staff()
  );

-- reviews
create policy "reviews_access" on reviews
  for all
  using (
    user_belongs_to_company(
      (select company_id from claim_years where id = claim_year_id)
    )
    or is_execom_staff()
  );

-- review_comments
create policy "review_comments_access" on review_comments
  for all
  using (
    user_belongs_to_company(
      (select cy.company_id
       from reviews r
       join claim_years cy on cy.id = r.claim_year_id
       where r.id = review_id)
    )
    or is_execom_staff()
  );

-- audit_log (separate insert and select policies)
create policy "audit_log_insert" on audit_log
  for insert
  with check (auth.uid() is not null);

create policy "audit_log_select" on audit_log
  for select
  using (
    user_belongs_to_company(
      (select company_id from profiles where id = audit_log.user_id)
    )
    or is_execom_staff()
  );
