-- ════════════════════════════════════════════════════════════════════════════
-- Migration 019 — SR&ED acquisition funnel leads
--
-- Backs the public /sred assessor. An anonymous visitor answers a short
-- screening flow, the server recalculates the result deterministically, and a
-- lead row is written only once the applicant has consented to be contacted.
--
-- Shape follows the project's JSONB-first pattern (see claim_year.claim_json
-- and prototype_assessments.answers): answers, result, internal analysis,
-- contact and attribution each live in their own jsonb column so the question
-- catalogue and the policy can evolve without another migration. The few
-- columns lifted out are the ones the reviewer desk sorts and filters on.
--
-- Security model, deliberately tighter than the rest of the portal because
-- this table is fed by unauthenticated traffic:
--
--   • anon and authenticated get NO direct insert or update. Writes go through
--     `sred_lead_intake` and `sred_lead_transition`, both SECURITY DEFINER and
--     executable by service_role only.
--   • execom staff get SELECT through RLS so the admin queue can read it with
--     the ordinary session-scoped client. Clients and applicants get nothing.
--   • the intake function enforces its own body-size and rate limits, so the
--     protection survives a serverless instance that has no shared memory.
--   • the state machine has no `approved` or `funded` transition. Financial
--     execution is out of scope for this build and cannot be reached from here.
--
-- Numbering note: 018 is taken by the unmerged feat/mvp-readiness-track branch.
-- This is 019 so the two can merge without a collision.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enums ─────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'sred_lead_lane') then
    create type sred_lead_lane as enum (
      'purchase_review',
      'preparation_offer',
      'technical_review',
      'already_filed_review',
      'not_ready'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'sred_lead_status') then
    create type sred_lead_status as enum (
      'new',
      'triaged',
      'awaiting_documents',
      'specialist_review',
      'purchase_underwriting',
      'preparation_offered',
      'closed'
    );
  end if;
end $$;

-- ─── Leads ─────────────────────────────────────────────────────────────────

create table if not exists public.sred_acquisition_leads (
  id uuid primary key default gen_random_uuid(),

  -- Idempotency. A retried submit on a flaky mobile connection reuses the same
  -- request_id; a DIFFERENT payload under the same id is a conflict, not an
  -- overwrite.
  request_id  uuid not null unique,
  fingerprint text not null,

  -- Surfaced for the queue.
  company_name  text,
  contact_name  text,
  contact_email text,
  fiscal_year_end date,
  claim_stage   text,
  province      text,

  lane     sred_lead_lane   not null,
  status   sred_lead_status not null default 'new',
  priority smallint         not null default 0,

  -- What the applicant entered, what the server computed from it, and the
  -- staff-only analysis. `internal` holds purchase gates and illustrative
  -- economics and is never returned to a browser.
  answers     jsonb not null default '{}'::jsonb,
  result      jsonb not null default '{}'::jsonb,
  internal    jsonb not null default '{}'::jsonb,
  attribution jsonb not null default '{}'::jsonb,

  -- Contact is only ever written with recorded consent.
  contact jsonb,
  service_consent   boolean not null default false,
  marketing_consent boolean not null default false,
  consent_version   text,
  consented_at      timestamptz,

  requested      text,
  policy_version text not null,

  -- Optimistic concurrency for the reviewer desk.
  version integer not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_sred_lead_marketing_needs_service
    check (marketing_consent = false or service_consent = true)
);

create index if not exists idx_sred_leads_queue
  on public.sred_acquisition_leads(status, priority desc, created_at desc);
create index if not exists idx_sred_leads_lane    on public.sred_acquisition_leads(lane);
create index if not exists idx_sred_leads_created on public.sred_acquisition_leads(created_at desc);
create index if not exists idx_sred_leads_email   on public.sred_acquisition_leads(contact_email);

-- ─── Audit ─────────────────────────────────────────────────────────────────

create table if not exists public.sred_acquisition_audit (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sred_acquisition_leads(id) on delete cascade,
  actor   uuid references auth.users(id),
  event   text not null,
  note    text,
  policy_version text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sred_audit_lead on public.sred_acquisition_audit(lead_id, created_at desc);

-- ─── Outbox ────────────────────────────────────────────────────────────────
-- Guarantees an accepted lead creates a review task even if a downstream
-- notification fails. Nothing in this build DISPATCHES from the outbox; it is
-- a queue of work for staff, not a messaging channel.

create table if not exists public.sred_acquisition_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sred_acquisition_leads(id) on delete cascade,
  event   text not null,
  status  text not null default 'pending',
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (lead_id, event)
);

