# SR&ED Claim OS — Claude Code Build Prompt v2

## Context

You are working in an existing Next.js 14 App Router project at `~/Desktop/execom-site`.
The project already has:
- Supabase Auth (email/password) with middleware at `middleware.ts`
- Route groups: `(marketing)/` and `(portal)/portal/`
- Existing MVP tables from `001_sred_portal.sql` (companies, profiles, claim_years, files, projects, evidence, costs, claim_outputs, reviews, review_comments, audit_log)
- Auth trigger from `002_auth_trigger.sql` (auto-creates profile on signup)
- A partial 003 migration at `supabase/migrations/003_sred_claim_os.sql` that MUST be replaced
- Existing lib modules at `lib/portal/` (supabase-client, supabase-server, auth, types, validation, constants, claim-builder, xlsx-export, pdf-export)
- Brand system: Playfair Display + Inter + JetBrains Mono, #195E8E blue, #F7F6EE bg, #0d1b2a sidebar
- Supabase project: `gxgfutobubsgttfqilkt.supabase.co`
- Env vars in `.env.local`

## What to build

Three deliverables, in this order:
1. **Replacement migration** (`supabase/migrations/003_claim_os_schema.sql`)
2. **Service modules** (`lib/services/*.ts`)
3. **Route skeleton** (pages that fetch data and render shells)

Do NOT build full UI components yet. Each page should be a server component that fetches the relevant data and renders a minimal shell showing the data structure.

---

## Deliverable 1: Schema Migration

### File: `supabase/migrations/003_claim_os_schema.sql`

DELETE the existing `003_sred_claim_os.sql` and replace with this migration. This is additive to 001 and 002.

### Architecture rules — FOLLOW THESE EXACTLY

1. **Projects belong to claim_years, not companies.** The existing `projects.company_id` column from 001 should be deprecated. All new queries should join through `claim_years.company_id`. Do not add `company_id` to any new table that already has `claim_year_id`.

2. **Costs never belong directly to a project.** The existing `costs.project_id` column from 001 is a legacy shortcut. The correct chain is:
   ```
   cost_imports → cost_line_items → cost_line_classifications → cost_line_project_splits
   ```
   This preserves full auditability. A single imported line can be split across multiple projects with different allocation percentages.

3. **AI never writes to approved fields.** Every narrative section has `raw_text`, `ai_draft_text`, and `approved_text`. Only `approved_text` feeds exports. AI writes to `ai_draft_text` only. The user promotes content from `ai_draft_text` → `approved_text` explicitly.

4. **Snapshots before exports.** Before any export is generated, the system creates a `claim_snapshot` capturing the full claim state as JSON. The `export_bundle` references the snapshot. Later edits do not mutate prior exports.

5. **Review rules live in the database.** Create a `review_rules` table that defines each rule declaratively. A worker evaluates rules on data change and writes results to `review_issues`.

### Tables to create (in dependency order)

