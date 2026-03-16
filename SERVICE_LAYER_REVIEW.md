# Service Layer Code Review – execom-site v3 Build

**Date:** March 16, 2026
**Scope:** 8 service files + 3 key routes
**Migration Context:** 001–005 migrations analyzed

---

## Executive Summary

The service layer is well-structured with clear separation of concerns and proper orchestration boundaries. However, there are **2 critical schema mismatches** and **multiple missing calculation features** that must be addressed before deployment.

---

## 1. SCHEMA ALIGNMENT

### 1.1 Critical Mismatch: `project_people` vs `project_persons`

**Status:** CRITICAL — Blocks any runtime execution

**Issue:**
- **Migration 003** creates table: `project_people`
- **Migration 005** alters: `project_people`
- **Service code (projectService.ts)** queries: `project_persons` (lines 158, 173)
- **Service types (types.ts)** defines: `ProjectPerson` interface (line 66)

**Evidence:**
```
Migration 003, line 107:
  CREATE TABLE IF NOT EXISTS project_people (...)

projectService.ts, line 159:
  .from('project_persons')  ← WRONG TABLE NAME
```

**Fix Required:**
- Either rename migration table to `project_persons` OR
- Update all service queries from `project_persons` → `project_people`

**Severity:** CRITICAL – Pre-deployment blocker
**When to fix:** Before any testing or scaffolding

---

### 1.2 Table Column Name Alignment

All other table names and column names are correctly aligned:
- ✅ `cost_line_items` — migration 003, services correct
- ✅ `cost_line_classifications` — migration 005, services correct
- ✅ `cost_line_project_splits` — migration 005, services correct
- ✅ `project_narrative_sections` — migration 003, services correct
- ✅ `claim_contacts`, `projects`, `costs`, `assistance_items`, etc.

**Specific column checks:**
- `specified_employee_flag`, `specified_employee_start_date`, `specified_employee_end_date` — defined in types.ts, added to migration 005
- `capital_property` category exists in migration 005 cost classifications (line 114)
- `province_code` exists in both `cost_line_project_splits` and `provincial_line_values`

**Status:** ✅ ALIGNED (except project_people issue above)

---

## 2. FEDERAL CALC LOGIC (`federalCalcService.ts`)

### 2.1 Per-Project Assistance Reduction

**Status:** ❌ NOT IMPLEMENTED (Missing feature)

**Issue:**
- Current implementation (lines 172–181) deducts assistance at **claim-level aggregate only**.
- Specification calls for **per-project assistance reduction** before ITC calculation per project.

**Code:**
```typescript
// Line 172–181: Fetches ALL assistance for claim_year
const totalAssistance = (assistRows ?? []).reduce(
  (sum: number, a: { amount: number }) => sum + a.amount,
  0
)

// Deducts from total claim expenditures (line 202–205)
const qualifiedExpenditures = Math.max(
  totalExpenditures - totalAssistance,
  0
)
```

**Missing:**
- Should allocate assistance per project (via `linked_project_id`)
- Should calculate project-level qualified expenditures
- Should apply rate limits per project

**Severity:** CRITICAL — Calculation accuracy
**Fix Timeline:** Post-scaffold (requires three-pass orchestration)

---

### 2.2 Specified Employee Cap (5x YMPE)

**Status:** ❌ NOT IMPLEMENTED (Flagged in TODO)

**Evidence (line 390–392):**
```typescript
// TODO: Add calculation-layer rules for:
//   - specified employee salary cap check (5x YMPE)
//   - arms-length contract 80% rate verification
```

**Issue:**
- Service stores `specified_employee_flag` in database (types.ts, line 73)
- No logic in `federalCalcService` to:
  - Cap specified employee salary at 5x YMPE
  - Apply formula: `cap = YMPE * year * 5`
  - Reduce excess from qualified expenditures

**Missing Code:**
```typescript
// Should exist but doesn't:
const YMPE_2024 = 65500  // Configurable
const specifiedEmployeeCap = YMPE_2024 * 5
// Filter project_persons with specified_employee_flag
// Apply cap per person, year range
```

**Severity:** MEDIUM — Review layer can catch, but calculation incomplete
**Fix Timeline:** Post-scaffold (needs configuration constants)

---

### 2.3 80% Contractor Rules

**Status:** ✅ PARTIALLY IMPLEMENTED

**Evidence (lines 37–41):**
```typescript
const ARMS_LENGTH_CONTRACT_RATE = 0.80
const NON_ARMS_LENGTH_CONTRACT_RATE = 0.80
```

