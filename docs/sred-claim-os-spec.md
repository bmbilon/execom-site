# SR&ED Claim OS — Build Specification

## 1. Next.js Route Map

### Route Group: `(marketing)/`
Existing marketing site. No changes.

| Route | Purpose |
|---|---|
| `/` | execom homepage |
| `/about` | About page |
| `/engage` | Engagement CTA page |
| `/contact` | Contact form |

### Route Group: `(portal)/portal/`
All portal routes. Protected by middleware (redirect to `/portal/login` if no session).

#### Auth Routes (public)
| Route | Purpose |
|---|---|
| `/portal/login` | Email/password sign in |
| `/portal/signup` | Create account |
| `/portal/forgot-password` | Password reset request |

#### Auth Callback (outside route groups)
| Route | Purpose |
|---|---|
| `/auth/callback` | Supabase email confirmation code exchange |

#### Dashboard
| Route | Purpose |
|---|---|
| `/portal/dashboard` | Main landing: company name, quick actions, claim year cards with stats |

#### Claim Year Routes
All nested under `/portal/claims/[yearId]/`.

| Route | Purpose | Phase |
|---|---|---|
| `/portal/claims/[yearId]/setup` | Claim setup: entity details, contacts, method election, jurisdiction, project shells | 1 |
| `/portal/claims/[yearId]/upload` | File upload zone (drag-and-drop), file grid with categories | 1 |
| `/portal/claims/[yearId]/projects` | Project roster: list all projects for this claim year | 1 |
| `/portal/claims/[yearId]/projects/[projectId]` | Project workspace: narrative composer, people, evidence, cost ledger | 2 |
| `/portal/claims/[yearId]/projects/[projectId]/narrative` | Guided narrative builder with 5-section composer | 2 |
| `/portal/claims/[yearId]/projects/[projectId]/people` | Personnel and contractors table | 2 |
| `/portal/claims/[yearId]/projects/[projectId]/evidence` | Evidence links with drag-and-drop assignment | 2 |
| `/portal/claims/[yearId]/projects/[projectId]/costs` | Project-level cost ledger | 3 |
| `/portal/claims/[yearId]/costs` | Claim-wide cost workspace: imports, unmapped, mapped, allocation matrix | 3 |
| `/portal/claims/[yearId]/costs/import` | Cost import wizard: upload CSV/GL/payroll, map columns, classify | 3 |
| `/portal/claims/[yearId]/costs/assistance` | Assistance and reimbursement tracking | 3 |
| `/portal/claims/[yearId]/federal` | Federal calculation workspace: expenditure waterfall, T661 validation, Sched 31 preview | 4 |
| `/portal/claims/[yearId]/provincial` | Provincial workspace: Alberta Sched 29 waterfall, project listing matrix | 4 |
| `/portal/claims/[yearId]/review` | Review workspace: blockers → warnings → recommendations, deep-links to fields | 5 |
| `/portal/claims/[yearId]/export` | Export workspace: generate forms, narrative pack, support pack, version history | 5 |

#### Screener
| Route | Purpose |
|---|---|
| `/portal/screener` | Eligibility screener (standalone, no claim year required) |

#### Settings
| Route | Purpose |
|---|---|
| `/portal/settings` | Company profile, team members, billing |

#### Admin (execom staff only)
| Route | Purpose |
|---|---|
| `/portal/admin/clients` | All companies list, impersonation |
| `/portal/admin/reviews/` | Pending review queue |
| `/portal/admin/reviews/[reviewId]` | Review workspace for a specific claim |

### API Routes
| Route | Method | Purpose | Phase |
|---|---|---|---|
| `/api/portal/setup-company` | POST | Create company + link profile | 1 |
| `/api/portal/export/[yearId]` | POST | Generate export bundle | 5 |
| `/api/portal/import/[yearId]` | POST | Process cost import file | 3 |
| `/api/portal/calculate/[yearId]/federal` | POST | Run federal calculation engine | 4 |
| `/api/portal/calculate/[yearId]/provincial` | POST | Run provincial calculation engine | 4 |
| `/api/portal/review/[yearId]/run-rules` | POST | Execute rules engine, generate review issues | 5 |
| `/api/portal/ai/narrative-rewrite` | POST | AI-assisted narrative section rewrite | 2 |
| `/api/portal/ai/classify-costs` | POST | AI-assisted cost classification | 3 |
| `/api/portal/ai/evidence-suggest` | POST | AI-assisted evidence-to-project matching | 2 |

