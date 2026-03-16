# SR&ED Claim OS — Claude Code Build Prompt v3

## Context

You are working in an existing Next.js 14 App Router project at `~/Desktop/execom-site`.
The project already has:
- Supabase Auth (email/password) with middleware at `middleware.ts`
- Route groups: `(marketing)/` and `(portal)/portal/`
- Existing MVP tables from `001_sred_portal.sql` (companies, profiles, claim_years, files, projects, evidence, costs, claim_outputs, reviews, review_comments, audit_log)
- Auth trigger from `002_auth_trigger.sql` (auto-creates profile on signup)
- Existing lib modules at `lib/portal/` (supabase-client, supabase-server, auth, types, validation, constants, claim-builder, xlsx-export, pdf-export)
- Brand system: Playfair Display + Inter + JetBrains Mono, #195E8E blue, #F7F6EE bg, #0d1b2a sidebar
- Supabase project: `gxgfutobubsgttfqilkt.supabase.co`
- Env vars in `.env.local`

### MANDATORY: Inspect before building

Before writing any code, read and inspect these existing files. Summarize what you found as comments at the top of the migration file, listing every existing table, every column on `projects` and `costs`, every RLS helper function name and signature, and every existing route path under `app/(portal)/portal/`.

Files to inspect:
- `supabase/migrations/001_sred_portal.sql`
- `supabase/migrations/002_auth_trigger.sql`
- Any existing `003_*` or `004_*` migration files
- `lib/portal/types.ts`
- `lib/portal/supabase-server.ts`
- `lib/portal/supabase-client.ts`
- `lib/portal/xlsx-export.ts`
- `lib/portal/pdf-export.tsx`
- Existing portal route structure under `app/(portal)/portal/`
- `docs/cra-sred-rules-reference.md` — CRA rules, review processes, and optimization reference (use as authoritative source for calculation logic, review rule semantics, and filing requirements)

Do NOT assume table columns, helper function names, or exported utilities. Reuse exact existing patterns where present.

## What to build

Three deliverables, in this order:
1. **New migration** (`supabase/migrations/005_claim_os_schema.sql`)
2. **Service modules** (`lib/services/*.ts`)
3. **Route skeleton** (pages that fetch data and render shells)

Do NOT build full UI components yet. Each page should be a server component that fetches the relevant data and renders a minimal shell showing the data structure.

---

## Deliverable 1: Schema Migration

### File: `supabase/migrations/005_claim_os_schema.sql`

### Migration safety rules

Do NOT delete or rewrite any existing migration files (`001_*`, `002_*`, `003_*`, `004_*`). Those files may already be applied to the remote Supabase database. Rewriting applied migration history causes drift between local files and remote state.

Instead, create a new migration file `005_claim_os_schema.sql` that:
- Uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so it is safe to run even if some objects already exist from earlier migrations.
- Includes a compatibility header as SQL comments listing every table and column from 001 that it depends on or extends.
- If any table from 001 already exists with overlapping purpose but incompatible structure, prefer `ALTER TABLE` and compatibility shims over duplicate replacement tables.

### Architecture rules — FOLLOW THESE EXACTLY

1. **Projects belong to claim_years, not companies.** The existing `projects.company_id` column from 001 is a legacy column. Retain it for backward compatibility but DO NOT use it in any new service logic or query. All new queries join through `claim_years.company_id`. Do not add `company_id` to any new table that already has `claim_year_id`.

2. **`projects.claim_year_id` must exist, be NOT NULL, be indexed, and be the canonical parent relation** for all project queries. Confirm this column exists in 001 before relying on it. If it does not exist or is nullable, fix it. If `projects.claim_year_id` exists but contains null legacy rows, backfill safely before enforcing `NOT NULL`. If deterministic backfill is not possible from existing data, leave the column nullable temporarily, add the index, use it as the canonical parent in all new code, and emit a migration TODO comment explaining what remains to be backfilled.

3. **Costs never belong directly to a project.** The existing `costs.project_id` column from 001 is a legacy shortcut. Retain it for backward compatibility but DO NOT use it in any new service logic. The correct chain is:
   ```
   cost_imports → cost_line_items → cost_line_classifications → cost_line_project_splits
   ```
   This preserves full auditability. A single imported line can be split across multiple projects with different allocation percentages.

4. **AI never writes to approved fields.** Every narrative section has `raw_text`, `ai_draft_text`, and `approved_text`. Only `approved_text` feeds exports. AI writes to `ai_draft_text` only. The user promotes content explicitly — either from `ai_draft_text` or from manually edited text.

5. **Snapshots before exports.** Before any export is generated, the system creates a `claim_snapshot` capturing the full claim state as JSON. The `export_bundle` references the snapshot. Later edits do not mutate prior exports.

6. **Review rules live in the database.** Create a `review_rules` table that defines each rule declaratively. A worker evaluates rules on data change and writes results to `review_issues`.

7. **Reuse existing RLS helpers.** Inspect the existing RLS helper functions in 001 (`get_my_profile`, `user_belongs_to_company`, `is_execom_staff`) and reuse their exact names and signatures. Only create `claim_year_company` if it does not already exist. Use the exact schema-qualified helper function names/signatures discovered in existing migrations. Do not assume helpers live in `public` unless inspection confirms it.

