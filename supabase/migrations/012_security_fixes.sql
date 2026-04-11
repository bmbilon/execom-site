-- ════════════════════════════════════════════════════════════════════════════
-- Migration 012: Security hardening
--
-- Resolves three Supabase database linter findings against the production
-- execom-client-portal database:
--
--   1. security_definer_view  on public.matter_summary
--   2. rls_disabled_in_public on public.recalc_runs
--   3. rls_disabled_in_public on public.claim_recalc_locks
--
-- ─── Live-state verification performed before writing this migration ───
--
-- Confirmed via pg_tables / pg_policies / pg_proc in production on 2026-04-11:
--
--   * recalc_runs           → rowsecurity = false, no policies
--     claim_recalc_locks    → rowsecurity = false, no policies
--     (Migration 008 never applied in production. The tables exist but RLS
--      was never enabled. No pre-existing FOR ALL policies to drop.)
--
--   * All seven export-path tables (commercialization_matters,
--     approved_snapshots, generated_artifacts, and the four intake tables)
--     already have RLS enabled with correct client-owns-row + staff-read
--     policies from migration 011. No base-table changes are required here.
--
--   * Helper functions is_execom_staff() and user_belongs_to_company(uuid)
--     both exist as STABLE SECURITY DEFINER with search_path locked to public.
--
-- ─── Design decisions ───
--
--   * matter_summary is recreated with `security_invoker = true` so row
--     filtering runs under the caller's privileges. Because all underlying
--     tables have correct RLS, this fixes the linter finding and ensures
--     clients see only their own matters while execom staff see all matters
--     (critical for the government-form export workflow).
--
--   * View grants are re-applied explicitly after recreation. View recreate
--     can leave grants in surprising states; being explicit removes ambiguity.
--
--   * recalc_runs / claim_recalc_locks are pipeline-internal. Writes come
--     from the server-side recalculation engine using the service-role key,
--     which bypasses RLS entirely. Authenticated clients should only SELECT
--     (to display recalc status in the portal).
--
--     Therefore we install SELECT-only policies scoped to `authenticated`.
--     No INSERT/UPDATE/DELETE policies exist for normal roles — writes from
--     authenticated sessions will be denied by RLS. Writes from the recalc
--     engine continue to work because the service role bypasses RLS.
--
--   * Migration is idempotent. Re-running is safe:
--       - CREATE OR REPLACE VIEW is naturally idempotent.
--       - ALTER TABLE ... ENABLE ROW LEVEL SECURITY is idempotent.
--       - Policy creation is guarded by pg_policies existence checks.
-- ════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- 1. matter_summary: recreate with security_invoker = true
-- ─────────────────────────────────────────────────────────────────────────

create or replace view public.matter_summary
with (security_invoker = true) as
select
  m.id                         as matter_id,
  m.user_id,
  m.matter_type,
  m.display_name,
  m.status,
  m.created_at,
  m.updated_at,
  i.id                         as incorporation_intake_id,
  ip.id                        as ip_transfer_intake_id,
  tm.id                        as trademark_intake_id,
  lic.id                       as licensing_intake_id,
  (
    select count(*)
    from public.approved_snapshots s
    where s.matter_id = m.id
  )                            as snapshot_count,
  (
    select count(*)
    from public.generated_artifacts a
    where a.matter_id = m.id
      and a.status = 'generated'
  )                            as active_artifact_count
from public.commercialization_matters m
  left join public.incorporation_intakes i  on i.matter_id  = m.id
  left join public.ip_transfer_intakes  ip on ip.matter_id = m.id
  left join public.trademark_intakes    tm on tm.matter_id = m.id
  left join public.licensing_intakes    lic on lic.matter_id = m.id;

-- Re-grant intended access explicitly. Authenticated users may read the view
-- (and RLS on the base tables filters the rows appropriately); anon has no
-- access.
revoke all on public.matter_summary from public;
revoke all on public.matter_summary from anon;
grant  select on public.matter_summary to authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- 2. recalc_runs: enable RLS + install SELECT-only policy
-- ─────────────────────────────────────────────────────────────────────────

alter table public.recalc_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'recalc_runs'
      and policyname = 'recalc_runs_select'
  ) then
    create policy recalc_runs_select on public.recalc_runs
      for select
      to authenticated
      using (
        user_belongs_to_company(
          (select cy.company_id from public.claim_years cy where cy.id = claim_year_id)
        )
        or is_execom_staff()
      );
  end if;
end $$;

-- Defense-in-depth: remove any table-level privileges from anon. RLS would
-- already deny them, but revoking grants eliminates the attack surface.
revoke all on public.recalc_runs from anon;


-- ─────────────────────────────────────────────────────────────────────────
-- 3. claim_recalc_locks: enable RLS + install SELECT-only policy
-- ─────────────────────────────────────────────────────────────────────────

alter table public.claim_recalc_locks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'claim_recalc_locks'
      and policyname = 'claim_recalc_locks_select'
  ) then
    create policy claim_recalc_locks_select on public.claim_recalc_locks
      for select
      to authenticated
      using (
        user_belongs_to_company(
          (select cy.company_id from public.claim_years cy where cy.id = claim_year_id)
        )
        or is_execom_staff()
      );
  end if;
end $$;

revoke all on public.claim_recalc_locks from anon;
