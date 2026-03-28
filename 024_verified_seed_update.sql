-- =============================================================================
-- 024_verified_seed_update.sql
-- Verified-source-audit data update
-- Source of truth: "Execom Calculator — Verified Benchmark Dataset
--                   (Source-Audited)" — March 2026
--
-- This migration:
--   1. Updates regions with compliance risk flags and corrected fees
--   2. Adds verified Tier 1/2 source records
--   3. Deactivates weak/blog-level sources
--   4. Corrects benchmark values to match verified dataset
--   5. Marks demoted benchmarks as non-citable
--   6. Moves assumption-only items into methodology_configs
--   7. Links verified benchmarks to authoritative sources
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════
-- A. REGION UPDATES — compliance flags and fee corrections
-- ═══════════════════════════════════════════════════════════════

-- Alberta: add compliance flags
update public.regions set
  compliance_risk_flags = '[
    {"flag": "registry_agent_mandatory", "label": "All corporate filings must go through a registry agent — no direct government portal", "source": "Alberta.ca"},
    {"flag": "extra_prov_bc_mb_sk_zero_fee", "label": "Corporations from BC, MB, or SK can register extra-provincially at $0 government fee via the Online Extra-Provincial Registration system", "source": "Alberta.ca"}
  ]'::jsonb,
  notes = 'AB has no direct govt portal; all filings via registry agent. Govt incorporation fee $283.25 (agent service charge additional, uncapped). Annual return govt fee $51.50 at agent. BC/MB/SK corps: $0 extra-prov registration.'
where code = 'AB' and superseded_date is null;

-- Ontario: add compliance flags, correct filing_floor
update public.regions set
  compliance_risk_flags = '[
    {"flag": "cra_annual_return_ended", "label": "CRA stopped accepting Ontario annual returns on behalf of Ontario on May 15, 2021 — corporations relying solely on T2 filing are in default", "source": "Ontario.ca — Corporations Tax", "date": "2021-05-15"},
    {"flag": "initial_return_60_days", "label": "Initial return must be filed within 60 days of incorporation via Ontario Business Registry", "source": "Ontario.ca — Corporations Information Act"}
  ]'::jsonb,
  notes = 'ON annual return $0 govt fee. Requires Company Key + My Ontario Account (5-7 business days). CRA no longer accepts annual returns since May 2021 — common accountant error. Initial return within 60 days of incorporation.',
  filing_floor = 360
where code = 'ON' and superseded_date is null;

-- BC: add compliance flags
update public.regions set
  compliance_risk_flags = '[
    {"flag": "annual_report_timing", "label": "Annual report due within 2 months after anniversary date of incorporation or extra-provincial registration", "source": "BC Registry — gov.bc.ca"},
    {"flag": "extra_prov_inbound_fee", "label": "Extra-provincial registration: $380 one-time + $43.39/year annual report", "source": "BC Registry"}
  ]'::jsonb,
  notes = 'BC uses own name system (not NUANS). Incorporation: $350 + $30 name approval = $380. Annual report $43.39/yr due within 2 months of anniversary.',
  filing_floor = 380
where code = 'BC' and superseded_date is null;

-- Federal: correct filing floor (was $500, verified incorp is $200 + ~$60 NUANS)
update public.regions set
  compliance_risk_flags = '[
    {"flag": "director_residency", "label": "25% of directors must be Canadian residents under CBCA", "source": "Corporations Canada — ISED"},
    {"flag": "extra_prov_required", "label": "Extra-provincial registration still required in each operating province", "source": "ISED"}
  ]'::jsonb,
  notes = 'Federal: $200 online incorporation (1-day processing), $250 mail (10 days), +$100 express (4 hours). $12/year online annual return. 25% Canadian-resident director requirement. Extra-prov registration still needed in operating province.',
  filing_floor = 260,
  residency_director_requirement = true
where code = 'FED' and superseded_date is null;


-- ═══════════════════════════════════════════════════════════════
-- B. ADD VERIFIED TIER 1/2 SOURCE RECORDS
-- ═══════════════════════════════════════════════════════════════