### Shared Layout Structure
```
app/
├── (marketing)/
│   └── layout.tsx          ← dark nav, footer, execom branding
├── (portal)/portal/
│   └── layout.tsx          ← sidebar nav, breadcrumbs, no footer
│       └── claims/[yearId]/
│           └── layout.tsx  ← claim sub-nav tabs
└── auth/callback/route.ts
```

### Portal Sidebar Navigation (left-nav)
```
Dashboard
─────────
Claim Years
  └─ [Active Year]
      ├─ Setup
      ├─ Upload
      ├─ Projects
      ├─ Costs
      ├─ Federal
      ├─ Provincial
      ├─ Review
      └─ Export
─────────
Screener
Settings
```

---

## 2. Field-Level Mapping: UI → T661 / Schedule 31 / Alberta

### T661 Part 1 — Claimant Information

| UI Field | DB Column | T661 Line |
|---|---|---|
| Legal name | `companies.legal_name` | Line 010 |
| Operating name | `companies.operating_name` | Line 012 |
| Business number | `companies.bn` | Line 015 |
| Tax year start | `claim_years.tax_year_start` | Line 020 |
| Tax year end | `claim_years.tax_year_end` | Line 022 |
| Province | `companies.province` | Line 030 |
| Contact name | `claim_contacts.name` (role=claimant) | Line 040 |
| Contact title | `claim_contacts.title` (role=claimant) | Line 042 |
| Contact phone | `claim_contacts.phone` (role=claimant) | Line 044 |
| Contact email | `claim_contacts.email` (role=claimant) | Line 046 |
| Preparer name | `claim_contacts.name` (role=preparer) | Line 050 |
| Preparer phone | `claim_contacts.phone` (role=preparer) | Line 052 |
| Number of projects | count of `projects` for claim year | Line 060 |
| Associated corporation? | `claim_years.associated_corp_flag` | Line 070 |
| Method election | `claim_years.method_election` | Line 080 |

### T661 Part 2 — Project Information (per project)

| UI Field | DB Column | T661 Line |
|---|---|---|
| Project title | `projects.name` | Line 200 |
| Project code | `projects.code` | Line 202 |
| Field of science/technology | `projects.field_code` | Line 204 |
| Start date | `projects.start_date` | Line 210 |
| Expected completion date | `projects.end_date` | Line 212 |
| Continuation from prior year? | `projects.continuation_flag` | Line 214 |
| Project type | `projects.project_type` | Line 216 |
| Collaboration/subcontractor? | `projects.collaboration_flag` | Line 218 |

### T661 Part 2 — Project Description (narrative sections)

| UI Section | DB Table/Key | T661 Line |
|---|---|---|
| Scientific/technological uncertainties | `project_narrative_sections` key=`technical_uncertainty` | Line 242 |
| Work performed (systematic investigation) | `project_narrative_sections` key=`systematic_investigation` | Line 244 |
| Advancements achieved | `project_narrative_sections` key=`advancement` | Line 246 |
| Was employee involved in prep? | UI checkbox per project | Line 253 |
| Employee name who prepared | `project_people` where role matches | Line 254 |

### T661 Part 3 — Expenditures (Sections A/B/C)

#### Section A — Traditional Method or Section B — Proxy Method