**Implementation (lines 192–193):**
```typescript
totals.contractor_arms * ARMS_LENGTH_CONTRACT_RATE +
totals.contractor_non_arms * NON_ARMS_LENGTH_CONTRACT_RATE +
```

**Assessment:**
- ✅ Correct rates applied in waterfall
- ⚠️ Classification logic relies on `cost_line_classifications.related_party_flag` (fetched at line 86–92)
- ⚠️ No explicit "arms-length vs non-arms-length" category validation
  - Migration 005 allows: `arms_length_contractor`, `non_arms_length_contractor` (line 112–113)
  - Service code maps via `related_party_flag` on lines 135–139

**Minor Risk:** Category naming convention differs between schema and code. Service assumes:
```
category == 'subcontractor' OR 'contractor_arms'
if (related_party_flag) → non-arms
else → arms_length
```

But migration expects: `'arms_length_contractor'` or `'non_arms_length_contractor'` explicitly.

**Severity:** LOW — Functionally correct but category mismatch creates confusion
**Fix Timeline:** Post-scaffold (documentation update)

---

### 2.4 Proxy vs Traditional Branching

**Status:** ✅ IMPLEMENTED

**Evidence (lines 154–161, 184–187):**
```typescript
export interface FederalCalcOptions {
  method?: 'proxy' | 'traditional'
}

const proxyOrOverhead =
  method === 'proxy'
    ? totals.salary * PROXY_RATE
    : totals.overhead
```

✅ Correct branching logic
✅ Defaults to `'proxy'` (line 168)

---

### 2.5 Post-December 2024 Capital Property Handling

**Status:** ❌ NOT IMPLEMENTED

**Issue:**
- Migration 005 (line 114) includes `'capital_property'` as a valid classification.
- No logic in `federalCalcService` to handle capital property:
  - Pre-Dec 2024: 55% inclusion
  - Post-Dec 2024: 100% inclusion
  - Effective date: 2024-12-16 (matches `EXPENDITURE_LIMIT_PRE_2024` cutoff)

**Current Code (lines 140–145):**
```typescript
} else if (cat === 'materials') {
  totals.materials += amount
} else if (cat === 'overhead') {
  totals.overhead += amount
} else {
  totals.other += amount  // ← capital_property falls here as 'other'
}
```

**Missing:**
- Detect `capital_property` category
- Apply date-based rate: `capital_property_amount * (start >= cutoff ? 1.0 : 0.55)`

**Severity:** CRITICAL — Post-Dec 2024 claims will miscalculate
**Fix Timeline:** Pre-scaffold (legislative requirement)

---

### 2.6 $6M / $3M Enhanced Rate Limit by Effective Date

**Status:** ✅ IMPLEMENTED

**Evidence (lines 31–35, 45–49):**
```typescript
const EXPENDITURE_LIMIT_PRE_2024 = 3_000_000
const EXPENDITURE_LIMIT_POST_2024 = 6_000_000

function expenditureLimitForYear(taxYearStart: string): number {
  const cutoff = new Date('2024-12-16')
  const start = new Date(taxYearStart)
  return start >= cutoff ? EXPENDITURE_LIMIT_POST_2024 : EXPENDITURE_LIMIT_PRE_2024
}
```

✅ Correct implementation
✅ Applied in ITC calculation (line 208)

---

### 2.7 Configurable PPA Rate (not hardcoded 0.55)

**Status:** ✅ CONFIGURABLE

**Evidence (line 23):**
```typescript
const PROXY_RATE = 0.55  // Configurable constant at top of file
```

✅ Easy to update when regulation changes
✅ Clear comment referencing ITA Reg. 2900(4)

---

## 3. PROVINCIAL CALC LOGIC (`provincialCalcService.ts`)

### 3.1 Three-Pass Sequencing Awareness

**Status:** ❌ NOT IMPLEMENTED

**Issue:**
- Service calculates provincial credits independently (line 78–168).
- No awareness of three-pass orchestration:
  1. **Provisional federal** → generates federal qualified expenditures
  2. **Provincial** → uses federal result as base (line 141)
  3. **Final federal** → adjusted for provincial impacts (NOT implemented anywhere)

**Current Logic (lines 132–141):**
```typescript
let qualifiedBase: number
if (config.usesFederalBase) {
  const provinceProportion = totalAmount / totalAllAllocated
  qualifiedBase = federalQualifiedExpenditures * provinceProportion
}
```

