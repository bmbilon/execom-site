-- ════════════════════════════════════════════════════════════════════════════
-- Migration 015 — Prototype Readiness: lead-type tagging
--
-- Adds an internal_lead_type column on prototype_assessments. Lead type is
-- a single dominant tag (commercially_serious / strong_build_candidate /
-- strong_validation_candidate / strong_licensing_candidate /
-- prototype_first_coachable / underfunded / fantasy_risk / general_prospect)
-- computed in the application layer at submit time and any time staff
-- re-score. Stored as text rather than an enum so new tags don't need
-- another migration.
--
-- Idempotent: guarded by information_schema checks.
-- ════════════════════════════════════════════════════════════════════════════

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'prototype_assessments'
      and column_name  = 'internal_lead_type'
  ) then
    alter table public.prototype_assessments
      add column internal_lead_type text;

    comment on column public.prototype_assessments.internal_lead_type is
      'Single dominant lead-type tag computed at scoring time. Free-form '
      'text (not enum) so new buckets can be added in code without a '
      'migration. Never shown to the founder.';
  end if;
end $$;

-- Helpful index for filtering the admin queue by lead type
create index if not exists idx_proto_assess_lead_type
  on public.prototype_assessments(internal_lead_type);

-- Recreate the admin queue view with the new column.
-- CREATE OR REPLACE VIEW cannot reorder or insert columns, so drop first.
drop view if exists public.prototype_assessment_queue;

create view public.prototype_assessment_queue as
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
  a.internal_lead_type,
  a.submitted_at,
  a.updated_at,
  a.created_at,
  p.full_name  as user_full_name,
  p.email      as user_email
from public.prototype_assessments a
left join public.profiles p on p.id = a.user_id;
