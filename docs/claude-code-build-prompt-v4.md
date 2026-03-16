# SR&ED Claim OS — Claude Code Build Prompt v4

## Context

This is **Commit 2**: `feat/sred-provincial-adapters-phase-1`.

Commit 1 (`feat/sred-claim-os-federal-alberta-core`) is already merged and locked:
- Claim-year/project architecture
- Federal calc scaffold (federalCalcService.ts)
- Alberta three-pass sequencing (stub)
- 30 review rules (seeded in migration 005)
- Snapshot/export pattern
- Province-neutral breakdown naming

### MANDATORY: Inspect before building

Before writing any code, inspect these files **if they already exist**. If a listed file does not exist yet, create it as part of this pass and note that in your implementation summary:

- `supabase/migrations/006_provincial_adapters.sql`
- `lib/services/provincial/types.ts`
- `lib/services/provincial/registry.ts`
- `lib/services/provincial/adapters/*.ts`
- `lib/services/provincialCalcService.ts`
- `lib/services/types.ts`
- `docs/provincial-sred-spec.md` — authoritative source for all provincial rules
- `docs/cra-sred-rules-reference.md` — federal rules reference
- `docs/claude-code-build-prompt-v3.md` — prior build spec (for context only)

Also inspect these existing Commit 1 files to understand the current function names, signatures, and patterns — reuse them, do not invent parallel helpers:

- `lib/services/federalCalcService.ts`
- `app/api/portal/calculate/[yearId]/full/route.ts`
- `lib/services/reviewService.ts`
- `lib/services/exportService.ts`

Do NOT assume table columns, helper function names, or exported utilities. Read the actual code and reuse exact existing patterns where present.

---

## What to build

Five deliverables, in this order:

1. **Fix Commit 1 critical bugs** (capital property + three-pass orchestration)
2. **Provincial adapter layer** (strategy interface, registry, per-province adapters)
3. **Provincial route page** (UI shell with province cards and metadata)
4. **Provincial review rules engine** expansion
5. **Export bundle province support**

Do NOT build full UI components yet. Each page should be a server component that fetches the relevant data and renders a minimal shell showing the data structure.

---

## Architecture Rules (carry forward from v3, plus new)

All 10 rules from v3 still apply. Additional rules for the provincial pass:

### Rule 11: Province adapter isolation

Each province adapter is a self-contained module in `lib/services/provincial/adapters/`.
Adapters MUST NOT import other adapters. Cross-province logic (e.g., assistance reduction ordering)
lives in the orchestration layer (`provincialCalcService.ts` or the API route), never in adapters.

### Rule 12: Strategy pattern for provincial calculations

All new provinces use `ProvinceCalcStrategy` interface from `lib/services/provincial/types.ts`.
Alberta remains inline in `provincialCalcService.ts` for backward compatibility — it is NOT
adapterized in this pass unless already migrated. The registry at
`lib/services/provincial/registry.ts` is the single source of truth for looking up adapters
by province code.

### Rule 13: CCPC flag drives refundability

Most provincial credits have CCPC-conditional refundability. The `companies.ccpc_flag` column
(added in migration 006) is the source of truth. Never hardcode CCPC status.

### Rule 14: Assistance interaction order matters

Provincial credits are government assistance for federal purposes. The three-pass sequence is:
1. Provisional federal (before provincial assistance)
2. All provincial calculations (using provisional federal QE)
3. Final federal (incorporating provincial credits as assistance)

**Critical**: Each adapter returns both `creditAmount` (total credit) and
`federalAssistanceAmount` (the portion that counts as government assistance for
federal purposes). These are NOT always equal:

- **NL exception**: NL eligible expenditures are NOT reduced by assistance, but the NL
  credit itself IS federal assistance in step 3.
- **Manitoba renunciation**: If `claim_years.mb_renunciation_flag = true`, the renounced
  non-refundable portion is NOT government assistance. The adapter excludes it from
  `federalAssistanceAmount`.