-- Deactivate weak / blog-level sources first
update public.sources set active = false
where citation_label in (
  'Metaintro-90Days-2026',        -- blog, demoted
  'LSTM-Timing-2025',             -- blog, demoted
  'Runn-Utilization-2025',        -- SaaS vendor blog, demoted
  'Bark-Marketing-2025',          -- pricing aggregator
  'Bark-Accounting-2025',         -- pricing aggregator
  'Holler-WebDesign-2026',        -- agency website
  'ExpertCFO-Pricing-2025',       -- vendor self-pricing
  'EI-Rules-2026'                 -- immigration news blog (redundant)
);

-- Insert verified sources (on conflict do nothing in case re-run)
insert into public.sources (title, publisher, url, citation_label, accessed_date, region_code, source_type, trust_tier, claim_supported, is_primary, notes)
values
  -- Tier 1: Government / Statutory
  ('Services, fees and processing times', 'ISED / Corporations Canada',
   'https://ised-isde.canada.ca/site/corporations-canada/en/services-fees-and-processing-times',
   'ISED-CorpCanada-Fees-2026', '2026-03-01', 'FED', 'government_official', 1,
   'Federal incorporation $200 online; annual return $12; express +$100', true,
   'Primary government fee schedule for federal incorporations'),

  ('Cost and time required to register, change or search for a business name/corporation', 'Ontario.ca',
   'https://www.ontario.ca/page/cost-time-required-to-register-change-search-for-business-name-corporation-not-for-profit',
   'Ontario-BCA-Fees-2026', '2026-03-01', 'ON', 'government_official', 1,
   'Ontario incorporation $300; initial return $0 within 60 days', true,
   'Ontario Business Corporations Act fee schedule'),

  ('Corporations Tax', 'Ontario.ca',
   'https://www.ontario.ca/document/corporations-tax',
   'Ontario-CorpTax-CRA-2026', '2026-03-01', 'ON', 'government_official', 1,
   'CRA stopped accepting Ontario annual returns on behalf of Ontario on May 15, 2021', true,
   'Compliance risk: Ontario corps relying solely on T2 are in default'),

  ('Ontario Business Registry: all services', 'Ontario.ca',
   'https://www.ontario.ca/page/ontario-business-registry-all-services',
   'Ontario-OBR-Services-2026', '2026-03-01', 'ON', 'government_official', 1,
   'Ontario annual return $0 via OBR; Company Key required', true,
   'Ontario Business Registry service list and fee schedule'),

  ('Forms, fees and information packages', 'BC Registry / gov.bc.ca',
   'https://www2.gov.bc.ca/gov/content/employment-business/business/managing-a-business/permits-licences/businesses-incorporated-companies/forms-corporate-registry',
   'BC-Registry-Fees-2026', '2026-03-01', 'BC', 'government_official', 1,
   'BC incorporation $350 + $30 name = $380; annual report $43.39', true,
   'BC Corporate Registry official fee schedule'),

  ('Registry agent product catalogue (October 2025)', 'Alberta Government',
   'https://open.alberta.ca/publications/6041328/resource/f76adce0-6f8b-4d15-8999-db37b6b3aece',
   'AB-Registry-Catalogue-2025', '2026-03-01', 'AB', 'government_official', 1,
   'Alberta incorporation govt fee $283.25; annual return $51.50; agent service charges uncapped', true,
   'Alberta registry agent product catalogue — government fee component only'),

  ('Annual returns for corporations, cooperatives, and organizations', 'Alberta.ca',
   'https://www.alberta.ca/corporations-cooperatives-organizations-annual-returns',
   'AB-AnnualReturns-2026', '2026-03-01', 'AB', 'government_official', 1,
   'Alberta annual return process; registry agent mandatory', true,
   'Alberta annual return requirements'),

  ('Register an out-of-province corporation', 'Alberta.ca',
   'https://www.alberta.ca/register-out-of-province-corporation',
   'AB-ExtraProv-2026', '2026-03-01', 'AB', 'government_official', 1,
   '$0 government fee for corporations from BC, MB, SK using Online Extra-Provincial Registration', true,
   'Alberta extra-provincial registration for western provinces'),

  ('EI Regular Benefits - How much could you receive', 'Service Canada / Canada.ca',
   'https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit/benefit-amount.html',
   'ServiceCanada-EI-Benefits-2026', '2026-03-01', 'FED', 'government_official', 1,
   'EI max weekly $729; 55% replacement rate; 14-45 weeks duration', true,
   'Primary statutory source for EI benefit calculations'),

  ('Summary of the 2026 Actuarial Report on EI Premium Rate', 'ESDC / Canada.ca',
   'https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/reports/premium/rates2026.html',
   'ESDC-EI-Actuarial-2026', '2026-03-01', 'FED', 'government_official', 1,
   'Max insurable earnings $68,900 for 2026', true,
   'Official EI actuarial report confirming 2026 parameters'),

  ('Important notice about maximum insurable earnings for 2026', 'ESDC / Canada.ca',
   'https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/ei-employers/premium-reduction-program/2026-maximum-insurable-earnings.html',
   'ESDC-EI-MIE-2026', '2026-03-01', 'FED', 'government_official', 1,
   'Maximum weekly EI benefit rate $729; max insurable earnings $68,900', true,
   'Employer notice confirming 2026 EI rate changes'),

  ('CPP contribution rates, maximums and exemptions', 'CRA / Canada.ca',
   'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html',
   'CRA-CPP-Rates-2026', '2026-03-01', 'FED', 'government_official', 1,
   'CPP1 self-employed 11.9% on YMPE $74,600 (basic exemption $3,500); max $8,460.90', true,
   'CRA statutory CPP contribution rates'),

  ('Second additional CPP (CPP2) contribution rates and maximums', 'CRA / Canada.ca',
   'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/calculating-deductions/making-deductions/second-additional-cpp-contribution-rates-maximums.html',
   'CRA-CPP2-Rates-2026', '2026-03-01', 'FED', 'government_official', 1,
   'CPP2 self-employed 8% on $74,600-$85,000; max $832', true,
   'CRA statutory CPP2 contribution rates'),

  ('Quality of Employment in Canada: Average earnings, 2024', 'Statistics Canada',
   'https://www150.statcan.gc.ca/n1/pub/14-28-0001/2025001/article/00001-eng.htm',
   'StatsCan-AvgEarnings-2024', '2026-03-01', 'FED', 'government_official', 1,
   'Average hourly wage $35.20/hr; average weekly earnings $1,267.54/wk ($65,912/yr)', true,
   'Statistics Canada Quality of Employment indicator — earnings'),

  ('Experiences of self-employed workers in Canada, 2023', 'Statistics Canada',
   'https://www150.statcan.gc.ca/n1/pub/71-222-x/71-222-x2024001-eng.htm',
   'StatsCan-SelfEmployed-2023', '2026-03-01', 'FED', 'government_official', 1,
   'Self-employed: 2,652,600 = 13.2% of employed population; 15.8% difficulty finding clients', true,
   'Statistics Canada self-employment survey data'),

  ('Quality of Employment: Own-account worker rate, 2023', 'Statistics Canada',
   'https://www150.statcan.gc.ca/n1/pub/14-28-0001/2024001/article/00003-eng.htm',
   'StatsCan-OwnAccount-2023', '2026-03-01', 'FED', 'government_official', 1,
   '32.6% of own-account workers worked part-time (<30 hrs/wk); 18.5% involuntary', true,
   'Key utilization baseline: only 67.4% of own-account workers are full-time'),

  ('Medical or dental benefits coverage, 2024', 'Statistics Canada',
   'https://www150.statcan.gc.ca/n1/pub/14-28-0001/2025001/article/00003-eng.htm',
   'StatsCan-Benefits-2024', '2026-03-01', 'FED', 'government_official', 1,
   '66.8% of employees had workplace medical/dental benefits; public sector 80.9%, private 62.1%', true,
   'Quantifies the benefit coverage gap that independent operators face'),

  -- Tier 2: Institutional research
  ('Benefits Benchmarking 2023 — Employer-Sponsored Benefits', 'Conference Board of Canada',
   'https://www.conferenceboard.ca/wp-content/uploads/2022/10/benefits-benchmarking_employer-sponsored-benefits_october2023.pdf',
   'ConfBoard-Benefits-2023', '2026-03-01', 'ALL', 'institutional_research', 2,
   'Employer health premium $17-$216/month single; total benefit cost $3,000-$8,000/employee/yr', true,
   'Conference Board of Canada benefits benchmarking — institutional research'),

  ('Group Benefits in Canada: What Employers Must Provide', 'Workzoom (citing Conference Board of Canada)',
   'https://www.workzoom.com/blog/employee-benefits-canada-employers/',
   'Workzoom-ConfBoard-RRSP-2026', '2026-03-01', 'ALL', 'institutional_research', 2,
   'Employer RRSP/DPSP matching: 28% (20-49 employees) to 84% (1000+); 72% at 100+ employees. Match 50-100% on 2-5% of salary.', true,
   'Conference Board of Canada data on employer RRSP matching, cited via Workzoom'),

  ('Canadian Accounts Receivable Statistics & Payment Times', 'Paidnice (Xero/Statistics Canada methodology)',
   'https://www.paidnice.com/accounts-receivable-statistics/canada',
   'Paidnice-Xero-AR-2025', '2026-03-01', 'ALL', 'institutional_research', 2,
   'Canada avg invoice-to-payment: 27.9 days; AB: 27.2; BC: 26.1; ON: 27.2', true,
   'Derived from Xero Small Business Insights weighted to StatsCan industry distribution'),

  ('B2B Payment Practices Trends in Canada', 'Atradius',
   'https://atradius.fr/dam/jcr:8d95e5e0-fe8f-45e9-8bff-2970f2cf0a2b/payment-practices-barometer-north-america-can-en.pdf',
   'Atradius-B2B-Payments-2025', '2026-03-01', 'ALL', 'institutional_research', 2,
   'Overdue invoices converted to cash on average one month beyond due date in Canada', true,
   'Institutional trade credit insurer research on B2B payment behavior'),

  ('How Much Is Dental Insurance in Canada (2026)', 'PolicyMe',
   'https://www.policyme.com/dental-insurance/how-much-does-dental-insurance-cost-in-canada',
   'PolicyMe-Dental-2026', '2026-03-01', 'ALL', 'insurance_brokerage', 3,
   'Individual adult dental+health: $75-$175/month typical', false,
   'Insurance brokerage published pricing — medium confidence, no StatsCan equivalent')