```sql
-- ============================================================
-- EXTEND EXISTING TABLES
-- ============================================================

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
  ADD COLUMN IF NOT EXISTS province_programs jsonb DEFAULT '["AB"]'::jsonb;

-- projects: add T661 Part 2 fields (DO NOT add company_id references)
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

-- ============================================================
-- NEW TABLES
-- ============================================================

-- 1. claim_contacts
CREATE TABLE claim_contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  contact_role  text NOT NULL CHECK (contact_role IN ('claimant','preparer','technical','financial')),
  name          text NOT NULL,
  title         text,
  email         text,
  phone         text,
  created_at    timestamptz DEFAULT now()
);

-- 2. project_narrative_sections
CREATE TABLE project_narrative_sections (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_key             text NOT NULL CHECK (section_key IN (
    'technical_uncertainty',
    'systematic_investigation',
    'advancement',
    'project_logistics',
    'evidence_retained'
  )),
  raw_text                text,
  ai_draft_text           text,
  approved_text           text,
  evidence_coverage_score numeric(3,2) DEFAULT 0.00,
  review_status           text DEFAULT 'draft' CHECK (review_status IN ('draft','ai_drafted','edited','approved','flagged')),
  updated_at              timestamptz DEFAULT now(),
  UNIQUE (project_id, section_key)
);

-- 3. project_people
CREATE TABLE project_people (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  person_type   text NOT NULL CHECK (person_type IN ('employee','contractor','subcontractor','consultant')),
  name          text NOT NULL,
  role          text,
  employer_type text CHECK (employer_type IN ('claimant','arms_length','non_arms_length')),
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- 4. project_evidence_links
CREATE TABLE project_evidence_links (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evidence_id           uuid NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
  narrative_section_key text,
  support_strength      text DEFAULT 'moderate' CHECK (support_strength IN ('strong','moderate','weak')),
  note                  text,
  created_at            timestamptz DEFAULT now(),
  UNIQUE (project_id, evidence_id, narrative_section_key)
);

-- 5. cost_imports (batch import headers)
CREATE TABLE cost_imports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  source_type   text NOT NULL CHECK (source_type IN ('payroll_csv','gl_export','ap_export','time_tracking','manual','github','jira','linear')),
  source_name   text,
  imported_at   timestamptz DEFAULT now(),
  status        text DEFAULT 'pending' CHECK (status IN ('pending','processing','complete','failed')),
  row_count     integer,
  metadata_json jsonb
);

-- 6. cost_line_items (raw imported rows — one per CSV/GL line)
CREATE TABLE cost_line_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_import_id   uuid NOT NULL REFERENCES cost_imports(id) ON DELETE CASCADE,
  claim_year_id    uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  line_date        date,
  vendor_or_employee text,
  description      text,
  gl_account       text,
  gross_amount     numeric(12,2),
  tax_amount       numeric(12,2),
  net_amount       numeric(12,2),
  currency         text DEFAULT 'CAD',
  raw_payload_json jsonb,
  created_at       timestamptz DEFAULT now()
);

-- 7. cost_line_classifications (AI or manual classification of each line)
CREATE TABLE cost_line_classifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_line_item_id uuid NOT NULL REFERENCES cost_line_items(id) ON DELETE CASCADE,
  likely_category   text NOT NULL CHECK (likely_category IN (
    'salary_wages',
    'specified_employee',
    'arms_length_contractor',
    'non_arms_length_contractor',
    'materials_consumables',
    'overhead',
    'proxy_interaction',
    'assistance_reimbursement',
    'excluded'
  )),
  confidence_score    numeric(3,2),
  related_party_flag  boolean DEFAULT false,
  excluded_flag       boolean DEFAULT false,
  rationale           text,
  classified_by       text DEFAULT 'manual' CHECK (classified_by IN ('manual','ai','rule')),
  created_at          timestamptz DEFAULT now(),
  UNIQUE (cost_line_item_id)  -- one classification per line item
);

-- 8. cost_line_project_splits (allocate each classified line to projects)
CREATE TABLE cost_line_project_splits (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_line_item_id  uuid NOT NULL REFERENCES cost_line_items(id) ON DELETE CASCADE,
  project_id         uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  allocation_percent numeric(5,2) NOT NULL,
  allocation_amount  numeric(12,2) NOT NULL,
  province_code      text DEFAULT 'AB',
  province_percent   numeric(5,2) DEFAULT 100.00,
  review_status      text DEFAULT 'pending' CHECK (review_status IN ('pending','confirmed','excluded','flagged')),
  created_at         timestamptz DEFAULT now(),
  UNIQUE (cost_line_item_id, project_id)
);

-- 9. assistance_items
CREATE TABLE assistance_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id     uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  assistance_type   text NOT NULL CHECK (assistance_type IN (
    'government_grant','government_assistance','non_government_assistance','contract_payment'
  )),
  source_name       text NOT NULL,
  amount            numeric(12,2) NOT NULL,
  linked_project_id uuid REFERENCES projects(id),
  treatment_notes   text,
  created_at        timestamptz DEFAULT now()
);

-- 10. federal_line_values (T661 + Schedule 31 line-level values)
CREATE TABLE federal_line_values (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  snapshot_id   uuid,  -- references claim_snapshots once created
  form_code     text NOT NULL DEFAULT 'T661',
  line_code     text NOT NULL,
  value         numeric(14,2),
  explanation   text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (claim_year_id, snapshot_id, form_code, line_code)
);

-- 11. provincial_line_values (Alberta Schedule 29 + project listing)
CREATE TABLE provincial_line_values (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  snapshot_id   uuid,
  province_code text NOT NULL DEFAULT 'AB',
  form_code     text NOT NULL,
  line_code     text NOT NULL,
  value         numeric(14,2),
  explanation   text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (claim_year_id, snapshot_id, province_code, form_code, line_code)
);

-- 12. provincial_project_breakdowns (per-project Alberta expenditure detail)
CREATE TABLE provincial_project_breakdowns (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id          uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  snapshot_id            uuid,
  project_id             uuid NOT NULL REFERENCES projects(id),
  province_code          text NOT NULL DEFAULT 'AB',
  alberta_expenditures   numeric(14,2),
  non_alberta_share      numeric(14,2),
  alberta_salaries       numeric(14,2),
  federal_proxy_in_ab    numeric(14,2),
  alberta_proxy_amount   numeric(14,2),
  created_at             timestamptz DEFAULT now()
);

-- 13. review_rules (declarative rule definitions)
CREATE TABLE review_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key    text NOT NULL UNIQUE,
  layer       text NOT NULL CHECK (layer IN ('form','eligibility','calculation')),
  severity    text NOT NULL CHECK (severity IN ('blocker','warning','info')),
  source_area text NOT NULL,
  message_template text NOT NULL,
  enabled     boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 14. review_issues (rule evaluation results)
CREATE TABLE review_issues (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id     uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  project_id        uuid REFERENCES projects(id),
  rule_key          text REFERENCES review_rules(rule_key),
  issue_type        text NOT NULL,
  severity          text NOT NULL CHECK (severity IN ('blocker','warning','info')),
  source_area       text NOT NULL,
  message           text NOT NULL,
  target_field      text,
  resolution_status text DEFAULT 'open' CHECK (resolution_status IN ('open','resolved','dismissed','deferred')),
  resolution_note   text,
  created_at        timestamptz DEFAULT now(),
  resolved_at       timestamptz
);

-- 15. claim_snapshots (full JSON snapshot of claim state, taken before exports)
CREATE TABLE claim_snapshots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  snapshot_type text NOT NULL CHECK (snapshot_type IN ('pre_export','pre_review','manual','amendment')),
  payload_json  jsonb NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- 16. export_bundles (versioned export packages)
CREATE TABLE export_bundles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  export_type   text NOT NULL CHECK (export_type IN (
    't661_package','schedule_31','alberta_package','narrative_pack',
    'evidence_appendix','cost_support','reviewer_memo','full_bundle'
  )),
  status        text DEFAULT 'generating' CHECK (status IN ('generating','ready','failed','superseded')),
  snapshot_id   uuid REFERENCES claim_snapshots(id),
  storage_key   text,
  file_size     bigint,
  generated_by  uuid REFERENCES profiles(id),
  created_at    timestamptz DEFAULT now()
);
```

