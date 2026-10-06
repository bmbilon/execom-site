# Executive AI Practicum review build

## Actual architecture

This feature extends the existing `bmbilon/execom-site` Next.js 14 App Router application, based on `origin/main` at `ba62fa8`. Marketing uses the current dark site components, local fonts, navigation and tokens. The portal retains its light theme, Better Auth identity, Neon PostgreSQL database and `profiles.is_execom_staff` access rule. No replacement site, LMS or independent authentication system was introduced.

Work is isolated on `codex/executive-ai-practicum`. Existing changes in the Founders Home project and the homepage worktree were not modified. The source handoff and private targeting data are not checked in or bundled.

The supplied handoff message ended at the start of Section 2. This build implements the received mandate and business decisions. The remaining detailed sections and Appendix A were not received. No research employers were invented or marked as consenting applicants.

## Routes and behavior

- `/executive-ai`: offer, instructor, examples, ten-session format, scope boundaries, C$10,000 starting price, conditional CAPG information and live availability. The two entry paths are `/executive-ai/apply` and `/executive-ai/employers`.
- `/executive-ai/apply`, `/executive-ai/employers`: verified portal account required to save. Incomplete drafts persist in PostgreSQL; resume works across devices. Final submissions are validated and idempotent. No browser storage is used for application answers.
- `/portal/executive-ai`: own drafts, applications, employer nominations and invitations for the signed-in verified email. Verified sponsors can find their authorized participant workspaces here. Each nomination has a distinct participant draft. HR sees invitation/submission progress, not private participant answers.
- `/portal/executive-ai/[id]`: applicant correspondence, deliberate sponsor sharing, immutable offers and decisions, withdrawal, private versioned employer-package preparation and downloadable package history. A verified sponsor account receives only its authorized employer projection.
- `/executive-ai/sponsor#TOKEN`: scoped, expiring sponsor capability; only the applicant-released brief is shown. The response is an attestation, not automatic proof of authority. Staff must verify sponsorship before offering a place.
- `/portal/admin/executive-ai`: staff queue, filters, cohorts, concurrency planning and immutable course/terms versions.
- `/portal/admin/executive-ai/[id]`: private intake, review evidence, applicant-visible correspondence, offers, grant preparation and audit history.
- `/portal/admin/executive-ai/prospects`: private JSON research import and introduction notes. Research never creates an application, reservation or marketing consent.
- `/api/executive-ai/documents/program` and `/sponsor`: downloadable public briefs. `/grant?packageId=...` requires applicant, verified sponsor or staff authorization.

All new private API handlers enforce identity and ownership independently of the portal layout. Mutations require same-origin JSON, bounded bodies and server validation. New storage is not exposed through the public Data API. Responses containing admissions data use no-store and noindex headers. The protected-preview middleware uses the short-lived Vercel deployment identity (or the caller’s Trusted Sources header) to its same-deployment session lookup and handles non-JSON/error responses safely.

## Persistence and availability

Migration `029_executive_ai_practicum.sql` creates the private admissions schema; `030_executive_ai_nomination_drafts.sql` binds invitations to individual drafts; `031_executive_ai_initial_course.sql` seeds a versioned, unapproved course draft with unresolved commercial and eligibility details. The production schema name is `executive_ai`; review deployments require `executive_ai_preview`. There is no default fallback schema.

For a preview, set `PRACTICUM_SCHEMA=executive_ai_preview`. The explicitly enabled `PRACTICUM_PREVIEW_MIGRATE=1` initializes only this isolated schema using the existing server-side Neon credentials. This initializer is guarded by Vercel's preview environment and refuses production. It creates no cohorts, bookings or applicants. Existing Vercel secrets remain hosted; the CLI does not export their values.

For a local environment with an authorized `PORTAL_DATABASE_URL`, set the same preview schema and run `node --env-file=.env.local --import tsx scripts/migrate-executive-ai.ts`. The script refuses production. Production migrations and publication are a later, separately reviewed release.

