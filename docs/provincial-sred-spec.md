# Canadian Provincial & Territorial SR&ED Tax Credits — Complete Implementation Specification

> **Scope**: All provinces and territories excluding Alberta (already implemented). Jurisdictions with no program (PEI, Northwest Territories, Nunavut) are confirmed and documented for completeness.
>
> **Sources**: CRA provincial/territorial tax credit pages, provincial government sites, form instructions, and authoritative tax practitioners (PwC, EY, Ryan, Gowling).

***

## Implementation Priority Ranking

Before the per-province specifications, a ranked priority list for software implementation based on claim volume, credit size, and complexity:

| Priority | Province | Rationale |
|----------|---------|-----------|
| 1 | **Ontario** | Highest claim volume; three stacked programs (OITC + ORDTC + OBRITC); most complex provincial logic |
| 2 | **Quebec** | Second-highest volume; CRIC overhaul in 2025 requires new form logic; Revenue Québec separate from CRA |
| 3 | **British Columbia** | Third-highest volume; dual refundable/non-refundable structure; separate T666 form |
| 4 | **Saskatchewan** | Refundable/non-refundable split; $1M/$10M expenditure tiers; agriculture levy edge cases |
| 5 | **Manitoba** | Unusual 6-month renunciation window creates interaction complexity with federal |
| 6 | **Nova Scotia** | Simple 15% fully refundable; T2SCH340; recapture required |
| 7 | **New Brunswick** | Simple 15% fully refundable; T2SCH360; recapture required |
| 8 | **Newfoundland & Labrador** | Unique rule: eligible expenditures NOT reduced by assistance (except GST/HST ITCs) |
| 9 | **Yukon** | Simple 15% + 5% bonus; T2SCH442; small volume |
| 10 | **PEI** | No program — gate flag only |
| 11 | **NWT/Nunavut** | No program — gate flags only |

***

## Province 1: British Columbia (BC)

### 1.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Scientific Research and Experimental Development Tax Credit |
| Administering authority | Canada Revenue Agency (on behalf of BC) |
| Form number | **T666** — British Columbia Scientific Research and Experimental Development Tax Credit |
| Refundable | **Yes** — for CCPCs, on expenditures up to the expenditure limit |
| Non-refundable | **Yes** — for CCPCs on expenditures above the limit, and for all non-CCPCs |
| Eligible claimants | All corporations with a permanent establishment in BC [^1] |
| Credit rate | **10%** of qualified BC expenditures [^2] |
| Expenditure limit | $3M (general); **$6M** for tax years beginning on or after December 16, 2024 (pending final federal legislation) [^3][^4] |
| Maximum refundable credit | $300,000 at $3M limit; **$600,000** at $6M limit [^3] |

**Enhanced rate**: No enhanced rate beyond the base 10%. The refundability distinction is the only differentiation.

### 1.2 Filing Requirements

- **Forms required**: T666 (BC SR&ED form) + T661 (federal) + T2SCH31 (federal ITC)[^1]
- **T661 prerequisite**: Yes — federal claim must be filed to establish qualified expenditure base
- **Filing deadline**: No later than **18 months after the end of the taxation year**[^5][^1]
- **Separate provincial submission**: No — T666 is submitted to CRA with the T2 return
- **Carryback**: 3 years (non-refundable portion only)[^5]
- **Carryforward**: 10 years (non-refundable portion only)[^5]
- **Recapture**: Yes — property previously used in SR&ED that is disposed of or converted to commercial use triggers recapture. Recapture must be reported on T666[^1]

### 1.3 Calculation Mechanics

**Credit base**: SR&ED **qualified BC expenditures** — defined as the BC-located portion of federal qualified expenditures under section 127 of the federal Income Tax Act.[^2][^1]

**Formula**:

```
Refundable portion = min(qualified_BC_expenditures, expenditure_limit) × 10%
Non-refundable portion = max(0, qualified_BC_expenditures − expenditure_limit) × 10%
Total BC SR&ED credit = refundable_portion + non-refundable_portion
```

**Proxy method treatment**: If the federal claim uses the proxy method, the Prescribed Proxy Amount (PPA) is included in federal qualified expenditures. The same PPA-inclusive qualified expenditure figure flows to the BC calculation. BC does not apply a separate PPA calculation.[^1]

**Assistance reductions**: BC qualified expenditures are reduced by government and non-government assistance related to SR&ED performed in BC, in the same manner as federal (before the BC base is struck).[^1]

**Capital expenditures**: For property acquired after December 15, 2024, capital expenditures that are now federally eligible flow through to the BC credit base (the BC credit tracks the federal qualified expenditure definition).[^3]

**Expenditure limit sharing**: Associated corporations must share the expenditure limit (same sharing rules as the federal expenditure limit).[^3]

### 1.4 Project-Level Requirements

- **Province-of-expenditure allocation required**: Yes — claimants must identify which SR&ED costs relate to activities performed in BC specifically (i.e., on which `cost_line_project_splits.province_code = 'BC'`)[^1]
- **Project-by-project reporting**: No separate BC project schedule; BC follows the T661 project structure
- **Employee location rules**: Salaries in the BC base must be for employees performing SR&ED work in BC
- **Location of R&D activities**: Must be carried on in BC (permanent establishment required)[^1]

### 1.5 Assistance Interaction with Federal SR&ED

- The BC SR&ED tax credit is **government assistance** for federal purposes[^5]
- It reduces the federal pool of deductible SR&ED expenditures and the qualified SR&ED expenditure pool
- The credit must be accounted for as assistance at the time it is "entitled to be received" (i.e., when the BC claim is filed)
- Timing note: If the BC credit is received after the federal T2 is filed, the federal return may need to be amended to adjust the assistance deduction

### 1.6 Review and Audit Risk Factors

- Missing T666 when BC expenditures are claimed on T661
- Allocating salaries or contractor payments to BC without evidence of work location (timesheets, IP addresses, office records)
- Using federal qualified expenditure total without provincial allocation — BC portion must be stripped out
- Recapture not reported on property disposal/conversion
- Expenditure limit not shared among associated corporations

### 1.7 Platform Rule Engine Specification

```
RULE.PROV.BC.NO_FORM_T666
  layer: form
  severity: blocker
  source_area: provincial_calc
  message_template: "BC credit requires Form T666 to be generated and included in the export bundle"

RULE.PROV.BC.NO_BC_EXPENDITURES
  layer: form
  severity: blocker
  source_area: provincial_calc
  message_template: "BC credit requires at least one cost line split with province_code = 'BC'"

RULE.PROV.BC.EXPENDITURE_LIMIT_SHARED
  layer: calculation
  severity: warning
  source_area: provincial_calc
  message_template: "Associated corporations must share the BC expenditure limit — verify Form T2SCH9 associated group allocation"

RULE.PROV.BC.REFUNDABLE_EXCEEDS_LIMIT
  layer: calculation
  severity: blocker
  source_area: provincial_calc
  message_template: "Refundable BC credit claimed on expenditures exceeding the expenditure limit — verify CCPC status and limit"

RULE.PROV.BC.ASSISTANCE_NOT_DEDUCTED
  layer: calculation
  severity: blocker
  source_area: provincial_calc
  message_template: "BC qualified expenditures must be reduced by government/non-government assistance related to BC SR&ED"

RULE.PROV.BC.FEDERAL_BASE_REQUIRED
  layer: form
  severity: blocker
  source_area: provincial_calc
  message_template: "Federal T661 must be filed to establish the BC qualified expenditure base"

RULE.PROV.BC.RECAPTURE_CHECK
  layer: eligibility
  severity: warning
  source_area: provincial_calc
  message_template: "BC SR&ED property disposed of or converted to commercial use may require recapture — verify T666 Part 2"

RULE.PROV.BC.NON_CCPC_NONREFUNDABLE
  layer: eligibility
  severity: info
  source_area: provincial_calc
  message_template: "Non-CCPC claimant: BC SR&ED credit is non-refundable only — can only reduce BC taxes payable, excess carried 3 back / 10 forward"

RULE.PROV.BC.CAPITAL_POST_DEC2024
  layer: eligibility
  severity: info
  source_area: provincial_calc
  message_template: "Capital expenditures on property acquired after December 15, 2024 may now be included in BC qualified expenditure base"
```

