-- 016 — Auto-set is_execom_staff for execom team members.
--
-- Two parts:
--   1. Backfill: flip is_execom_staff=true for every existing profile whose
--      email is @execom.ca. Idempotent — safe to re-run.
--   2. Trigger refresh: extend the existing handle_new_user() trigger so
--      future signups from @execom.ca inherit is_execom_staff=true on
--      profile creation, without us having to manually grant it.
--
-- Gate-by-email is the simplest reliable identity check we can do without
-- adding a separate auth schema. If we ever onboard a non-@execom.ca
-- staff member we can flip the flag manually.

-- ─── 1. Backfill existing profiles ──────────────────────────────────────
update public.profiles
set is_execom_staff = true
where lower(email) like '%@execom.ca'
  and (is_execom_staff is null or is_execom_staff = false);

-- ─── 2. Extend signup trigger ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, is_execom_staff)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'owner',
    lower(new.email) like '%@execom.ca'
  );
  return new;
end;
$$;

-- Trigger itself was created in migration 002 and stays as-is; only the
-- function body changed.