-- ─── Durable rate limit ────────────────────────────────────────────────────
-- The in-process limiter in lib/sred/guard.ts does not survive scale-out.
-- This one does.

create table if not exists public.sred_acquisition_rate_limits (
  key        text primary key,
  count      integer not null,
  expires_at timestamptz not null
);

-- ─── updated_at ────────────────────────────────────────────────────────────

create or replace function public.set_sred_leads_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sred_leads_updated_at on public.sred_acquisition_leads;
create trigger trg_sred_leads_updated_at
  before update on public.sred_acquisition_leads
  for each row execute function public.set_sred_leads_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────────

alter table public.sred_acquisition_leads       enable row level security;
alter table public.sred_acquisition_audit       enable row level security;
alter table public.sred_acquisition_outbox      enable row level security;
alter table public.sred_acquisition_rate_limits enable row level security;

revoke all on public.sred_acquisition_leads       from anon, authenticated;
revoke all on public.sred_acquisition_audit       from anon, authenticated;
revoke all on public.sred_acquisition_outbox      from anon, authenticated;
revoke all on public.sred_acquisition_rate_limits from anon, authenticated;

grant all on public.sred_acquisition_leads       to service_role;
grant all on public.sred_acquisition_audit       to service_role;
grant all on public.sred_acquisition_outbox      to service_role;
grant all on public.sred_acquisition_rate_limits to service_role;

-- Staff read the queue with their own session. No one else sees anything, and
-- nobody writes directly.
grant select on public.sred_acquisition_leads to authenticated;
grant select on public.sred_acquisition_audit to authenticated;

drop policy if exists "Staff view sred acquisition leads" on public.sred_acquisition_leads;
create policy "Staff view sred acquisition leads"
  on public.sred_acquisition_leads for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_execom_staff = true
  ));

drop policy if exists "Staff view sred acquisition audit" on public.sred_acquisition_audit;
create policy "Staff view sred acquisition audit"
  on public.sred_acquisition_audit for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_execom_staff = true
  ));

-- ─── Intake ────────────────────────────────────────────────────────────────

create or replace function public.sred_lead_intake(
  p_request_id uuid,
  p_fingerprint text,
  p_rate_key text,
  p_lead jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prior public.sred_acquisition_leads%rowtype;
  v_id uuid;
  v_count integer;
begin
  if p_rate_key is null or length(p_rate_key) <> 64 then
    raise exception 'INVALID_RATE_KEY';
  end if;
  if octet_length(p_lead::text) > 65536 then
    raise exception 'PAYLOAD_TOO_LARGE';
  end if;

  -- Durable rate control, independent of any single serverless instance.
  insert into public.sred_acquisition_rate_limits(key, count, expires_at)
    values (p_rate_key, 1, now() + interval '2 minutes')
    on conflict (key) do update
      set count = public.sred_acquisition_rate_limits.count + 1
    returning count into v_count;
  if v_count > 15 then
    raise exception 'RATE_LIMIT';
  end if;
  delete from public.sred_acquisition_rate_limits where expires_at < now();

  -- Serialize concurrent retries of the same request_id.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));

  select * into v_prior
    from public.sred_acquisition_leads
   where request_id = p_request_id;

  if found then
    if v_prior.fingerprint <> p_fingerprint then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return v_prior.id;
  end if;

  insert into public.sred_acquisition_leads (
    request_id, fingerprint,
    company_name, contact_name, contact_email,
    fiscal_year_end, claim_stage, province,
    lane, priority,
    answers, result, internal, attribution,
    contact, service_consent, marketing_consent, consent_version, consented_at,
    requested, policy_version
  ) values (
    p_request_id,
    p_fingerprint,
    p_lead->>'company_name',
    p_lead->>'contact_name',
    p_lead->>'contact_email',
    nullif(p_lead->>'fiscal_year_end','')::date,
    p_lead->>'claim_stage',
    p_lead->>'province',
    (p_lead->>'lane')::public.sred_lead_lane,
    coalesce((p_lead->>'priority')::smallint, 0),
    coalesce(p_lead->'answers','{}'::jsonb),
    coalesce(p_lead->'result','{}'::jsonb),
    coalesce(p_lead->'internal','{}'::jsonb),
    coalesce(p_lead->'attribution','{}'::jsonb),
    p_lead->'contact',
    coalesce((p_lead->>'service_consent')::boolean, false),
    coalesce((p_lead->>'marketing_consent')::boolean, false),
    p_lead->>'consent_version',
    now(),
    p_lead->>'requested',
    p_lead->>'policy_version'
  )
  returning id into v_id;

  insert into public.sred_acquisition_audit(lead_id, event, note, policy_version)
    values (v_id, 'assessment_received', p_lead->>'lane', p_lead->>'policy_version');

  -- Task creation only. No email, contract, payment or purchase runs here.
  insert into public.sred_acquisition_outbox(lead_id, event)
    values (v_id, 'review_task')
    on conflict do nothing;

  return v_id;