### 1.8 Data Model Implications

- `cost_line_project_splits.province_code` = `'BC'` identifies BC expenditures
- `provincial_project_breakdowns.province_code = 'BC'` captures per-project BC amounts
- `provincial_line_values` stores T666 line values (form_code = `'T666'`)
- New field needed on `claim_years` or `provincial_line_values`: `bc_expenditure_limit` (float) — populated from federal expenditure limit
- `assistance_items` linked at project level must be used to reduce BC base before credit calculation

### 1.9 Export Requirements

| Output | Form/Schedule | Notes |
|--------|-------------|-------|
| T666 PDF | T666 BC SR&ED Credit | Submitted to CRA with T2 |
| Provincial project allocation | Support schedule | Per-project BC expenditure breakdown |
| Federal T661 (prerequisite) | T661 | Must accompany |

***

## Province 2: Saskatchewan (SK)

### 2.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Saskatchewan Research and Development Tax Credit |
| Administering authority | Canada Revenue Agency |
| Form number | **T2SCH403** [^6] |
| Refundable | Yes — **CCPCs on first $1M** of eligible expenditures (since April 1, 2017) [^7] |
| Non-refundable | Yes — CCPCs over $1M, and all non-CCPCs (up to $10M total) [^7] |
| Eligible claimants | Corporations and partnerships with a permanent establishment in Saskatchewan [^7] |
| Credit rate | **10%** of eligible expenditures [^7] |
| Refundable expenditure limit | **$1M** (CCPC only; = 1/3 of federal expenditure limit) [^8] |
| Maximum total eligible expenditures | **$10M** (combined refundable + non-refundable) [^7] |
| Maximum refundable credit | $100,000 (10% × $1M) |

### 2.2 Filing Requirements

- **Forms required**: T2SCH403 + T661 (federal) + T2SCH31 (federal ITC)[^6]
- **T661 prerequisite**: Yes
- **Filing deadline**: 18 months after tax year end[^8]
- **Carryback**: 3 years (non-refundable portion)[^8]
- **Carryforward**: 10 years (non-refundable portion)[^8]
- **Renunciation**: Yes, in whole or in part, under s.63.4(13) of the Saskatchewan Income Tax Act, 2000[^7]

### 2.3 Calculation Mechanics

**Credit base**: Same eligible expenditure definition as federal SR&ED, for SR&ED carried on in Saskatchewan. Capital expenditures are eligible (SK did not exclude capital pre-2014 and the federal restoration post-December 2024 aligns).[^7][^8]

**Formula**:

```
refundable_credit = min(eligible_SK_expenditures, 1,000,000) × 10%  [CCPC only]
non_refundable_credit = min(
    max(0, eligible_SK_expenditures − 1,000,000),
    9,000,000   ← up to $10M ceiling minus the first $1M
) × 10%
total_SK_credit = refundable_credit + non_refundable_credit
```

**Proxy method treatment**: Federal PPA flows into the eligible expenditure base for SK (follows federal definition).[^8]

**Assistance reductions**: Eligible SK expenditures are reduced by government and non-government assistance in the same manner as federal.[^8]

**Expenditure limit**: The SK $1M refundable limit is expressly set at 1/3 of the federal expenditure limit. If the federal expenditure limit changes (as it did effective December 16, 2024 to $6M), the SK limit may adjust to $2M. **This formula relationship should be stored as a rule, not a hardcoded number.**[^8]

### 2.4 Project-Level Requirements

- **Province-of-expenditure allocation required**: Yes — costs must be attributed to Saskatchewan activities[^7]
- **Project-by-project reporting**: Follows T661 project structure; no additional SK project schedule
- **Employee location rules**: Must perform SR&ED in Saskatchewan

### 2.5 Assistance Interaction with Federal SR&ED

- SK credit = **government assistance**; reduces federal QE pool[^8]
- Renunciation available: A corporation without taxes payable can renounce the non-refundable portion to preserve federal QE. Renunciation must be made before 6 months from year-end to align with the federal assistance determination point (same logic as Manitoba)[^7]

### 2.6 Review and Audit Risk Factors

- Claiming refundable credit for expenditures over $1M
- Exceeding $10M total expenditure ceiling
- Missing T2SCH403 while SK expenditures appear in T661
- Non-CCPC claiming refundable credit
- Failure to renounce non-refundable credit when no SK taxes are payable (missed federal QE optimization)

### 2.7 Platform Rule Engine Specification

```
RULE.PROV.SK.NO_FORM_403
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "SK credit requires T2SCH403 in the export bundle"

RULE.PROV.SK.NO_SK_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "SK credit requires at least one cost line split with province_code = 'SK'"

RULE.PROV.SK.REFUNDABLE_OVER_LIMIT
  layer: calculation | severity: blocker | source_area: provincial_calc
  message_template: "SK refundable credit capped at $1M of eligible expenditures for CCPCs — excess is non-refundable"

RULE.PROV.SK.TOTAL_EXCEEDS_10M
  layer: calculation | severity: blocker | source_area: provincial_calc
  message_template: "SK eligible expenditures exceed $10M annual ceiling — excess is not eligible for any SK credit"

RULE.PROV.SK.NON_CCPC_NONREFUNDABLE
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "Non-CCPC: SK credit is non-refundable only — can reduce SK taxes payable, carry 3 back / 10 forward"

RULE.PROV.SK.RENUNCIATION_WINDOW
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "SK non-refundable credit may be renounced to preserve federal QE — renunciation must occur before T2 filing (6-month deadline)"

RULE.PROV.SK.LIMIT_RATIO_CHECK
  layer: calculation | severity: info | source_area: provincial_calc
  message_template: "SK refundable limit = 1/3 of federal expenditure limit — verify limit is consistent with current federal limit"

RULE.PROV.SK.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 must be filed to establish SK eligible expenditure base"
```

### 2.8 Data Model Implications

- `cost_line_project_splits.province_code = 'SK'`
- `provincial_line_values` with `form_code = 'T2SCH403'`
- New field: `sk_refundable_limit` (should be derived as 1/3 of federal expenditure limit, not hardcoded)
- `claim_years` needs `ccpc_flag` (boolean) or this derives from company profile

### 2.9 Export Requirements

| Output | Form/Schedule | Notes |
|--------|-------------|-------|
| T2SCH403 PDF | Saskatchewan R&D Tax Credit | Filed with T2 |
| Provincial allocation schedule | Support | Per-project SK expenditure breakdown |

***

## Province 3: Manitoba (MB)

### 3.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Manitoba Research and Development Tax Credit |
| Administering authority | Canada Revenue Agency |
| Form number | **T2SCH380** [^9] |
| Refundable | **50% refundable / 50% non-refundable** (standard); **100% refundable** when R&D is performed under an eligible contract with a qualifying research institute [^10] |
| Eligible claimants | Corporations and partnerships with a permanent establishment in Manitoba [^10] |
| Credit rate | **15%** of eligible expenditures [^10] |
| Qualifying research institutes | Universities, affiliated colleges, research centres listed by Manitoba Finance [^10] |

### 3.2 Filing Requirements

- **Forms required**: T2SCH380 + T661 (federal) + T2SCH31 (federal ITC)[^9]
- **T661 prerequisite**: Yes
- **Filing deadline for credit identification**: **12 months after the income tax return is due** for the tax year = effectively **18 months after year end** for corporations[^10]
- **⚠️ CRITICAL RENUNCIATION DEADLINE**: Renunciation of the Manitoba credit must be made **on or before 6 months after year-end** (the T2 filing due date). If a corporation does not owe Manitoba tax, failing to renounce the non-refundable MB credit before the 6-month deadline means the MB credit is counted as government assistance and reduces the federal qualified SR&ED expenditure pool — reducing the federal ITC.[^11]
- **Carryback**: 3 years (non-refundable portion)[^10]
- **Carryforward**: 20 years (non-refundable portion)[^12][^10]
- **Renunciation**: Yes, in whole or in part, under s.7.3(7) of the Manitoba Income Tax Act[^10]

### 3.3 Calculation Mechanics

