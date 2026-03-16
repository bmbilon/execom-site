-- Allow any authenticated user to create a company (needed during onboarding
-- when the user has no company_id on their profile yet).
create policy "companies_insert_authenticated" on companies
  for insert
  with check (auth.uid() is not null);

-- Allow users to read/update their own profile (needed during onboarding
-- to link company_id, and for general profile access).
create policy "profiles_self_access" on profiles
  for all
  using (id = auth.uid());
