# Neon portal migration

Enable `NEXT_PUBLIC_DATABASE_PROVIDER=neon` only after the database and users have been copied and verified. The public Data API URL belongs in `NEXT_PUBLIC_NEON_DATA_API_URL`; all database, signing, auth, mail and object-storage credentials remain server-only.

Apply migrations 026, 027 and 028 in order after restoring the legacy schema and access rules. Import existing users with `scripts/migrate-neon-auth.ts --apply`. Existing UUIDs, profile roles and bcrypt passwords are retained. New passwords use Better Auth's default password hashing. Existing Supabase sessions and pending email links do not transfer.

Signup requires email verification. Password reset links are single-use and expire after one hour. Existing banned or deleted accounts cannot start sessions. The private `portal_auth` schema is not available through the Data API. API tokens expire after two minutes and carry the original user UUID so existing row policies still apply.

Server configuration: `PORTAL_DATABASE_URL`, `NEON_DATA_API_URL`, `NEON_SERVICE_PRIVATE_JWK`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `PORTAL_RESEND_API_KEY`, `PORTAL_MAIL_FROM`, `NEON_S3_ENDPOINT`, `NEON_S3_REGION`, `NEON_S3_ACCESS_KEY_ID`, `NEON_S3_SECRET_ACCESS_KEY`. Preview deployments use their immutable deployment URL for auth callbacks.

Private `sred-files` and `claim-exports` buckets use signed uploads/downloads. The portal checks the current user's company, staff flag and claim year before issuing a file capability. Uploads keep the 25 MB limit. Browser credentials cannot access Galea's private workspace store.

Validation scripts:
- `scripts/verify-neon-auth.ts`: password compatibility, reset, signup verification, row-policy isolation and access controls. Email delivery is intercepted.
- `scripts/verify-neon-deployment.ts`: real HTTP login, middleware, dashboard and signed private storage. Uses temporary synthetic users and removes them afterward.

Galea is a separate deployment sharing the original database. Its workspace and file connector must be migrated before retiring the Supabase project. Keep a verified SQL backup on X10 before retirement. A rollback after accepting Neon writes requires reconciliation; do not simply restore the old provider flag.