- **Saskatchewan renunciation**: Same logic as Manitoba when
  `claim_years.sk_renunciation_flag = true`.

The orchestration layer sums `federalAssistanceAmount` from each adapter result — never
raw `creditAmount`.

### Rule 15: Quebec separate authority

Quebec CRIC is filed with Revenue Québec (CO-17), NOT CRA (T2). The export bundle must flag
QC forms as Revenue Québec submissions. Do not include QC forms in CRA T2 export packages.

### Rule 16: Consistent review rule namespace

All review rules use the existing namespace pattern from migration 005:

```
FORM.PROV.<PROVINCE_CODE>.<RULE_NAME>
ELIG.PROV.<PROVINCE_CODE>.<RULE_NAME>
CALC.PROV.<PROVINCE_CODE>.<RULE_NAME>
```

Do NOT introduce a new `RULE.PROV.*` prefix. Keep it consistent with the existing
`FORM.CLAIM.*`, `ELIG.NARRATIVE.*`, `CALC.FED.*` pattern from Commit 1.

### Rule 17: Province registry validation

Province registry coverage must be explicit:
- Alberta remains inline for backward compatibility and is not adapterized in this pass
  unless already migrated.
- Implement adapters for the remaining 9 provinces with active SR&ED programs:
  BC, SK, MB, ON, QC, NB, NS, NL, YT.
- Implement no-program gates for jurisdictions with no SR&ED program: PE, NT, NU.
- Validate the registry against the exact intended jurisdiction list from
  `docs/provincial-sred-spec.md` rather than a hardcoded count.
- Registry iteration MUST use sorted province codes (alphabetical) for deterministic
  ordering. If adapters execute in arbitrary order, logs and review outputs vary between
  runs. The orchestration layer should call `Array.from(registry.keys()).sort()` or
  equivalent before iterating.

---

## Deliverable 1: Fix Commit 1 Bugs

### 1a. Capital property handling in `lib/services/federalCalcService.ts`

Inspect `federalCalcService.ts` and find the cost category accumulation loop. Currently,
`capital_property` falls through to a generic `other` bucket. Fix:

- Add a `capital_property` accumulator to whatever totals structure the service uses.
- Detect `capital_property` classification in the category loop.
- Define a constant at module scope:
  ```typescript
  const CAPITAL_PROPERTY_REINSTATEMENT_DATE = '2024-12-16'
  ```
  Compare `tax_year_start` against this constant — do NOT embed the date string inline
  in the calculation logic. If CRA or Finance revises the effective date, only one line changes.
- In the waterfall calculation, apply date-based inclusion:
  - Tax year start >= CAPITAL_PROPERTY_REINSTATEMENT_DATE → 100% inclusion (post-Budget 2025)
  - Tax year start < CAPITAL_PROPERTY_REINSTATEMENT_DATE → 0% (capital was excluded pre-Budget 2025)
- Add the included capital property amount to total expenditures before ITC calc.
- Capital property is always direct — never included in proxy calculation.

Use the actual function and variable names found in `federalCalcService.ts`. Do not invent
alternate helpers if equivalent ones already exist.

### 1b. Three-pass orchestration in the full calculation route

Inspect `app/api/portal/calculate/[yearId]/full/route.ts` and identify the actual helper
names currently present in `federalCalcService.ts` and `provincialCalcService.ts`. Replace
the TODO stub with actual orchestration using the existing function signatures:

```
Step 1: Provisional federal calculation
        → Call the existing federal waterfall function

Step 2: All provincial calculations using provisional federal QE
        → Call the existing provincial credits function

Step 3: Sum federalAssistanceAmount from each adapter result
        (NOT raw creditAmount — Manitoba/SK renunciation may reduce this)

Step 4: Upsert provincial credits as assistance items into assistance_items
        with assistance_type = 'government_assistance'
        and source_name = '<Province> SR&ED Tax Credit'
        and metadata JSON containing:
          - province_code (e.g. 'BC', 'ON')
          - adapter_id (e.g. 'bc-sred-adapter', 'on-sred-adapter')
          - calculated_at (ISO timestamp)
        This enables audit trace back to the originating provincial calculation
        if recalculation occurs later across multiple provinces in a claim year.

Step 5: Final federal calculation (now includes provincial assistance)
        → Call the same federal waterfall function again

Step 6: Save all line values using existing persistence helpers
```