**Credit base**: Eligible expenditures include:
- Current SR&ED expenditures (following federal definition)
- Capital expenditures for depreciable property (other than buildings or leasehold interests in buildings)
- First-term and second-term shared-use equipment[^10]

**Note**: Manitoba explicitly includes capital expenditures — this is not contingent on the post-December 2024 federal restoration.

**Formula**:

```
mb_credit_gross = eligible_MB_expenditures × 15%

IF performed under eligible contract with qualifying research institute:
    mb_refundable = mb_credit_gross
    mb_non_refundable = 0
ELSE:
    mb_refundable = mb_credit_gross × 50%
    mb_non_refundable = mb_credit_gross × 50%
```

**Proxy method treatment**: PPA is included in federal qualified expenditures; MB follows the same eligible expenditure base.[^10]

**Assistance reductions**: Standard federal-aligned reduction applies (eligible MB expenditures reduced by assistance).[^11]

### 3.4 Project-Level Requirements

- **Province-of-expenditure allocation**: Yes — work must be performed in Manitoba[^10]
- **Qualifying research institute flag**: The system must track whether each project is performed under an eligible contract with a qualifying MB research institute (determines refundability tier)
- **Capital expenditure tracking**: Capital purchases must be tagged and tracked for the Manitoba base

### 3.5 Assistance Interaction with Federal SR&ED

- Manitoba credit = **government assistance** for federal purposes[^12][^11]
- Reduces federal pool of deductible SR&ED expenditures and qualified SR&ED expenditures[^11]
- **Renunciation strategy**: A corporation with no Manitoba taxes payable should renounce the non-refundable MB credit **before the T2 filing deadline (6 months from year-end)** to prevent the credit from being treated as government assistance and reducing the federal QE pool. The 6-month deadline is the operative date for determining "government assistance entitled to receive"[^11]
- The refundable portion of the MB credit that is actually received is always government assistance; the non-refundable portion can be renounced to eliminate this treatment[^11]

### 3.6 Review and Audit Risk Factors

- Missing renunciation when corporation has no MB taxable income (frequently missed, significantly impacts federal ITC)
- Failing to separate qualifying-research-institute contracts from other SR&ED (misclassifies refundability tier)
- Including buildings or leasehold interests as eligible capital expenditures (explicitly excluded)[^10]
- Missing T2SCH380 when MB expenditures in T661
- Incorrect 50%/100% refundability determination

### 3.7 Platform Rule Engine Specification

```
RULE.PROV.MB.NO_FORM_380
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "MB credit requires T2SCH380 in the export bundle"

RULE.PROV.MB.NO_MB_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "MB credit requires at least one cost line split with province_code = 'MB'"

RULE.PROV.MB.RENUNCIATION_DEADLINE_WARNING
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "MB non-refundable credit renunciation must occur before the T2 filing deadline (6 months from year-end) — failure increases government assistance and reduces federal QE"

RULE.PROV.MB.REFUNDABILITY_FLAG_MISSING
  layer: form | severity: warning | source_area: provincial_calc
  message_template: "MB credit: confirm whether SR&ED is performed under an eligible contract with a qualifying MB research institute (determines 50% vs 100% refundability)"

RULE.PROV.MB.CAPITAL_BUILDING_EXCLUDED
  layer: eligibility | severity: blocker | source_area: provincial_calc
  message_template: "Buildings and leasehold interests in buildings are not eligible capital expenditures for the MB credit — remove from MB eligible base"

RULE.PROV.MB.CARRYFORWARD_20YR
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "MB non-refundable credit carries forward 20 years (longer than the 10-year federal carryforward)"

RULE.PROV.MB.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 must be filed to establish MB eligible expenditure base"

RULE.PROV.MB.QUALIFYING_INSTITUTE_LIST
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "Verify qualifying research institute is on the Manitoba Finance approved list before applying 100% refundability"
```

### 3.8 Data Model Implications

- `cost_line_project_splits.province_code = 'MB'`
- New field: `mb_qualifying_institute_contract` (boolean) on `projects` or a `project_flags` JSONB field — drives refundability tier
- `provincial_line_values` with `form_code = 'T2SCH380'`
- `claim_years` needs `mb_renunciation_flag` (boolean) and `mb_renunciation_date` (date) to track renunciation timing

### 3.9 Export Requirements

| Output | Form/Schedule | Notes |
|--------|-------------|-------|
| T2SCH380 PDF | Manitoba R&D Tax Credit | Filed with T2 |
| Renunciation election (if applicable) | Attachment to T2SCH380 | Required when renouncing non-refundable credit |

***

## Province 4: Ontario (ON)

Ontario has **three separate SR&ED-related tax credits** that stack. All are filed with the T2.

### 4.1 Program A: Ontario Innovation Tax Credit (OITC)

| Field | Value |
|-------|-------|
| Official program name | Ontario Innovation Tax Credit (OITC) |
| Form | **T2SCH566** [^13][^14] |
| Administering authority | CRA (on behalf of Ontario) |
| Rate | **8%** (tax years commencing after May 31, 2016) [^15] |
| Refundable | **Yes — fully refundable** [^13] |
| Eligible claimants | All corporations (public and private) with permanent establishment in Ontario [^13] |
| Expenditure limit | **$3M** (max annual credit $240,000); associated corporations share the limit [^15] |
| Phase-out trigger | Specified capital amount > $25M **OR** prior-year federal taxable income > $500,000 → limit is reduced proportionally [^13] |

**Calculation**:
```
oitc_eligible_expenditures = federal_qualified_Ontario_expenditures
    minus government/non-government assistance
    minus contract payments related to Ontario SR&ED
oitc_eligible_expenditures_for_credit = min(oitc_eligible_expenditures, expenditure_limit)
oitc_credit = oitc_eligible_expenditures_for_credit × 8%
```

**Filing deadline**: 18 months after tax year end[^13]

### 4.2 Program B: Ontario Research and Development Tax Credit (ORDTC)

| Field | Value |
|-------|-------|
| Official program name | Ontario Research and Development Tax Credit (ORDTC) |
| Form | **T2SCH508** [^16] |
| Administering authority | CRA (on behalf of Ontario) |
| Rate | **3.5%** (tax years commencing after May 31, 2016) [^16][^17] |
| Refundable | **No — non-refundable only** (reduces Ontario corporate income tax payable) [^16] |
| Eligible claimants | All corporations with permanent establishment in Ontario (not tax-exempt; no exempt income) [^16] |
| Carryback | 3 years [^17] |
| Carryforward | 20 years [^17] |

**Calculation**:
```
ordtc_eligible_expenditures = federal_qualified_Ontario_expenditures
    minus government assistance
    minus non-government assistance
    minus contract payments received/entitled/expected
ordtc_credit = ordtc_eligible_expenditures × 3.5%
```

**Filing requirements**: T2SCH508 + T661 + T2SCH31[^16]

### 4.3 Program C: Ontario Business-Research Institute Tax Credit (OBRITC)

| Field | Value |
|-------|-------|
| Official program name | Ontario Business-Research Institute Tax Credit (OBRITC) |
| Forms | **T2SCH568** (credit calculation) + **T2SCH569** (per-contract info) [^18] |
| Administering authority | CRA (on behalf of Ontario, after December 31, 2008) [^18] |
| Rate | **20% refundable** [^19][^18] |
| Eligible claimants | Corporations with PE in Ontario that have eligible contracts with Eligible Research Institutes (ERIs) [^18] |
| Annual expenditure cap | **$20M**; maximum credit = $4M (20% × $20M) [^18] |
| Associated corp sharing | $20M limit must be allocated among associated corporations [^18] |

**Eligible expenditures**: Payments made **in money** (not in-kind) to ERIs where there is an agreement for the ERI to perform SR&ED on behalf of the corporation. The corporation must be entitled to exploit the results.[^20]

**ERI definition**: Ontario universities, community colleges, hospital research institutes, Ontario Centres of Excellence, federal Networks of Centres of Excellence, or non-profit organizations designated as ERIs.[^19]

**Calculation**:
```
obritc_qualified_expenditures = min(Ontario_ERI_contract_payments, 20,000,000)
obritc_credit = obritc_qualified_expenditures × 20%
```

**Interaction with federal QE**: OBRITC = government assistance → reduces federal QE pool[^20]

