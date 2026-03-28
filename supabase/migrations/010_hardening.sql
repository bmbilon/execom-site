-- ═══════════════════════════════════════════════════════════════
-- 010 — Operational hardening + status enum unification
--
-- 1. Unify status enum: replace incorporation_status with a shared
--    commercialization_status used by ALL child modules.
-- 2. DB-level status transition enforcement
-- 3. RLS tightening (client updates restricted to editable statuses)
-- 4. Payload hash on snapshots + artifacts
-- 5. Unique version constraints
-- 6. Snapshot immutability guard
-- ═══════════════════════════════════════════════════════════════


-- ─── 0. Unify status enum ─────────────────────────────────────
-- Create the shared enum, migrate incorporation_intakes to use it,
-- then drop the old incorporation-specific one.

-- Drop triggers that depend on the status column before altering its type
drop trigger if exists trg_sync_matter_status on incorporation_intakes;
drop trigger if exists trg_intake_updated on incorporation_intakes;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'commercialization_status') then
    create type commercialization_status as enum (
      'draft',
      'submitted',
      'in_review',
      'changes_requested',
      'approved_for_generation',
      'generated',
      'filed'
    );
  end if;
end$$;

-- Migrate the column: text round-trip to swap enum types safely
alter table incorporation_intakes
  alter column status drop default;
alter table incorporation_intakes
  alter column status type text using status::text;
alter table incorporation_intakes
  alter column status type commercialization_status using status::commercialization_status;
alter table incorporation_intakes
  alter column status set default 'draft';

-- Drop the old enum now that nothing references it
drop type if exists incorporation_status;

-- Recreate the triggers we dropped before the type swap
create trigger trg_intake_updated
  before update on incorporation_intakes
  for each row execute function update_timestamp();

create trigger trg_sync_matter_status
  after update of status on incorporation_intakes
  for each row execute function sync_matter_status();


-- ─── 1. DB-level status transition enforcement ────────────────
-- Shared trigger function used by ALL child intake tables.
-- Prevents invalid status changes regardless of how the update
-- is executed (service layer, raw query, or admin console).

create or replace function enforce_status_transition()
returns trigger as $$
declare
  allowed text[];
begin
  if old.status = new.status then
    return new;
  end if;

  case old.status::text
    when 'draft' then
      allowed := array['submitted'];
    when 'submitted' then
      allowed := array['in_review'];
    when 'in_review' then
      allowed := array['changes_requested', 'approved_for_generation'];
    when 'changes_requested' then
      allowed := array['submitted'];
    when 'approved_for_generation' then
      allowed := array['generated'];
    when 'generated' then
      allowed := array['filed'];
    when 'filed' then
      allowed := array[]::text[];
    else
      allowed := array[]::text[];
  end case;

  if not (new.status::text = any(allowed)) then
    raise exception 'Invalid status transition: % → %', old.status, new.status;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_enforce_status_transition
  before update of status on incorporation_intakes
  for each row execute function enforce_status_transition();


-- ─── 2. RLS: restrict client updates to editable statuses ─────

drop policy if exists "Users update own intakes" on incorporation_intakes;

create policy "Users update own intakes (editable only)"
  on incorporation_intakes for update
  using (
    auth.uid() = user_id
    and status in ('draft', 'changes_requested')
  );

drop policy if exists "Users update own matters" on commercialization_matters;

create policy "Users update own matters (editable only)"
  on commercialization_matters for update
  using (
    auth.uid() = user_id
    and status in ('draft', 'changes_requested', 'submitted')
  );


-- ─── 3. Payload hash column on snapshots ──────────────────────

alter table approved_snapshots
  add column if not exists payload_hash text;

comment on column approved_snapshots.payload_hash
  is 'SHA-256 hex digest of the payload JSONB, computed at snapshot creation time';


-- ─── 4. Snapshot hash on artifact records ─────────────────────

alter table generated_artifacts
  add column if not exists snapshot_hash text;

comment on column generated_artifacts.snapshot_hash
  is 'SHA-256 of the snapshot payload used for this generation — must match approved_snapshots.payload_hash';


-- ─── 5. Unique constraint on snapshot versions ────────────────

alter table approved_snapshots
  add constraint uq_snapshot_intake_version
  unique (intake_id, version);

alter table generated_artifacts
  add constraint uq_artifact_snapshot_type_version
  unique (snapshot_id, artifact_type, version);


-- ─── 6. Immutability guard on approved snapshots ──────────────

create or replace function prevent_snapshot_mutation()
returns trigger as $$
begin
  if old.payload is distinct from new.payload then
    raise exception 'Approved snapshot payload is immutable (snapshot %)' , old.id;
  end if;
  if old.payload_hash is not null and old.payload_hash is distinct from new.payload_hash then
    raise exception 'Approved snapshot hash is immutable (snapshot %)' , old.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_snapshot_immutable
  before update on approved_snapshots
  for each row execute function prevent_snapshot_mutation();
