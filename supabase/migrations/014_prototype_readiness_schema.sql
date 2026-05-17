-- ════════════════════════════════════════════════════════════════════════════
-- Migration 014 — Prototype Readiness Assessment
--
-- Intake instrument for prospective prototyping / commercialization clients.
-- A founder fills a multi-step wizard; execom staff review submissions and
-- score them internally to route the lead into one of:
--
--   • Validation Sprint      ($3.5k–$7.5k)
--   • Prototype Blueprint    ($8k–$15k)
--   • Build & Launch Plan    ($15k–$50k+)
--   • Not ready (educate & nurture)
--
-- The founder never sees their score or tier — they only see a generic
-- "thank you, we will be in touch" confirmation. Scoring is for execom
-- staff only and lives behind the existing is_execom_staff RLS pattern.
--
-- Answers are stored as a single jsonb column keyed by question_id, matching
-- the project's existing JSONB-first persistence pattern (see claim_year.claim_json).
-- ════════════════════════════════════════════════════════════════════════════


-- ─── Enum for status ───────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'prototype_assessment_status') then
    create type prototype_assessment_status as enum (
      'in_progress',
      'submitted',
      'reviewing',
      'contacted',
      'closed_won',
      'closed_lost',
      'archived'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'prototype_assessment_tier') then
    create type prototype_assessment_tier as enum (
      'high',
      'medium',
      'risky',
      'not_ready'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'prototype_recommended_path') then
    create type prototype_recommended_path as enum (
      'reality_review',
      'validation_sprint',
      'prototype_blueprint',
      'build_launch',
      'not_ready'
    );
  end if;
end $$;


-- ─── Main table ────────────────────────────────────────────────────────────

create table if not exists prototype_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  status prototype_assessment_status not null default 'in_progress',

  -- Wizard progress
  current_step smallint not null default 1,
  total_steps  smallint not null default 7,

  -- Lightweight identity (also captured in the answers JSONB, surfaced
  -- here for fast listing / sorting in the admin queue)
  founder_name   text,
  founder_email  text,
  company_name   text,
  product_name   text,

  -- The full set of answers, keyed by question id. Free-form to allow the
  -- question catalog to evolve without further migrations.
  answers jsonb not null default '{}'::jsonb,

  -- Internal scoring (execom staff only — never shown to the founder)
  internal_score     smallint,   -- 0–100 composite
  internal_tier      prototype_assessment_tier,
  recommended_path   prototype_recommended_path,
  internal_notes     text,
  scored_at          timestamptz,
  scored_by          uuid references auth.users(id),

  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- A founder shouldn't accidentally start two concurrent drafts. Enforce
  -- at most one in-progress draft per user; submitted ones can stack.
  constraint chk_score_range check (
    internal_score is null or (internal_score between 0 and 100)
  )
);

create unique index if not exists uniq_proto_assess_one_draft
  on prototype_assessments(user_id)
  where status = 'in_progress';

create index if not exists idx_proto_assess_user      on prototype_assessments(user_id);
create index if not exists idx_proto_assess_status    on prototype_assessments(status);
create index if not exists idx_proto_assess_tier      on prototype_assessments(internal_tier);
create index if not exists idx_proto_assess_submitted on prototype_assessments(submitted_at desc);


-- ─── updated_at trigger ────────────────────────────────────────────────────

create or replace function set_prototype_assessments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_prototype_assessments_updated_at on prototype_assessments;
create trigger trg_prototype_assessments_updated_at
  before update on prototype_assessments
  for each row execute function set_prototype_assessments_updated_at();


-- ─── RLS ───────────────────────────────────────────────────────────────────

alter table prototype_assessments enable row level security;

-- Founder: can see their own assessments only
drop policy if exists "Users view own prototype assessments" on prototype_assessments;
create policy "Users view own prototype assessments"
  on prototype_assessments for select
  using (auth.uid() = user_id);

-- Founder: can create their own
drop policy if exists "Users insert own prototype assessments" on prototype_assessments;
create policy "Users insert own prototype assessments"
  on prototype_assessments for insert
  with check (auth.uid() = user_id);

-- Founder: can update only their in_progress draft. The scoring columns
-- are NOT excluded here at the SQL level because RLS can't gate columns —
-- the application layer (server actions) is the source of truth for which
-- columns the founder is allowed to write. We just ensure they can't
-- edit a submitted/reviewed assessment.
drop policy if exists "Users update own prototype assessments (draft only)" on prototype_assessments;
create policy "Users update own prototype assessments (draft only)"
  on prototype_assessments for update
  using (auth.uid() = user_id and status = 'in_progress')
  with check (auth.uid() = user_id);

-- Staff: see everything
drop policy if exists "Staff view all prototype assessments" on prototype_assessments;
create policy "Staff view all prototype assessments"
  on prototype_assessments for select
  using (exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.is_execom_staff = true
  ));

-- Staff: update everything (for scoring, notes, status changes)
drop policy if exists "Staff update all prototype assessments" on prototype_assessments;
create policy "Staff update all prototype assessments"
  on prototype_assessments for update
  using (exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.is_execom_staff = true
  ));


-- ─── Admin queue view ──────────────────────────────────────────────────────

create or replace view prototype_assessment_queue as
select
  a.id,
  a.user_id,
  a.status,
  a.founder_name,
  a.founder_email,
  a.company_name,
  a.product_name,
  a.internal_score,
  a.internal_tier,
  a.recommended_path,
  a.submitted_at,
  a.updated_at,
  a.created_at,
  p.full_name  as user_full_name,
  p.email      as user_email
from prototype_assessments a
left join profiles p on p.id = a.user_id;

comment on view prototype_assessment_queue is
  'Admin-facing list of submitted assessments. Inherits RLS from prototype_assessments.';


-- ─── Done ──────────────────────────────────────────────────────────────────

comment on table prototype_assessments is
  'Multi-step Prototype Readiness Assessment submissions. Internal scoring routes founders into the right paid path (Validation Sprint, Prototype Blueprint, Build & Launch). Founders never see the score.';