### 4.4 Combined Ontario Stack (CCPC Example)

```
federal_qualified_Ontario_expenditures = X
OITC = min(X, expenditure_limit) × 8%        [refundable]
ORDTC = X_less_assistance × 3.5%             [non-refundable]
OBRITC = min(ERI_payments, 20M) × 20%        [refundable, separate base]
Combined OITC+ORDTC effective rate = 11.5% on Ontario expenditures
Max combined (excluding OBRITC) per $3M = $240K + $105K = $345K
```

### 4.5 Filing Requirements (Combined)

| Credit | Form | T661 Required? | Deadline |
|--------|------|---------------|---------|
| OITC | T2SCH566 | Yes | 18 months from year-end |
| ORDTC | T2SCH508 | Yes | 18 months from year-end |
| OBRITC | T2SCH568 + T2SCH569 per contract | Yes | 18 months from year-end |

### 4.6 Ontario-Specific Review Triggers

- OITC claimed by corporation with specified capital amount above $25M or prior-year income above $500K without applying phase-out
- T2SCH569 missing for each ERI contract claimed on T2SCH568
- OBRITC claimed on in-kind (non-cash) contributions
- OBRITC claimed where corporation is connected to ERI
- Associated corporations not sharing $20M OBRITC limit
- ORDTC used to reduce tax below zero (non-refundable — blocked by calculation logic)

### 4.7 Platform Rule Engine Specification

```
RULE.PROV.ON.OITC_NO_FORM_566
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Ontario OITC requires T2SCH566 in the export bundle"

RULE.PROV.ON.ORDTC_NO_FORM_508
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Ontario ORDTC requires T2SCH508 in the export bundle"

RULE.PROV.ON.OITC_PHASE_OUT_CHECK
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "Ontario OITC: verify specified capital amount (≤$25M) and prior-year taxable income (≤$500K) to confirm full expenditure limit applies"

RULE.PROV.ON.OITC_EXPENDITURE_LIMIT_SHARED
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "Associated corporations must share the OITC $3M expenditure limit — verify allocation"

RULE.PROV.ON.OBRITC_ERI_CONTRACT_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "OBRITC requires a completed T2SCH569 for each eligible contract with an Eligible Research Institute"

RULE.PROV.ON.OBRITC_CASH_ONLY
  layer: eligibility | severity: blocker | source_area: provincial_calc
  message_template: "OBRITC eligible expenditures must be cash payments — in-kind contributions are not eligible"

RULE.PROV.ON.OBRITC_CAP_EXCEEDED
  layer: calculation | severity: blocker | source_area: provincial_calc
  message_template: "OBRITC annual eligible expenditure cap is $20M ($4M maximum credit) — reduce claimed amount"

RULE.PROV.ON.OBRITC_FEDERAL_ASSISTANCE_REDUCTION
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "OBRITC = government assistance — must reduce federal qualified SR&ED expenditure pool"

RULE.PROV.ON.ORDTC_NON_REFUNDABLE_ONLY
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "ORDTC is non-refundable — it reduces Ontario corporate income tax payable only; excess carries 3 back / 20 forward"

RULE.PROV.ON.NO_ON_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Ontario credit(s) require at least one cost line split with province_code = 'ON'"
```

### 4.8 Data Model Implications

- `cost_line_project_splits.province_code = 'ON'`
- `provincial_line_values` with `form_code` values: `'T2SCH566'`, `'T2SCH508'`, `'T2SCH568'`
- New table or JSONB on projects: `on_eri_contracts` (ERI code, contract date, payment amount) — drives T2SCH569 generation
- `claim_years` or `companies`: `specified_capital_amount` (numeric) for OITC phase-out
- `companies`: `prior_year_taxable_income_on` (numeric) for OITC phase-out calculation

### 4.9 Export Requirements

| Output | Form | Notes |
|--------|------|-------|
| T2SCH566 PDF | OITC | Filed with T2 |
| T2SCH508 PDF | ORDTC | Filed with T2 |
| T2SCH568 PDF | OBRITC | Filed with T2 |
| T2SCH569 PDF | Per ERI contract | One per eligible contract |

***

## Province 5: Quebec (QC)

### 5.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Tax Credit for Research, Development and Pre-Commercialization (CRIC — Crédit pour la recherche, l'innovation et la commercialisation) |
| Effective for | Taxation years beginning **after March 25, 2025** [^21][^22] |
| Administering authority | **Revenue Québec** (NOT CRA — separate provincial system) [^21] |
| Form number | **RD-1029.8.CR-T** [^23][^24] |
| Associated corp limit allocation | **RD-1029.8.EN** [^25] |
| Filed with | Québec corporate return **CO-17** [^26] |
| Refundable | **Yes — fully refundable** [^27][^22] |
| Eligible claimants | Corporations that carry on business in Quebec with an establishment in Quebec [^28] |
| Base rate | **20%** on all eligible expenditures above the exclusion threshold [^21][^22] |
| Enhanced rate | **30%** on the first **$1,000,000** of eligible expenditures above the exclusion threshold [^21][^22] |
| Eligible activities | SR&ED (same federal definition) + **pre-commercialization activities** [^29][^28] |
| Capital expenditures | **Eligible** under CRIC (equipment used in R&D or pre-commercialization) [^27] |

**Note on prior regime**: For taxation years beginning on or before March 25, 2025, the old Quebec credits (RD-1029.7, RD-1029.8.6, RD-1029.8.16.1, RD-1029.8.9.03) apply. The platform should support both regimes based on `claim_years.tax_year_start`.[^27][^21]

### 5.2 Filing Requirements

- **Forms required**: RD-1029.8.CR-T + CO-17 (provincial T2 equivalent)
- **T661 prerequisite**: Yes — federal scientific review determines R&D work eligibility; Revenue Québec harmonizes with federal R&D definition[^28]
- **Filing deadline**: 18 months after tax year end (aligned with federal)
- **Associated corp expenditure limit**: RD-1029.8.EN must be filed to allocate the $1M enhanced-rate expenditure limit among associated corporations[^25]
- **Carryforward**: Not applicable (fully refundable)
- **Revenue Québec submission**: CRIC is filed separately with Revenue Québec, not CRA

### 5.3 Calculation Mechanics

**Exclusion Threshold**:
```
exclusion_threshold = max(
    50,000,
    sum_over_RD_employees(basic_personal_amount × time_fraction_on_RD)
)
```
- 2025 basic personal amount = $18,751 per employee[^30][^31]
- Time fraction = proportion of employee's time spent on eligible R&D or pre-commercialization
- Example: 10 employees at 100% R&D → threshold = 10 × $18,751 = $187,510[^32]

**Credit Calculation**:
```
eligible_expenditures_above_threshold = max(0, qualified_QC_expenditures − exclusion_threshold)

IF eligible_expenditures_above_threshold ≤ 1,000,000:
    cric_credit = eligible_expenditures_above_threshold × 30%
ELSE:
    cric_credit = 1,000,000 × 30% + (eligible_expenditures_above_threshold − 1,000,000) × 20%
```

**Qualified QC expenditures** include:
- Salaries and wages of employees performing eligible R&D or pre-commercialization in Quebec[^28]
- Subcontractor payments for R&D or pre-commercialization in Quebec
- Capital equipment costs for R&D or pre-commercialization use[^27]
- Must be incurred in Quebec[^28]

**Assistance reductions**: Any government or non-government assistance attributable to CRIC expenditures must be subtracted from qualified expenditures before computing the credit.[^28]

**Pre-commercialization activities** (eligible under CRIC, unique to Quebec):
- Tests, technological validations, and studies for regulatory certification/registration for commercialization
- Prototype development and testing for performance validation to meet regulatory requirements
- Pilot plant testing to validate production processes for regulatory standards
- Product design activities
- Must be a continuation of eligible R&D activities undertaken in Quebec[^29][^28]

### 5.4 Project-Level Requirements

- **Province-of-expenditure**: Expenditures must be incurred in Quebec[^28]
- **Establishment requirement**: Corporation must operate a business in Quebec and have an establishment there[^27]
- **Project-by-project tracking**: CRIC does not use CRA's T661 project structure for its own form, but Revenue Québec harmonizes with federal R&D definitions
- **Pre-commercialization flag**: Each project must track whether any claimed expenditures relate to pre-commercialization activities (new CRIC category not present in federal T661)
- **Employee R&D time fraction**: Must be tracked per employee for exclusion threshold calculation[^31]