on conflict (id) do nothing;


-- ═══════════════════════════════════════════════════════════════
-- C. CORRECT BENCHMARK VALUES — supersede wrong data, insert verified
-- ═══════════════════════════════════════════════════════════════

-- Recreate helper function
create or replace function _seed_verified(
  p_category_slug text,
  p_region_code text,
  p_scenario text,
  p_low numeric, p_median numeric, p_high numeric,
  p_unit text, p_engagement text,
  p_includes text, p_excludes text,
  p_confidence int, p_notes text,
  p_source_type text, p_is_citable boolean
) returns uuid as $$
declare
  v_cat_id uuid;
  v_region_id uuid;
  v_bv_id uuid;
begin
  select id into v_cat_id from public.benchmark_categories where slug = p_category_slug;
  if v_cat_id is null then raise exception 'Category not found: %', p_category_slug; end if;
  if p_region_code is not null then
    select id into v_region_id from public.regions where code = p_region_code and superseded_date is null;
    if v_region_id is null then raise exception 'Region not found: %', p_region_code; end if;
  end if;

  -- Supersede any existing active rows for this category/region/scenario
  update public.benchmark_values set superseded_date = current_date
  where benchmark_category_id = v_cat_id
    and coalesce(region_id::text, 'null') = coalesce(v_region_id::text, 'null')
    and scenario = p_scenario
    and superseded_date is null;

  insert into public.benchmark_values (
    benchmark_category_id, region_id, scenario,
    value_low, value_median, value_high,
    unit, engagement_structure, includes, excludes,
    confidence_score, notes, source_type, is_citable,
    effective_date
  ) values (
    v_cat_id, v_region_id, p_scenario,
    p_low, p_median, p_high,
    p_unit, p_engagement, p_includes, p_excludes,
    p_confidence, p_notes, p_source_type, p_is_citable,
    current_date
  ) returning id into v_bv_id;

  return v_bv_id;