Admission and cohort mutations use a database transaction and shared advisory lock. Accepted/enrolled seats and unexpired issued offers consume capacity. Expired, declined and withdrawn offers release it. Capacity cannot drop below allocations; allocated delivery dates, hours and location cannot silently change. Open cohorts require future confirmed dates, a deadline, schedule and hours. Default maximum concurrent cohorts is one, editable by staff. The public view never substitutes example dates or a fabricated queue.

Course/terms versions and offer snapshots are immutable. Offers require project qualification, sponsor verification, approved tools/data, an approved commercial version and capacity. Only the applicant can accept their current unexpired offer. No payment collection is implemented or implied.

## Funding adapter

The CAPG adapter is a manual employer handoff. Preparation packages persist a snapshot and include course version, shared employer brief, real schedule if assigned, itemized costs if confirmed, unresolved issues, completion-evidence checklist and `https://capg.alberta.ca/`.

Provider/course eligibility starts unresolved. Owners/shareholders/board members receive a funding restriction flag without rejection from privately funded admissions. Government states are explicitly employer-reported or staff-evidence-reviewed; nothing claims a live government API decision. Banking records and government passwords are never collected.

Official public sources checked 2026-10-06:
- https://www.alberta.ca/canada-alberta-productivity-grant
- https://smith.queensu.ca/executiveeducation/programs/ai-for-leaders.php

## Review and launch decisions

Before issuing a real offer, staff must set the actual cohort schedule, contracting/training entity and address, provider build allowance, internal staff/software/integration responsibilities and commercial terms. Funding verification and the cost allocation remain separate requirements. The preview begins with no real open cohorts or bookings.

The source research rows (30 employers and eight channels) are needed to populate the private prospect view. See `RESEARCH-IMPORT.md`. No outreach is performed. Applicant correspondence is stored in the portal. Existing account verification mail remains part of the existing portal signup system; verification tests intercept or avoid real mail.

The privacy page describes a 12-month closed-record review policy. Automated retention deletion is not enabled; operator review and legally required contractual/accounting retention remain necessary.

## Verification

`npm test` runs the existing tests; PostgreSQL integration tests run when `PRACTICUM_TEST_DATABASE_URL` points to a local database named `eai_test`. They refuse remote hosts. Example: `PRACTICUM_TEST_DATABASE_URL=postgresql://USER@127.0.0.1:55432/eai_test npm test`.

`npx tsc --noEmit` and `npx next build` are the release gates. `scripts/verify-executive-ai-deployment.mjs` performs HTTP tests with synthetic verified accounts supplied in an ignored local file and refuses production URLs and real email domains. Temporary fixture setup is removed from the final deployment and all synthetic records are cleaned up. Tests do not send email or contact government services.


### Verified result (6 October 2026)

- 25 tests passed, including 15 PostgreSQL integration cases and the ten existing tests. TypeScript and the full optimized Next.js build pass.
- Hosted verification used the actual Better Auth and Neon services with four synthetic verified accounts. Save/resume, idempotent intake, sponsor projection, HR nomination/claim, staff-only review, offer/acceptance, live capacity, PDF authorization and manual grant status passed. Guest, nonstaff, cross-account and cross-origin requests were rejected.
- Browser checks covered the public page, executive save/resume, staff admissions and verified sponsor workspace. Desktop (1440 px) and mobile (390 px) views were inspected; no horizontal overflow or browser errors were found in the checked flows.
- Program, sponsorship and employer funding PDFs were rendered and visually inspected. Saved employer packages remain accessible after reloading the workspace.
- Synthetic users, applications, offers, cohorts and imported prospects were removed. The temporary fixture endpoint is absent from the review source and final deployment. No email, marketing outreach or government submission was sent.
- Preview variables are configured only for branch `codex/executive-ai-practicum`: `PRACTICUM_SCHEMA=executive_ai_preview` and `PRACTICUM_PREVIEW_MIGRATE=1`. Production settings and production publication are untouched.

Screenshots and rendered PDF samples are available locally under `outputs/executive-ai/` (ignored by Git and deployment). Portal screenshots and the employer-package sample contain clearly synthetic verification records; final public screenshots show the empty founding intake.