### After creating all tables, add:

1. **RLS on every new table** using the existing helper functions (`user_belongs_to_company`, `is_execom_staff`, `claim_year_company`). Add the `claim_year_company` helper if it doesn't exist.
2. **Indexes** on every `claim_year_id`, `project_id`, `cost_import_id`, and `cost_line_item_id` FK column.
3. **Seed the review_rules table** with these initial rules:

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
  ('CALC.FED.PPA_MISMATCH', 'calculation', 'blocker', 'federal_calc', 'Prescribed proxy amount does not equal 55% of qualifying salaries'),
  ('CALC.FED.NEGATIVE_QE', 'calculation', 'blocker', 'federal_calc', 'Qualified expenditures are negative — check reductions'),
  ('CALC.FED.METHOD_INCONSISTENCY', 'calculation', 'blocker', 'federal_calc', 'Method election conflicts with expenditure structure'),
  ('CALC.PROV.AB_RECONCILE', 'calculation', 'warning', 'provincial_calc', 'Alberta expenditures exceed federal total'),
  ('CALC.PROV.AB_SPLIT_COMPLETE', 'calculation', 'blocker', 'provincial_calc', 'Project has costs but no Alberta expenditure breakdown');
```

---

## Deliverable 2: Service Modules

### Location: `lib/services/`

Create these 7 service files. Each service is a module of pure functions that take a Supabase client (server-side) and return typed results. Services only talk to the tables in their domain. No cross-service imports.

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
export async function approveNarrativeSection(supabase, sectionId: string)
// approveNarrativeSection copies ai_draft_text → approved_text and sets review_status = 'approved'
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
Domain: `federal_line_values`, `claim_snapshots`
```typescript
export async function runFederalCalculation(supabase, yearId: string)
// Reads all cost_line_project_splits + classifications + assistance for the year
// Applies method election logic (proxy vs traditional)
// Calculates T661 Part 3 lines
// Calculates Schedule 31 ITC lines
// Writes results to federal_line_values
// Returns the full line value set