Use existing function names from the service files. Do not invent parallel helpers.

---

## Deliverable 2: Provincial Adapter Layer

### 2a. Strategy interface

If `lib/services/provincial/types.ts` does not exist, create it with:

```typescript
interface ProvinceCalcStrategy {
  provinceCode: string
  provinceName: string
  primaryFormCode: string
  allFormCodes: string[]
  usesFederalBase: boolean
  assistanceReducesBase: boolean   // false only for NL
  hasRecapture: boolean            // BC, NB, NS
  hasRenunciation: boolean         // SK, MB, NS
  requiresSeparateAuthority: boolean // QC only
  calculateCredit(expenditures: ProvinceExpenditures, sb: SupabaseClient): Promise<ProvinceCreditResult>
}
```

**Critical**: `ProvinceCreditResult` must include both:
- `creditAmount` — total credit calculated
- `federalAssistanceAmount` — portion that counts as government assistance for federal
  purposes (excludes renounced portions for MB/SK)

### 2b. Province adapters

Implement each province adapter exactly per `docs/provincial-sred-spec.md`. For Ontario,
implement all three stacked programs (OITC + ORDTC + OBRITC) as described in the spec —
do not simplify or combine them.

For Quebec, the CRIC regime date gate uses `tax_year_start` as the determinant per the spec:
CRIC applies to taxation years **beginning** after March 25, 2025. If `tax_year_start` is
on or before that date, return a zero result with a **structured warning** in the result
object (e.g. `{ warning: { code: 'QC_PRE_CRIC_REGIME', message: '...' } }`) — do NOT
silently return zero. This allows the review system to surface the regime mismatch via
`FORM.PROV.QC.WRONG_REGIME_DATE` and the export service to skip QC bundles gracefully.

### 2c. Province registry

Create `lib/services/provincial/registry.ts` mapping all province codes to their adapters
or no-program gates. Alberta is excluded from this registry (it remains inline).

---

## Deliverable 3: Provincial Route Page

### File: `app/(portal)/portal/claims/[yearId]/provincial/page.tsx`

Server component. Fetch and render a summary of all provinces active in this claim year.

1. Fetch all `cost_line_project_splits` grouped by `province_code` for this claim year.
2. Fetch claim-year provincial metadata: `mb_renunciation_flag`, `mb_renunciation_date`,
   `sk_renunciation_flag`, `taxable_capital_eoy`, `associated_corp_flag`, `method_election`.
3. Fetch company-level metadata: `ccpc_flag`, `specified_capital_amount`,
   `prior_year_taxable_income_on`, `qc_establishment_flag`.
4. Fetch the provisional federal qualified expenditure (QE) base from `federal_line_values`
   (or the existing federal calc result structure). This is the base that provincial adapters
   use for their calculations. Without it, province card summaries could display expenditure
   totals that don't match the base used for credit calculation.
5. For each province with splits, show a card with:
   - Province name and program name(s)
   - Form code(s) required
   - Qualified expenditure total
   - Credit calculation summary (if calculated — fetch from `provincial_line_values`)
   - Key province-specific metadata (renunciation status, CCPC status, phase-out fields)
   - Link to province-specific detail page (future)
6. For provinces with no program (PE, NT, NU only — **not** YT, which has a program), show
   an info banner indicating federal-only eligibility.
7. Show the three-pass calculation status (provisional federal done? provincial done? final federal done?).

---

## Deliverable 4: Provincial Review Rules Engine

### 4a. New function: `runProvincialRules(sb, claimYearId)`

Add to `lib/services/reviewService.ts`:

- Fetch all enabled rules from `review_rules` where `rule_key LIKE 'FORM.PROV.%'`
  or `LIKE 'ELIG.PROV.%'` or `LIKE 'CALC.PROV.%'`.
