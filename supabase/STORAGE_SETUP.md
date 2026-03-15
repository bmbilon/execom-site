# Supabase Storage Setup

The SR&ED portal requires a private storage bucket that must be created manually in the Supabase dashboard.

## Steps

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `sred-files`
4. Set to **Private** (not public)
5. Click "Create bucket"

## Storage Policy

After creating the bucket, apply this storage policy via the SQL Editor in the Supabase dashboard:

```sql
create policy "company_or_staff_scoped_access" on storage.objects
  for all using (
    bucket_id = 'sred-files'
    and (
      (storage.foldername(name))[1]::uuid in (
        select company_id from profiles where id = auth.uid()
      )
      or exists (
        select 1 from profiles
        where id = auth.uid() and is_execom_staff = true
      )
    )
  );
```

This policy ensures:
- Authenticated users can only access files within their company's folder prefix
- execom staff (is_execom_staff = true) can access all files across companies
- Unauthenticated users have no access

## File Path Convention

Files are stored at: `{company_id}/{claim_year_id}/{uuid}_{sanitized_filename}`

- `company_id` is the UUID of the company
- `claim_year_id` is the UUID of the claim year
- `uuid` is a fresh random UUID generated at upload time
- `sanitized_filename` is the original filename lowercased, special chars replaced with underscore, truncated to 100 characters

This ensures no filename collisions even if users upload files with identical names.

## Limits

- Max file size: 25 MB per file
- Max per claim year: 500 MB
- Allowed types: PDF, XLSX, XLS, CSV, DOCX, PNG, JPG, ZIP