### 5.5 Assistance Interaction with Federal SR&ED

- CRIC = **government assistance** for federal purposes[^28]
- Reduces federal pool of deductible SR&ED expenditures and qualified SR&ED expenditure pool
- Interoperability: The CRIC exclusion threshold means small-expenditure Quebec companies may receive less provincial credit than expected — the federal claim is unaffected, but federal calculations must account for CRIC as assistance received

### 5.6 Review and Audit Risk Factors

- Exclusion threshold miscalculation (complex per-employee FTE calculation)
- Pre-commercialization activities claimed without demonstrating continuation from eligible R&D in Quebec
- Capital expenditures claimed without documentation of R&D/pre-commercialization use purpose
- Missing RD-1029.8.EN when associated corporations need to allocate the $1M enhanced-rate limit
- Filing RD-1029.8.CR-T with CRA instead of Revenue Québec
- Applying the new CRIC rates to tax years beginning before March 25, 2025

### 5.7 Platform Rule Engine Specification

```
RULE.PROV.QC.WRONG_REGIME_DATE
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "QC CRIC applies to tax years beginning after March 25, 2025 — use prior-regime forms (RD-1029.7 etc.) for earlier tax years"

RULE.PROV.QC.NO_FORM_CRIC
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "QC CRIC requires Form RD-1029.8.CR-T filed with Revenue Québec CO-17 return"

RULE.PROV.QC.REVENUE_QUEBEC_NOT_CRA
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "QC CRIC is administered by Revenue Québec — do NOT file with CRA; submit with CO-17 provincial return"

RULE.PROV.QC.EXCLUSION_THRESHOLD_MISSING
  layer: calculation | severity: blocker | source_area: provincial_calc
  message_template: "QC CRIC exclusion threshold requires per-employee R&D time fraction data — employee time tracking must be provided"

RULE.PROV.QC.PRECOMM_WITHOUT_RD_LINK
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "QC CRIC pre-commercialization activities must be a continuation of R&D carried out in Quebec — document the R&D-to-pre-commercialization link"

RULE.PROV.QC.ASSOCIATED_CORP_LIMIT
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "Associated corporations must share the $1M CRIC enhanced-rate expenditure limit — file RD-1029.8.EN"

RULE.PROV.QC.CAPITAL_DOCUMENTATION
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "QC CRIC capital equipment expenditures require documentation of R&D/pre-commercialization use percentage"

RULE.PROV.QC.ASSISTANCE_DEDUCTION
  layer: calculation | severity: blocker | source_area: provincial_calc
  message_template: "QC CRIC qualified expenditures must be reduced by any government or non-government assistance before computing the credit"

RULE.PROV.QC.NO_QC_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "QC credit requires at least one cost line split with province_code = 'QC'"

RULE.PROV.QC.FEDERAL_SCIENTIFIC_REVIEW
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "QC CRIC eligibility for R&D component relies on federal CRA scientific determination — ensure T661 Part 2 narratives are strong"
```

### 5.8 Data Model Implications

- `cost_line_project_splits.province_code = 'QC'`
- New per-project field: `qc_precomm_flag` (boolean) — tracks whether pre-commercialization expenditures are claimed
- New per-employee/project field: `qc_rd_time_fraction` (numeric 0.00–1.00) — required for exclusion threshold
- `provincial_line_values` with `form_code = 'RD-1029.8.CR-T'`
- `companies`: `qc_establishment_flag` (boolean)
- CRIC form is filed with CO-17, not CRA T2 — export bundle must flag this as a Revenue Québec submission

### 5.9 Export Requirements

| Output | Form | Filed With | Notes |
|--------|------|-----------|-------|
| RD-1029.8.CR-T PDF | CRIC claim | CO-17 (Revenue Québec) | Not filed with CRA |
| RD-1029.8.EN PDF (if applicable) | Associated corp limit allocation | CO-17 | One per associated group |
| T661 + T2SCH31 | Federal SR&ED | CRA with T2 | Still required; drives eligibility |

***

## Province 6: New Brunswick (NB)

### 6.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | New Brunswick Research and Development Tax Credit |
| Administering authority | Canada Revenue Agency |
| Form number | **T2SCH360** [^33][^34] |
| Refundable | **Yes — fully refundable** [^35][^36] |
| Rate | **15%** of eligible expenditures [^36] |
| Eligible claimants | All corporations with a permanent establishment in New Brunswick [^36] |

### 6.2 Filing Requirements

- **Forms required**: T2SCH360 + T661 (federal) + T2SCH31[^36]
- **T661 prerequisite**: Yes
- **Filing deadline**: 18 months after tax year end[^37]
- **Carryforward**: Not applicable (fully refundable)
- **Recapture**: Yes — property used in R&D that is disposed of or converted to commercial use triggers recapture; calculated on T2SCH360 and reported on Schedule 5, line 573[^36]

### 6.3 Calculation Mechanics

**Credit base**: Federal SR&ED eligible expenditures for R&D carried on in New Brunswick.[^36]

```
nb_credit = eligible_NB_expenditures × 15%
```

Eligible expenditures follow the federal definition (including proxy or traditional method as applicable). Standard assistance reductions apply.

### 6.4 Project-Level Requirements

- Province-of-expenditure: `province_code = 'NB'` on cost splits[^36]
- No separate NB project schedule required beyond T661

### 6.5 Assistance Interaction with Federal SR&ED

NB credit = government assistance; reduces federal QE pool. Standard treatment.

### 6.6 Review and Audit Risk Factors

- Missing T2SCH360 when NB expenditures in T661
- Missing recapture calculation on property disposal

### 6.7 Platform Rule Engine Specification

```
RULE.PROV.NB.NO_FORM_360
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NB credit requires T2SCH360 in the export bundle"

RULE.PROV.NB.NO_NB_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NB credit requires at least one cost line split with province_code = 'NB'"

RULE.PROV.NB.RECAPTURE_CHECK
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "NB SR&ED property disposed of or converted to commercial use requires recapture calculation on T2SCH360"

RULE.PROV.NB.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 must establish NB eligible expenditure base"

RULE.PROV.NB.ASSISTANCE_REDUCTION
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "NB qualified expenditures must be reduced by government/non-government assistance — verify assistance_items for NB projects"
```

### 6.8 Export Requirements

| Output | Form | Notes |
|--------|------|-------|
| T2SCH360 PDF | NB R&D Tax Credit | Filed with T2 |

***

## Province 7: Nova Scotia (NS)

### 7.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Nova Scotia Research and Development Tax Credit |
| Administering authority | Canada Revenue Agency |
| Form number | **T2SCH340** [^38][^39] |
| Refundable | **Yes — fully refundable** (applied first against NS taxes payable, excess refunded) [^38] |
| Rate | **15%** of eligible expenditures [^38] |
| Eligible claimants | All corporations with a permanent establishment in Nova Scotia [^38] |

### 7.2 Filing Requirements

- **Forms required**: T2SCH340 + T661 (federal) + T2SCH31[^38]
- **T661 prerequisite**: Yes
- **Filing deadline**: **18 months after corporation's tax year-end**[^38]
- **Carryforward**: Not applicable (fully refundable)
- **Recapture**: Yes — property disposed of or converted to commercial use; reported on T2SCH340 and Schedule 5 line 221[^38]
- **Renunciation**: Yes, in whole or in part, under s.41(7) of the Nova Scotia Income Tax Act[^38]

### 7.3 Calculation Mechanics

```
ns_credit = eligible_NS_expenditures × 15%
```

Eligible expenditures = federal SR&ED qualified expenditures for work carried on in Nova Scotia. Standard assistance reductions apply.

### 7.4 Platform Rule Engine Specification