end;
$$ language plpgsql;


-- ── INCORPORATION GOVT FEE (corrected to match verified government schedules) ──

select _seed_verified('incorporation_govt_fee', 'AB', 'all',
  333, 433, 483, 'CAD', 'govt_fee',
  'Government fee $283.25 + registry agent service charge ($50-$200)',
  'Agent service charge varies by provider',
  5, 'Verified: AB govt fee $283.25 per registry agent product catalogue Oct 2025. Agent service charges uncapped.',
  'government_official', true);

select _seed_verified('incorporation_govt_fee', 'ON', 'all',
  300, 300, 360, 'CAD', 'govt_fee',
  'Ontario Business Registry filing fee $300',
  'NUANS search fee separate if required ($60)',
  5, 'Verified: Ontario.ca — BCA fee schedule. $300 online (immediate).',
  'government_official', true);

select _seed_verified('incorporation_govt_fee', 'BC', 'all',
  380, 380, 380, 'CAD', 'govt_fee',
  'BC Registries: $350 basic fee + $30 name approval',
  null,
  5, 'Verified: BC Registry fee schedule. BC uses own name system (not NUANS).',
  'government_official', true);

select _seed_verified('incorporation_govt_fee', 'FED', 'all',
  200, 214, 350, 'CAD', 'govt_fee',
  'Corporations Canada: $200 online (1-day processing)',
  'Express +$100 (4-hour processing). Mail/email $250 (10 days).',
  5, 'Verified: ISED fee schedule. Low=$200 online, median=$200+$14 NUANS, high=$250+$100 express.',
  'government_official', true);