8. **Reuse existing export helpers.** The modules `lib/portal/xlsx-export.ts` and `lib/portal/pdf-export.tsx` already exist. Wrap and adapt them in the new `exportService`; do not reimplement document generation from scratch.

9. **Preparer and form dependencies.** The T661 filing checklist (Lines 270–282) and preparer section require ancillary CRA forms depending on claim circumstances: T1145 (agreement to allocate assistance), T1146 (agreement to transfer qualified expenditures), T1174 (specified employee salary allocation for associated corporations), and T1263 (third-party preparer disclosure including billing arrangement). The `claim_contacts` table carries `preparer_ern`, `billing_arrangement`, and `related_forms_required` to track these. Review rules should warn if a preparer contact exists without an ERN, or if `associated_corp_flag = true` with specified employees but no T1174 in `related_forms_required`.

10. **Configurable regulatory constants.** The PPA proxy rate (currently 55%), specified employee cap formula parameters (currently 2.5 × YMPE × days/365 per T661), enhanced ITC expenditure limit ($3M pre-Dec 2024, $6M post-Dec 2024), and taxable capital phase-out thresholds are all regulatory values that change over time. Do NOT hardcode them as magic numbers. Use a constants file or config table keyed by form year so they can be updated without code changes. Reference the CRA rules document at `docs/cra-sred-rules-reference.md` for current values.

### Table creation order

Create `claim_snapshots` BEFORE `federal_line_values`, `provincial_line_values`, and `export_bundles` so that `snapshot_id` foreign keys can reference it properly. Do not leave `snapshot_id` as a loose UUID without a FK constraint.

### Tables to create

#### Extend existing tables

```sql
-- companies: add CRA-required fields
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS operating_name text,
  ADD COLUMN IF NOT EXISTS province text DEFAULT 'AB',
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text;

-- claim_years: add filing metadata
ALTER TABLE claim_years
  ADD COLUMN IF NOT EXISTS tax_year_start date,
  ADD COLUMN IF NOT EXISTS tax_year_end date,
  ADD COLUMN IF NOT EXISTS filing_deadline date,
  ADD COLUMN IF NOT EXISTS method_election text DEFAULT 'proxy'
    CHECK (method_election IN ('proxy','traditional')),
  ADD COLUMN IF NOT EXISTS associated_corp_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS taxable_capital_eoy numeric(14,2),
  ADD COLUMN IF NOT EXISTS province_programs jsonb DEFAULT '["AB"]'::jsonb;

-- projects: add T661 Part 2 fields (DO NOT touch or rely on company_id)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS field_code text,
  ADD COLUMN IF NOT EXISTS continuation_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS collaboration_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'experimental_development'
    CHECK (project_type IN ('basic_research','applied_research','experimental_development'));

-- evidence: add richer metadata
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS evidence_date date,
  ADD COLUMN IF NOT EXISTS evidence_category text,
  ADD COLUMN IF NOT EXISTS extracted_summary text,
  ADD COLUMN IF NOT EXISTS metadata_json jsonb;
```

#### New tables (in dependency order)

Create in this exact order:

1. `claim_contacts`
2. `project_narrative_sections`
3. `project_people`
4. `project_evidence_links` — make `narrative_section_key` NOT NULL with a default value of `'general'` for unsectioned links, so the UNIQUE constraint on `(project_id, evidence_id, narrative_section_key)` works correctly with Postgres null semantics
5. `cost_imports`
6. `cost_line_items`
7. `cost_line_classifications` — UNIQUE on `cost_line_item_id` (one active classification per line; if classification history is needed later, we add a `superseded_by` column)
8. `cost_line_project_splits`
9. `assistance_items`
10. `claim_snapshots` — CREATE THIS BEFORE tables that reference it
11. `federal_line_values` — `snapshot_id` is a proper FK to `claim_snapshots(id)`
12. `provincial_line_values` — same FK pattern
13. `provincial_project_breakdowns` — same FK pattern
14. `review_rules`
15. `review_issues` — `rule_key` FK to `review_rules(rule_key)`
16. `export_bundles` — `snapshot_id` FK to `claim_snapshots(id)`

Use the column definitions from the architecture doc (provided below). All tables use `uuid PRIMARY KEY DEFAULT gen_random_uuid()` and `created_at timestamptz DEFAULT now()`.

#### Column definitions for new tables

**claim_contacts**: `claim_year_id` (uuid NOT NULL FK), `contact_role` (text, check: claimant/preparer/technical/financial), `name` (text NOT NULL), `title`, `email`, `phone`, `preparer_ern` (text — CRA Electronic Registration Number, required for preparers), `billing_arrangement` (text, check: contingency/fixed_fee/hourly/internal — required for preparers per T1263 disclosure), `related_forms_required` (text[] — e.g. T1145, T1146, T1174, T1263 — tracks which CRA ancillary forms apply to this contact)

**project_narrative_sections**: `project_id` (uuid NOT NULL FK), `section_key` (text NOT NULL, check: technical_uncertainty/systematic_investigation/advancement/project_logistics/evidence_retained), `raw_text`, `ai_draft_text`, `approved_text`, `evidence_coverage_score` (numeric(3,2) default 0), `review_status` (text default 'draft', check: draft/ai_drafted/edited/approved/flagged), `updated_at` (timestamptz), UNIQUE(project_id, section_key)