```
RULE.PROV.NS.NO_FORM_340
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NS credit requires T2SCH340 in the export bundle"

RULE.PROV.NS.NO_NS_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NS credit requires at least one cost line split with province_code = 'NS'"

RULE.PROV.NS.RECAPTURE_CHECK
  layer: eligibility | severity: warning | source_area: provincial_calc
  message_template: "NS SR&ED property disposed of or converted to commercial use requires recapture on T2SCH340"

RULE.PROV.NS.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 required to establish NS eligible expenditure base"

RULE.PROV.NS.RENUNCIATION_AVAILABLE
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "NS credit may be renounced under s.41(7) NS Income Tax Act — consider if non-refundable optimization is needed"
```

### 7.5 Export Requirements

| Output | Form | Notes |
|--------|------|-------|
| T2SCH340 PDF | NS R&D Tax Credit | Filed with T2 |

***

## Province 8: Newfoundland and Labrador (NL)

### 8.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Scientific Research and Experimental Development Tax Credit (NL) |
| Administering authority | Canada Revenue Agency (on behalf of NL) |
| Form — corporations | **T2SCH301** [^40] |
| Form — individuals | **T1129** [^40][^41] |
| Refundable | **Yes — fully refundable** [^2][^42] |
| Rate | **15%** of eligible expenditures [^2][^42] |
| Eligible claimants | Taxpayers including corporations, individuals, beneficiaries of trusts, and members of partnerships with a permanent establishment in NL [^42] |

### 8.2 Filing Requirements

- **Forms required**: T2SCH301 (corporations) or T1129 (individuals) + T661 (federal) + T2SCH31[^40]
- **Filing deadline**: 12 months after the filing due date for the income tax return = **18 months after year-end for corporations**[^2]
- **Carryforward**: Not applicable (fully refundable)

### 8.3 Calculation Mechanics

```
nl_credit = eligible_NL_expenditures × 15%
```

**⚠️ UNIQUE RULE**: NL eligible expenditures are **NOT reduced by government and non-government assistance** (except with respect to HST/GST input tax credits). This is the only province with this exception.[^2]

**However**: The NL credit itself is government assistance and **does** reduce the federal pool of deductible SR&ED expenditures and qualified SR&ED expenditures.[^2]

**Practical implication**: NL companies with grants (IRAP, etc.) can still claim the full 15% NL credit on their gross eligible expenditures, without reduction for the grant — but their federal claim still gets reduced.

### 8.4 Project-Level Requirements

- Province-of-expenditure: `province_code = 'NL'` on cost splits
- No additional NL project schedule

### 8.5 Platform Rule Engine Specification

```
RULE.PROV.NL.NO_FORM_301
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NL credit requires T2SCH301 in the export bundle (corporations)"

RULE.PROV.NL.NO_NL_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "NL credit requires at least one cost line split with province_code = 'NL'"

RULE.PROV.NL.ASSISTANCE_NOT_DEDUCTED_FROM_NL
  layer: calculation | severity: info | source_area: provincial_calc
  message_template: "NL UNIQUE RULE: eligible expenditures are NOT reduced by government or non-government assistance for NL credit purposes (except GST/HST ITCs)"

RULE.PROV.NL.NL_CREDIT_IS_FEDERAL_ASSISTANCE
  layer: calculation | severity: warning | source_area: provincial_calc
  message_template: "NL credit = government assistance for federal purposes — must reduce federal qualified SR&ED expenditure pool"

RULE.PROV.NL.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 required to establish NL eligible expenditure base"

RULE.PROV.NL.INDIVIDUALS_USE_T1129
  layer: form | severity: info | source_area: provincial_calc
  message_template: "Individuals, trust beneficiaries, and partners claiming NL credit use Form T1129, not T2SCH301"
```

### 8.6 Data Model Implications

- New boolean flag needed: `nl_exclude_assistance_reduction` = TRUE (hardcoded province-specific rule)
- This must be handled in `provincialCalcService.runProvincialCalculation()` as a special case when `province_code = 'NL'`

### 8.7 Export Requirements

| Output | Form | Notes |
|--------|------|-------|
| T2SCH301 PDF | NL R&D Tax Credit (corps) | Filed with T2 |
| T1129 (if applicable) | NL R&D Tax Credit (individuals) | Filed with T1 |

***

## Territory 1: Yukon (YT)

### 9.1 Program Overview

| Field | Value |
|-------|-------|
| Official program name | Yukon Research and Development Tax Credit |
| Administering authority | Canada Revenue Agency |
| Form — corporations | **T2SCH442** [^43][^44] |
| Form — individuals | **T1232** [^45] |
| Refundable | **Yes — fully refundable** (applied first against taxes payable) [^43] |
| Base rate | **15%** of eligible expenditures [^43] |
| Enhanced rate | Additional **5%** on eligible expenditures paid to **Yukon University** [^43] |
| Maximum effective rate | **20%** (when all SR&ED is contracted to Yukon University) [^45] |
| Eligible claimants | Corporations with a permanent establishment in Yukon [^43] |

### 9.2 Filing Requirements

- **Forms required**: T2SCH442 + T661 (federal) + T2SCH31[^43]
- **Filing deadline**: 18 months after tax year end[^43]
- **Carryforward**: Not applicable (fully refundable)

### 9.3 Calculation Mechanics

**Credit base**: Federal qualified expenditures (as defined in s.127(9) of the federal ITA), incurred in the Yukon.[^45]

```
yt_credit = eligible_YT_expenditures × 15%
           + YT_University_payments × 5%
total_yt_credit = sum of above
```

### 9.4 Platform Rule Engine Specification

```
RULE.PROV.YT.NO_FORM_442
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Yukon credit requires T2SCH442 in the export bundle"

RULE.PROV.YT.NO_YT_EXPENDITURES
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Yukon credit requires at least one cost line split with province_code = 'YT'"

RULE.PROV.YT.YUKON_U_BONUS_FLAG
  layer: eligibility | severity: info | source_area: provincial_calc
  message_template: "Payments to Yukon University qualify for an additional 5% credit — verify and flag YT University contract payments"

RULE.PROV.YT.FEDERAL_BASE_REQUIRED
  layer: form | severity: blocker | source_area: provincial_calc
  message_template: "Federal T661 required to establish Yukon eligible expenditure base"

RULE.PROV.YT.YUKON_U_CONTRACT_MISSING
  layer: form | severity: warning | source_area: provincial_calc
  message_template: "5% Yukon University bonus claimed but no Yukon University contract recorded — attach contract documentation"
```

### 9.5 Data Model Implications

- `cost_line_project_splits.province_code = 'YT'`
- New flag: `yt_yukon_university_payment` (boolean or amount) on `cost_line_items` or `cost_line_project_splits`
- `provincial_line_values` with `form_code = 'T2SCH442'`

### 9.6 Export Requirements

| Output | Form | Notes |
|--------|------|-------|
| T2SCH442 PDF | Yukon R&D Tax Credit | Filed with T2 |

***

## Jurisdictions with No Provincial SR&ED Program

### Prince Edward Island (PE)
No provincial SR&ED tax credit program exists. Federal SR&ED credit is available. No provincial form required.[^46][^37]

**Platform rule**:
```
RULE.PROV.PE.NO_PROGRAM
  layer: form | severity: info | source_area: provincial_calc
  message_template: "Prince Edward Island has no provincial SR&ED tax credit — federal SR&ED credit only applies"
```

### Northwest Territories (NT)
No territorial SR&ED tax credit program exists. Federal SR&ED credit applies.[^47]

**Platform rule**:
```
RULE.PROV.NT.NO_PROGRAM
  layer: form | severity: info | source_area: provincial_calc
  message_template: "Northwest Territories has no territorial SR&ED tax credit — federal SR&ED credit only applies"
```

### Nunavut (NU)
No territorial SR&ED tax credit program exists. Federal SR&ED credit applies.[^46][^47]

**Platform rule**:
```
RULE.PROV.NU.NO_PROGRAM
  layer: form | severity: info | source_area: provincial_calc
  message_template: "Nunavut has no territorial SR&ED tax credit — federal SR&ED credit only applies"
```

***

## Consolidated Data Model Implications

### New Fields Required

The following fields must be added to the existing schema to support all provinces:

**On `companies` table**:
```sql
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS ccpc_flag boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS specified_capital_amount numeric(14,2),  -- ON OITC phase-out
  ADD COLUMN IF NOT EXISTS prior_year_taxable_income_on numeric(14,2),  -- ON OITC phase-out
  ADD COLUMN IF NOT EXISTS qc_establishment_flag boolean DEFAULT false;
```