- For each province with cost splits in this claim year, evaluate applicable rules.
- Insert findings into `review_issues` with `rule_key` FK.

### 4b. Wire into main review flow

**`runAllRules()` must call `runProvincialRules()` after federal/base claim checks and
before writing final review summary counts.** Do not leave it as an unconnected function.

### 4c. High-value rule checks to implement

At minimum, implement these checks:

```
FORM.PROV.*.NO_*_EXPENDITURES   — province with splits but zero qualified expenditures
FORM.PROV.*.FEDERAL_BASE_REQUIRED — federal calc not yet run when provincial requested
CALC.PROV.ON.OITC_PHASE_OUT     — specified_capital_amount or prior_year_taxable_income_on triggers
ELIG.PROV.MB.RENUNCIATION_DEADLINE — 6-month window check against tax_year_end
FORM.PROV.QC.WRONG_REGIME_DATE  — tax_year_start (beginning of tax year) vs CRIC effective date
CALC.PROV.QC.EXCLUSION_THRESHOLD_MISSING — no provincial_employee_time rows for QC
CALC.PROV.SK.TOTAL_EXCEEDS_10M  — SK expenditure ceiling
CALC.PROV.NL.ASSISTANCE_NOT_REDUCED — informational, always fire for NL claims
```

### 4d. Rule key naming convention

Use the existing namespace pattern consistently:
```
FORM.PROV.<PROVINCE_CODE>.<RULE_NAME>
ELIG.PROV.<PROVINCE_CODE>.<RULE_NAME>
CALC.PROV.<PROVINCE_CODE>.<RULE_NAME>
```

All provincial rules seeded in migration 006 must use this pattern. Do NOT introduce
a `RULE.PROV.*` prefix.

---

## Deliverable 5: Export Bundle Province Support

Update `lib/services/exportService.ts` to:

1. Accept `province_code` parameter for provincial export bundles.
2. Use `export_type = 'provincial_package'` (not `alberta_package`).
3. Set `export_bundles.province_code` column.
4. Generate per-province form PDFs based on the adapter's `allFormCodes`.
   **Before generating PDFs**, validate that the adapter returned a non-empty `allFormCodes`
   array. If a regime gate prevented calculation (e.g. Quebec pre-CRIC years), the adapter
   may return an empty array. In that case, the export service must fail gracefully — skip
   the province bundle, log a warning, and include a `skipped_reason` in the export metadata
   rather than producing an empty or corrupt bundle.
5. For Quebec: flag the export as a Revenue Québec submission (CO-17), not CRA T2.

### Schema dependency

If `export_bundles.province_code` column does not already exist, add it in migration 006.
Update the `export_type` CHECK constraint to support `provincial_package`. Preserve
`alberta_package` for backward compatibility with any existing rows, but all new code
should use `provincial_package` with `province_code = 'AB'`.

---

## Migration 006 Requirements

If `supabase/migrations/006_provincial_adapters.sql` does not exist, create it. If it does,
verify it includes all of the following:

### New columns on existing tables

```sql
-- companies
ccpc_flag boolean DEFAULT true
specified_capital_amount numeric(14,2)
prior_year_taxable_income_on numeric(14,2)
qc_establishment_flag boolean DEFAULT false

-- claim_years
mb_renunciation_flag boolean DEFAULT false
mb_renunciation_date date
sk_renunciation_flag boolean DEFAULT false

-- projects
mb_qualifying_institute_flag boolean DEFAULT false
qc_precomm_flag boolean DEFAULT false
on_eri_contract_flag boolean DEFAULT false

-- provincial_project_breakdowns (province-neutral columns alongside legacy Alberta)
provincial_expenditures numeric(14,2)
non_province_share numeric(12,2)
provincial_salaries numeric(14,2)
federal_proxy_in_province numeric(14,2)
provincial_proxy_amount numeric(14,2)

-- export_bundles
province_code text
-- Update export_type CHECK to include 'provincial_package'

-- Indexes (required for province-filtered queries in exports and review rules)
CREATE INDEX IF NOT EXISTS idx_provincial_project_breakdowns_province
  ON provincial_project_breakdowns(province_code);
CREATE INDEX IF NOT EXISTS idx_export_bundles_province
  ON export_bundles(province_code);
```