**project_people**: `project_id` (uuid NOT NULL FK), `person_type` (text NOT NULL, check: employee/contractor/subcontractor/consultant), `name` (text NOT NULL), `role`, `employer_type` (check: claimant/arms_length/non_arms_length), `specified_employee_flag` (boolean DEFAULT false — true if person is a specified employee per ITA s.248(1): ≥10% shareholder or non-arm's-length), `specified_employee_start_date` (date), `specified_employee_end_date` (date), `notes`

**project_evidence_links**: `project_id` (uuid NOT NULL FK), `evidence_id` (uuid NOT NULL FK to evidence), `narrative_section_key` (text NOT NULL DEFAULT 'general'), `support_strength` (text default 'moderate', check: strong/moderate/weak), `note`, UNIQUE(project_id, evidence_id, narrative_section_key)

**cost_imports**: `claim_year_id` (uuid NOT NULL FK), `source_type` (text NOT NULL, check: payroll_csv/gl_export/ap_export/time_tracking/manual/github/jira/linear), `source_name`, `imported_at` (timestamptz default now()), `status` (text default 'pending', check: pending/processing/complete/failed), `row_count` (integer), `metadata_json` (jsonb)

**cost_line_items**: `cost_import_id` (uuid NOT NULL FK), `claim_year_id` (uuid NOT NULL FK), `line_date` (date), `vendor_or_employee` (text), `description` (text), `gl_account` (text), `gross_amount` (numeric(12,2)), `tax_amount` (numeric(12,2)), `net_amount` (numeric(12,2)), `currency` (text default 'CAD'), `raw_payload_json` (jsonb)

**cost_line_classifications**: `cost_line_item_id` (uuid NOT NULL FK), `likely_category` (text NOT NULL, check: salary_wages/specified_employee/arms_length_contractor/non_arms_length_contractor/third_party_payment/materials_consumed/materials_transformed/overhead/capital_property/proxy_interaction/assistance_reimbursement/excluded), `confidence_score` (numeric(3,2)), `related_party_flag` (boolean default false), `excluded_flag` (boolean default false), `rationale` (text), `classified_by` (text default 'manual', check: manual/ai/rule), UNIQUE(cost_line_item_id)

**cost_line_project_splits**: `cost_line_item_id` (uuid NOT NULL FK), `project_id` (uuid NOT NULL FK), `allocation_percent` (numeric(5,2) NOT NULL), `allocation_amount` (numeric(12,2) NOT NULL), `province_code` (text default 'AB'), `province_percent` (numeric(5,2) default 100), `review_status` (text default 'pending', check: pending/confirmed/excluded/flagged), UNIQUE(cost_line_item_id, project_id)

**assistance_items**: `claim_year_id` (uuid NOT NULL FK), `assistance_type` (text NOT NULL, check: government_grant/government_assistance/non_government_assistance/contract_payment), `source_name` (text NOT NULL), `amount` (numeric(12,2) NOT NULL), `linked_project_id` (uuid FK to projects), `treatment_notes`

**claim_snapshots**: `claim_year_id` (uuid NOT NULL FK), `snapshot_type` (text NOT NULL, check: pre_export/pre_review/manual/amendment), `payload_json` (jsonb NOT NULL)

**federal_line_values**: `claim_year_id` (uuid NOT NULL FK), `snapshot_id` (uuid FK to claim_snapshots), `form_code` (text NOT NULL default 'T661'), `line_code` (text NOT NULL), `value` (numeric(14,2)), `explanation` (text), UNIQUE(claim_year_id, snapshot_id, form_code, line_code)

**provincial_line_values**: `claim_year_id` (uuid NOT NULL FK), `snapshot_id` (uuid FK to claim_snapshots), `province_code` (text NOT NULL default 'AB'), `form_code` (text NOT NULL), `line_code` (text NOT NULL), `value` (numeric(14,2)), `explanation` (text), UNIQUE(claim_year_id, snapshot_id, province_code, form_code, line_code)

**provincial_project_breakdowns**: `claim_year_id` (uuid NOT NULL FK), `snapshot_id` (uuid FK to claim_snapshots), `project_id` (uuid NOT NULL FK), `province_code` (text NOT NULL default 'AB'), `provincial_expenditures` (numeric(14,2) — expenditures carried out in this province), `non_provincial_share` (numeric(14,2) — expenditures outside this province), `provincial_salaries` (numeric(14,2) — salary base in this province), `federal_proxy_in_province` (numeric(14,2) — portion of federal PPA allocated to this province), `provincial_proxy_amount` (numeric(14,2) — province-specific proxy calculation)

**review_rules**: `rule_key` (text NOT NULL UNIQUE), `layer` (text NOT NULL, check: form/eligibility/calculation), `severity` (text NOT NULL, check: blocker/warning/info), `source_area` (text NOT NULL), `message_template` (text NOT NULL), `enabled` (boolean default true)

**review_issues**: `claim_year_id` (uuid NOT NULL FK), `project_id` (uuid FK to projects), `rule_key` (text FK to review_rules(rule_key)), `issue_type` (text NOT NULL), `severity` (text NOT NULL, check: blocker/warning/info), `source_area` (text NOT NULL), `message` (text NOT NULL), `target_field` (text), `resolution_status` (text default 'open', check: open/resolved/dismissed/deferred), `resolution_note`, `resolved_at` (timestamptz)

**export_bundles**: `claim_year_id` (uuid NOT NULL FK), `version_label` (text NOT NULL), `export_type` (text NOT NULL, check: t661_package/schedule_31/provincial_package/narrative_pack/evidence_appendix/cost_support/reviewer_memo/full_bundle), `status` (text default 'generating', check: generating/ready/failed/superseded), `snapshot_id` (uuid FK to claim_snapshots), `storage_key`, `file_size` (bigint), `generated_by` (uuid FK to profiles — confirm `profiles.id` type matches `auth.uid()` UUID type via inspection)

### After tables: RLS, indexes, seeds

1. **Enable RLS** on every new table.

2. **RLS policies** on every new table using the existing helpers. Pattern: `user_belongs_to_company(claim_year_company(claim_year_id)) OR is_execom_staff()`. For tables that FK through `project_id` instead of `claim_year_id`, join through `projects → claim_years` to get `company_id`. Check for duplicate policy names against existing migrations before creating.

3. **Indexes** on every `claim_year_id`, `project_id`, `cost_import_id`, `cost_line_item_id`, and `evidence_id` FK column.

4. **Seed review_rules** with initial rules. Note: the PPA rule references "configured proxy rate" — the 55% rate is the current CRA prescribed proxy amount but should not be treated as eternal in the message text:

```sql
INSERT INTO review_rules (rule_key, layer, severity, source_area, message_template) VALUES
  ('FORM.CLAIM.NO_PROJECTS', 'form', 'blocker', 't661_part1', 'Claim must have at least one project'),
  ('FORM.CLAIM.NO_CONTACTS', 'form', 'blocker', 't661_part1', 'Claimant and preparer contact information required'),
  ('FORM.CLAIM.NO_METHOD', 'form', 'blocker', 't661_part1', 'Method election (proxy or traditional) must be selected'),
  ('FORM.CLAIM.NO_TAX_YEAR', 'form', 'blocker', 't661_part1', 'Tax year start and end dates required'),
  ('FORM.CLAIM.NO_BN', 'form', 'blocker', 't661_part1', 'Business number is required for filing'),
  ('FORM.PROJECT.NO_NARRATIVES', 'form', 'blocker', 't661_part2', 'Project must have approved narratives for uncertainty, investigation, and advancement'),
  ('FORM.PROJECT.MISSING_FIELD_CODE', 'form', 'warning', 't661_part2', 'Field of science/technology code should be assigned'),
  ('FORM.PROJECT.MISSING_DATES', 'form', 'warning', 't661_part2', 'Project start and completion dates should be set'),
  ('ELIG.NARRATIVE.COMMERCIAL_LANGUAGE', 'eligibility', 'warning', 'project_narrative', 'Technical uncertainty section contains commercial language'),
  ('ELIG.NARRATIVE.NO_EXPERIMENTS', 'eligibility', 'warning', 'project_narrative', 'Systematic investigation lacks experimental chronology'),
  ('ELIG.NARRATIVE.NO_EVIDENCE', 'eligibility', 'warning', 'project_narrative', 'Narrative section has no evidence links'),
  ('ELIG.COST.NO_PROJECT', 'eligibility', 'warning', 'cost_allocation', 'Cost line is not assigned to any project'),
  ('ELIG.COST.RELATED_PARTY', 'eligibility', 'warning', 'cost_allocation', 'Related party cost requires treatment documentation'),
  ('ELIG.COST.LARGE_CONTRACTOR', 'eligibility', 'info', 'cost_allocation', 'Contractor payment exceeds $30,000 — ensure listed on T661'),
  ('CALC.FED.PROJECT_SUM', 'calculation', 'blocker', 'federal_calc', 'Project cost totals do not match claim total'),
  ('CALC.FED.PPA_MISMATCH', 'calculation', 'blocker', 'federal_calc', 'Prescribed proxy amount does not match configured proxy rate applied to qualifying salaries'),
  ('CALC.FED.NEGATIVE_QE', 'calculation', 'blocker', 'federal_calc', 'Qualified expenditures are negative — check reductions'),
  ('CALC.FED.METHOD_INCONSISTENCY', 'calculation', 'blocker', 'federal_calc', 'Method election conflicts with expenditure structure'),
  ('CALC.PROV.AB_RECONCILE', 'calculation', 'warning', 'provincial_calc', 'Alberta expenditures exceed federal total'),
  ('CALC.PROV.AB_SPLIT_COMPLETE', 'calculation', 'blocker', 'provincial_calc', 'Project has costs but no Alberta expenditure breakdown'),
  -- Additional rules per CRA rules reference (docs/cra-sred-rules-reference.md §9.4)
  ('ELIG.PROJECT.CONTINUATION_NO_DIFFERENTIATION', 'eligibility', 'warning', 'project_narrative', 'Multi-year continuation project must differentiate current-year work from prior years'),
  ('FORM.COST.SALARY_180_DAYS', 'form', 'blocker', 'cost_allocation', 'Salary/wages paid more than 180 days after tax year end are not deductible SR&ED expenditures'),
  ('ELIG.COST.SPECIFIED_EMPLOYEE_CAP', 'eligibility', 'warning', 'cost_allocation', 'Specified employee salary exceeds form-year cap (T661 column 5 formula) — excess is not eligible'),
  ('ELIG.COST.ASSOCIATED_CORP_T1174', 'eligibility', 'blocker', 'cost_allocation', 'Associated corporation with specified employees requires Form T1174 allocation agreement'),
  ('FORM.CLAIM.DEADLINE_WARNING', 'form', 'warning', 't661_part1', 'T661 filing deadline is within 90 days — claim has not been exported'),
  ('FORM.CLAIM.DEADLINE_CRITICAL', 'form', 'blocker', 't661_part1', 'T661 filing deadline is within 30 days — claim has not been exported'),
  ('ELIG.NARRATIVE.ADVANCEMENT_MISSING', 'eligibility', 'warning', 'project_narrative', 'Line 246 advancement does not appear to connect back to Line 242 uncertainty'),
  ('FORM.NARRATIVE.WORD_LIMIT_EXCEEDED', 'form', 'warning', 'project_narrative', 'Narrative section exceeds CRA word limit (Line 242: 350w, Line 244: 700w, Line 246: 350w)'),
  ('ELIG.NARRATIVE.LOW_EVIDENCE_COVERAGE', 'eligibility', 'warning', 'project_narrative', 'Narrative section evidence_coverage_score is below 0.5 — weak substantiation for CRA review'),
  ('FORM.CLAIM.NO_PREPARER_ERN', 'form', 'warning', 't661_part1', 'Claim preparer contact is missing Electronic Registration Number (ERN)')
ON CONFLICT (rule_key) DO NOTHING;
```

For the `review_rules` seed, emit one idempotent INSERT statement only, ending with `ON CONFLICT (rule_key) DO NOTHING;`. Do not duplicate the seed block.

---

## Deliverable 2: Service Modules

### Location: `lib/services/`

Create these 7 service files. Each service is a module of pure functions that take a Supabase server client and return typed results.

**Domain boundary rule:** Domain services should not depend directly on each other. If orchestration is needed (e.g., export service needs to check review blockers before exporting), create a thin workflow inside the calling API route handler. Do not import `reviewService` inside `exportService` — instead, the API route calls `reviewService.hasBlockers()` first, then calls `exportService.generateExportBundle()`.

#### `lib/services/claimService.ts`
Domain: `companies`, `claim_years`, `claim_contacts`
```typescript
export async function getClaimYear(supabase, yearId: string)
export async function getClaimYears(supabase, companyId: string)
export async function createClaimYear(supabase, data: CreateClaimYearInput)
export async function updateClaimYear(supabase, yearId: string, data: Partial<ClaimYear>)
export async function getClaimContacts(supabase, yearId: string)
export async function upsertClaimContact(supabase, contact: ClaimContactInput)
export async function getClaimSummary(supabase, yearId: string)
// getClaimSummary returns: project count, cost totals, file count, evidence count,
// narrative completion %, readiness score
```

#### `lib/services/projectService.ts`
Domain: `projects`, `project_narrative_sections`, `project_people`, `project_evidence_links`
```typescript
export async function getProjects(supabase, yearId: string)
export async function getProject(supabase, projectId: string)
export async function createProject(supabase, data: CreateProjectInput)
export async function updateProject(supabase, projectId: string, data: Partial<Project>)
export async function getNarrativeSections(supabase, projectId: string)
export async function upsertNarrativeSection(supabase, section: NarrativeSectionInput)
export async function promoteNarrativeDraft(supabase, sectionId: string, overrideText?: string)
// If overrideText is provided, writes that to approved_text.
// Otherwise copies ai_draft_text → approved_text.
// Sets review_status = 'approved' in either case.
export async function getProjectPeople(supabase, projectId: string)
export async function upsertProjectPerson(supabase, person: ProjectPersonInput)
export async function getProjectEvidenceLinks(supabase, projectId: string)
export async function linkEvidence(supabase, link: EvidenceLinkInput)
export async function getProjectCostSummary(supabase, projectId: string)
// Queries cost_line_project_splits for this project, groups by category
```

#### `lib/services/costService.ts`
Domain: `cost_imports`, `cost_line_items`, `cost_line_classifications`, `cost_line_project_splits`, `assistance_items`
```typescript
export async function createImport(supabase, yearId: string, sourceType: string, sourceName: string)
export async function getImports(supabase, yearId: string)
export async function ingestLineItems(supabase, importId: string, yearId: string, rows: RawCostRow[])
export async function getLineItems(supabase, importId: string)
export async function getUnclassifiedLines(supabase, yearId: string)
export async function classifyLineItem(supabase, lineItemId: string, classification: ClassificationInput)
export async function getUnassignedLines(supabase, yearId: string)
export async function splitLineToProjects(supabase, lineItemId: string, splits: ProjectSplitInput[])
export async function getProjectAllocationMatrix(supabase, yearId: string)
// Returns: for each project, sum of allocated amounts by category
export async function getAssistanceItems(supabase, yearId: string)
export async function upsertAssistanceItem(supabase, item: AssistanceItemInput)
export async function getCostSummary(supabase, yearId: string)
// Returns: total by category, mapped vs unmapped counts, province splits
```

#### `lib/services/federalCalcService.ts`
Domain: `federal_line_values`, reads from cost/project tables (read-only cross-domain access is acceptable)
```typescript
export async function runFederalCalculation(supabase, yearId: string)
// For this scaffold, prefer conservative, clearly traceable calculation steps
// with TODO markers over speculative full tax logic. Do not invent unsupported filing logic.
//
// CALCULATION SEQUENCE (per CRA rules reference docs/cra-sred-rules-reference.md):
//
// 1. Load claim_year (method_election, associated_corp_flag, taxable_capital_eoy, tax_year_start)
// 2. Load all cost_line_project_splits + cost_line_classifications for the year
// 3. For each project:
//    a. Sum allocated amounts by classification category
//    b. Apply specified employee cap: if category = 'specified_employee',
//       use the current T661-specified employee cap formula from the applicable form year config.
//       NOTE: The actual T661 form uses "2.5 × YMPE × days / 365" (column 5 of the
//       specified employee salary table), NOT simply "5× YMPE". Internal references to
//       "5× YMPE" are inconsistent with the filed form. Do not hardcode any multiplier —
//       load the cap formula parameters from the regulatory constants config for the claim year.
//    c. Apply arm's-length contractor 80% rule: category 'arms_length_contractor' × 0.80
//    d. Apply non-arm's-length look-through: category 'non_arms_length_contractor' × 0.80
//    e. Apply third-party payment 80% rule: category 'third_party_payment' × 0.80
//    f. If method_election = 'proxy':
//       PPA = qualifying_salary_base × configured_proxy_rate (currently 0.55, but MUST be configurable)
//       Do NOT include overhead as separate expenditure
//    g. If method_election = 'traditional':
//       Include overhead as direct SR&ED expenditure (no PPA)
//    h. If tax_year_start >= '2024-12-16': include 'capital_property' in qualified expenditures
//       'capital_property' covers eligible capital property AND lease costs (not just equipment)
//       TODO: Verify capital treatment under proxy vs traditional per Bill C-15
// 4. For each project: deduct assistance per-project (NOT aggregate):
//    project_qe = MAX(0, project_total - SUM(assistance_items for this project))
//    NOTE: IEG from Alberta is government_assistance — it reduces federal QE per project
// 5. Sum project_qe across all projects = total federal qualified expenditures
// 6. Apply ITC rate:
//    - If tax_year_start >= '2024-12-16' (post-Budget 2025):
//      Enhanced rate (35% for CCPC) on first $6M of QE
//      Phase-out when taxable_capital_eoy between $15M–$75M
//      Max refundable ITC: $2.1M
//    - If tax_year_start < '2024-12-16':
//      Enhanced rate (35% for CCPC) on first $3M of QE
//      Phase-out when taxable_capital_eoy between $10M–$50M
//      Max refundable ITC: $1.05M
//    - Basic rate: 15% on QE above the enhanced limit
//    TODO: Implement taxable capital phase-out formula
//    TODO: Handle associated_corp_flag — associated corps share the expenditure limit
// 7. Write results to federal_line_values (T661 Part 3 lines + Schedule 31 ITC lines)
// 8. Return the full line value set

export async function getFederalLines(supabase, yearId: string)
export async function getFederalWaterfall(supabase, yearId: string)
// Returns the step-by-step expenditure waterfall:
// total expenditures → exclusions → proxy/overhead → assistance → qualified → ITC
```

#### `lib/services/provincialCalcService.ts`
Domain: `provincial_line_values`, `provincial_project_breakdowns`, reads from federal/cost tables
```typescript
export async function runProvincialCalculation(supabase, yearId: string, provinceCode: string)
// For this scaffold, prefer conservative, clearly traceable calculation steps
// with TODO markers over speculative full tax logic. Do not invent unsupported filing logic.
//
// ALBERTA IEG CALCULATION SEQUENCE (Schedule 29 of AT1):
// Reference: docs/cra-sred-rules-reference.md §8
//
// IMPORTANT SEQUENCING — three-pass orchestration:
// The provincial calc derives from a pre-IEG federal project base, and the IEG
// then feeds back as government assistance reducing federal QE. This means:
//   1. Run PROVISIONAL federal calc (per-project QE WITHOUT IEG assistance)
//   2. Run provincial calc → derives Alberta expenditures from the provisional
//      federal project base, computes IEG amount
//   3. Store IEG as assistance_item (type: 'government_assistance') per project
//   4. Re-run FINAL federal calc → deducts IEG from per-project QE before computing ITC
// The full/route.ts API endpoint orchestrates all three passes.
// Do NOT build a circular dependency where provincial reads final-federal numbers
// that already include IEG reduction — that creates an infinite loop.
//
// IEG TWO-TIER STRUCTURE:
// 1. Load PROVISIONAL federal qualified expenditure base for Alberta projects
//    (from the pre-IEG federal run, T661 line 559, Alberta portion)
// 2. For each project in Alberta:
//    a. Start with federal QE allocated to Alberta
//    b. Deduct federal proxy amount allocated to Alberta
//    c. Add Alberta proxy amount (same rate, Alberta salary base)
//    d. Result = Alberta eligible R&D expenditures
// 3. Sum Alberta eligible expenditures across all projects (cap at $4M for IEG)
// 4. Retrieve base-year spending:
//    Query prior 2 claim_years for same company with province_programs containing 'AB'
//    base_year_avg = average of their Alberta eligible expenditures
//    If no prior years (first-time claimant): base_year_avg = 0 → full 20% applies
// 5. Compute IEG tiers:
//    base_tier = MIN(alberta_eligible, $4M) × 0.08
//    incremental_amount = MAX(0, alberta_eligible - base_year_avg)
//    incremental_tier = MIN(incremental_amount, $4M - base_tier_eligible) × 0.12
//    total_ieg = base_tier + incremental_tier
// 6. Apply taxable capital phase-out:
//    If taxable_capital_eoy < $10M: full IEG
//    If $10M–$50M: proportional reduction
//    If >= $50M: IEG = 0
// 7. Write provincial_line_values (AT1 Schedule 29 lines)
// 8. Write provincial_project_breakdowns (per-project provincial_expenditures, non_provincial_share,
//    provincial_salaries, federal_proxy_in_province, provincial_proxy_amount)
// 9. Return IEG total + per-project breakdown

export async function getProvincialLines(supabase, yearId: string, provinceCode: string)
export async function getProvincialProjectMatrix(supabase, yearId: string, provinceCode: string)
// Returns per-project breakdown: provincial expenditures, non-provincial share, provincial salaries, proxy amounts
```

#### `lib/services/reviewService.ts`
Domain: `review_rules`, `review_issues`, reads from all tables for context
```typescript
export async function runAllRules(supabase, yearId: string)
// 1. Load all active review_rules
// 2. Load full claim context (claim_year + projects + narratives + costs + evidence + calculations)
// 3. Evaluate each rule against the context
// 4. Delete existing open issues for this claim_year (for initial scaffold, replace open issues wholesale)
// 5. Insert new review_issues
// 6. Return { blockers: N, warnings: N, info: N }

// NARRATIVE LINTING (per CRA rules reference §4.2 and §7):
// - FORM.NARRATIVE.WORD_LIMIT_EXCEEDED: Check approved_text word count against:
//     technical_uncertainty (Line 242): 350 words max
//     systematic_investigation (Line 244): 700 words max
//     advancement (Line 246): 350 words max
// - ELIG.NARRATIVE.COMMERCIAL_LANGUAGE: Scan approved_text for commercial terms:
//     "revenue", "sales", "customer", "market", "competitive advantage", "profit",
//     "market share", "customer satisfaction" — extend keyword list as needed
// - ELIG.NARRATIVE.NO_EXPERIMENTS: Check systematic_investigation for temporal markers
//     (months, dates, "Phase", "Q1", hypothesis/result language)
// - ELIG.NARRATIVE.LOW_EVIDENCE_COVERAGE: Flag sections where evidence_coverage_score < 0.5
//     Evidence coverage = (linked evidence items with support_strength 'strong' or 'moderate') / target
//     Target: ≥ 3 evidence items per narrative section for export readiness
// - ELIG.NARRATIVE.ADVANCEMENT_MISSING: Check if Line 246 references concepts from Line 242
// - ELIG.PROJECT.CONTINUATION_NO_DIFFERENTIATION: If continuation_flag = true,
//     check that systematic_investigation text does not duplicate prior year's text
//
// DEADLINE CHECKS:
// - FORM.CLAIM.DEADLINE_WARNING: filing_deadline <= now() + 90 days AND no export_bundle exists
// - FORM.CLAIM.DEADLINE_CRITICAL: filing_deadline <= now() + 30 days AND no export_bundle exists

export async function getReviewIssues(supabase, yearId: string)
export async function resolveIssue(supabase, issueId: string, note: string)
export async function dismissIssue(supabase, issueId: string, note: string)
export async function hasBlockers(supabase, yearId: string): Promise<boolean>
```

#### `lib/services/exportService.ts`
Domain: `claim_snapshots`, `export_bundles`. Reuses existing `lib/portal/xlsx-export.ts` and `lib/portal/pdf-export.tsx` for document generation.
```typescript
export async function createSnapshot(supabase, yearId: string, snapshotType: string)
// Reads ENTIRE claim state (company, contacts, projects, narratives, costs, calculations, evidence)
// Writes a claim_snapshot with the full JSON payload

export async function generateExportBundle(supabase, yearId: string, exportType: string)
// 1. Create a pre_export snapshot
// 2. Generate the requested document using existing xlsx-export / pdf-export helpers
// 3. Upload to Supabase Storage
// 4. Create export_bundle record linking to snapshot
// 5. Return the bundle with download URL
// NOTE: blocker check is done by the calling API route, NOT inside this function

export async function getExportBundles(supabase, yearId: string)
export async function getSnapshot(supabase, snapshotId: string)
```

### Type definitions

Create `lib/services/types.ts` with interfaces for every input/output type referenced above. Use the actual DB column names. Cross-reference against existing `lib/portal/types.ts` — extend or re-export where overlap exists; do not create conflicting type definitions.

---

## Deliverable 3: Route Skeleton

### Location: `app/(portal)/portal/`

Create these route pages. Each is a server component that:
1. Gets the session via `createServerSupabaseClient()`
2. Calls the relevant service function(s)
3. Renders a minimal data shell — no StatusBadge, no complex UI

Follow the existing portal auth/redirect pattern exactly as found in current server pages. Do not invent a new auth wrapper if one already exists.

Each page renders ONLY:
- The section label (uppercase, blue, 12px, tracking-wide — matching existing brand)
- The page title (Playfair Display serif)
- A `<pre className="text-[13px] font-mono text-[#5A5A5A] bg-white border border-[#E5E5E5] rounded-[6px] p-6 overflow-auto">` block showing the JSON data (temporary, will be replaced with real UI later)

### Route tree

```
app/(portal)/portal/
├── dashboard/
│   └── page.tsx              ← EXISTING, keep as-is
├── claims/[yearId]/
│   ├── page.tsx              ← Server-side redirect() to /portal/claims/[yearId]/setup
│   ├── layout.tsx            ← Sub-nav with tabs: Setup | Projects | Costs | Federal | Provincial | Review | Export
│   ├── setup/
│   │   └── page.tsx          ← claimService.getClaimYear + getClaimContacts
│   ├── projects/
│   │   ├── page.tsx          ← projectService.getProjects
│   │   └── [projectId]/
│   │       └── page.tsx      ← projectService.getProject + getNarrativeSections + getProjectPeople + getProjectEvidenceLinks + getProjectCostSummary
│   ├── costs/
│   │   └── page.tsx          ← costService.getImports + getCostSummary + getProjectAllocationMatrix
│   ├── federal/
│   │   └── page.tsx          ← federalCalcService.getFederalLines + getFederalWaterfall
│   ├── provincial/
│   │   └── page.tsx          ← provincialCalcService.getProvincialLines + getProvincialProjectMatrix
│   ├── review/
│   │   └── page.tsx          ← reviewService.getReviewIssues (grouped by severity: blockers first)
│   └── export/
│       └── page.tsx          ← exportService.getExportBundles
├── screener/
│   └── page.tsx              ← EXISTING, keep as-is
└── settings/
    └── page.tsx              ← EXISTING, keep as-is
```

### API Routes

```
app/api/portal/
├── calculate/[yearId]/
│   ├── federal/route.ts      ← POST: federalCalcService.runFederalCalculation
│   ├── provincial/route.ts   ← POST: provincialCalcService.runProvincialCalculation
│   └── full/route.ts         ← POST: orchestrate provisional federal → provincial (IEG) → store IEG as assistance → final federal
│                                (three-pass: provincial derives from pre-IEG federal base, IEG feeds back as assistance)
├── review/[yearId]/
│   └── run-rules/route.ts    ← POST: reviewService.runAllRules
├── import/[yearId]/
│   └── route.ts              ← POST: costService.createImport + ingestLineItems
├── export/[yearId]/
│   └── route.ts              ← POST: check reviewService.hasBlockers() first, then exportService.generateExportBundle()
└── setup-company/
    └── route.ts              ← EXISTING, keep as-is
```

For all POST routes, return typed JSON responses: `{ ok: boolean, data?: ..., error?: string }`. Reuse existing auth/session patterns from the repo.

### Claim year sub-nav layout

The `claims/[yearId]/layout.tsx` should render horizontal tabs matching the execom brand:

```tsx
const TABS = [
  { label: 'Setup', href: `/portal/claims/${yearId}/setup` },
  { label: 'Projects', href: `/portal/claims/${yearId}/projects` },
  { label: 'Costs', href: `/portal/claims/${yearId}/costs` },
  { label: 'Federal', href: `/portal/claims/${yearId}/federal` },
  { label: 'Provincial', href: `/portal/claims/${yearId}/provincial` },
  { label: 'Review', href: `/portal/claims/${yearId}/review` },
  { label: 'Export', href: `/portal/claims/${yearId}/export` },
]
```

Styling: `text-[13px] font-semibold uppercase tracking-[0.06em]`, active tab gets `border-b-2 border-blue text-blue`, inactive gets `text-[#5A5A5A] hover:text-[#1A1A1A]`.

---

## Constraints

- TypeScript strict mode
- All server-side data fetching (no client-side Supabase queries for reads)
- Use `createServerSupabaseClient()` from `lib/portal/supabase-server.ts` in server components
- Use `createClient()` from `lib/portal/supabase-client.ts` only in client components for mutations
- Never import service modules in client components (services are server-only)
- All monetary values use `numeric(12,2)` or `numeric(14,2)` — never floats
- execom is always lowercase
- Brand: border-radius never > 6px, no gradients, no pills, no emoji, no spinners
- File paths for Supabase Storage: `{company_id}/{claim_year_id}/{uuid}_{sanitized_name}`

## Build order

1. Read and inspect all existing files listed in the "Inspect before building" section
2. Create `supabase/migrations/005_claim_os_schema.sql` with compatibility header
3. Create `lib/services/types.ts`
4. Create all 7 service modules
5. Create the claim year `layout.tsx` with sub-nav
6. Create `claims/[yearId]/page.tsx` redirect page
7. Create all route pages
8. Create all API routes
9. Run `npm run build` and fix any type errors

## Post-build validation checklist

After scaffolding, verify:
- [ ] No migration name collisions with existing 001-004 files
- [ ] No duplicate RLS policy names across all migration files
- [ ] All foreign keys reference tables that are created BEFORE them in the migration
- [ ] No server-only imports leaking into `'use client'` files
- [ ] No route conflicts with existing portal pages
- [ ] Type definitions in `lib/services/types.ts` do not conflict with `lib/portal/types.ts`
- [ ] `npm run build` passes with zero errors