end;
$$;

-- ─── Reviewer transitions ──────────────────────────────────────────────────

create or replace function public.sred_lead_transition(
  p_lead_id uuid,
  p_expected_version integer,
  p_to text,
  p_actor uuid,
  p_note text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.sred_acquisition_leads%rowtype;
  ok boolean;
begin
  if p_actor is null or p_note is null
     or length(trim(p_note)) < 5 or length(p_note) > 1000 then
    raise exception 'INVALID_REVIEW';
  end if;

  -- Staff check happens HERE, against the profiles table, not against anything
  -- the browser told us.
  if not exists (
    select 1 from public.profiles
     where id = p_actor and is_execom_staff = true
  ) then
    raise exception 'STAFF_REQUIRED';
  end if;

  select * into r from public.sred_acquisition_leads where id = p_lead_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if r.version <> p_expected_version then raise exception 'STALE_RECORD'; end if;

  ok = case r.status
    when 'new'                   then p_to in ('triaged','closed')
    when 'triaged'               then p_to in ('awaiting_documents','specialist_review','purchase_underwriting','preparation_offered','closed')
    when 'awaiting_documents'    then p_to in ('specialist_review','purchase_underwriting','closed')
    when 'specialist_review'     then p_to in ('awaiting_documents','preparation_offered','purchase_underwriting','closed')
    when 'purchase_underwriting' then p_to in ('awaiting_documents','specialist_review','closed')
    when 'preparation_offered'   then p_to in ('awaiting_documents','closed')
    else false
  end;
  if not ok then raise exception 'INVALID_TRANSITION'; end if;

  -- A lane cannot be escaped by moving the file. Underwriting is only for
  -- purchase candidates; a preparation offer is only for the preparation lane.
  if p_to = 'purchase_underwriting' and r.lane <> 'purchase_review' then
    raise exception 'LANE_MISMATCH';
  end if;
  if p_to = 'preparation_offered' and r.lane <> 'preparation_offer' then
    raise exception 'LANE_MISMATCH';
  end if;

  update public.sred_acquisition_leads
     set status = p_to::public.sred_lead_status,
         version = version + 1,
         updated_at = now()
   where id = p_lead_id;

  insert into public.sred_acquisition_audit(lead_id, actor, event, note, policy_version)
    values (p_lead_id, p_actor, r.status || ' -> ' || p_to, p_note, r.policy_version);

  return r.version + 1;
end;
$$;

revoke all on function public.sred_lead_intake(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.sred_lead_transition(uuid, integer, text, uuid, text) from public, anon, authenticated;
grant execute on function public.sred_lead_intake(uuid, text, text, jsonb) to service_role;
grant execute on function public.sred_lead_transition(uuid, integer, text, uuid, text) to service_role;

-- ─── Queue view ────────────────────────────────────────────────────────────

drop view if exists public.sred_acquisition_queue;
create view public.sred_acquisition_queue as
select
  l.id,
  l.company_name,
  l.contact_name,
  l.contact_email,
  l.fiscal_year_end,
  l.claim_stage,
  l.province,
  l.lane,
  l.status,
  l.priority,
  l.requested,
  l.policy_version,
  l.version,
  l.marketing_consent,
  l.created_at,
  l.updated_at,
  (l.result -> 'estimate' ->> 'low')::numeric  as estimate_low,
  (l.result -> 'estimate' ->> 'high')::numeric as estimate_high,
  (l.result -> 'estimate' ->> 'kind')          as estimate_kind,
  jsonb_array_length(coalesce(l.internal -> 'purchaseBlockers', '[]'::jsonb)) as blocker_count,
  l.attribution ->> 'utm_source'   as utm_source,
  l.attribution ->> 'utm_campaign' as utm_campaign
from public.sred_acquisition_leads l;

comment on view public.sred_acquisition_queue is
  'Reviewer-desk list of SR&ED acquisition leads. Inherits RLS from sred_acquisition_leads: execom staff only.';

comment on table public.sred_acquisition_leads is
  'Public /sred assessor leads. Written only through sred_lead_intake after applicant consent. `internal` holds staff-only purchase gates and illustrative economics and must never be returned to a browser.';
