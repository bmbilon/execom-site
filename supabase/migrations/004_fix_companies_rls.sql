-- Drop the overly restrictive "for all" policy on companies
drop policy if exists "companies_access" on companies;
drop policy if exists "companies_insert_authenticated" on companies;

-- Separate policies: any authenticated user can INSERT,
-- but only company members (or staff) can SELECT/UPDATE/DELETE.
create policy "companies_select" on companies
  for select
  using (user_belongs_to_company(id) or is_execom_staff());

create policy "companies_insert" on companies
  for insert
  with check (auth.uid() is not null);

create policy "companies_update" on companies
  for update
  using (user_belongs_to_company(id) or is_execom_staff());

create policy "companies_delete" on companies
  for delete
  using (user_belongs_to_company(id) or is_execom_staff());
