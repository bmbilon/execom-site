-- Auto-create a profile row when a new user signs up via Supabase Auth.
-- The profile is created without a company_id; the user links it during
-- the company setup flow in the portal dashboard.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'owner'
  );
  return new;
end;
$$;

-- Fire after every insert into auth.users (i.e. every signup).
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
