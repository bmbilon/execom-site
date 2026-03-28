-- ═══════════════════════════════════════════════════════════════
-- 011 — IP Transfer, Trademark, and Licensing child modules
--
-- Extends the commercialization_matters parent to support three
-- additional workflow types. Each follows the same pattern as
-- incorporation: child intake → snapshot → artifact → filing.
--
-- All child tables use the shared commercialization_status enum
-- created in 010. One status system across the entire platform.
--
-- The snapshot, artifact, and audit tables from 009 are shared
-- infrastructure — no duplication per module.
-- ═══════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════
-- IP TRANSFER INTAKES
-- ═══════════════════════════════════════════════════════════════

create table ip_transfer_intakes (
  id               uuid primary key default gen_random_uuid(),
  matter_id        uuid not null references commercialization_matters(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           commercialization_status not null default 'draft',

  -- Source corporation (often from an incorporation matter)
  source_matter_id uuid references commercialization_matters(id),

  -- IP asset identification
  asset_title          text not null default '',
  asset_type           text not null default 'invention',  -- invention, software, design, trade_secret, other
  asset_description    text,
  invention_date       text,
  public_disclosure    boolean default false,
  disclosure_details   text,

  -- Inventor / assignor
  inventor_name        text not null default '',
  inventor_email       text,
  inventor_phone       text,
  inventor_address     text,

  -- Assignee (corporation)
  assignee_corp_name   text not null default '',
  assignee_corp_number text,

  -- Consideration
  consideration_type   text not null default 'shares',     -- shares, cash, mixed, nominal
  consideration_amount text,
  share_class          text,
  num_shares           int,

  -- Patent filing status
  patent_filed         boolean default false,
  patent_app_number    text,
  patent_jurisdiction  text,

  -- Supporting documents
  prior_art_notes      text,
  existing_agreements  text,

  -- Admin
  admin_notes              text,
  change_request_message   text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_ip_intakes_matter on ip_transfer_intakes(matter_id);
create index idx_ip_intakes_user   on ip_transfer_intakes(user_id);
create index idx_ip_intakes_status on ip_transfer_intakes(status);


-- ═══════════════════════════════════════════════════════════════
-- TRADEMARK INTAKES
-- ═══════════════════════════════════════════════════════════════

create table trademark_intakes (
  id               uuid primary key default gen_random_uuid(),
  matter_id        uuid not null references commercialization_matters(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           commercialization_status not null default 'draft',

  -- Source corporation
  source_matter_id uuid references commercialization_matters(id),

  -- Mark details
  mark_text            text not null default '',
  mark_type            text not null default 'word',       -- word, design, sound, other
  mark_description     text,
  mark_image_path      text,

  -- Owner
  owner_name           text not null default '',
  owner_address        text,
  owner_type           text default 'corporation',

  -- Filing details
  nice_classes         text,
  goods_services       text,
  filing_basis         text default 'use',                 -- use, intent_to_use, foreign_registration
  first_use_date       text,
  first_use_commerce   text,

  -- Clearance
  clearance_done       boolean default false,
  clearance_notes      text,
  conflicts_found      boolean default false,
  conflict_details     text,

  -- Jurisdiction
  jurisdiction         text not null default 'Canada',
  priority_claim       boolean default false,
  priority_country     text,
  priority_date        text,
  priority_app_number  text,

  -- Admin
  admin_notes              text,
  change_request_message   text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_tm_intakes_matter on trademark_intakes(matter_id);
create index idx_tm_intakes_user   on trademark_intakes(user_id);
create index idx_tm_intakes_status on trademark_intakes(status);


-- ═══════════════════════════════════════════════════════════════
-- LICENSING INTAKES
-- ═══════════════════════════════════════════════════════════════

create table licensing_intakes (
  id               uuid primary key default gen_random_uuid(),
  matter_id        uuid not null references commercialization_matters(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  status           commercialization_status not null default 'draft',

  -- Source corporation + IP
  source_matter_id uuid references commercialization_matters(id),
  ip_matter_id     uuid references commercialization_matters(id),

  -- Licensed IP
  licensed_ip_title    text not null default '',
  licensed_ip_type     text not null default 'patent',     -- patent, software, trade_secret, trademark, mixed
  ip_description       text,

  -- Licensor
  licensor_name        text not null default '',
  licensor_address     text,
  licensor_contact     text,

  -- Licensee
  licensee_name        text,
  licensee_address     text,
  licensee_type        text default 'corporation',

  -- License terms
  license_type         text not null default 'exclusive',  -- exclusive, non_exclusive, sole
  territory            text default 'Worldwide',
  field_of_use         text,
  term_years           int,
  auto_renewal         boolean default false,

  -- Financial terms
  upfront_fee          text,
  royalty_rate          text,
  royalty_basis         text,
  minimum_royalty       text,
  milestone_payments    text,

  -- Sublicensing
  sublicense_allowed    boolean default false,
  sublicense_terms      text,

  -- IP protection obligations
  prosecution_responsibility text default 'licensor',
  enforcement_responsibility text default 'licensor',
  improvement_ownership      text default 'licensor',

  -- Admin
  admin_notes              text,
  change_request_message   text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_lic_intakes_matter on licensing_intakes(matter_id);
create index idx_lic_intakes_user   on licensing_intakes(user_id);
create index idx_lic_intakes_status on licensing_intakes(status);


-- ═══════════════════════════════════════════════════════════════
-- Extend artifact_type enum for new document types
-- ═══════════════════════════════════════════════════════════════

alter type artifact_type add value if not exists 'ip_assignment_docx';
alter type artifact_type add value if not exists 'ip_board_resolution_docx';
alter type artifact_type add value if not exists 'ip_tax_memo_docx';
alter type artifact_type add value if not exists 'ip_consideration_docx';
alter type artifact_type add value if not exists 'ip_patent_recordation_docx';
alter type artifact_type add value if not exists 'trademark_clearance_report_docx';
alter type artifact_type add value if not exists 'trademark_filing_record_docx';
alter type artifact_type add value if not exists 'licensing_term_sheet_docx';
alter type artifact_type add value if not exists 'licensing_readiness_packet_docx';
alter type artifact_type add value if not exists 'ciia_agreement_docx';
alter type artifact_type add value if not exists 'commercial_form_agreement_docx';


-- ═══════════════════════════════════════════════════════════════
-- Status transition triggers (reuse shared function from 010)
-- ═══════════════════════════════════════════════════════════════

create trigger trg_ip_status_transition
  before update of status on ip_transfer_intakes
  for each row execute function enforce_status_transition();

create trigger trg_tm_status_transition
  before update of status on trademark_intakes
  for each row execute function enforce_status_transition();

create trigger trg_lic_status_transition
  before update of status on licensing_intakes
  for each row execute function enforce_status_transition();


-- ═══════════════════════════════════════════════════════════════
-- Sync child status → parent matter
-- ═══════════════════════════════════════════════════════════════

create or replace function sync_matter_status_generic()
returns trigger as $$
begin
  update commercialization_matters
  set status = new.status::text
  where id = new.matter_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_ip_status
  after update of status on ip_transfer_intakes
  for each row execute function sync_matter_status_generic();

create trigger trg_sync_tm_status
  after update of status on trademark_intakes
  for each row execute function sync_matter_status_generic();

create trigger trg_sync_lic_status
  after update of status on licensing_intakes
  for each row execute function sync_matter_status_generic();


-- ═══════════════════════════════════════════════════════════════
-- Auto-update timestamps
-- ═══════════════════════════════════════════════════════════════

create trigger trg_ip_updated
  before update on ip_transfer_intakes
  for each row execute function update_timestamp();

create trigger trg_tm_updated
  before update on trademark_intakes
  for each row execute function update_timestamp();

create trigger trg_lic_updated
  before update on licensing_intakes
  for each row execute function update_timestamp();


-- ═══════════════════════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════════════════════

alter table ip_transfer_intakes enable row level security;
alter table trademark_intakes enable row level security;
alter table licensing_intakes enable row level security;

-- IP transfer
create policy "Users view own IP intakes"
  on ip_transfer_intakes for select
  using (auth.uid() = user_id);
create policy "Users insert own IP intakes"
  on ip_transfer_intakes for insert
  with check (auth.uid() = user_id);
create policy "Users update own IP intakes (editable only)"
  on ip_transfer_intakes for update
  using (auth.uid() = user_id and status in ('draft', 'changes_requested'));
create policy "Staff view all IP intakes"
  on ip_transfer_intakes for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
create policy "Staff update all IP intakes"
  on ip_transfer_intakes for update
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

-- Trademark
create policy "Users view own TM intakes"
  on trademark_intakes for select
  using (auth.uid() = user_id);
create policy "Users insert own TM intakes"
  on trademark_intakes for insert
  with check (auth.uid() = user_id);
create policy "Users update own TM intakes (editable only)"
  on trademark_intakes for update
  using (auth.uid() = user_id and status in ('draft', 'changes_requested'));
create policy "Staff view all TM intakes"
  on trademark_intakes for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
create policy "Staff update all TM intakes"
  on trademark_intakes for update
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));

-- Licensing
create policy "Users view own licensing intakes"
  on licensing_intakes for select
  using (auth.uid() = user_id);
create policy "Users insert own licensing intakes"
  on licensing_intakes for insert
  with check (auth.uid() = user_id);
create policy "Users update own licensing intakes (editable only)"
  on licensing_intakes for update
  using (auth.uid() = user_id and status in ('draft', 'changes_requested'));
create policy "Staff view all licensing intakes"
  on licensing_intakes for select
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));
create policy "Staff update all licensing intakes"
  on licensing_intakes for update
  using (exists (select 1 from profiles where id = auth.uid() and is_execom_staff = true));


-- ═══════════════════════════════════════════════════════════════
-- Cross-matter summary view
-- ═══════════════════════════════════════════════════════════════

create or replace view matter_summary as
select
  m.id as matter_id,
  m.user_id,
  m.matter_type,
  m.display_name,
  m.status,
  m.created_at,
  m.updated_at,
  i.id as incorporation_intake_id,
  ip.id as ip_transfer_intake_id,
  tm.id as trademark_intake_id,
  lic.id as licensing_intake_id,
  (select count(*) from approved_snapshots s where s.matter_id = m.id) as snapshot_count,
  (select count(*) from generated_artifacts a where a.matter_id = m.id and a.status = 'generated') as active_artifact_count
from commercialization_matters m
left join incorporation_intakes i on i.matter_id = m.id
left join ip_transfer_intakes ip on ip.matter_id = m.id
left join trademark_intakes tm on tm.matter_id = m.id
left join licensing_intakes lic on lic.matter_id = m.id;