| UI Field | DB Source | T661 Line |
|---|---|---|
| Salaries & wages (directly engaged) | sum of `costs` where cost_type='salary' | Line 300 |
| Specified employee salaries cap | calculated | Line 302 |
| Arm's-length contractor payments | sum of `costs` where cost_type='subcontractor' AND related_party_flag=false | Line 310 |
| Non-arm's-length contractor payments | sum of `costs` where cost_type='subcontractor' AND related_party_flag=true | Line 312 |
| Materials consumed/transformed | sum of `costs` where cost_type='materials' | Line 320 |
| Overhead and other expenditures (traditional) | sum of `costs` where cost_type='overhead' | Line 330 |
| Prescribed proxy amount (PPA) | 55% of Line 300 salary amount | Line 340 (proxy) |
| Third-party payments > $30K (arm's length) | `costs` where amount > 30000 | Line 345 |
| Total SR&ED expenditures | sum of all included costs | Line 360 |

#### Section C — Reductions

| UI Field | DB Source | T661 Line |
|---|---|---|
| Government assistance | sum of `assistance_items` where type='government_assistance' | Line 370 |
| Non-government assistance | sum of `assistance_items` where type='non_government_assistance' | Line 372 |
| Contract payments received | sum of `assistance_items` where type='contract_payment' | Line 374 |
| Total reductions | sum of Lines 370-374 | Line 380 |
| Net SR&ED expenditures | Line 360 minus Line 380 | Line 400 |

### T661 Part 4 — Qualified SR&ED Expenditures (for ITC)

| UI Field | DB Source | T661 Line |
|---|---|---|
| Qualified expenditures pool | calculated from Part 3 | Line 430 |

### Schedule 31 — Investment Tax Credit (Corporations)

| UI Field | DB Source | Sched 31 Line |
|---|---|---|
| SR&ED qualified expenditures | from T661 Line 430 | Line 100 |
| ITC rate (CCPC 35% / other 15%) | calculated | Line 110 |
| Current year ITC earned | Line 100 × rate | Line 120 |
| Refundable portion | calculated based on corp type | Line 140 |
| ITC applied to tax payable | calculated | Line 160 |
| ITC refund | Line 140 result | Line 180 |

### Alberta Schedule 29 — Innovation Employment Grant (IEG)

| UI Field | DB Source | AT29 Line |
|---|---|---|
| Alberta qualified expenditures | from `provincial_project_breakdowns.alberta_expenditures` | Line 100 |
| Non-Alberta share deduction | from `provincial_project_breakdowns.non_alberta_share` | Line 102 |
| Net Alberta expenditures | Line 100 minus Line 102 | Line 105 |
| Base level spending (year -1) | entered or carried forward | Line 114 |
| Base level spending (year -2) | entered or carried forward | Line 116 |
| Average base level spending | average of Lines 114, 116 | Line 118 |
| Incremental expenditures | Line 105 minus Line 118 | Line 120 |
| IEG rate (8%) | fixed | Line 125 |
| IEG amount | Line 120 × 8% | Line 130 |

### Alberta Project Listing (per project)

| UI Field | DB Source | AT29 Column |
|---|---|---|
| Project title | `projects.name` | Col A |
| Field code | `projects.field_code` | Col B |
| Alberta-incurred qualified expenditures | `provincial_project_breakdowns.alberta_expenditures` | Col C |
| Non-Alberta share | `provincial_project_breakdowns.non_alberta_share` | Col D |
| Alberta salaries | `provincial_project_breakdowns.alberta_salaries` | Col E |
| Federal proxy included in AB amount | `provincial_project_breakdowns.federal_proxy_in_ab` | Col F |
| Alberta proxy by project | `provincial_project_breakdowns.alberta_proxy_amount` | Col G |

---

## 3. Rules Engine Specification

### Architecture

The rules engine runs server-side via `/api/portal/review/[yearId]/run-rules`.
It evaluates three layers and writes results to `review_issues`.
Each rule has a unique `rule_key` for tracking resolutions across runs.

```typescript
interface Rule {
  key: string;               // unique identifier e.g. "FORM.T661.MISSING_PROJECT"
  layer: 'form' | 'eligibility' | 'calculation';
  severity: 'blocker' | 'warning' | 'info';
  source_area: string;       // e.g. "t661_part1", "project_narrative", "cost_allocation"
  evaluate: (ctx: ClaimContext) => RuleResult[];
}

interface RuleResult {
  passed: boolean;
  message: string;
  project_id?: string;
  target_field?: string;     // deep-link target
}

interface ClaimContext {
  claimYear: ClaimYear;
  company: Company;
  contacts: ClaimContact[];
  projects: ProjectWithNarratives[];
  costs: CostWithSplits[];
  evidence: EvidenceWithLinks[];
  assistance: AssistanceItem[];
  federalLines: FederalLineValue[];
  provincialLines: ProvincialLineValue[];
}
```

### Layer A — Form Rules

These check that the structure required by the actual CRA forms exists.

| Rule Key | Severity | Check | Message |
|---|---|---|---|
| `FORM.CLAIM.NO_PROJECTS` | blocker | claim year has ≥ 1 project | "Claim must have at least one project" |
| `FORM.CLAIM.NO_CONTACTS` | blocker | claimant and preparer contacts exist | "Claimant and preparer contact information required" |
| `FORM.CLAIM.NO_METHOD` | blocker | method_election is set | "Method election (proxy or traditional) must be selected" |
| `FORM.CLAIM.NO_TAX_YEAR` | blocker | tax_year_start and tax_year_end set | "Tax year start and end dates required" |
| `FORM.CLAIM.NO_BN` | blocker | company BN is not null | "Business number is required for filing" |
| `FORM.PROJECT.MISSING_TITLE` | blocker | project.name is not empty | "Project title is required" |
| `FORM.PROJECT.MISSING_FIELD_CODE` | warning | project.field_code is set | "Field of science/technology code should be assigned" |
| `FORM.PROJECT.MISSING_DATES` | warning | start_date and end_date set | "Project start and completion dates should be set" |
| `FORM.PROJECT.NO_NARRATIVES` | blocker | all 3 required narrative sections exist and have approved_text | "Project must have approved narratives for uncertainty, investigation, and advancement" |
| `FORM.PROJECT.INCOMPLETE_NARRATIVE` | warning | narrative section has text but not approved | "Narrative section '{section}' has draft text but is not approved" |
| `FORM.CLAIM.PROJECT_COUNT_MISMATCH` | warning | count of projects matches header count | "Project count does not match claim header" |
| `FORM.CLAIM.PROVINCE_NOT_ENABLED` | info | province programs match actual provincial data | "Provincial program data exists but jurisdiction not enabled" |

### Layer B — Eligibility / Permissibility Rules

These check whether the content appears claim-supportive and CRA-defensible.

| Rule Key | Severity | Check | Message |
|---|---|---|---|
| `ELIG.NARRATIVE.COMMERCIAL_LANGUAGE` | warning | technical_uncertainty section does not contain commercial/sales terms | "Technical uncertainty section contains commercial language: '{matched_phrase}'" |
| `ELIG.NARRATIVE.NO_EXPERIMENTS` | warning | systematic_investigation contains chronology markers (dates, versions, iterations) | "Systematic investigation lacks experimental chronology" |
| `ELIG.NARRATIVE.NO_FAILURE` | info | systematic_investigation mentions failures, pivots, or negative results | "Investigation narrative does not describe what failed or why" |
| `ELIG.NARRATIVE.CONCLUSORY` | warning | text does not contain unsupported claims like "we developed" without evidence | "Narrative contains conclusory statements without supporting detail" |
| `ELIG.NARRATIVE.NO_EVIDENCE` | warning | evidence_coverage_score > 0 for required sections | "Narrative section '{section}' has no evidence links" |
| `ELIG.COST.NO_PROJECT` | warning | every non-excluded cost has a project_id or cost_project_split | "Cost '{description}' is not assigned to any project" |
| `ELIG.COST.NO_RATIONALE` | info | classified costs have classification_rationale | "Cost classification for '{description}' has no documented rationale" |
| `ELIG.COST.RELATED_PARTY` | warning | related_party_flag costs have treatment notes | "Related party cost '{vendor}' requires treatment documentation" |
| `ELIG.COST.LARGE_CONTRACTOR` | info | arm's-length contracts > $30K are documented for T661 Line 345 | "Contractor payment to '{vendor}' exceeds $30,000 — ensure listed on T661" |
| `ELIG.EVIDENCE.NO_DATE` | info | evidence items have evidence_date | "Evidence '{title}' has no date — may weaken chronology support" |
| `ELIG.EVIDENCE.ORPHANED` | info | evidence items are linked to at least one project | "Evidence '{title}' is not linked to any project" |
| `ELIG.ASSISTANCE.MISSING` | warning | if grants/assistance exist in cost data but no assistance_items recorded | "Possible government assistance detected in costs but not recorded in reductions" |

### Layer C — Calculation Rules

These check math and roll-forward consistency.

| Rule Key | Severity | Check | Message |
|---|---|---|---|
| `CALC.FED.PROJECT_SUM` | blocker | sum of project-level costs = company-level total on T661 | "Project cost totals (${project_sum}) do not match claim total (${claim_total})" |
| `CALC.FED.PPA_MISMATCH` | blocker | if proxy method: PPA = 55% × salary line | "Prescribed proxy amount does not equal 55% of qualifying salaries" |
| `CALC.FED.ASSISTANCE_DOUBLE` | warning | assistance amounts not counted against multiple categories | "Assistance from '{source}' appears to reduce expenditures twice" |
| `CALC.FED.NEGATIVE_QE` | blocker | qualified expenditures ≥ 0 | "Qualified expenditures are negative — check assistance and reductions" |
| `CALC.FED.METHOD_INCONSISTENCY` | blocker | if proxy: no overhead costs exist; if traditional: overhead costs required | "Method election is '{method}' but expenditure structure suggests the other method" |
| `CALC.FED.ITC_RATE` | warning | ITC rate matches corporation type (CCPC 35% vs 15%) | "ITC rate may not match corporation type" |
| `CALC.PROV.AB_RECONCILE` | warning | Alberta expenditures ≤ federal qualified expenditures | "Alberta expenditures exceed federal total — check province allocation" |
| `CALC.PROV.AB_SPLIT_COMPLETE` | blocker | all projects with costs have provincial_project_breakdowns | "Project '{name}' has costs but no Alberta expenditure breakdown" |
| `CALC.PROV.AB_PROXY_CONSISTENCY` | warning | Alberta proxy treatment matches federal proxy logic | "Alberta proxy amount is inconsistent with federal proxy calculation" |

### Export Blocking

The export endpoint checks:
```typescript
const blockers = reviewIssues.filter(i => i.severity === 'blocker' && i.resolution_status === 'open');
if (blockers.length > 0) {
  return { canExport: false, blockers };
}
```

No export bundle is generated when open blockers exist. Warnings and info-level issues are shown but do not block.

### Rule Execution Flow

1. API receives POST to `/api/portal/review/[yearId]/run-rules`
2. Load full `ClaimContext` from DB (single query batch)
3. Delete all `review_issues` for this claim_year where `resolution_status = 'open'`
4. Run all rules in order: form → eligibility → calculation
5. Insert new `review_issues` rows
6. Return summary: `{ blockers: N, warnings: N, info: N }`

### Keyword Detection Lists (for eligibility narrative rules)

**Commercial language patterns** (flag in technical_uncertainty):
```
market share, revenue, profit, customer acquisition, competitive advantage,
sales growth, business opportunity, market demand, ROI, cost savings,
go-to-market, product launch, user adoption, monetize, commercialize
```

**Conclusory patterns** (flag in any narrative):
```
we developed, we created, we built, we designed, we implemented
```
(when not followed by "because", "by", "through", "after", or experimental detail)

**Chronology markers** (expected in systematic_investigation):
```
v[0-9], sprint, iteration, phase, attempt, trial, week of, Q[1-4],
January through December, [0-9]{4}-[0-9]{2}, tested, measured,
observed, failed, pivoted, revised, compared
```

---

## 4. Build Phase Mapping

| Phase | Routes to Build | Tables Used | Rules Active |
|---|---|---|---|
| 1 - Foundations | dashboard, setup, upload, projects list | companies, profiles, claim_years, claim_contacts, files, projects | FORM.CLAIM.* |
| 2 - Project Authoring | project workspace, narrative, people, evidence | project_narrative_sections, project_people, project_evidence_links, evidence | ELIG.NARRATIVE.*, ELIG.EVIDENCE.* |
| 3 - Cost Layer | costs workspace, import, assistance, project costs | costs, cost_imports, cost_project_splits, assistance_items | ELIG.COST.*, ELIG.ASSISTANCE.* |
| 4 - Calculation | federal workspace, provincial workspace | federal_claim_snapshots, federal_line_values, federal_calculation_steps, provincial_* | CALC.FED.*, CALC.PROV.* |
| 5 - Review + Export | review workspace, export workspace | review_issues, claim_snapshots, export_bundles | All rules, export blocking |