**On `claim_years` table**:
```sql
ALTER TABLE claim_years
  ADD COLUMN IF NOT EXISTS mb_renunciation_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mb_renunciation_date date,
  ADD COLUMN IF NOT EXISTS sk_renunciation_flag boolean DEFAULT false;
```

**On `projects` table**:
```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS mb_qualifying_institute_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS qc_precomm_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS on_eri_contract_flag boolean DEFAULT false;
```

**On `cost_line_project_splits` table**:
`province_code` already exists per the existing schema — ensure a NOT NULL constraint with `'AB'` default.

**New table: `provincial_employee_time`** (for Quebec CRIC exclusion threshold):
```sql
CREATE TABLE IF NOT EXISTS provincial_employee_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id),
  project_person_id uuid NOT NULL REFERENCES project_people(id),
  province_code text NOT NULL DEFAULT 'QC',
  rd_time_fraction numeric(4,3) NOT NULL,  -- 0.000 to 1.000
  created_at timestamptz DEFAULT now()
);
```

**New table: `on_eri_contracts`** (for Ontario OBRITC T2SCH569):
```sql
CREATE TABLE IF NOT EXISTS on_eri_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  claim_year_id uuid NOT NULL REFERENCES claim_years(id),
  eri_code text NOT NULL,          -- Ontario ERI code from approved list
  eri_name text NOT NULL,
  contract_date date,
  payment_amount numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Provincial Calculation Module Interface

Each `provincialCalcService.runProvincialCalculation(supabase, yearId, provinceCode)` call must implement province-specific logic. The calculation engine should use a strategy pattern:

```typescript
interface ProvinceCalcStrategy {
  provinceCode: string;
  formCode: string;
  creditRate: number;
  refundableCap?: number;  // BC, SK: expenditure limit
  hasEnhancedRate?: boolean;  // QC CRIC, YT
  assistanceReducesBase: boolean;  // false for NL
  hasRecapture: boolean;  // BC, NB, NS
  hasRenunciation: boolean;  // SK, MB, NS
  requiresSeparateAuthority: boolean;  // true for QC (Revenue Québec)
  calculateCredit(expenditures: ProvinceExpenditures): ProvinceCreditResult;
}
```

### Province Code Reference

| Province | Code | Program | Form | Refundable | Rate | Administered By |
|----------|------|---------|------|-----------|------|----------------|
| BC | BC | BC SR&ED | T666 | Partial (CCPC up to limit) | 10% | CRA |
| SK | SK | SK R&D | T2SCH403 | Partial (CCPC ≤$1M) | 10% | CRA |
| MB | MB | MB R&D | T2SCH380 | 50% (100% with QRI) | 15% | CRA |
| ON (OITC) | ON | OITC | T2SCH566 | Yes | 8% | CRA |
| ON (ORDTC) | ON | ORDTC | T2SCH508 | No | 3.5% | CRA |
| ON (OBRITC) | ON | OBRITC | T2SCH568/569 | Yes | 20% | CRA |
| QC | QC | CRIC | RD-1029.8.CR-T | Yes | 20%/30% | Revenue Québec |
| NB | NB | NB R&D | T2SCH360 | Yes | 15% | CRA |
| NS | NS | NS R&D | T2SCH340 | Yes | 15% | CRA |
| NL | NL | NL SR&ED | T2SCH301/T1129 | Yes | 15% | CRA |
| YT | YT | YT R&D | T2SCH442 | Yes | 15% (+5% YU) | CRA |
| PEI | PE | None | — | — | — | — |
| NWT | NT | None | — | — | — | — |
| NU | NU | None | — | — | — | — |

***

## Cross-Province Assistance Reduction Rules

All provincial credits (except NL) are government assistance and must reduce federal qualified SR&ED expenditures. The reduction order matters:

1. Compute federal QE (before provincial assistance)
2. Determine all expected provincial credits (using the QE before provincial reduction)
3. Subtract expected provincial credits from federal QE pool
4. Recompute federal ITC on reduced QE base
5. If provincial credits change (e.g., renunciation elected), iterate

**NL exception**: NL credit does not reduce NL-based eligible expenditures, but does reduce the federal QE pool.[^2]

**Manitoba renunciation**: If corporation renounces non-refundable MB credit **before the T2 filing deadline (6 months from year-end)**, the renounced portion is NOT government assistance and does NOT reduce federal QE. The platform must surface this optimization before the T2 filing deadline.[^11]

**Quebec (Revenue Québec)**: CRIC is filed with CO-17, not T2. The CRIC credit expected to be received must still be deducted as assistance on the federal T661/T2SCH31 at the time it is "entitled to be received."

---

## References

1. [[PDF] cit-007-british-columbia-scientific-research-experimental ... - Gov.bc.ca](https://www2.gov.bc.ca/assets/gov/taxes/income-taxes/publications/cit-007-british-columbia-scientific-research-experimental-development-tax-credit.pdf) - To apply for the credit, complete the British Columbia Scientific Research and. Experimental Develop...

2. [Provincial and territorial research and development (R&D) tax credits](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/provincial-territorial-research-development-tax-credits.html) - The Nova Scotia R&D tax credit is administered by the Canada Revenue Agency and is fully refundable ...

3. [Scientific research and experimental development tax credit ...](https://www2.gov.bc.ca/gov/content/taxes/income-taxes/corporate/credits/scientific-research-development/faqs) - The refundable credit cannot exceed 10% of the expenditure limit, which is generally $3 million. The...

4. [Scientific research and experimental development tax credit](https://www2.gov.bc.ca/gov/content/taxes/income-taxes/corporate/credits/scientific-research-development) - The B.C. scientific research and experimental development (SR&ED) tax credit is for qualifying corpo...

5. [British Columbia Canada SR&ED Tax Credit Programs - Ryan](https://funding.ryan.com/government-funding/research-development/sred/british-columbia-provincial-sred-tax-credit/) - The British Columbia SR&ED tax credit is available to corporations and partnerships that have a perm...

6. [T2SCH403 Saskatchewan Research and Development Tax Credit](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch403.html) - A schedule for Saskatchewan corporations who have made eligible expenditures for scientific research...

7. [Saskatchewan research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/saskatchewan-provincial-corporation-tax/saskatchewan-research-development-tax-credit.html) - The credit is equal to 10% of eligible expenditures. For expenditures incurred before April 1, 2015,...

8. [Saskatchewan Research and DevelopmentTax Credit (Provincial ...](https://funding.ryan.com/government-funding/research-development/sred/saskatchewan-sred/) - CCPC's may earn a refundable Investment Tax Credit (ITC) at the rate of 10% on qualified SR&ED expen...

9. [T2SCH380 Manitoba Research and Development Tax Credit](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch380.html) - Use this schedule if you are a corporation with a permanent establishment in Manitoba that has made ...

10. [Manitoba research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/manitoba-provincial-corporation-tax/manitoba-research-development-tax-credit.html) - The amount of the credit is equal to 15% of eligible expenditures. Eligible expenditures include cur...

11. [[PDF] Manitoba Research and Development (R&D) Tax Credit](https://www.gov.mb.ca/finance/pubs/mbrandd.pdf) - The six month filing deadline for renouncing Manitoba's credit and for determining government assist...

12. [Manitoba Research and Development Tax Credit (Provincial SR&ED)](https://funding.ryan.com/government-funding/research-development/sred/manitoba-sred/) - The Manitoba R&D tax credit claim must be submitted within one year after the tax return filing dead...

13. [[PDF] Ontario Innovation Tax Credit (2016 and later tax years)](https://www.cchwebsites.com/content/pdf/tax_forms/ca/en/t2sch566_en.pdf) - Use this schedule to claim an Ontario innovation tax credit (OITC). A qualifying corporation must: –...

14. [T2SCH566 Ontario Innovation Tax Credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch566.html) - Use this form to claim an Ontario innovation tax credit (OITC). Ways to get the form. Download and f...

15. [Ontario innovation tax credit | ontario.ca](http://www.ontario.ca/page/ontario-innovation-tax-credit) - For taxation years that commence after May 31, 2016, the tax credit rate is 8% ... Download Schedule...

16. [Ontario research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/ontario-provincial-corporation-tax/ontario-research-development-tax-credit.html) - The amount of the non-refundable credit is equal to 3.5% of eligible expenditures incurred by a corp...

17. [Ontario research and development tax credit | ontario.ca](http://www.ontario.ca/page/ontario-research-and-development-tax-credit) - For taxation years that commence after May 31, 2016, the tax credit rate is 3.5% · The tax credit ra...

18. [Ontario business-research institute tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/ontario-provincial-corporation-tax/ontario-business-research-institute-tax-credit.html) - The business-research institute tax credit is a 20% refundable tax credit based on qualified expendi...

19. [Ontario Business Research Institute Tax Credit (OBRITC)](https://hellodarwin.com/business-aid/programs/ontario-business-research-institute-tax-credit) - Claim a 20% refundable tax credit for qualified expenditures ... Who is eligible for the Ontario Bus...

20. [What are OITC, OBRITC, & ORDTC Provincial SR&ED Tax Credits?](https://funding.ryan.com/blog/government-funding/oitc-obritc-ordtc-ontario-provincial-sred/) - This program is available for all open tax years, contingent on filing a federal SR&ED claim within ...

21. [The CRIC, Quebec's Research and Development (R&D) Tax Credit](https://t2inc.ca/en/blog/quebec-research-and-development-tax-credit) - The CRIC replaces Quebec's former R&D tax credits as of March 25, 2025. The base rate is 20% and may...

22. [Tax credit for R&D, innovation and pre-commercialization](https://www.revenuquebec.ca/en/press-room/tax-news/details/2025-07-09/tax-credit-for-rd-innovation-and-pre-commercialization/) - A new refundable tax credit for R&D, innovation and pre-commercialization (the CRIC) to improve the ...

23. [Tax Credit for R&D and Pre-Commercialization RD-1029.8.CR-T](https://www.revenuquebec.ca/en/online-services/forms-and-publications/current-details/rd-1029-8-cr-t/) - RD-1029.8. CR-T. This form must be filed by any corporation that is claiming the tax credit for R&D ...

24. [RD-1029.8.CR, Tax Credit for R&D and Pre-Commercialization](https://support.cchifirm.ca/en/assistance/T2/2025/content/taxhelp/rd_1029_8_cr.htm) - Complete a separate copy of Form RD-1029.8.CR for each entity (corporation, partnership or interpose...

25. [Agreement regarding the expenditure limit for the tax credit for R&D ...](https://support.cchifirm.ca/en/assistance/T2/2025/content/taxhelp/rd_1029_8_en.htm) - This form allows you to allocate the expenditure limit (maximum: $1,000,000) between the associated ...

26. [Quick Reference Guide 2025: Quebec CDAE Tax Credit - Boast.ai](https://www.boast.ai/en-ca/resources/guides/quick-reference-guide-2025-quebec-cdae-tax-credit) - Complete Form CO-1029.8.36.DA for each eligible employee · Include all Investissement Québec certifi...

27. [Québec's New Provincial R&D Tax Credits](https://www.sreducation.ca/quebec-rd-tax-credits/) - Tax Credit for Fees and Dues Paid to a Research Consortium (RD 1029.8. 9.03): Up to 30% refundable c...

28. [Tax credit for research, innovation and commercialization (CRIC)](https://www.finances.gouv.qc.ca/department/support_financial_sector_enterprises/tax_assistance_innovation/cric.asp) - To be eligible for the CRIC, pre-commercialization activities must be undertaken in conjunction with...

29. [A New Era for Quebec's SR&ED Program: Eligible Activities and ...](https://ryan.com/canada/about-ryan/articles/2025/sred-program-update/) - In all cases, pre-commercialization activities must constitute a continuation of eligible R&D activi...

30. [Quebec's SR&ED Tax Credit Overhaul: A Simpler, Stronger Incentive](https://ryan.com/canada/about-ryan/articles/2025/sred-tax-credit-quebec-overhaul/) - For example, if a business has 10 employees working in R&D in 2025, and they are used 100% in R&D ac...

31. [Quebec's SR&ED Tax Credit Overhaul: Meet the New CRIC Incentive](https://funding.ryan.com/blog/government-funding/quebec-sred-tax-credit-cric-overhaul/) - The threshold is now the greater of $50,000 or the basic personal amount per employee, prorated base...

32. [Quebec CRIC Tax Credit: What You Need to Know | Avinova](https://www.avinova.ca/en/blog/cric-tax-credit-quebec) - Quebec's CRIC Tax Credit: What You Need to Know ; Eligible expenses: $800,000; Exclusion threshold: ...

33. [[PDF] NEW BRUNSWICK RESEARCH AND DEVELOPMENT TAX ...](https://www.cchwebsites.com/content/pdf/tax_forms/ca/en/t2sch360.pdf) - calculate a refundable New Brunswick research and development (R&D) tax credit ... Refundable curren...

34. [T2SCH360 New Brunswick Research and Development Tax Credit](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch360.html) - Use this schedule if you are a corporation with a permanent establishment in New Brunswick that has ...

35. [Research and Development Tax Credit - Finance](https://www2.gnb.ca/content/gnb/en/departments/finance/taxes/taxcredit.html) - New Brunswick's Research and Development (R&D) tax credit has been increased from 10 percent to 15 p...

36. [New Brunswick research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/new-brunswick-provincial-corporation-tax/new-brunswick-research-development-tax-credit.html) - File a completed Schedule 360, New Brunswick Research and Development Tax Credit, with your return. ...

37. [Atlantic Canada SR&ED Tax Credit Programs - Ryan](https://funding.ryan.com/government-funding/research-development/sred/atlantic-provincial-sred-tax-credits/) - Most of the Atlantic Provinces in Canada offer provincial variants of the Canadian federal Scientifi...

38. [Nova Scotia research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/nova-scotia-provincial-corporation-tax/nova-scotia-research-development-tax-credit.html) - The credit is equal to 15% of eligible expenditures. The credit is fully refundable, but must be app...

39. [Schedule 340, Nova Scotia Research and Development Tax Credit](https://support.cchifirm.ca/en/assistance/T2/2023/content/taxhelp/ann340.htm) - The credit is 15% of qualified expenditures and reduces Nova Scotia tax otherwise payable. Any remai...

40. [[PDF] Newfoundland and Labrador Research and Development Tax ...](https://www.cchwebsites.com/content/pdf/tax_forms/ca/en/t1129_en.pdf) - Use this form to calculate your Newfoundland and Labrador research and development (R&D) tax credit....

41. [T1129 Newfoundland and Labrador Research and Development ...](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t1129.html) - Use this form to calculate your Newfoundland and Labrador research and development tax credit (indiv...

42. [Scientific Research and Experimental Development Tax Credit](https://www.gov.nl.ca/fin/tax-programs-incentives/business/scientificresearch/) - This refundable tax credit allows you to claim 15% of your eligible research and development expendi...

43. [Yukon research and development tax credit - Canada.ca](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/provincial-territorial-corporation-tax/yukon-territorial-corporation-tax/yukon-research-development-tax-credit.html) - You can claim this credit if you have a permanent establishment in the Yukon at any time in the year...

44. [T2SCH442 Yukon Research and Development Tax Credit](https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2sch442.html) - A schedule for corporations who have incurred eligible expenditures ... Ways to get the form. Downlo...

45. [[PDF] Yukon Research and Development Tax Credit (Individuals)](https://www.cchwebsites.com/content/pdf/tax_forms/ca/en/t1232_en.pdf) - Yukon Research and Development Tax Credit. (Individuals). Complete this form to calculate your refun...

46. [SR&ED Tax Credits in Canada](https://abgi-canada.com/en/sred-tax-credits-in-canada/) - Only the provinces and territories of Prince Edward Island, Nunavut, and the Northwest Territories d...

47. [Canadian Territory SR&ED Tax Credits - Ryan](https://funding.ryan.com/government-funding/research-development/sred/canadian-territory-sred-tax-credits/) - Currently, there currently is not a territorial SR&ED variant for the Northwest Territories, or Nuna...