**Missing:**
- Service receives `federalQualifiedExpenditures` as parameter (line 81) ✅
- But route `/api/portal/calculate/[yearId]/full/route.ts` (lines 5–8) has TODO comment:
  ```
  // TODO: Implement full orchestration:
  // 1. Provisional federal calculation
  // 2. Provincial (IEG) calculation using provisional federal amounts
  // 3. Final federal calculation incorporating provincial results
  ```

**Critical Gap:** The route that orchestrates the three-pass is **unimplemented**. Services are isolated; sequencing must happen in route handler.

**Severity:** CRITICAL — Core claim calculation workflow
**Fix Timeline:** Post-scaffold (requires route implementation)

---

### 3.2 IEG Two-Tier Structure (8% base + 12% incremental)

**Status:** ❌ PARTIALLY IMPLEMENTED

**Current Code (lines 29–35):**
```typescript
AB: {
  name: 'Alberta',
  creditRate: 0.08,  // Alberta IEG base rate (8% for R&D)
  expenditureCap: null,
  usesFederalBase: true,
  formCode: 'AT1-SCH29',
}
```

**Issue:**
- Only base rate (8%) is implemented.
- IEG specification includes **two-tier structure**:
  - Base tier: 8% on qualified expenditures
  - Incremental tier: 12% on new/incremental expenditures (e.g., above prior-year baseline)
- Service has no logic to identify incremental vs baseline expenditures.

**Missing:**
```typescript
// Should exist but doesn't:
const baseYear2023Expenditures = fetchPriorYearExpenditure(...)
const incrementalExpenditure = Math.max(
  qualifiedExpenditure - baseYear2023Expenditures,
  0
)
const creditAmount =
  (baselineExpenditure * 0.08) +
  (incrementalExpenditure * 0.12)
```

**Severity:** MEDIUM — Affects Alberta claims only; reviewable but incorrect calc
**Fix Timeline:** Post-scaffold (requires prior-year data fetching)

---

### 3.3 $4M Cap

**Status:** ✅ IMPLEMENTED (for Ontario only)

**Evidence (line 40):**
```typescript
ON: {
  creditRate: 0.08,
  expenditureCap: 3_000_000,  // OITC expenditure limit
}
```

⚠️ **Note:** Only Ontario has explicit cap. Alberta shows `expenditureCap: null` (line 33).
AB IEG spec calls for ~$4M cap but it's not implemented.

**Severity:** LOW → MEDIUM (AB claims will over-calculate)
**Fix Timeline:** Post-scaffold (configuration update)

---

### 3.4 Base-Year Averaging

**Status:** ❌ NOT IMPLEMENTED

**Issue:**
- No logic in service to fetch or average prior-year expenditures.
- Alberta IEG uses prior-year baseline for incremental tier (related to section 3.2 above).
- Ontario OITC may have similar base-year adjustments.

**Severity:** MEDIUM — Affects multi-year claims
**Fix Timeline:** Post-scaffold

---

### 3.5 Taxable Capital Phase-Out

**Status:** ❌ NOT IMPLEMENTED

**Issue:**
- No logic to apply taxable capital phase-out (typically applies to small business exemptions).
- Migration 005 adds `taxable_capital_eoy` column to `claim_years` (line 52) but service doesn't use it.

**Severity:** LOW — May not apply to all provinces; needs spec clarification
**Fix Timeline:** Post-scaffold

---

### 3.6 Province-Neutral Column Names

**Status:** ✅ IMPLEMENTED

**Evidence:**
- Uses `province_code` throughout (lines 96, 107–110, 150, 182, etc.)
- Uses generic `provincial_line_values` table with `province_code` column (migration 003, line 279)
- Avoids Alberta-specific names like `alberta_expenditures`

**Assessment:**
- ✅ Correct design for multi-province expansion
- ✅ No hardcoded provincial assumptions in schema

**Note:** Migration 003 (lines 294–297) has OLD Alberta-specific columns in `provincial_project_breakdowns`:
```sql
alberta_expenditures   numeric(14,2),
non_alberta_share      numeric(12,2),
alberta_salaries       numeric(14,2),
```
These are legacy and not used by the service layer (not queried anywhere).

---

## 4. REVIEW SERVICE (`reviewService.ts`)

### 4.1 All 30+ Seeded Rules

**Status:** ⚠️ PARTIALLY VERIFIED

