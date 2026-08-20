-- ════════════════════════════════════════════════════════════════════════════
-- Migration 016 — MVP Readiness track (software / platform submissions)
--
-- Migration 014 built a single intake instrument shaped around physical
-- products: tooling, unit cost, packaging, shipping, retail channel. Running
-- a software submission through it produces false risk flags on every one of
-- those questions and recommends a Prototype Blueprint, which is not a
-- product execom sells for software.
--
-- This adds a `track` discriminator plus the software recommended-path
-- values and an add-on column. Existing rows are physical by definition, so
-- the column defaults to 'physical' and backfills to it.
--
-- NOTE ON ENUM VALUES: `alter type ... add value` cannot be used inside the
-- same transaction that then references the new value. The additions live in
-- their own statement block below and are not read anywhere in this file.
-- ════════════════════════════════════════════════════════════════════════════


-- ─── 1. Track discriminator ────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_type where typname = 'readiness_track') then
    create type readiness_track as enum ('physical', 'software');
  end if;
end $$;

alter table prototype_assessments
  add column if not exists track readiness_track not null default 'physical';

comment on column prototype_assessments.track is
  'Which intake instrument produced this row. physical = Prototype Readiness (migration 014), software = MVP Readiness. Derived from the build_type answer at submit time.';

-- Every pre-existing assessment was collected with the physical instrument.
update prototype_assessments set track = 'physical' where track is null;

create index if not exists prototype_assessments_track_idx
  on prototype_assessments (track);


-- ─── 2. Software recommended paths ─────────────────────────────────────────
--
-- Added to the existing enum rather than introducing a second column, so the
-- admin queue can order and filter one field across both tracks. Labels and
-- price bands live in lib/portal/mvp-readiness.ts.

alter type prototype_recommended_path add value if not exists 'scoping_sprint';
alter type prototype_recommended_path add value if not exists 'investor_deck';
alter type prototype_recommended_path add value if not exists 'clickable_demo';
alter type prototype_recommended_path add value if not exists 'marketing_site';
alter type prototype_recommended_path add value if not exists 'mvp_build';


-- ─── 3. Recommended add-ons ────────────────────────────────────────────────
--
-- Add-ons sit alongside the main path instead of replacing it. A regulated
-- product with unsecured data licensing still needs a scoping sprint; it
-- also needs somebody to establish whether the product is legal in its
-- current shape. Stored as text[] rather than an enum array so adding an
-- add-on later is a code change, not a migration.

alter table prototype_assessments
  add column if not exists recommended_add_ons text[] not null default '{}';

comment on column prototype_assessments.recommended_add_ons is
  'Software track only. Add-on engagements recommended alongside recommended_path, e.g. feasibility_memo for a submission blocked on licensed data or provincial regulation.';