### New tables

```sql
-- provincial_employee_time (Quebec CRIC exclusion threshold)
-- Columns: id, claim_year_id, project_person_id, province_code, rd_time_fraction, created_at
-- RLS: claim_year_company() + is_execom_staff()

-- on_eri_contracts (Ontario OBRITC — T2SCH568/T2SCH569)
-- Columns: id, project_id, claim_year_id, eri_code, eri_name, contract_date, payment_amount, created_at
-- RLS: claim_year_company() + is_execom_staff()
```

### Seeded provincial review rules

Seed all provincial review rules using the `FORM.PROV.*` / `ELIG.PROV.*` / `CALC.PROV.*`
namespace pattern. Use `ON CONFLICT (rule_key) DO NOTHING` for idempotency. See
`docs/provincial-sred-spec.md` for the complete rule list per province.

Each province-specific rule must include `province_code` in its `metadata` JSON column
(e.g. `'{"province_code": "ON"}'`). This allows future filtering by province without
parsing the rule key string.

**Important**: The `metadata` column is added in migration 006 and will be `NULL` for any
rules seeded in migration 005. All queries reading `metadata` must use
`coalesce(metadata, '{}'::jsonb)` to handle legacy rows gracefully.

---

## Post-Build Validation Checklist

After building, verify:

- [ ] `npm run build` succeeds with zero errors
- [ ] Migration 006 is syntactically valid SQL (no duplicate constraint names)
- [ ] All province adapters export a valid `ProvinceCalcStrategy` implementation
- [ ] Province registry covers all intended jurisdictions per `docs/provincial-sred-spec.md`
- [ ] Alberta is NOT in the registry (remains inline) unless explicitly migrated
- [ ] `provincialCalcService.ts` correctly dispatches to adapters via registry
- [ ] Ontario adapter handles all three stacked programs (OITC + ORDTC + OBRITC) per spec
- [ ] Quebec adapter gates on `tax_year_start` > March 25, 2025 before calculating CRIC
- [ ] NL adapter does NOT reduce expenditures by assistance
- [ ] Manitoba adapter returns `federalAssistanceAmount` excluding renounced non-refundable portion
- [ ] SK adapter derives refundable limit as 1/3 of federal expenditure limit (not hardcoded $1M)
- [ ] Three-pass orchestration sums `federalAssistanceAmount`, not raw `creditAmount`
- [ ] Provincial review rules use `FORM.PROV.*` / `ELIG.PROV.*` / `CALC.PROV.*` namespace
- [ ] `runAllRules()` calls `runProvincialRules()` — it is wired in, not orphaned
- [ ] ExportBundle type includes `province_code` field
- [ ] Types.ts includes `ProvincialEmployeeTime` and `OnEriContract` interfaces
- [ ] No adapter imports another adapter (isolation rule)
- [ ] YT is treated as an active program province, not a no-program gate
- [ ] Provincial route page fetches claim-year and company metadata, not just cost splits
- [ ] Provincial route page fetches provisional federal QE base for card summaries
- [ ] `federalAssistanceAmount` from every adapter is never greater than `creditAmount`
  (add a runtime assertion or validation check — prevents adapter bugs that inflate federal deductions)
- [ ] Quebec adapter returns a structured warning object (not silent zero) for pre-CRIC years
- [ ] Export service validates `allFormCodes` is non-empty before generating province bundles
- [ ] Migration 006 includes indexes on `province_code` for `provincial_project_breakdowns` and `export_bundles`
- [ ] Seeded review rules include `province_code` in their metadata JSON
- [ ] Assistance items upserted in step 4 include province_code and adapter_id in metadata
- [ ] Registry iteration uses sorted province codes for deterministic ordering