**Rules Seeded (Migration 005, lines 192–222):**
Count: **30 rules** across three layers:
- Form: 10 rules
- Eligibility: 13 rules
- Calculation: 7 rules

**Service Implements (lines 104–397):**
- ✅ Form rules: 4 rules hardcoded
  - `no_projects` (line 133)
  - `no_claimant_contact` (line 141)
  - `no_preparer_contact` (line 156)
  - `no_method_election` (line 171)
- ❌ Missing: 6 form rules from seeded list (e.g., `no_tax_year`, `no_bn`, `missing_field_code`)
- ✅ Eligibility rules: 5 rules hardcoded
  - `missing_narrative` (line 206)
  - `commercial_language` (line 230)
  - `weak_systematic` (line 255)
  - `weak_uncertainty` (line 283)
  - `no_evidence_links` (line 311)
- ❌ Missing: 8+ seeded eligibility rules (e.g., `advancement_missing`, `continuation_no_differentiation`)
- ✅ Calculation rules: 2 rules hardcoded
  - `no_costs` (line 342)
  - `unclassified_costs` (line 360)
- ❌ Missing: 5 calculation rules from seeded list (e.g., `ppa_mismatch`, `negative_qe`)

**Gap:** Service only implements ~11 of 30 seeded rules. Others defined in DB but never executed by `runAllRules()`.

**Severity:** MEDIUM — Rules won't fire; however, database layer ensures they exist for future implementation
**Fix Timeline:** Post-scaffold (phased rule implementation)

---

### 4.2 Narrative Linting (Word Limits, Commercial Language, Evidence Coverage)

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Commercial Language (lines 230–251):**
- ✅ Scans approved/draft narrative text against `COMMERCIAL_KEYWORDS` list (lines 23–34)
- ✅ Flags rule: `commercial_language`
- Confidence: **adequate**

**Word Limits:**
- ❌ NOT IMPLEMENTED
- TODO rule in seed data exists: `FORM.NARRATIVE.WORD_LIMIT_EXCEEDED` (migration 005, line 220)
- Service has no word-count check

**Evidence Coverage:**
- ⚠️ **Exists in schema** but **service ignores it**
  - Types define `evidence_coverage_score` in `NarrativeSection` (types.ts, line 61)
  - Migration 003 adds this column (line 96)
  - Service doesn't read or validate against threshold
  - Seeded rule references it: `LOW_EVIDENCE_COVERAGE` (migration 005, line 221)

**Severity:** MEDIUM — Partial implementation; word limits and evidence coverage scores missing
**Fix Timeline:** Post-scaffold

---

### 4.3 Deadline Checks

**Status:** ❌ NOT IMPLEMENTED

**Seeded Rules (migration 005, lines 217–218):**
```
FORM.CLAIM.DEADLINE_WARNING (90 days)
FORM.CLAIM.DEADLINE_CRITICAL (30 days)
```

**Missing:**
- Service doesn't check `filing_deadline` from `claim_years` table
- No date comparison logic

**Severity:** LOW — Informational feature; doesn't block calculation
**Fix Timeline:** Post-scaffold

---

### 4.4 Wholesale Replace of Open Issues

**Status:** ✅ IMPLEMENTED

**Evidence (lines 91–98):**
```typescript
// Clear existing open issues for re-evaluation
const { error: delErr } = await sb
  .from('review_issues')
  .delete()
  .eq('claim_year_id', claimYearId)
  .eq('resolution_status', 'open')
```

✅ Correctly clears only `'open'` issues; preserves resolved/dismissed
✅ Replaces with fresh evaluation on each `runAllRules()` call

---

## 5. EXPORT SERVICE (`exportService.ts`)

### 5.1 Reuses Existing Helpers

**Status:** ✅ IMPLEMENTED

**Evidence (lines 7–8):**
```typescript
import { generateXlsx } from '@/lib/portal/xlsx-export'
import { generatePdf } from '@/lib/portal/pdf-export'
```

✅ Correctly delegates to portal layer helpers
✅ Handles three export types: `xlsx`, `pdf`, `json` (lines 171–200)

**Implementation Quality:**
- ✅ Creates snapshots before export (lines 158–164)
- ✅ Uploads to Supabase Storage with signed URLs (lines 204–214)
- ✅ Marks bundles as superseded when new version created (lines 291–306)

---

## 6. DOMAIN BOUNDARY RULE

**Status:** ✅ MAINTAINED

**Check:** Do services import other services directly?

