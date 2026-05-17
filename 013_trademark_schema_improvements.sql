-- ═══════════════════════════════════════════════════════════════
-- 013 — Trademark schema improvements
--
-- 1. Add jurisdictions array column to trademark_intakes
--    (keeps the existing text `jurisdiction` column for backward
--    compat — the array becomes the source of truth going forward)
--
-- 2. Create trademark_goods_services child table for normalized
--    goods/services records instead of JSON blob in text column.
--    The JSON column remains for quick reads; the child table
--    enables class-level queries, conflict searches, and proper
--    Nice classification management.
-- ═══════════════════════════════════════════════════════════════


-- ─── 1. Jurisdictions array ──────────────────────────────────

alter table trademark_intakes
  add column if not exists jurisdictions text[] default '{"Canada"}';

-- Backfill from existing text column
update trademark_intakes
set jurisdictions = case
  when jurisdiction = 'Both' then '{"Canada","United States"}'::text[]
  when jurisdiction = 'United States' then '{"United States"}'::text[]
  else '{"Canada"}'::text[]
end
where jurisdictions is null or jurisdictions = '{"Canada"}';


-- ─── 2. Goods & Services child table ────────────────────────

create table if not exists trademark_goods_services (
  id               uuid primary key default gen_random_uuid(),
  intake_id        uuid not null references trademark_intakes(id) on delete cascade,
  matter_id        uuid not null references commercialization_matters(id) on delete cascade,

  -- Description
  description      text not null default '',
  category         text not null default 'goods',  -- goods | services

  -- Nice classification
  nice_class       text,                           -- e.g. '9', '42'
  nice_class_title text,                           -- e.g. 'Scientific apparatus'

  -- Filing scope per jurisdiction
  file_in_ca       boolean default true,
  file_in_us       boolean default false,

  -- Normalized filing descriptions (admin can edit post-review)
  ca_description   text,  -- CIPO-formatted description
  us_description   text,  -- USPTO ID Manual description

  sort_order       int default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_tm_gs_intake on trademark_goods_services(intake_id);
create index if not exists idx_tm_gs_matter on trademark_goods_services(matter_id);
create index if not exists idx_tm_gs_class  on trademark_goods_services(nice_class);

-- Auto-update timestamp
create trigger trg_tm_gs_updated
  before update on trademark_goods_services
  for each row execute function update_timestamp();

-- RLS
alter table trademark_goods_services enable row level security;

create policy "Users view own TM goods/services"
  on trademark_goods_services for select
  using (exists (
    select 1 from trademark_intakes ti
    where ti.id = trademark_goods_services.intake_id
      and ti.user_id = auth.uid()
  ));

create policy "Users insert own TM goods/services"
  on trademark_goods_services for insert
  with check (exists (
    select 1 from trademark_intakes ti
    where ti.id = trademark_goods_services.intake_id
      and ti.user_id = auth.uid()
      and ti.status in ('draft', 'changes_requested')
  ));

create policy "Users update own TM goods/services"
  on trademark_goods_services for update
  using (exists (
    select 1 from trademark_intakes ti
    where ti.id = trademark_goods_services.intake_id
      and ti.user_id = auth.uid()
      and ti.status in ('draft', 'changes_requested')
  ));

create policy "Users delete own TM goods/services"
  on trademark_goods_services for delete
  using (exists (
    select 1 from trademark_intakes ti
    where ti.id = trademark_goods_services.intake_id
      and ti.user_id = auth.uid()
      and ti.status in ('draft', 'changes_requested')
  ));

create policy "Staff view all TM goods/services"
  on trademark_goods_services for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

create policy "Staff manage all TM goods/services"
  on trademark_goods_services for all
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));


-- ─── 3. Additional columns for filing tracking ──────────────

alter table trademark_intakes
  add column if not exists filing_basis_ca text,
  add column if not exists filing_basis_us text,
  add column if not exists already_in_use boolean default false,
  add column if not exists use_territory text,
  add column if not exists file_before_launch boolean default false,
  add column if not exists owner_country text default 'Canada',
  add column if not exists owner_corp_number text,
  add column if not exists known_competitors text,
  add column if not exists domain_available text default 'unknown',
  add column if not exists social_handles_available text default 'unknown',
  add column if not exists risk_notes text;