-- ── NUANS NAME SEARCH (corrected) ──
select _seed_verified('nuans_name_search', null, 'all',
  0, 14, 60, 'CAD', 'govt_fee',
  'NUANS report: $0 standard or $13.80 via Corporations Canada portal; third-party $13.80-$60',
  null,
  5, 'Verified: ISED Online Filing Centre. $0 standard, $13.80 portal. Third-party agents charge $13.80-$60.',
  'government_official', true);

-- ── ANNUAL RETURN (corrected to verified government fees) ──
select _seed_verified('annual_return_registry', 'AB', 'all',
  52, 80, 90, 'CAD', 'annual',
  'Government fee $51.50 via registry agent + agent service charge',
  null,
  5, 'Verified: AB registry agent catalogue. Govt fee $51.50 fixed. Agent total typically $80-$90.',
  'government_official', true);

select _seed_verified('annual_return_registry', 'ON', 'all',
  0, 0, 0, 'CAD', 'annual',
  'Annual return via Ontario Business Registry — $0 government fee',
  'Requires Company Key (5-7 business days if not held). CRA no longer accepts since May 2021.',
  5, 'Verified: Ontario.ca. $0 fee. OBR Company Key required.',
  'government_official', true);

select _seed_verified('annual_return_registry', 'BC', 'all',
  43.39, 43.39, 43.39, 'CAD', 'annual',
  'Annual report via BC Corporate Online',
  null,
  5, 'Verified: BC Registry fee schedule. Due within 2 months of incorporation anniversary.',
  'government_official', true);

select _seed_verified('annual_return_registry', 'FED', 'all',
  12, 12, 12, 'CAD', 'annual',
  'Federal annual return via Corporations Canada online',
  'Separate from extra-provincial obligations in operating province.',
  5, 'Verified: ISED fee schedule. $12/year online.',
  'government_official', true);


-- ═══════════════════════════════════════════════════════════════
-- D. DEMOTE WEAK BENCHMARKS — mark non-citable
-- ═══════════════════════════════════════════════════════════════

-- Vendor coordination drag: no institutional source exists
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 1,
  admin_notes = 'Verified source audit: No StatsCan, BDC, CFIB, or equivalent institutional study quantifies vendor coordination hours. Converted to methodology assumption.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'vendor_coordination_drag')
  and superseded_date is null;

-- Ramp lag months: blog-sourced only
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: "Time to first revenue" originated from Metaintro (blog) and US consulting sources. No Canadian institutional dataset. Retained as methodology assumption.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'ramp_lag_months')
  and superseded_date is null;

-- Website design: agency websites only
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Website cost ranges sourced from agency websites (Holler Digital, Bark.com). No institutional equivalent. Demoted.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'website_design')
  and superseded_date is null;

-- Fractional CFO: vendor self-pricing
update public.benchmark_values set
  is_citable = false,
  source_type = 'law_firm_published_pricing',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Sourced from The Expert CFO (vendor self-pricing). No institutional legal cost survey. Retained for modeling but not citable.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'fractional_cfo_monthly')
  and superseded_date is null;

-- Strategy consultant: no institutional source
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: No institutional source for strategy consulting pricing ranges. Retained for modeling but not citable.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'strategy_consultant_project')
  and superseded_date is null;