**Result:** No direct service-to-service imports found.
```bash
grep -r "import.*from.*Service" /lib/services/
→ No matches
```

**Orchestration Pattern:** Services are imported only by:
- API routes (in `app/api/`)
- Server components (in `app/`)

✅ Correct separation of concerns

---

## 7. TYPE SAFETY (`types.ts`)

### 7.1 All Input/Output Interfaces Defined

**Status:** ✅ MOSTLY COMPLETE

**Defined:**
- ✅ Row types (ClaimContact, NarrativeSection, ProjectPerson, etc.)
- ✅ Input types (CreateClaimYearInput, ProjectPersonInput, etc.)
- ✅ Summary types (ClaimSummary, CostSummary, FederalWaterfall)
- ✅ Service-specific types (FederalLineValue, ReviewRule, ReviewIssue)

**Missing:**
- ❌ `FederalCalcResult` — service defines (federalCalcService.ts, implied by FederalWaterfall) but not explicitly exported from types.ts
- ❌ `ProvincialCalcResult` — service defines inline (provincialCalcService.ts, line 63) but should be in types.ts for reuse

**Severity:** LOW — Functional but inconsistent
**Fix Timeline:** Pre-scaffold (move types to types.ts)

---

## 8. OTHER ISSUES & DEVIATIONS

### 8.1 Service Isolation of Calculation Logic

**Issue:** Calculation services fetch costs directly from database instead of accepting them as parameters.

**Example (federalCalcService.ts, lines 61–92):**
```typescript
async function fetchCategoryTotals(
  sb: SupabaseClient,
  claimYearId: string
): Promise<CategoryTotals> {
  const { data: items } = await sb
    .from('cost_line_items')
    .select('...')
    .eq('claim_year_id', claimYearId)
  // Loads everything, classifies, sums
}
```

**Concern:** Makes testing harder; tight coupling to database schema.

**Better Pattern:** Accept pre-aggregated cost totals as function parameter:
```typescript
async function calculateFederalWaterfall(
  categoryTotals: CategoryTotals,  // ← pass in
  assistance: number,
  opts: FederalCalcOptions
): Promise<FederalWaterfall>
```

**Impact:** Currently works but limits reuse
**Severity:** LOW — Not blocking, refactor opportunity
**Fix Timeline:** Post-scaffold

---

### 8.2 Missing Specified Employee Date Validation

**Issue:** Types define `specified_employee_start_date` and `specified_employee_end_date` but no service validates:
- Dates fall within tax year
- Start < End
- Overlaps with other specified employees

**Severity:** LOW — UI layer should validate
**Fix Timeline:** Post-scaffold

---

### 8.3 Missing Project-Level Tracking in Cost Splits

**Issue:** `cost_line_project_splits` allows splitting a cost across multiple projects (line 145–155 of migration 005).

Service (`costService.ts`) correctly handles this, but `federalCalcService` doesn't use per-project splits:
```typescript
// federalCalcService.ts assumes ALL allocations are to be summed
// doesn't filter by project when needed
```

**Impact:** If federal calc needs per-project iteration (not per-claim), this becomes an issue.

**Severity:** LOW → MEDIUM (depends on per-project ITC requirement)
**Fix Timeline:** Post-scaffold (clarify spec)

---

### 8.4 Route: Three-Pass Orchestration Stub

**Status:** NOT IMPLEMENTED

**File:** `/app/api/portal/calculate/[yearId]/full/route.ts` (lines 5–8)
```typescript
// TODO: Implement full orchestration:
// 1. Provisional federal calculation
// 2. Provincial (IEG) calculation using provisional federal amounts
// 3. Final federal calculation incorporating provincial results
```

**Impact:** This is the PRIMARY route that users will call. Currently returns a stub response (lines 44–49).

**Severity:** CRITICAL — Core feature missing
**Fix Timeline:** Post-scaffold (requires all service fixes above)

---

### 8.5 Route: Layout Component Uses Portal Supabase Client

**File:** `/app/(portal)/portal/claims/[yearId]/layout.tsx` (line 13)
```typescript
const supabase = createServerSupabaseClient()
```

✅ Correct: Uses server-side client for RLS
✅ Correct: Validates claim_year exists before rendering

---

### 8.6 Route: Index Page Redirects Correctly

**File:** `/app/(portal)/portal/claims/[yearId]/page.tsx` (line 8)
```typescript
redirect(`/portal/claims/${params.yearId}/setup`)
```

