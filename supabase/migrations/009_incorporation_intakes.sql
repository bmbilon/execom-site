-- ═══════════════════════════════════════════════════════════════
-- 009 — Commercialization module: matters, intakes, snapshots,
--       artifacts, and audit trail
-- ═══════════════════════════════════════════════════════════════
-- Extensible to IP transfer, trademark, licensing later.
-- Incorporation is the first child module.
-- ═══════════════════════════════════════════════════════════════

-- ─── Enums ───────────────────────────────────────────────────

create type matter_type as enum (
  'incorporation',
  'ip_transfer',
  'trademark',
  'licensing'
);

create type incorporation_status as enum (
  'draft',
  'submitted',
  'in_review',
  'changes_requested',
  'approved_for_generation',
  'generated',
  'filed'
);

create type artifact_type as enum (
  'alberta_incorporation_pdf',
  'incorporation_package_docx',
  'organizational_resolutions_docx',
  'founder_subscription_docx'
);

create type artifact_status as enum (
  'generated',
  'superseded',
  'filed_copy'
);

-- ─── Parent: commercialization_matters ───────────────────────
-- One row per client engagement.  Later child tables for
-- ip_transfer_intakes, trademark_intakes, etc. will FK here.

create table commercialization_matters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  matter_type   matter_type not null,
  display_name  text not null default '',
  status        text not null default 'draft',  -- mirrors child status
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_matters_user   on commercialization_matters(user_id);
create index idx_matters_type   on commercialization_matters(matter_type);
create index idx_matters_status on commercialization_matters(status);

-- ─── Child: incorporation_intakes ────────────────────────────

create table incorporation_intakes (
  id            uuid primary key default gen_random_uuid(),
  matter_id     uuid not null references commercialization_matters(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  status        incorporation_status not null default 'draft',

  -- Step 1: Company Basics
  proposed_name      text not null default '',
  legal_element      text not null default 'Ltd.',
  alt_name_1         text,
  alt_name_2         text,
  reserved_name      text,
  fiscal_year_end    text not null default 'December 31',

  -- Registered office
  reg_street         text not null default '',
  reg_city           text not null default '',
  reg_province       text not null default 'Alberta',
  reg_postal_code    text not null default '',

  -- Mailing address
  mailing_same_as_reg boolean not null default true,
  mail_po_box        text,
  mail_city          text,
  mail_province      text,
  mail_postal_code   text,

  -- Step 2: People (structured JSONB)
  agent              jsonb not null default '{}',
  director_structure text not null default 'fixed',
  director_fixed_number int,
  director_min       int,
  director_max       int,
  directors          jsonb not null default '[]',
  declarant          jsonb not null default '{}',

  -- Step 3: Articles
  articles_choice    text not null default 'default',
  custom_articles    jsonb,

  -- Admin fields
  admin_notes            text,
  change_request_message text,

  -- Timestamps
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_intakes_matter on incorporation_intakes(matter_id);
create index idx_intakes_user   on incorporation_intakes(user_id);
create index idx_intakes_status on incorporation_intakes(status);

-- ─── Approved snapshots ──────────────────────────────────────
-- Immutable frozen copy of intake at approval time.
-- The Python filler consumes snapshots, never mutable intakes.

create table approved_snapshots (
  id            uuid primary key default gen_random_uuid(),
  intake_id     uuid not null references incorporation_intakes(id) on delete cascade,
  matter_id     uuid not null references commercialization_matters(id) on delete cascade,
  version       int not null default 1,
  payload       jsonb not null,           -- full IncorporationIntake frozen
  approved_by   uuid not null references auth.users(id),
  approved_at   timestamptz not null default now()
);

create index idx_snapshots_intake on approved_snapshots(intake_id);
create index idx_snapshots_matter on approved_snapshots(matter_id);

-- ─── Generated artifacts ─────────────────────────────────────
-- Every PDF/docx output is logged here.

create table generated_artifacts (
  id            uuid primary key default gen_random_uuid(),
  matter_id     uuid not null references commercialization_matters(id) on delete cascade,
  intake_id     uuid not null references incorporation_intakes(id) on delete cascade,
  snapshot_id   uuid not null references approved_snapshots(id) on delete cascade,
  artifact_type artifact_type not null,
  version       int not null default 1,
  file_path     text,
  storage_key   text,
  generated_by  uuid not null references auth.users(id),
  generated_at  timestamptz not null default now(),
  status        artifact_status not null default 'generated'
);

create index idx_artifacts_matter   on generated_artifacts(matter_id);
create index idx_artifacts_snapshot on generated_artifacts(snapshot_id);

-- ─── Audit trail ─────────────────────────────────────────────

create table matter_status_events (
  id            uuid primary key default gen_random_uuid(),
  matter_id     uuid not null references commercialization_matters(id) on delete cascade,
  intake_id     uuid references incorporation_intakes(id) on delete cascade,
  from_status   text not null,
  to_status     text not null,
  changed_by    uuid not null references auth.users(id),
  note          text,
  created_at    timestamptz not null default now()
);

create index idx_events_matter on matter_status_events(matter_id);

-- ─── Auto-update timestamps ──────────────────────────────────

create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_matter_updated
  before update on commercialization_matters
  for each row execute function update_timestamp();

create trigger trg_intake_updated
  before update on incorporation_intakes
  for each row execute function update_timestamp();

-- ─── Sync child status → parent matter ───────────────────────

create or replace function sync_matter_status()
returns trigger as $$
begin
  update commercialization_matters
  set status = new.status::text
  where id = new.matter_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_matter_status
  after update of status on incorporation_intakes
  for each row execute function sync_matter_status();

-- ─── Row-Level Security ─────────────────────────────────────

alter table commercialization_matters enable row level security;
alter table incorporation_intakes enable row level security;
alter table approved_snapshots enable row level security;
alter table generated_artifacts enable row level security;
alter table matter_status_events enable row level security;

-- Matters: users see own, staff see all
create policy "Users view own matters"
  on commercialization_matters for select
  using (auth.uid() = user_id);
create policy "Users insert own matters"
  on commercialization_matters for insert
  with check (auth.uid() = user_id);
create policy "Users update own matters"
  on commercialization_matters for update
  using (auth.uid() = user_id);
create policy "Staff view all matters"
  on commercialization_matters for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
create policy "Staff update all matters"
  on commercialization_matters for update
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

-- Intakes: users see own, staff see all
create policy "Users view own intakes"
  on incorporation_intakes for select
  using (auth.uid() = user_id);
create policy "Users insert own intakes"
  on incorporation_intakes for insert
  with check (auth.uid() = user_id);
create policy "Users update own intakes"
  on incorporation_intakes for update
  using (auth.uid() = user_id);
create policy "Staff view all intakes"
  on incorporation_intakes for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
create policy "Staff update all intakes"
  on incorporation_intakes for update
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

-- Snapshots, artifacts, events: staff-only write, user read own matter
create policy "Users view own snapshots"
  on approved_snapshots for select
  using (exists (select 1 from commercialization_matters where id = matter_id and user_id = auth.uid()));
create policy "Staff manage snapshots"
  on approved_snapshots for all
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

create policy "Users view own artifacts"
  on generated_artifacts for select
  using (exists (select 1 from commercialization_matters where id = matter_id and user_id = auth.uid()));
create policy "Staff manage artifacts"
  on generated_artifacts for all
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

create policy "Users view own events"
  on matter_status_events for select
  using (exists (select 1 from commercialization_matters where id = matter_id and user_id = auth.uid()));
create policy "Staff manage events"
  on matter_status_events for all
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