-- Agency retainer: pricing aggregator source
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Sourced from Bark.com (pricing aggregator). No institutional equivalent.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'agency_retainer_monthly')
  and superseded_date is null;

-- CPA advisory hourly: pricing aggregator
update public.benchmark_values set
  source_type = 'law_firm_published_pricing',
  confidence_score = 3,
  admin_notes = 'Verified source audit: CPA pricing from firm guides (MaxPro, CoCountant). Reasonable but not institutional. Retained as citable at lower confidence.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'cpa_advisory_hourly')
  and superseded_date is null;

-- Mark all existing Phase-2 time-economics benchmarks as methodology assumptions
-- (time_to_operational_readiness, time_to_first_revenue, first_invoice_lag from 022)
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: No Canadian institutional dataset for time-to-operational-readiness or time-to-first-revenue. Retained as methodology assumption for calculator modeling.'
where benchmark_category_id in (
  select id from public.benchmark_categories
  where slug in ('time_to_operational_readiness', 'time_to_first_revenue', 'first_invoice_lag')
)
and superseded_date is null;

-- Accelerator equity proxy: no institutional source
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Individual program terms are primary; aggregate range not institutionally sourced. Demoted.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'accelerator_equity_proxy')
  and superseded_date is null;

-- Venture legal setup: law firm self-pricing only
update public.benchmark_values set
  is_citable = false,
  source_type = 'law_firm_published_pricing',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Prior figures from Faurie Law pricing page and Reddit. No CBA, law society, or institutional legal cost survey. Retained as low-confidence estimate.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'venture_legal_setup')
  and superseded_date is null;

-- Software stack annual: SaaS vendor blogs
update public.benchmark_values set
  is_citable = false,
  source_type = 'methodology_assumption',
  confidence_score = 2,
  admin_notes = 'Verified source audit: SaaS stack costs sourced from Clarro/vendor blogs. No institutional equivalent exists. Removed from verified dataset.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'software_stack_annual')
  and superseded_date is null;

-- Disability income insurance: insurance broker sites only
update public.benchmark_values set
  is_citable = false,
  source_type = 'insurance_brokerage',
  confidence_score = 2,
  admin_notes = 'Verified source audit: Disability premium ranges from insurance broker websites. No Statistics Canada or OSFI equivalent.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'disability_income_insurance')
  and superseded_date is null;

-- Accelerator program cost: reasonable range but no institutional survey
update public.benchmark_values set
  source_type = 'methodology_assumption',
  confidence_score = 2,
  is_citable = false,
  admin_notes = 'Verified source audit: Program fees vary by program. No institutional survey of accelerator costs exists for Canada.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'accelerator_program_cost')
  and superseded_date is null;


-- ═══════════════════════════════════════════════════════════════
-- E. UPDATE VERIFIED BENCHMARKS WITH SOURCE TYPE
-- ═══════════════════════════════════════════════════════════════

-- Mark remaining high-confidence benchmarks with proper source_type
-- Trademark govt fee (CIPO — government)
update public.benchmark_values set source_type = 'government_official'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'trademark_govt_fee')
  and superseded_date is null and source_type = 'unclassified';

-- Trademark legal fee
update public.benchmark_values set source_type = 'law_firm_published_pricing'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'trademark_legal_fee')
  and superseded_date is null and source_type = 'unclassified';

-- SR&ED fees
update public.benchmark_values set source_type = 'law_firm_published_pricing'
where benchmark_category_id in (
  select id from public.benchmark_categories where slug in ('sred_contingency_fee', 'sred_flat_fee')
) and superseded_date is null and source_type = 'unclassified';

-- E&O and general liability insurance
update public.benchmark_values set source_type = 'insurance_brokerage'
where benchmark_category_id in (
  select id from public.benchmark_categories where slug in ('e_and_o_insurance', 'general_liability_insurance')
) and superseded_date is null and source_type = 'unclassified';

-- WCB premium (government)
update public.benchmark_values set source_type = 'government_official'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'wcb_premium')
  and superseded_date is null and source_type = 'unclassified';

-- GST registration and filing
update public.benchmark_values set source_type = 'government_official'
where benchmark_category_id in (
  select id from public.benchmark_categories where slug in ('gst_hst_registration', 'gst_hst_filing_preparation')
) and superseded_date is null and source_type = 'unclassified';