✅ Correct: Server-side redirect (not client-side)
✅ Appropriate: Sends user to setup flow

---

## 9. SUMMARY TABLE

| Component | Feature | Status | Severity | Fix Before Deploy? |
|-----------|---------|--------|----------|-------------------|
| **federalCalcService** | Schema alignment | ❌ project_people | CRITICAL | YES |
| | Per-project assistance | ❌ Not implemented | CRITICAL | No* |
| | Specified employee cap | ❌ Not implemented | MEDIUM | No* |
| | 80% contractor rules | ✅ Implemented | — | — |
| | Proxy/traditional branch | ✅ Implemented | — | — |
| | Post-Dec 2024 capital property | ❌ Not implemented | CRITICAL | YES |
| | $6M/$3M enhanced limit | ✅ Implemented | — | — |
| | Configurable PPA rate | ✅ Configurable | — | — |
| **provincialCalcService** | Three-pass sequencing | ❌ Route unimplemented | CRITICAL | No* |
| | IEG two-tier (8%+12%) | ❌ Base only | MEDIUM | No* |
| | $4M cap | ❌ Not in AB config | MEDIUM | No* |
| | Base-year averaging | ❌ Not implemented | MEDIUM | No* |
| | Taxable capital phase-out | ❌ Not implemented | LOW | No* |
| | Province-neutral names | ✅ Implemented | — | — |
| **reviewService** | All 30+ rules seeded | ⚠️ 11/30 hardcoded | MEDIUM | No* |
| | Narrative linting | ⚠️ Partial (commercial only) | MEDIUM | No* |
| | Deadline checks | ❌ Not implemented | LOW | No* |
| | Wholesale issue replace | ✅ Implemented | — | — |
| **exportService** | Reuse xlsx/pdf helpers | ✅ Implemented | — | — |
| **projectService** | Standard CRUD | ✅ Implemented | — | — |
| **costService** | Standard CRUD + splits | ✅ Implemented | — | — |
| **claimService** | Standard CRUD + summary | ✅ Implemented | — | — |
| **Type safety** | All input/output types | ⚠️ Some inline | LOW | No* |
| **Domain boundaries** | Service isolation | ✅ Maintained | — | — |
| **Route: full calc** | Three-pass orchestration | ❌ Stub only | CRITICAL | No* |
| **Route: layout** | RLS + validation | ✅ Correct | — | — |
| **Route: redirect** | Server-side redirect | ✅ Correct | — | — |

**\*Post-scaffold** = Can be addressed after initial scaffold and testing phase.

---

## 10. RECOMMENDED ACTION PLAN

### Phase 1: BLOCKING (Fix before any testing)
1. **Rename `project_persons` → `project_people`** in projectService.ts (or vice versa in schema)
   - Files: projectService.ts lines 158, 173; types.ts line 16 (re-export)
   - Effort: 5 min

2. **Implement post-Dec 2024 capital property handling** in federalCalcService.ts
   - Add capital_property category detection (lines 140–145)
   - Apply date-based rate (0.55 pre-2024, 1.0 post-2024)
   - Effort: 30 min

### Phase 2: SCAFFOLD FOUNDATION
3. Implement `/app/api/portal/calculate/[yearId]/full/route.ts` three-pass orchestration
4. Move `ProvincialCalcResult` and `FederalCalcResult` to types.ts
5. Seed review_rules table (migration 005 already includes INSERT statements ✅)

### Phase 3: POST-SCAFFOLD (Iterative refinement)
6. Add hardcoded rules for missing eligibility/calculation checks (15+ more rules)
7. Implement specified employee salary capping (5x YMPE per person, per year range)
8. Implement per-project assistance reduction (requires orchestration)
9. Add IEG two-tier logic (base 8% + incremental 12%) with prior-year baseline fetching
10. Add word limit and evidence coverage validation in review service
11. Add deadline checks (filing_deadline comparison)
12. Implement base-year averaging for multi-year claims

---

## 11. DEPLOYMENT CHECKLIST

- [ ] Fix project_people/project_persons mismatch
- [ ] Implement capital property post-Dec 2024 handling
- [ ] Verify all migrations run without error (001–005)
- [ ] Run unit tests on each service (if available)
- [ ] Stub route `/full/route.ts` should return 501 Not Yet Implemented (not 200 stub)
- [ ] Document three-pass sequence in API documentation
- [ ] Confirm RLS policies work for multi-tenant access
- [ ] Test with sample claim data (single project, simple costs)
