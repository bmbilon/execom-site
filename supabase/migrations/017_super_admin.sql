-- 017 — Super-admin tier above execom staff.
--
-- Problem this solves: the profiles RLS policy is `for all`, so any
-- is_execom_staff user can edit any profile — including flipping the
-- is_execom_staff flag on themselves or others. There was no tier above
-- staff and no guard against privilege escalation.
--
-- This migration adds an explicit is_super_admin tier and a trigger that
-- blocks changes to the staff/super flags unless the actor is a super
-- admin. Service-role / SECURITY DEFINER contexts (auth.uid() is null),
-- such as the signup trigger, pass through unaffected.

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

-- Helper, mirrors is_execom_staff(). STABLE + SECURITY DEFINER so it can
-- be used inside RLS policies and triggers.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_super_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

-- Privilege-escalation guard. Fires before any profile UPDATE. If the
-- staff or super flag is being changed and the caller is an authenticated
-- non-super user, reject. auth.uid() is null for the service role and for
-- SECURITY DEFINER triggers (e.g. handle_new_user), so those are allowed.
create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (coalesce(new.is_execom_staff, false) is distinct from coalesce(old.is_execom_staff, false)
      or coalesce(new.is_super_admin, false) is distinct from coalesce(old.is_super_admin, false)) then
    if auth.uid() is not null and not public.is_super_admin() then
      raise exception 'Only super admins can change is_execom_staff / is_super_admin';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_privilege_escalation on public.profiles;
create trigger trg_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_privilege_escalation();

-- Seed the first super admin. Runs as the postgres/service role at
-- migration time (auth.uid() is null), so the guard above allows it.
update public.profiles
set is_super_admin = true,
    is_execom_staff = true
where lower(email) = 'brett@execom.ca';