-- Bookkeeping, T2, tax planning: firm-published pricing
update public.benchmark_values set source_type = 'law_firm_published_pricing'
where benchmark_category_id in (
  select id from public.benchmark_categories where slug in ('bookkeeping_monthly', 't2_corporate_filing', 'tax_planning_incorporated')
) and superseded_date is null and source_type = 'unclassified';

-- Legal fees: law firm published
update public.benchmark_values set source_type = 'law_firm_published_pricing'
where benchmark_category_id in (
  select id from public.benchmark_categories where slug in ('incorporation_legal_fee', 'shareholders_agreement', 'msa_client_contract', 'minute_book_maintenance')
) and superseded_date is null and source_type = 'unclassified';

-- Health/dental insurance (self-funded): insurance brokerage
update public.benchmark_values set
  source_type = 'insurance_brokerage',
  confidence_score = 3,
  admin_notes = 'Verified source audit: PolicyMe published pricing. Cross-referenced with Conference Board employer premium range. Not Tier 1 but reasonable.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'health_dental_insurance')
  and superseded_date is null;

-- Retirement contribution gap: methodology (calculated from comp)
update public.benchmark_values set
  source_type = 'institutional_research',
  confidence_score = 3,
  is_citable = true,
  admin_notes = 'Verified source audit: Conference Board of Canada confirms 72% of 100+ employee firms offer RRSP matching at 2-5% of salary. Calculator uses dynamic calc from user comp.'
where benchmark_category_id = (select id from public.benchmark_categories where slug = 'retirement_contribution_gap')
  and superseded_date is null;


-- ═══════════════════════════════════════════════════════════════
-- F. ADD VERIFIED METHODOLOGY CONFIGS
-- ═══════════════════════════════════════════════════════════════

-- Update existing EI configs with verified source metadata
update public.methodology_configs set
  confidence_score = 5,
  source_type = 'government_official'
where key in ('ei_replacement_rate', 'ei_max_weekly_benefit_2026', 'ei_max_insurable_earnings_2026')
  and superseded_date is null;

-- Update GST threshold
update public.methodology_configs set
  confidence_score = 5,
  source_type = 'government_official'
where key = 'gst_registration_threshold' and superseded_date is null;

-- Update SR&ED claim value
update public.methodology_configs set
  confidence_score = 4,
  source_type = 'government_official'
where key = 'sred_avg_claim_value' and superseded_date is null;

-- Demote utilization configs
update public.methodology_configs set
  confidence_score = 2,
  source_type = 'demoted_benchmark'
where key in ('utilization_default_year1', 'utilization_default_established', 'ramp_months_to_full_utilization')
  and superseded_date is null;

-- Demote first revenue lag
update public.methodology_configs set
  confidence_score = 2,
  source_type = 'demoted_benchmark'
where key = 'first_revenue_lag_median_months' and superseded_date is null;