export async function getFederalLines(supabase, yearId: string)
export async function getFederalWaterfall(supabase, yearId: string)
// Returns the step-by-step expenditure waterfall:
// total expenditures → exclusions → proxy/overhead → assistance → qualified → ITC
```

#### `lib/services/provincialCalcService.ts`
Domain: `provincial_line_values`, `provincial_project_breakdowns`
```typescript
export async function runProvincialCalculation(supabase, yearId: string, provinceCode: string)
// Derives from federal qualified expenditure base
// Applies Alberta-specific adjustments
// Writes provincial_line_values and provincial_project_breakdowns

export async function getProvincialLines(supabase, yearId: string, provinceCode: string)
export async function getProvincialProjectMatrix(supabase, yearId: string, provinceCode: string)
// Returns per-project breakdown: AB expenditures, non-AB share, AB salaries, proxy amounts
```

#### `lib/services/reviewService.ts`
Domain: `review_rules`, `review_issues`
```typescript
export async function runAllRules(supabase, yearId: string)
// 1. Load all active review_rules
// 2. Load full claim context (claim_year + projects + narratives + costs + evidence + calculations)
// 3. Evaluate each rule against the context
// 4. Delete existing open issues for this claim_year
// 5. Insert new review_issues
// 6. Return { blockers: N, warnings: N, info: N }

export async function getReviewIssues(supabase, yearId: string)
export async function resolveIssue(supabase, issueId: string, note: string)
export async function dismissIssue(supabase, issueId: string, note: string)
export async function hasBlockers(supabase, yearId: string): Promise<boolean>
```

#### `lib/services/exportService.ts`
Domain: `claim_snapshots`, `export_bundles`
```typescript
export async function createSnapshot(supabase, yearId: string, snapshotType: string)
// Reads ENTIRE claim state (company, contacts, projects, narratives, costs, calculations, evidence)
// Writes a claim_snapshot with the full JSON payload

export async function generateExportBundle(supabase, yearId: string, exportType: string)
// 1. Check hasBlockers() — refuse if true
// 2. Create a pre_export snapshot
// 3. Generate the requested document (T661 XLSX, PDF, narrative pack, etc.)
// 4. Upload to Supabase Storage
// 5. Create export_bundle record linking to snapshot
// 6. Return the bundle with download URL

export async function getExportBundles(supabase, yearId: string)
export async function getSnapshot(supabase, snapshotId: string)
```

### Type definitions

Create `lib/services/types.ts` with interfaces for every input/output type referenced above. Use the actual DB column names. Export all types.

---

## Deliverable 3: Route Skeleton

### Location: `app/(portal)/portal/`

Create these route pages. Each is a server component that:
1. Gets the session via `createServerSupabaseClient()`
2. Calls the relevant service function(s)
3. Renders a minimal shell showing the data exists

DO NOT build full UI components. Each page renders:
- The section label (uppercase, blue, 12px, tracking-wide — matching existing brand)
- The page title (Playfair Display serif)
- A `<pre>` block showing the JSON data (temporary, will be replaced with real UI later)

### Route tree

```
app/(portal)/portal/
├── dashboard/
│   └── page.tsx              ← EXISTING, keep as-is
├── claims/[yearId]/
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
│   └── provincial/route.ts   ← POST: provincialCalcService.runProvincialCalculation
├── review/[yearId]/
│   └── run-rules/route.ts    ← POST: reviewService.runAllRules
├── import/[yearId]/
│   └── route.ts              ← POST: costService.createImport + ingestLineItems
├── export/[yearId]/
│   └── route.ts              ← POST: exportService.generateExportBundle (EXISTING, update to use new service)
└── setup-company/
    └── route.ts              ← EXISTING, keep as-is
```

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
- Status labels use the existing `StatusBadge` component
- File paths for Supabase Storage: `{company_id}/{claim_year_id}/{uuid}_{sanitized_name}`

## Build order

1. Delete `supabase/migrations/003_sred_claim_os.sql` and `003_fix_onboarding_rls.sql` and `004_fix_companies_rls.sql`
2. Create `supabase/migrations/003_claim_os_schema.sql`
3. Create `lib/services/types.ts`
4. Create all 7 service modules
5. Create the claim year `layout.tsx` with sub-nav
6. Create all route pages
7. Create all API routes
8. Run `npm run build` and fix any type errors
