# CRA SR&ED: Rules, Review Processes & Optimization for Maximum Claim Success

## Executive Summary

Canada's Scientific Research and Experimental Development (SR&ED) program is one of the world's most generous R&D incentive regimes, delivering billions in annual credits to Canadian businesses. For claims to survive CRA scrutiny — including the ~20% of claims selected for formal review each year — preparers must understand the precise eligibility framework, the mechanics of qualified expenditure calculation, the review triggers and process, and province-specific stacking (particularly Alberta's Innovation Employment Grant). This report synthesizes CRA policy, practitioner guidance, and recent legislative changes to equip the execom SR&ED OS platform with the intelligence needed to maximize claim success rates. Where these rules intersect with build decisions in the OS platform, specific system design implications are called out.[^1][^2]

***

## Part 1: Eligibility Framework

### 1.1 The Two-Question Test (Current CRA Policy)

As of August 13, 2021, CRA replaced its prior five-question eligibility test with a simplified two-part framework. The same statutory definition from subsection 248(1) of the *Income Tax Act* applies, but the evaluative lens is now framed as:[^3][^4]

- **The "Why"**: Work must be undertaken with the purpose of achieving an *advancement in scientific or technological knowledge*. Success is not required — even learning that a hypothesis fails can qualify.[^5]
- **The "How"**: Work must be conducted through a *systematic investigation or search by means of experimentation or analysis*. A systematic investigation consists of: (1) defining a problem; (2) generating a hypothesis; (3) testing via experiment or analysis; (4) drawing conclusions.[^4]

Both requirements must be satisfied simultaneously. The five original questions still remain relevant for determining eligibility, but the two-part framework is now the primary lens CRA reviewers apply.[^4]

> **Platform implication**: The four narrative section keys in `project_narrative_sections` (`technical_uncertainty`, `systematic_investigation`, `advancement`, `project_logistics`) map directly to these requirements. The `review_rules` seed correctly flags narratives that lack experimental chronology or contain commercial language. Ensure narrative review logic scores against both the "why" (uncertainty + advancement) and the "how" (systematic investigation) pillars.

### 1.2 The Three Classic Criteria

Under the prior framework — which reviewers still reference when assessing claims — three criteria define eligible SR&ED work:[^6][^7]

1. **Technological Uncertainty**: The problem cannot be resolved using *generally available* scientific or technological knowledge. This is assessed against the claimant's knowledge base *plus* reasonably available public knowledge. Critically: complexity alone is not uncertainty. A project that is merely difficult or uses well-established techniques is routine engineering, not SR&ED.[^8][^9]
2. **Systematic Investigation**: An iterative, hypothesis-driven process was followed. CRA wants to see dead ends, failed experiments, and course corrections — not just the successful result.[^2]
3. **Technological Advancement**: The work generated new knowledge or capability that did not exist before, or improved existing materials, devices, products, or processes.[^7]

### 1.3 The Three Types of Eligible SR&ED

| Type | Definition | Common Examples |
|------|-----------|-----------------|
| **Basic Research** | Advancement of scientific knowledge, no specific practical application in view | Fundamental algorithm research, materials science |
| **Applied Research** | Advancement of scientific knowledge with a specific practical application | Research into ML inference efficiency for a defined class of problem |
| **Experimental Development** | Work to achieve technological advancement — new or improved materials, devices, products, or processes (including incremental improvements) | Software platform optimization, new protocol design, hardware integration |

The vast majority of software and technology company claims fall under experimental development. Incremental improvements are explicitly eligible, which is important for iterative software product development.[^1]

### 1.4 Eligible Support Work

Work that directly and commensurately supports core SR&ED activities is eligible as *support work*, provided it would not be eligible on its own:[^10][^11]

- Engineering and design
- Operations research
- Mathematical analysis
- Computer programming
- Data collection (only when directly supporting SR&ED, not routine business operations)
- Testing
- Psychological research

### 1.5 Excluded Work — Hard Stops

CRA explicitly excludes the following:[^11][^10]

- Market research or sales promotion
- Quality control or **routine testing** of materials, devices, products, or processes
- Research in social sciences or humanities
- Prospecting, exploring, or drilling for minerals, petroleum, or gas
- **Commercial production** of a new or improved material, device, or product
- Style changes
- **Routine data collection**

> **Key nuance**: If data collection serves both SR&ED and routine business operations, only the SR&ED-purposed portion is eligible. This commonly creates issues in software companies that track analytics as both product telemetry and experimental data.[^10]

### 1.6 Software-Specific Eligibility Nuances

Software development presents unique challenges because much work looks like routine development to a CRA reviewer. Eligible software SR&ED includes:[^12]

- Development of new operating systems or significant extensions to existing OS
- New generic methods of capturing, transmitting, storing, retrieving, manipulating, searching, or securing data
- Development of software for new types of hardware with conflicts between hardware and software
- New programming languages or software development tools, or significant extensions to existing languages[^12]

Critical misconception: using open-source software does not disqualify a claim if the company is extending or modifying it to overcome limitations or deficiencies. Approximately 80% of claims today involve some open-source code and remain eligible.[^12]

Bug fixes, performance optimizations using established libraries, UI/UX work, and standard integration work are generally **not** eligible unless the underlying problem generates genuine technological uncertainty that cannot be resolved with existing knowledge.

***

## Part 2: Qualified Expenditures & Calculation Rules

### 2.1 Expenditure Categories

| Category | Proxy Method | Traditional Method | Notes |
|----------|-------------|-------------------|-------|
| **Salaries/wages (directly engaged)** | Eligible for ITC; included in salary base for PPA | Eligible for ITC; deductible SR&ED expenditure | Core category for most companies[^13] |
| **Specified employee salaries** | Eligible, capped at 5× YMPE | Same cap applies | See section 2.3[^14] |
| **Other salary (supervisory/support)** | Covered by PPA; not separately claimed | Eligible as overhead expenditure | Under proxy, these salaries are absorbed into the 55% PPA[^13] |
| **Materials consumed** | Eligible for ITC; deductible SR&ED | Same | Must be consumed (destroyed) or transformed in SR&ED work |
| **Materials transformed** | Eligible for ITC; deductible SR&ED | Same | Materials incorporated into the product; fair market value at consumption |
| **Arm's length contracts** | 80% eligible for ITC | Same | 20% reduction applies[^15] |
| **Non-arm's length contracts** | 80% eligible, look-through rule applies | Same | Related party treatment; look-through reduces eligible amount[^16] |
| **Third-party payments** | 80% eligible | Same | Must be for SR&ED performed in Canada[^13] |
| **Overhead** | Replaced by PPA (55% of salary base) | Must be directly related and incremental | Major decision driver[^17] |
| **Capital expenditures** | Restored effective Dec 16, 2024 (see 2.5) | Same restoration | Recently reinstated by Budget 2025[^18] |

### 2.2 Proxy vs. Traditional Method — Decision Framework

The choice of method is made once per tax year and cannot be changed mid-year. The method is elected on **Line 160 of Form T661**. If no election is made, the traditional method is the default.[^19]

**Proxy Method**
- The Prescribed Proxy Amount (PPA) = **55% of the qualifying salary base**[^17][^19]
- The PPA replaces all overhead expenditures — no need to track utilities, rent allocated to SR&ED, support staff salaries, etc.[^20]
- PPA is included in *qualified* expenditures for ITC calculation but **not** in the pool of deductible SR&ED expenditures[^13]
- Strongly preferred for most small and medium companies; simpler to administer and often yields a higher ITC[^19]

**Traditional Method**
- Actual overhead and other expenditures that are *directly related* and *incremental* to SR&ED are claimed
- Included in both the deductible SR&ED pool AND the qualified expenditure pool for ITC[^13]
- Advantageous only when actual overhead exceeds what the 55% PPA would yield — typically large manufacturers or companies with significant SR&ED-specific real estate/equipment
- Requires extensive contemporaneous tracking of overhead attribution[^17]

**Numerical Example (from CRA policy)**:[^13]

| Item | Traditional | Proxy |
|------|------------|-------|
| Directly-engaged salaries | $100,000 | $100,000 |
| Materials | $15,000 | $15,000 |
| Overhead | $50,000 | — |
| PPA (55% of $100K) | — | $55,000 |
| Total qualified expenditures | $165,000 | $170,000 |
| ITC at 35% | **$57,750** | **$59,500** |

> **Platform implication**: The `method_election` field on `claim_years` captures this choice. The `federalCalcService.runFederalCalculation()` function must branch its logic based on this flag. The PPA calculation is: `PPA = salary_base × 0.55` — but this 55% rate is a regulatory prescription that *can* change (it was reduced from 65% in 2014). Never hardcode 0.55 as a magic constant; it should be a configurable parameter in `review_rules` or a constants file.

### 2.3 Specified Employee Rules — Critical Nuances

A **specified employee** is anyone who:[^21][^14]
- Does not deal at arm's length with the employer, OR
- Owns, directly or indirectly, 10% or more of any class of shares of the employer or a related corporation
- Includes relatives of specified shareholders (spouse, siblings, parents)

**Salary cap**: The maximum claimable salary for a specified employee is **5 times the Year's Maximum Pensionable Earnings (YMPE)**. For 2025, the YMPE is $71,300, making the maximum claimable salary approximately $356,500. This is prorated for the number of days the person is a specified employee during the year.[^22][^14]

**Associated corporations**: If a specified employee works for multiple associated corporations, the aggregate SR&ED salary claimed across all associated corporations cannot exceed 5× YMPE. An allocation agreement using **Form T1174** must be filed by each associated corporation's reporting deadline — failure to file T1174 means the salary is deemed *not* to be an SR&ED expenditure.[^14]

**No bonuses**: Only salary or wages qualify for specified employees — performance bonuses are excluded.[^22]

**Proxy method interaction**: Under the proxy method, the specified employee's salary (up to the cap) is included in the salary base to compute the PPA. Under the traditional method, the salary itself is a direct SR&ED expenditure plus it generates overhead claims.[^22]

> **Platform implication**: The `project_people` table with `person_type` values of `employee/contractor/subcontractor/consultant` and the `employer_type` of `claimant/arms_length/non_arms_length` captures the relationship. A review rule should flag any person identified as a company owner or shareholder for the specified employee cap check. The `cost_line_classifications` table's `specified_employee` category maps directly to this.

### 2.4 Assistance and Contract Payments — Reduction Rules

Government and non-government assistance **reduces qualified SR&ED expenditures on a project-by-project basis**. The reduction applies to the lesser of:[^23]
- Total assistance for that project (received, entitled to receive, or reasonably expected to receive by filing-due date)
- Total project expenditures

Key rules:[^23]
- Assistance for one project cannot reduce expenditures of another project
- Contract payments received by the claimant (as a performer) also reduce the claimant's qualified expenditures — the "look-through rule"
- When assistance exceeds project expenditures, qualified expenditures for that project are reduced to nil

**What constitutes government assistance**: grants, subsidies, forgivable loans, deductions, allowances, and any form of benefit under a government program. This includes the Alberta Innovation Employment Grant (IEG) itself — receiving IEG reduces the federal qualified expenditure base for that project.

> **Platform implication**: The `assistance_items` table with `assistance_type` values (`government_grant/government_assistance/non_government_assistance/contract_payment`) is correctly designed. The federal calculation waterfall must deduct assistance amounts *per project* before computing qualified expenditures, not in aggregate.

### 2.5 Capital Expenditures — Restored Eligibility (Post-December 15, 2024)

For taxation years beginning after December 15, 2024, Budget 2025 (implemented via Bill C-15) **reinstated capital expenditure eligibility** for SR&ED, returning to pre-2014 rules. This means:[^24][^18]

- Eligible capital property acquired after December 15, 2024, or lease costs first becoming payable after that date, can be included in both the SR&ED income deduction and the ITC calculation
- Under the proxy method (pre-2014): capital was eligible for ITC but not deductible as SR&ED; this distinction should be verified against Bill C-15 implementing language
- For equipment primarily used in SR&ED, this significantly increases the claimable pool

> **Platform implication**: This is a material change. The `cost_line_classifications` category list may need to be extended to include `capital_equipment_post_dec2024` or similar. For any claim year with a `tax_year_start` after December 15, 2024, the calculation service needs to handle capital expenditures. The `TODO` in `federalCalcService` should explicitly flag this.

***

## Part 3: ITC Rates and Refundability

### 3.1 Current Rate Structure (Pre-Budget 2025 Enhancement)

| Entity Type | ITC Rate | Refundable | Expenditure Limit |
|-------------|----------|------------|-------------------|
| **CCPC** | 35% | 100% refundable | Up to $3M of qualified expenditures[^25] |
| **CCPC** | 15% | 40% refundable | Expenditures over $3M or after phase-out[^26] |
| **Non-CCPC private corporation** | 15% | Not refundable | N/A[^26] |
| **Unincorporated / individual / trust** | 15% | 40% refundable | N/A[^26] |

The $3M expenditure limit begins to phase out when a CCPC's taxable capital reaches $10M, reaching nil at $50M.[^25]

### 3.2 Budget 2025 Enhancements (Effective Tax Years Beginning After December 15, 2024)

The November 2025 Fall Economic Statement and Bill C-15 introduced significant enhancements:[^27][^28]

| Change | Old Rule | New Rule |
|--------|----------|----------|
| **Enhanced rate expenditure limit** | $3M | **$6M** |
| **Maximum annual refundable ITC (CCPC)** | $1.05M | **$2.1M** |
| **Taxable capital phase-out (lower threshold)** | $10M | **$15M** |
| **Taxable capital phase-out (upper threshold)** | $50M | **$75M** |
| **Eligible public corporations** | Not eligible for enhanced rate | **Now eligible for 35% up to $6M** |

> **Platform implication**: The ITC rate and expenditure limit are not static. For claim years beginning after December 15, 2024, the calculation service must use the new $6M limit. The `claim_years.associated_corp_flag` field is critical — associated corporations share the expenditure limit, requiring Form T2 Schedule 23 / corporate group allocation logic.

***

## Part 4: Form T661 — Structure and Critical Completion Rules

### 4.1 T661 Part Overview

| Part | Content | Key Lines |
|------|---------|-----------|
| **Part 1** | General claim info, method election | Line 160 (method); Lines for BN, contacts |
| **Part 2** | Project descriptions (technical narratives) | Lines 242, 244, 246 (narratives); Line 240 (advancement title) |
| **Part 3** | SR&ED expenditures by category | Salary, materials, contracts, overhead/PPA |
| **Part 4** | Assistance and contract payments | Reductions to qualified expenditures |
| **Part 5** | PPA calculation (proxy method only) | Salary base, overall cap |
| **Part 6** | Summary of all projects by cost | All projects must be listed here[^29] |
| **Part 10** | Certification | Claimant certifies correctness — cannot be revoked[^30] |

### 4.2 Part 2 Narrative Word Limits

CRA specifies the following word limits for Part 2 Section B:[^31][^32]

| Line | Question | Word Limit |
|------|---------|-----------|
| **242** | What scientific/technological uncertainties did you attempt to overcome? | **350 words** |
| **244** | What work did you perform to overcome those uncertainties? (systematic investigation) | **700 words** |
| **246** | What scientific/technological advancements did you achieve or attempt to achieve? | **350 words** |

**Important filing rule**: All projects must have Part 2 completed and maintained at the place of business. While the CRA only requires the 20 largest projects (by dollar value) to be submitted with the return, Part 2 must exist for every project and must be produced on request — failure to provide results in **disallowance of all SR&ED expenditures for that project**.[^29]

> **Platform implication**: The `project_narrative_sections` table with section keys `technical_uncertainty` (Line 242), `systematic_investigation` (Line 244), and `advancement` (Line 246) maps exactly to T661 Part 2. The `review_rules` seed rule `FORM.PROJECT.NO_NARRATIVES` correctly blocks export if these three sections lack approved text. The `evidence_coverage_score` field on narrative sections is a meaningful metric — CRA reviewers look for alignment between the narrative and supporting evidence.

### 4.3 Filing Deadline — Hard Statutory Limit

The T661 **must be filed no later than 18 months after the end of the fiscal year** in which the SR&ED work was performed. This is a hard statutory deadline under the *Income Tax Act* — there is no appeals process, no "reasonable excuse" provision, and no CRA discretion.[^33][^34]

Critical nuances:[^33]
- The T661 must be filed **with or before** the T2 corporate income tax return
- If a T2 is filed without the T661, the T661 can still be added (via amended return) within the 18-month window — but this requires filing an amendment and is operationally complex
- Filing the T2 late (with T661 attached) is accepted within the 18-month window but triggers penalties on the late T2 itself
- The *effective* deadline for most companies that file their T2 on the standard 6-month schedule is that 6-month T2 deadline — not 18 months

> **Platform implication**: The `filing_deadline` field on `claim_years` should default to `tax_year_end + 6 months` (T2 due date) but display the hard limit of `tax_year_end + 18 months`. A review rule should warn when the current date is within 90 days of the 18-month hard deadline if the claim has not been exported.

***

## Part 5: The CRA Review Process

### 5.1 Risk Assessment and Selection

Every SR&ED claim undergoes a CRA risk assessment. Claims are selected for review either through this risk assessment or random sampling. The CRA does not publish the exact risk model, but the following factors are well-documented as triggers:[^30][^35][^36]

**High-risk triggers:**
- First-time SR&ED claimants with large claims
- Sudden and unexplained increase in claim value vs. prior year
- Claims where SR&ED work appears inconsistent with the company's industry or business model
- High ratio of specified employee/owner-manager salaries relative to total claim
- Contractor payments exceeding $30,000 to a single contractor without adequate documentation
- Amendment to a previously filed T2/T661
- Incomplete forms (missing lines, vague narratives)
- Continuation of a project into a second or third year without clear differentiation of what's new
- Repeated years of similar projects with identical or near-identical narratives

**Review types**:[^36]
1. **Assessed as filed** (best outcome): No review; refund issued within ~60 days[^37]
2. **First-Time Claimant Advisory Service (FTCAS)**: CRA meets with the claimant, credits are paid as filed, but the company receives recommendations for future claims[^38]
3. **Financial review only**: Focuses on payroll, contractor documentation, CCPC status verification, specific expenditure substantiation
4. **Full review (technical + financial)**: Both a Research and Technology Advisor (RTA) and a Financial Reviewer (FR) assess the claim

### 5.2 The Review Timeline

- Claims selected for review receive a letter from CRA **within 90 days of submission**[^36]
- CRA's service standard for refundable claims selected for review: **180 calendar days from receipt of complete claim**[^39]
- CRA met this 180-day standard 90% of the time in 2024-2025[^39]
- Claims not selected for review are processed in approximately **60 days**[^37]

**Post-April 1, 2026 changes**: CRA is implementing administrative improvements including removal of redundant review steps, faster determinations on claim adjustments, and streamlined internal workflows. A voluntary pre-claim approval process with a targeted 90-day processing time for approved claims is also being introduced.[^40]

### 5.3 What Reviewers Examine

CRA reviewers — both RTAs (technical) and FRs (financial) — will examine:[^30]

- Form T661, particularly the supporting information referenced on Lines 270–282 (documentation checklist)
- Technical evidence: project plans, lab notebooks, engineering logs, Git commits, Jira/Linear tickets, pull requests, test results, failure analyses
- Financial records: timesheets, payroll records, invoices, GL exports, contractor agreements, receipts for materials
- Evidence that documents: **who** did what, **what** they did, **when** they did it, and **how** it relates to the claimed uncertainty and advancement

> **CRA's documented expectation** (from T4088 Guide): *"The best supporting evidence is documentation that is dated and specific to the work performed."*[^41]

Once a claim is selected for review, **it cannot be withdrawn**. The Part 10 certification on the T661 cannot be revoked — providing incomplete or inaccurate information may result in monetary penalties.[^30]

### 5.4 After the Review — Dispute Resolution

If CRA proposes to disallow some or all of the claim:
1. The reviewer will explain the proposed adjustments and CRA's reasoning
2. The claimant may provide additional information or make representations before the final decision
3. If the claimant disagrees with the final assessment, a **Notice of Objection** can be filed within 90 days of the assessment
4. Further appeal goes to the Tax Court of Canada[^42]

***

## Part 6: Documentation — The Highest-Leverage Success Factor

Approximately 90% of SR&ED claims with solid documentation are accepted as filed. Only ~4% of claims are denied entirely, and poor documentation is the #1 cause of that denial.[^2]

### 6.1 The Contemporaneous Documentation Standard

CRA policy explicitly states that **contemporaneous documentation** — records generated *as the SR&ED was being carried out* — is the best supporting evidence. Over the past decade, documentation has evolved from a secondary consideration to effectively a defining characteristic: if there is no contemporaneous documentation, CRA reviewers increasingly infer that the work was not SR&ED.[^43][^41]

The key standard: documentation should be **dated, signed, and specific to the work performed**.[^44]

**What contemporaneous documentation must demonstrate**:[^2]
1. The technological advancement sought (objective)
2. The state-of-the-art knowledge baseline at project start
3. The specific technological uncertainties encountered
4. The hypotheses formed to address those uncertainties
5. The experiments performed (including failures and dead ends)
6. The data/results collected and their analysis
7. The conclusions drawn (positive or negative)

### 6.2 Documentation by Type

| Document Type | SR&ED Value | Notes |
|--------------|-------------|-------|
| **Project plans / technical specs** | High — establishes objectives upfront | Should predate or coincide with R&D start |
| **Git commit history** | High — timestamps individual code changes | Commit messages should reference the technical problem being solved |
| **Issue trackers (Jira/Linear/GitHub Issues)** | High — links work to specific problems | Issue titles should use technical language, not commercial language |
| **Meeting minutes / Slack threads** | Medium — corroborates but not primary | Documents decision points, hypothesis discussions |
| **Timesheets / time-tracking** | High (financial) — connects salary to project | Must link time to specific SR&ED activities |
| **Test results / benchmarks** | Very High — shows systematic investigation | Quantitative results with dates; include failed runs |
| **Experiment logs** | Very High — the gold standard | Dated, signed, records hypotheses and outcomes |
| **Year-end retrospective reports** | Low — retrospective creation is discounted | Useful as narrative scaffold but not primary evidence |

### 6.3 Project Management Tools as Evidence

CRA guidance from T4088 and practitioner case law explicitly recognizes project management software (Jira, GitHub, Linear, Basecamp, Asana, Trello) as valuable contemporaneous evidence. The key is that:[^45][^44]
- Tickets/issues are created before or during the work, not retroactively
- Technical problem descriptions use SR&ED-relevant language (uncertainty, hypothesis, investigation)
- Closing notes document what was learned, not just what was done

> **Platform implication**: The `cost_imports` table supports `source_type` values including `github` and `jira`. The `evidence` table's `source_type`, `evidence_date`, `evidence_category`, and `extracted_summary` fields are critical for building the evidence-to-narrative link. The `project_evidence_links` table connecting evidence to specific narrative sections is especially important — CRA reviewers expect the evidence to substantiate each specific section of the T661 Part 2 narrative.

***

## Part 7: Narrative Writing — Optimization Rules

CRA technical reviewers have science or engineering backgrounds and evaluate narratives for technical credibility. The following rules, drawn from practitioner experience and CRA documentation, directly affect approval rates.

### 7.1 Language Calibration

**Use**: Technical language appropriate to the field; specific to the actual work performed[^46][^32]

**Avoid**:
- Commercial language ("to increase revenue", "to gain market share", "to improve customer satisfaction") — this is flagged as a review rule `ELIG.NARRATIVE.COMMERCIAL_LANGUAGE`[^9]
- Vague non-technical terms ("innovative", "cutting-edge", "state-of-the-art") without substantiation
- Overly simplified explanations that obscure the technical depth of the work
- Overly jargon-heavy explanations that obscure the systematic process

### 7.2 What to Include in Each Section

**Line 242 — Uncertainty (max 350 words)**:[^32]
- State the project objective in technological terms
- Describe the existing knowledge base and its limitations
- Identify the specific unknowns that required experimentation
- Explain *why* those unknowns could not be resolved using generally available knowledge

**Line 244 — Systematic Investigation (max 700 words)**:[^32]
- Describe the chronological sequence of work with approximate dates
- Name the hypotheses or approaches tested
- Describe what was tried, what failed, and why
- Quantify results where possible (performance metrics, error rates, benchmarks)
- Identify team members by role (not necessarily by name) and their contribution type

**Line 246 — Advancement (max 350 words)**:[^32]
- Articulate what new knowledge or capability was gained
- Even failed projects should state the negative knowledge gained
- Connect the advancement back to the uncertainty stated in Line 242
- Avoid commercial framing; frame in terms of scientific/technological learning

### 7.3 Common Narrative Failures

| Failure Mode | Review Rule | Consequence |
|-------------|-------------|-------------|
| No experimental chronology — just describes the end product | `ELIG.NARRATIVE.NO_EXPERIMENTS` | High risk of eligibility denial |
| Commercial language in uncertainty section | `ELIG.NARRATIVE.COMMERCIAL_LANGUAGE` | Signals routine development |
| No evidence linked to the narrative | `ELIG.NARRATIVE.NO_EVIDENCE` | Cannot substantiate the claimed work |
| Narrative describes achievements, not uncertainty | — | Fails the "why" test |
| Narrative identical or nearly identical to prior year | — | Strong audit trigger |
| Project title is internal code name, not a technological objective | — | Disorienting to reviewer |

### 7.4 Multi-Year Projects

When a project continues from a prior tax year, the Part 2 narrative must clearly differentiate what new work was done *in the current tax year* from what was done in prior years. Reusing the prior year's narrative verbatim is a significant audit trigger. The current year's work should have its own uncertainty, investigation, and advancement — even if it is incremental.[^35]

***

## Part 8: Alberta — Provincial Stacking (IEG)

### 8.1 Alberta No Longer Has a Provincial SR&ED Credit

Alberta cancelled its provincial SR&ED tax credit effective January 1, 2020. It was replaced by the **Innovation Employment Grant (IEG)**, effective January 1, 2021. The IEG is administered through Schedule 29 of the Alberta Corporate Income Tax Return (AT1), not a standalone application.[^47]

### 8.2 IEG Structure

The IEG provides up to **20% refundable credit** on eligible R&D expenditures, in two tiers:[^48][^49]

1. **Base credit**: 8% of all eligible expenditures for the current tax year (up to $4M)
2. **Incremental credit**: Additional 12% on the portion of expenditures that **exceed the base level of spending** — defined as the average of the prior two tax years' eligible R&D expenditures

First-time claimants (no prior 2 years of SR&ED activity) and companies with zero spending in the prior two years automatically qualify for the full 20%.[^49]

**IEG Maximum**: Applies to up to $4M in eligible annual R&D expenditures.[^47][^48]

### 8.3 IEG Eligibility

- Must be a corporation (partnerships, trusts, and individuals are not eligible)[^50]
- Must have incurred eligible expenditures in Alberta after December 31, 2020
- Eligible expenditures must parallel federal SR&ED qualified expenditures
- Taxable capital < $10M: full IEG (8–20%)
- Taxable capital $10M–$50M: IEG phases out proportionally
- Taxable capital ≥ $50M: not eligible[^48]

### 8.4 IEG Filing Deadline

The IEG filing deadline is **21 months after year-end** (3 months beyond the federal 18-month T661 deadline). However, IEG eligibility is **contingent on filing a federal SR&ED claim within 18 months** — a missed federal deadline kills the IEG claim as well.[^50]

### 8.5 IEG and Federal Interaction

Because IEG is government assistance, it **reduces the federal qualified SR&ED expenditure base** for ITC calculation (see Part 2.4). This creates a sequencing dependency: the federal ITC calculation must account for expected IEG, and the IEG calculation uses the same expenditure pool as the federal claim.[^23]

> **Platform implication**: The `provincial_line_values` table and `provincialCalcService` need to handle both the IEG Schedule 29 calculation (AT1 form) AND the IEG-as-assistance reduction to federal qualified expenditures. The `assistance_items` table should capture the IEG as a `government_assistance` item linked at the project level. The `province_programs` field on `claim_years` with default `["AB"]` correctly gates this logic.

### 8.6 Combined Federal + Alberta Stack (CCPC Example)

For a small Alberta CCPC with $500K in qualifying salaries and no prior SR&ED expenditures:

| Layer | Calculation | Amount |
|-------|------------|--------|
| Qualifying salary base | $500,000 | — |
| PPA (proxy, 55%) | $500K × 55% | $275,000 |
| Total qualified expenditures | $500K + $275K | $775,000 |
| Federal ITC (35%, CCPC, under $6M limit) | $775K × 35% | $271,250 |
| Net for AB IEG (fed QE less assistance already received) | (Sequential calculation required) | — |
| Alberta IEG (20% on first $500K eligible, first-time) | $500K × 20% | $100,000 |
| **Combined benefit** | | **~$371,250** |

This illustrates why the IEG represents meaningful stacking, particularly for first-time claimants, and why capturing the Alberta split correctly is critical for claim completeness.

***

## Part 9: Key Review Rules — Mapped to the Platform

The platform's `review_rules` table seeds 20 rules. The following analysis maps each rule to its CRA policy basis and notes any optimization opportunities.

### 9.1 Form-Layer Rules (Blockers)

| Rule Key | CRA Basis | Optimization Note |
|---------|-----------|------------------|
| `FORM.CLAIM.NO_PROJECTS` | Part 6 of T661 requires all projects listed[^29] | Enforce at claim status level, not just export |
| `FORM.CLAIM.NO_CONTACTS` | T661 Part 1 requires claimant and preparer contacts | Track preparer credentials (ERN) — CRA may verify |
| `FORM.CLAIM.NO_METHOD` | Line 160 T661; no election defaults to traditional | Default should be proxy with explicit override |
| `FORM.CLAIM.NO_TAX_YEAR` | Core T661 requirement | Validate start < end; end - start between 1 day and 53 weeks |
| `FORM.CLAIM.NO_BN` | CRA match requirement | BN format: 9-digit root + 2-letter program ID + 4-digit reference |
| `FORM.PROJECT.NO_NARRATIVES` | T661 Part 2 Lines 242/244/246 required[^31] | Require ALL THREE sections to have `approved_text`, not just any one |
| `FORM.PROJECT.MISSING_FIELD_CODE` | T661 Line 241: field of science/technology[^51] | Add validation that field code is from CRA's defined list |
| `FORM.PROJECT.MISSING_DATES` | T661 Part 2 project start/end dates | Validate that project dates fall within the claim year's tax year |

### 9.2 Eligibility-Layer Rules (Warnings)

| Rule Key | CRA Basis | Optimization Note |
|---------|-----------|------------------|
| `ELIG.NARRATIVE.COMMERCIAL_LANGUAGE` | CRA reviewers flag commercial language in Line 242[^9] | Expand keyword list: "revenue", "sales", "customer", "market", "competitive advantage", "profit" |
| `ELIG.NARRATIVE.NO_EXPERIMENTS` | Systematic investigation requires experimental chronology[^4] | Check for temporal markers (months, dates, phases) and hypothesis-result language |
| `ELIG.NARRATIVE.NO_EVIDENCE` | T661 Lines 270–282 documentation checklist[^30] | Flag when `evidence_coverage_score < 0.3` on a narrative section |
| `ELIG.COST.NO_PROJECT` | All costs must be attributed to a project per T661 Part 6 | Also flag costs in `pending` review status at export time |
| `ELIG.COST.RELATED_PARTY` | Non-arm's length contract rules, look-through rule[^16] | Require `treatment_notes` not null; flag for review |
| `ELIG.COST.LARGE_CONTRACTOR` | CRA scrutinizes large contractor payments; $30K threshold is practitioner convention | Consider $25K threshold for earlier warning |

### 9.3 Calculation-Layer Rules (Blockers)

| Rule Key | CRA Basis | Optimization Note |
|---------|-----------|------------------|
| `CALC.FED.PROJECT_SUM` | T661 Part 6: project totals must reconcile to claim total[^29] | Reconcile within rounding tolerance ($0.01) |
| `CALC.FED.PPA_MISMATCH` | T661 Part 5: PPA = salary base × prescribed rate[^19] | Note: the prescribed rate is currently 55% but is a regulatory value |
| `CALC.FED.NEGATIVE_QE` | Qualified expenditures cannot be negative | Check each project individually, not just claim total |
| `CALC.FED.METHOD_INCONSISTENCY` | Overhead claimed under traditional but proxy elected, or vice versa[^13] | Cross-check cost classifications against `method_election` |
| `CALC.PROV.AB_RECONCILE` | AB expenditures are a subset of federal, never exceed[^23] | Allow small rounding difference; flag if >$100 discrepancy |
| `CALC.PROV.AB_SPLIT_COMPLETE` | IEG requires per-province expenditure breakdown | Required for AT1 Schedule 29 |

### 9.4 Recommended Additional Review Rules

The following rules are not in the current seed but are supported by CRA policy and practitioner experience:

| Suggested Rule Key | Severity | Basis |
|-------------------|----------|-------|
| `ELIG.PROJECT.CONTINUATION_NO_DIFFERENTIATION` | Warning | Multi-year projects need current-year-specific narratives[^35] |
| `FORM.COST.SALARY_180_DAYS` | Blocker | Salaries not paid within 180 days of tax year end are not deductible[^52] |
| `ELIG.COST.SPECIFIED_EMPLOYEE_CAP` | Warning | Flag when specified employee salary exceeds 5× YMPE[^14] |
| `ELIG.COST.ASSOCIATED_CORP_T1174` | Blocker | Specified employees of associated corps require T1174[^14] |
| `FORM.CLAIM.DEADLINE_WARNING` | Warning | T661 deadline within 90 days |
| `FORM.CLAIM.DEADLINE_CRITICAL` | Blocker | T661 deadline within 30 days |
| `ELIG.NARRATIVE.ADVANCEMENT_MISSING` | Warning | Line 246 advancement text does not appear to connect back to Line 242 uncertainty |

***

## Part 10: End-to-End Optimization Checklist

The following checklist synthesizes all of the above into a system-level view for maximizing SR&ED claim success:

### Pre-Filing (System Design)
- [ ] **Document as you build**: Integrate with GitHub, Jira, Linear to capture contemporaneous evidence with timestamps[^44][^45]
- [ ] **Method election conscious**: Defaulting to proxy is correct for most small companies; prompt users to confirm if traditional is selected[^19]
- [ ] **Assign field codes**: Every project must have a field of science/technology code (T661 Line 241); this is a warning in CRA's review[^51]
- [ ] **Separate projects cleanly**: One SR&ED project per major technological challenge; co-mingling unrelated work into one project weakens both[^53]
- [ ] **Capture collaboration**: Flag collaborative work and note arm's-length status; subcontractor SR&ED must be performed in Canada[^16]

### Narrative Quality
- [ ] **Lead with uncertainty, not achievement**: Line 242 should articulate what was unknown, not what was built
- [ ] **Use temporal structure in Line 244**: "Phase 1 (Month X–Y): We hypothesized... Results showed... Phase 2..."
- [ ] **Include negative results**: CRA reviewers are specifically trained to look for failed experiments as proof of genuine research[^2]
- [ ] **No commercial language anywhere in Part 2**: Run automated detection against the defined word list
- [ ] **Match evidence to narrative sections**: Every narrative section needs linked evidence; `evidence_coverage_score` should be ≥ 0.5 for export

### Cost Filing
- [ ] **Link every cost to a project**: Unassigned costs (`ELIG.COST.NO_PROJECT`) are at risk of full disallowance
- [ ] **Document related-party transactions**: Non-arm's-length contracts need written documentation of SR&ED work performed
- [ ] **Pay salaries on time**: Salaries paid more than 180 days after tax year end are not eligible[^52]
- [ ] **Track time in real-time**: Time estimates created retroactively are heavily discounted by CRA[^43]

### Alberta-Specific
- [ ] **File federal first within 18 months**: IEG eligibility is contingent on the federal claim[^50]
- [ ] **Capture base-year spending**: IEG's incremental tier requires prior 2-year average; store historical SR&ED expenditures per province
- [ ] **IEG as assistance**: Reduce federal qualified expenditures by IEG amount per project before computing ITC[^23]

***

## Summary of Recent Legislative Changes (Platform-Relevant)

| Change | Effective | Impact |
|--------|-----------|--------|
| Enhanced rate limit raised: $3M → $6M | Tax years beginning after Dec 15, 2024 | Higher maximum refundable ITC ($2.1M vs $1.05M)[^28] |
| Capital expenditures reinstated for SR&ED | Property acquired after Dec 15, 2024 | New cost classification category needed[^24] |
| Phase-out thresholds: $10M/$50M → $15M/$75M | Tax years beginning after Dec 15, 2024 | More CCPCs retain full enhanced rate[^54] |
| Eligible Canadian public corporations added | Tax years beginning after Dec 15, 2024 | Extends 35% refundable rate to qualifying public corps[^27] |
| Pre-claim approval process | Available after April 1, 2026 | 90-day targeted processing for pre-approved projects[^40] |
| CRA admin improvements (reduced review steps) | After April 1, 2026 | Faster processing for straightforward claims[^40] |
| IEG made permanent | Ongoing | No sunset date; reliable Alberta stacking vehicle[^55] |

---

## References

1. [9 Common Questions the CRA Uses to Determine SR&ED Eligibility](https://www.boast.ai/en-us/blog/sr-ed/sred-eligibility) - June 30 SR&ED Deadline: Are You Prepared? If your fiscal year ended in December, there's still time ...

2. [Documentation Requirements | ENTAX Consulting](https://www.entax.ca/learn/documentation) - CRA accepts many forms of evidence. The key is that records are contemporaneous, correlated to SR&ED...

3. [New SR&ED Eligibility Guidelines | EY - Canada](https://www.ey.com/en_ca/insights/sr-ed-and-business-incentives/four-things-to-know-about-the-new-sred-eligibility-guidelines) - 1. The CRA's approach to evaluating SR&ED eligibility has evolved · 2. The language and style of the...

4. [New Eligibility Guidelines – The 'How' and 'Why' of SR&ED](https://welchllp.com/insights/knowledge/new-eligibility-guidelines-the-how-and-why-of-sred/) - Therefore, if your work attempts to: (1) resolve an uncertainty; (2) advance your conceptual knowled...

5. [SR&ED Tax Credits in Canada: 2025-2026 Rule Updates](https://thinkaccounting.ca/blog/sred-tax-credits-2025-2026-updates/) - SR&ED tax credits explained for 2025-2026: eligibility, claim deadlines, with sr&ed credit calculato...

6. [How to Determine if You're Eligible for SR&ED - YouTube](https://www.youtube.com/watch?v=t9n4rKgzMHw) - ... (SR&ED) program aids businesses to conduct research and development ... 3 Criteria for a Success...

7. [9 Common Questions the CRA Uses to Determine SR&ED Eligibility](https://www.boast.ai/en-ca/blog/sr-ed/sred-eligibility) - Learn SR&ED eligibility criteria, answers to common CRA questions, and real-world examples in this c...

8. [Is Your SR&ED Work Solving Technological Uncertainty?](https://checkpointresearch.ca/is-your-sred-work-solving-technological-uncertainty/) - Technological uncertainty refers to unknowns in achieving a technical goal, where standard solutions...

9. [Line 242: Uncertainty - SR&ED Education](https://www.sreducation.ca/line-242-uncertain-about-uncertainty-no-problem/) - Summary. Your technical narrative plays a major role in your SR&ED report. Ensure you do not include...

10. [Scientific Research and Experimental Development (SR&ED) tax ...](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/sred-eligibility.html) - However, since the purpose of the data collection is to support normal business operations, it is ex...

11. [What Is SR&ED? A Complete Guide [2025]](https://danieltoma.ca/what-is-sred/) - ○ Commercial production of a new or improved material, device, product or process ○ Style changes ○ ...

12. [How Do I Identify My Companies Eligibility for an SR&ED Software ...](https://abgi-canada.com/en/how-do-i-identify-my-companys-eligibility-for-an-sred-software-claim/) - A software/IT company incorporated in Canada can receive 15%-35% from the SR&ED Tax Credit. Find out...

13. [Traditional and Proxy Methods Policy - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/traditional-proxy-methods-policy.html) - The main difference is that the traditional method allows specifically for the inclusion of SR&ED ov...

14. [SR&ED Salary or Wages Policy - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/salary-wages-policy.html) - A specified shareholder is a person who owns, directly or indirectly, at any time during the year, 1...

15. [[PDF] The Canadian R&D Tax Relief Regime 1. Overview of the SR&ED ...](https://www.kreston.com/wp-content/uploads/2025/01/Canadian-RD-Relief-Factsheet.pdf) - • Qualifying rate and refundability depends on ownership and size. • Include salary expense, overhea...

16. [Contract Expenditures for SR&ED Performed on Behalf of a ...](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/contract-expenditures-performed-on-behalf-a-claimant-policy.html) - The purpose of this document is to clarify the position of the Canada Revenue Agency ( CRA ) regardi...

17. [Claiming Overhead For SR&ED: Traditional Versus Proxy](https://sredunlimited.net/claiming-overhead-sred-traditional-versus-proxy/) - The short answer is that the proxy method allows you to make a capped calculation of overhead expens...

18. [Tax measures: Supplementary information | Budget 2025](https://budget.canada.ca/2025/report-rapport/tm-mf-en.html) - Budget 2025 proposes to further increase the expenditure limit on which the SR&ED program's enhanced...

19. [Proxy vs Traditional SR&ED Claim: Which Method to Choose?](https://www.sreducation.ca/proxy-traditional-sred/) - Most claimants with labour-intensive projects find the proxy method to be the easiest method of fill...

20. [Calculate allowable expenditures - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/sred-claim/allowable-expenditures.html) - Identify your allowable SR&ED expenditures, including salary or wages, materials, contracts, overhea...

21. [Specified Employees in SR&ED: Restrictions and Regulations](https://www.sreducation.ca/specified-employees-sred/) - A specified shareholder is a person who owns, directly or indirectly, at any time during the year, 1...

22. [Claiming SR&ED for Shareholders & Specified Employees](https://www.lavenderconsulting.io/newsandinsights/claiming-sr-ed-for-shareholders-specified-employees) - Specified employees and shareholders can generate strong SR&ED claims, but you must apply the unique...

23. [Assistance and Contract Payments Policy - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/assistance-contract-payments-policy.html) - Assistance and contract payments (see section 5.2) must be in respect of the SR&ED work performed in...

24. [Tax Insights: Bill C-15 implements SR&ED, capital cost allowance ...](https://www.pwc.com/ca/en/services/tax/publications/tax-insights/bill-c-15-implements-changes-2025.html) - an accelerated CCA of 10% for new eligible purpose‑built rental projects that begin construction aft...

25. [Get an investment tax credit (ITC) - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/sred-claim/investment-tax-credit.html) - Basic rate. The basic ITC rate is 15% on qualified SR&ED expenditures for corporations, individuals,...

26. [SR&ED tax incentives: What's changed and what to know](https://gowlingwlg.com/en/insights-resources/articles/2025/sr-and-ed-tax-incentive) - Enhancing SR&ED ITC ; CCPC. 35%. 100%. $3 million of qualifying SR&ED expenditures* ; CCPC · 15%. 40...

27. [Tax Insights: SR&ED updates Enhanced credits, expanded eligibility ...](https://www.pwc.com/ca/en/services/tax/publications/tax-insights/sred-changes-2025.html) - The key enhancements to the SR&ED tax incentive program, which are designed to expand access and inc...

28. [[PDF] Tax Alert 2025 No. 54 - EY](https://www.ey.com/content/dam/ey-unified-site/ey-com/en-ca/technical/tax/tax-alerts/2025/ey-taxalert-2025-no54.pdf) - SR&ED: expenditure limit – Increase, from $3 million to $6 million (instead of to. $4.5 million as p...

29. [SR&ED Filing Requirements Policy - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/filing-requirements-policy.html) - If an SR&ED claim is filed at least 90 days before the SR&ED reporting deadline (see section 5.2), t...

30. [The SR&ED Review Process: A Guide for Claimants - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/technical-review-a-guide-claimants.html) - This guide provides an overview of the SR&ED claim review process when reviewing both the work and t...

31. [SR&ED Technical Narrative Length Limits: The Truth About "Word ...](https://www.sreducation.ca/sred-technical-narrative-length-limits-the-truth-about-word-limits/) - The technical narrative portion on Part 2 of the T661 form serves as a blueprint of the SR&ED work p...

32. [Guide to Form T661 with example SR&ED report](https://www.t661.tax) - Lines 242, 244, and 246 have word limitations of 350, 700, and 350 respectively. Therefore, your ans...

33. [SR&ED Filing Deadline 2026: Key Dates - Chrono Innovation](https://www.chronoinnovation.com/resources/sred-filing-deadline-2026) - T661 absolute deadline: June 30 of the second year following (18 months after year-end); Example: Fo...

34. [SR&ED Filing Requirements Policy (December 18, 2014) - Canada.ca](https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program/filing-requirements-policy/filing-requirements-policy-december-2014.html) - ... filed: the reporting deadline to file Form T661 for an SR&ED expenditure is 12 months after the ...

35. [How to Avoid an SR&ED Review - Kingsway Consulting](http://www.kingswayconsulting.com/How-to-Avoid-an-SR-ED-Review.html) - Keep in mind that a review of a SR&ED claim does not trigger a full tax audit. A SR&ED review is an ...

36. [How to Win with an SR&ED Audit in 2025 - GrowWise Partners](https://growwise.ai/sred/how-to-win-with-an-sred-audit-in-2025/) - Triggers for an SR&ED CRA Review​​ Typical triggers for a review include: Filing an amended tax retu...

37. [SR&ED Tax Credit: Qualify and Maximize - Chrono Innovation](https://www.chronoinnovation.com/resources/sr-ed-tax-credit) - All claims without review take about 60 days. If selected for a financial or technical review, proce...

38. [I filed my SR&ED claim. Now what? - Welch LLP](https://welchllp.com/insights/knowledge/i-filed-my-sred-claim-now-what/) - The standard processing time for T2's with a SR&ED claim is anywhere from 60 to 180 calendar days. T...

39. [Service Standards 2024-2025 - Canada.ca](https://www.canada.ca/en/revenue-agency/services/about-canada-revenue-agency-cra/service-standards-cra/service-standards-2024-25.html) - Our standard: Our goal is to process a refundable SR&ED claim within 180 calendar days from the date...

40. [Canada's Federal Budget 2025: Key Updates to the SR&ED Program](https://www.knowledgegap.ca/post/sred-program-2025) - Current SR&ED processes remain in place. Typical processing time remains ~180 days. Existing documen...

41. [How to document SR & ED | R&D Action Consultant](https://rdactionconsultant.com/en/blog/how-to-document-sr-ed/) - The requirement of contemporary documentation implies that information produced later (eg. the year-...

42. [SR&ED claim rejected - Kreston GTA](https://www.krestongta.com/article/sred-claim-rejected/) - Why Was My SR&ED Claim Rejected? Claims are rejected for reasons like insufficient documentation, mi...

43. [SR&ED and Contemporaneous Documentation](https://sdtaxlaw.ca/sred-contemporaneous-documentation-cra/) - The purpose of contemporaneous documentation is to ensure that the activities are clearly linked to ...

44. [The Key to Successful Tax Credit Claims" - SRED Consultants Inc.](https://getsred.ca/title-mastering-sred-documentation-the-key-to-successful-tax-credit-claims/) - Unlike post-project documentation, contemporaneous records provide real-time insights into the work ...

45. [How to Document Your SR&ED Projects Effectively - CTAP](https://ctap.ca/how-to-document-your-sred-projects-effectively/) - Best Practices for Documenting SR&ED Projects. Real-Time Documentation. Maintain contemporaneous rec...

46. [Top Tips to Complete the T661 SR&ED Form Accurately](https://www.g6consulting.ca/top-tips-for-completing-the-t661-form-accurately/) - 1. Understand the CRA's Criteria · 2. Document R&D Activities in Real-Time · 3. Be Clear and Concise...

47. [Alberta SR&ED Program Replaced By Innovation Employment Grant ...](https://sredunlimited.net/alberta-sred-program-replaced-by-innovation-employment-grant-ieg/) - As of January 1st, 2020, Alberta cancelled the provincial SR&ED tax credit and replaced it with the ...

48. [Alberta Innovation Employment Grant (IEG) | Program Guide 2025](https://hellodarwin.com/business-aid/programs/innovation-employment-grant) - This grant supports small and medium-sized businesses in Alberta that engage in research and develop...

49. [Alberta's new Innovation Employment Grant for SR&ED - Emergex](https://www.emergex.com/en/alberta-upgrades-support-sred-new-innovation-employment-grant/) - The IEG is calculated in two steps: First, an 8% refundable tax credit on the SR&ED expenses for the...

50. [Alberta SR&ED Tax Credit Program: Innovation Employment Grant ...](https://funding.ryan.com/government-funding/research-development/sred/alberta-sred/) - The Innovation Employment Grant (IEG) is available to Alberta businesses investing in research and d...

51. [How to fill out t661 and t2sch31 SR&ED forms - G6 Consulting](https://www.g6consulting.ca/t661-and-t2sch31/) - The t661 part 2 is the most important part of the SRED claim. The purpose of lines 242, 244 and 246 ...

52. [[PDF] scientific research and experimental development (sr&ed ...](https://www.cchwebsites.com/content/pdf/tax_forms/ca/en/t661ex_en.pdf) - Use this form: to provide technical information on your SR&ED projects; to calculate your SR&ED expe...

53. [How to Qualify for SR&ED: Defining Technological Uncertainty and ...](https://funding.ryan.com/blog/government-funding/sred-define-technological-uncertainty-and-complex-systems/) - Scientific Research and Experimental Development (SR&ED) tax credit requires projects to have techno...

54. [A Practical Guide to the 2025 SR&ED Changes - GrowWise Partners](https://growwise.ai/sred/a-practical-guide-to-the-2025-sred-changes/) - The 2025 SR&ED updates raise the capital thresholds for CCPCs. The old range of $10 million to $50 m...

55. [Alberta Small Business Grants 2026 — 84+ Funding Programs](https://grantcompass.ca/alberta-grants.html) - The Innovation Employment Grant (IEG) provides an 8–20% provincial R&D tax credit that stacks with f...