-- Add verified CPP configs
insert into public.methodology_configs (key, label, value, description, scenario_scope, effective_date, confidence_score, source_type)
values
  ('cpp_self_employed_total_max_2026', 'CPP Self-Employed Total Max (2026)', '9292.90',
   'CPP1 $8,460.90 + CPP2 $832 = $9,292.90 total maximum self-employed contribution',
   'all', '2026-01-01', 5, 'government_official'),
  ('cpp_employee_surplus_annual', 'CPP Self-Employed Surplus vs Employee', '4646.45',
   'Annual surplus self-employed pays: employee $4,646.45 vs self-employed $9,292.90',
   'all', '2026-01-01', 5, 'government_official'),
  ('employer_health_dental_coverage_rate', 'Employer Health/Dental Coverage Rate', '0.668',
   '66.8% of Canadian employees had workplace medical/dental benefits in 2024',
   'all', '2026-01-01', 5, 'government_official'),
  ('employer_benefit_cost_low', 'Employer Benefit Cost Range (Low)', '3000',
   'Employer-paid benefit cost range: $3,000-$8,000/employee/year',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('employer_benefit_cost_high', 'Employer Benefit Cost Range (High)', '8000',
   'Employer-paid benefit cost range: $3,000-$8,000/employee/year',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('employer_rrsp_match_rate_low', 'Employer RRSP Match Rate (Low)', '0.02',
   'Typical employer RRSP match: 50-100% on 2-5% of salary (Conference Board)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('employer_rrsp_match_rate_high', 'Employer RRSP Match Rate (High)', '0.05',
   'Typical employer RRSP match: 50-100% on 2-5% of salary (Conference Board)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('invoice_to_payment_days_canada', 'Invoice-to-Payment Days (Canada)', '27.9',
   'Canada national average: 27.9 days from invoice to payment (Xero/StatsCan methodology)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('invoice_to_payment_days_ab', 'Invoice-to-Payment Days (Alberta)', '27.2',
   'Alberta: 27.2 days average (Xero/StatsCan methodology)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('invoice_to_payment_days_bc', 'Invoice-to-Payment Days (BC)', '26.1',
   'BC: 26.1 days average (Xero/StatsCan methodology)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('invoice_to_payment_days_on', 'Invoice-to-Payment Days (Ontario)', '27.2',
   'Ontario: 27.2 days average (Xero/StatsCan methodology)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('overdue_recovery_lag_days', 'B2B Overdue Invoice Recovery Lag', '30',
   'Overdue invoices converted to cash on average 1 month beyond due date (Atradius)',
   'all', '2026-01-01', 4, 'institutional_research'),
  ('avg_hourly_wage_canada_2024', 'Average Hourly Wage Canada (2024)', '35.20',
   'Statistics Canada: $35.20/hour average for employees aged 15+',
   'all', '2026-01-01', 5, 'government_official'),
  ('avg_annual_earnings_canada_2024', 'Average Annual Earnings Canada (2024)', '65912',
   'Statistics Canada: $65,912/year ($1,267.54/week × 52)',
   'all', '2026-01-01', 5, 'government_official'),
  ('self_employed_share_2023', 'Self-Employed Population Share (2023)', '0.132',
   '13.2% of employed population = 2,652,600 self-employed (Statistics Canada)',
   'all', '2026-01-01', 5, 'government_official'),
  ('own_account_parttime_rate_2023', 'Own-Account Worker Part-Time Rate (2023)', '0.326',
   '32.6% of own-account workers worked part-time (Statistics Canada)',
   'all', '2026-01-01', 5, 'government_official'),
  ('vendor_drag_hours_per_vendor_median', 'Vendor Coordination Hours Per Vendor (Median)', '40',
   'Methodology assumption: estimated founder hours spent coordinating each fragmented vendor. No institutional source exists.',
   'all', '2026-01-01', 1, 'methodology_assumption'),
  ('self_funded_health_dental_monthly_low', 'Self-Funded Health/Dental Monthly (Low)', '75',
   'Individual adult private plan: $75-$175/month (PolicyMe published pricing). Not Tier 1.',
   'all', '2026-01-01', 3, 'insurance_brokerage'),
  ('self_funded_health_dental_monthly_high', 'Self-Funded Health/Dental Monthly (High)', '175',
   'Individual adult private plan: $75-$175/month (PolicyMe published pricing). Not Tier 1.',
   'all', '2026-01-01', 3, 'insurance_brokerage')
on conflict do nothing;

-- Update disclosure text to reflect verified-source model
update public.methodology_configs set
  value = '"Estimates are based on verified government fee schedules, institutional research (Statistics Canada, Conference Board of Canada, CRA, ESDC), and published professional-services pricing. Items marked as methodology assumptions are not externally verified — they are directional estimates used for modeling purposes. This calculator is for informational purposes only and does not constitute financial or legal advice."',
  confidence_score = 5,
  source_type = 'internal_methodology'
where key = 'disclosure_text' and superseded_date is null;

-- Update benchmark dataset version
update public.methodology_configs set
  value = '"2026.03.2"'
where key = 'benchmark_dataset_version' and superseded_date is null;

-- Update invoice-to-cash methodology with verified data
update public.methodology_configs set
  value = '58',
  description = 'Net-30 invoice terms + 27.9-day avg payment time = ~58 days typical invoice-to-cash (Xero/StatsCan + Atradius)',
  confidence_score = 4,
  source_type = 'institutional_research'
where key = 'first_invoice_to_cash_days_b2b' and superseded_date is null;


-- Clean up helper
drop function if exists _seed_verified;
