-- =============================================================================
-- 021_calculator_seed_data.sql
-- Phase 1: Seed data for the calculator engine
-- Source of truth: Execom Calculator Architecture & Benchmark Research Brief
-- =============================================================================

-- ---------------------------------------------------------------------------
-- A. REGIONS (4 Phase 1 jurisdictions)
-- ---------------------------------------------------------------------------
insert into public.regions (code, name, incorporation_type, registry_agent_required, uses_nuans,
  gst_hst_type, gst_hst_rate, pst_rate, wcb_avg_rate_pct,
  residency_director_requirement, annual_return_fee, annual_return_gov_fee, filing_floor,
  notes, effective_date)
values
  ('AB', 'Alberta', 'provincial', true, true,
   'GST_only', 0.05, null, 0.0141,
   false, 90, 0, 550,
   'AB has no direct govt portal; registry agent mandatory. Annual return $80–$90 at agent. Filing floor includes incorporation govt fee + NUANS via agent.',
   '2026-01-01'),

  ('ON', 'Ontario', 'provincial', false, true,
   'HST', 0.13, null, null,
   false, 0, 0, 400,
   'ON annual return $0 govt fee but requires Company Key + My Ontario Account (10–15 day setup). Common accountant error: filing T2 only and missing OBR registry filing.',
   '2026-01-01'),

  ('BC', 'British Columbia', 'provincial', false, false,
   'GST_only', 0.05, 0.07, 0.0155,
   false, 43.39, 43.39, 400,
   'BC uses its own name system (not NUANS). Annual report $43.39/yr due within 2 months of anniversary.',
   '2026-01-01'),

  ('FED', 'Federal', 'federal', false, true,
   'GST_only', 0.05, null, null,
   true, 12, 12, 500,
   'Federal: $12/year online annual return. 25% Canadian-resident director requirement. Extra-prov registration still needed in operating province.',
   '2026-01-01');

-- ---------------------------------------------------------------------------
-- B. BENCHMARK CATEGORIES (Phase 1 subset — core calculator categories)
-- ---------------------------------------------------------------------------
insert into public.benchmark_categories (slug, label, category_group, applies_to_scenarios, is_one_time, recurrence_unit, requires_sred, is_optional, description)
values
  -- Legal
  ('incorporation_govt_fee', 'Incorporation Government Fee', 'legal',
   '{lean,professional,full_stack}', true, null, false, false,
   'Province-specific government filing fee for incorporation'),
  ('nuans_name_search', 'NUANS Name Search', 'legal',
   '{lean,professional,full_stack}', true, null, false, false,
   'Federal/provincial name search fee. Not required in BC.'),
  ('incorporation_legal_fee', 'Incorporation Legal/Agent Fee', 'legal',
   '{professional,full_stack}', true, null, false, false,
   'Professional fee charged by law firm or registry agent for incorporation preparation'),
  ('shareholders_agreement', 'Shareholders'' Agreement', 'legal',
   '{professional,full_stack}', true, null, false, true,
   'Legal drafting of shareholder agreement. Ranges by complexity.'),
  ('msa_client_contract', 'Master Services Agreement', 'legal',
   '{lean,professional,full_stack}', true, null, false, false,
   'Client-facing master services or consulting agreement'),
  ('trademark_govt_fee', 'Trademark Government Fee (CIPO)', 'legal',
   '{professional,full_stack}', true, 'per_filing', false, true,
   'CIPO trademark application fee per class of goods/services'),
  ('trademark_legal_fee', 'Trademark Legal Fee', 'legal',
   '{professional,full_stack}', true, null, false, true,
   'Search + filing preparation by trademark agent/lawyer'),

  -- Accounting & Tax
  ('t2_corporate_filing', 'T2 Corporate Tax Filing', 'accounting_tax',
   '{lean,professional,full_stack}', false, 'annual', false, false,
   'Annual corporate income tax return preparation'),
  ('bookkeeping_monthly', 'Monthly Bookkeeping', 'accounting_tax',
   '{lean,professional,full_stack}', false, 'monthly', false, false,
   'Monthly bookkeeping retainer for small business'),
  ('cpa_advisory_hourly', 'CPA Advisory (Hourly)', 'accounting_tax',
   '{professional,full_stack}', false, null, false, true,
   'Ad hoc CPA advisory at hourly rates'),
  ('tax_planning_incorporated', 'Tax Planning (Incorporated)', 'accounting_tax',
   '{professional,full_stack}', false, 'annual', false, true,
   'Salary vs dividends optimization and tax planning'),
  ('sred_contingency_fee', 'SR&ED Consultant Fee (Contingency)', 'accounting_tax',
   '{professional,full_stack}', false, 'per_claim', true, false,
   'Percentage of claim charged by SR&ED consultants'),
  ('sred_flat_fee', 'SR&ED Consultant Fee (Flat)', 'accounting_tax',
   '{professional,full_stack}', false, 'per_claim', true, false,
   'Fixed flat fee for SR&ED claim preparation'),

  -- Compliance
  ('annual_return_registry', 'Annual Return (Registry)', 'compliance',
   '{lean,professional,full_stack}', false, 'annual', false, false,
   'Province-specific annual corporate registry filing'),
  ('gst_hst_registration', 'GST/HST Registration', 'compliance',
   '{lean,professional,full_stack}', true, null, false, false,
   'One-time registration; mandatory at $30K revenue threshold'),
  ('gst_hst_filing_preparation', 'GST/HST Filing Preparation', 'compliance',
   '{lean,professional,full_stack}', false, 'annual', false, false,
   'Accountant fee to prepare quarterly/annual GST/HST filings'),
  ('minute_book_maintenance', 'Minute Book Maintenance', 'compliance',
   '{professional,full_stack}', false, 'annual', false, true,
   'Annual resolutions, director updates, share allotments'),

  -- Insurance
  ('e_and_o_insurance', 'Professional Liability / E&O', 'insurance',
   '{lean,professional,full_stack}', false, 'annual', false, false,
   'Professional liability insurance. Required contractually by many B2B clients.'),
  ('general_liability_insurance', 'General Liability Insurance', 'insurance',
   '{lean,professional,full_stack}', false, 'annual', false, true,
   'Commercial general liability coverage'),
  ('wcb_premium', 'WCB/WSIB Premium', 'insurance',
   '{lean,professional,full_stack}', false, 'annual', false, true,
   'Province-specific workers compensation. Optional for solo but required by some clients.'),

  -- Marketing
  ('agency_retainer_monthly', 'Marketing Agency Retainer', 'marketing',
   '{full_stack}', false, 'monthly', false, true,
   'Monthly digital marketing agency retainer'),
  ('website_design', 'Website / Brand Build', 'marketing',
   '{professional,full_stack}', true, null, false, true,
   'One-time brand identity and website development'),

  -- Advisory
  ('fractional_cfo_monthly', 'Fractional CFO', 'advisory',
   '{full_stack}', false, 'monthly', false, true,
   'Monthly fractional CFO retainer'),
  ('strategy_consultant_project', 'Strategy Consultant', 'advisory',
   '{full_stack}', true, null, false, true,
   'Per-engagement strategy consulting'),

  -- Delay / Opportunity Cost
  ('delay_cost_monthly', 'Monthly Delay Cost', 'delay_opportunity',
   '{delay}', false, 'monthly', false, false,
   'Income foregone per month of inaction: (annual_comp / 12)'),
  ('ei_replacement_monthly', 'EI Monthly Replacement', 'delay_opportunity',
   '{delay}', false, 'monthly', false, false,
   'EI benefit at 55% of insurable earnings, max $729/week'),
  ('ramp_lag_months', 'Revenue Ramp Lag', 'delay_opportunity',
   '{all}', false, null, false, false,
   'Months to first reliable revenue stream'),
  ('vendor_coordination_drag', 'Vendor Coordination Drag', 'delay_opportunity',
   '{fragmented_founder_path}', false, null, false, false,
   'Weeks lost to managing fragmented advisors');


-- ---------------------------------------------------------------------------
-- C. SOURCES (Phase 1 — key sources with trust tiers)
-- ---------------------------------------------------------------------------
insert into public.sources (title, publisher, url, citation_label, accessed_date, region_code, source_type, trust_tier, claim_supported, is_primary, notes)
values
  -- Tier 1: Government
  ('Services, fees and processing times', 'Corporations Canada (ISED)', 'https://ised-isde.canada.ca/site/corporations-canada/en/services-fees-and-processing-times',
   'Corp-Canada-2026', '2026-03-01', 'FED', 'government_official', 1, 'Federal annual return $12 online', true, null),

  ('Fee Schedule - Corporate Online', 'BC Registries', 'https://www.corporateonline.gov.bc.ca/WebHelp/fee_schedule.htm',
   'BC-Registries-2026', '2026-03-01', 'BC', 'government_official', 1, 'BC incorporation $350, annual report $43.39', true, null),

  ('Fees for trademarks', 'CIPO', 'https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/trademarks/fees-trademarks',
   'CIPO-2026', '2026-03-01', 'FED', 'government_official', 1, 'CIPO trademark application fees for 2026', true, null),

  ('EI Regular Benefits - How much could you receive', 'Canada.ca', 'https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit/benefit-amount.html',
   'EI-Benefits-2026', '2026-03-01', 'FED', 'government_official', 1, 'Maximum weekly EI benefit $729 (2026)', true, null),

  ('When to register for and start charging the GST/HST', 'Canada.ca', 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html',
   'CRA-GST-2026', '2026-03-01', 'FED', 'government_official', 1, 'GST/HST mandatory registration at $30,000 threshold', true, null),

  ('Annual returns for corporations', 'Alberta.ca', 'https://www.alberta.ca/corporations-cooperatives-organizations-annual-returns',
   'AB-AnnualReturn-2026', '2026-03-01', 'AB', 'government_official', 1, 'Alberta annual return process and requirements', true, null),

  ('Notice - Corporations Information Act - Filing an Annual Return', 'ServiceOntario', 'https://forms.mgcs.gov.on.ca/dataset/6c1fdc85-c100-493d-93ca-d86ef2c6a260/resource/a1e78643-e06e-403f-9aec-f26c10b26712/download/on00229e.pdf',
   'ON-AnnualReturn-2026', '2026-03-01', 'ON', 'government_official', 1, 'Ontario annual return $0 fee, requires ServiceOntario account', true, null),

  ('2025 premium rates', 'WorkSafeBC', 'https://www.worksafebc.com/en/insurance/know-coverage-costs/industry-premium-rates/2025-rates',
   'WorkSafeBC-2025', '2026-03-01', 'BC', 'government_regulation', 1, 'BC average base premium rate 1.55%', true, null),

  ('New Canada Employment Insurance Rules In 2026', 'Immigration News Canada', 'https://immigrationnewscanada.ca/canada-employment-insurance-rules-2026/',
   'EI-Rules-2026', '2026-03-01', 'FED', 'government_regulation', 1, 'EI max weekly benefit $729, max insurable earnings $68,900', false, null),

  -- Tier 2: Firm published pricing
  ('Business Registration Costs in Canada Explained', 'Bizincs', 'https://bizincs.com/business-registration-costs-canada/',
   'Bizincs-2026', '2026-03-01', 'ALL', 'industry_benchmark_report', 2, 'Cross-province incorporation cost comparison', false, null),

  ('Shareholders'' Agreement Canada (2025 Guide)', 'Kalfa Law Firm', 'https://kalfalaw.com/shareholders-agreements-canada-2025-guide/',
   'Kalfa-SHA-2025', '2026-03-01', 'ALL', 'law_firm_published_pricing', 2, 'SHA legal fees $2,000-$5,000', true, null),

  ('What It Costs To Register A Trademark In Canada In 2025', 'Heer Law', 'https://www.heerlaw.com/trademark-cost-canada',
   'HeerLaw-TM-2025', '2026-03-01', 'ALL', 'law_firm_published_pricing', 2, 'Trademark registration all-in costs', true, null),

  ('How Much Do SR&ED Consultants Charge?', 'GrowWise Partners', 'https://growwise.ai/sred/understanding-sred-consulting-fees-how-much-do-sred-consultants-charge/',
   'GrowWise-SRED-2025', '2026-03-01', 'FED', 'accounting_firm_pricing', 2, 'SR&ED contingency fees 10-30% of claim', true, null),

  ('SRED Flat Fees: 3 Great Reasons They Beat SR&ED Percentage', 'SRED.ca', 'https://sred.ca/2025/09/sred-flat-fees/',
   'SREDca-Flat-2025', '2026-03-01', 'FED', 'accounting_firm_pricing', 2, 'SR&ED flat fee model vs percentage', true, null),

  ('Small Business Bookkeeping Cost Monthly [2025 Guide]', 'CoCountant', 'https://cocountant.com/blog/small-business-bookkeeping-cost-monthly/',
   'CoCountant-Bookkeeping-2025', '2026-03-01', 'ALL', 'accounting_firm_pricing', 2, 'Monthly bookkeeping cost $300-$800', false, null),

  ('Accountant Cost in Canada 2026 Business Pricing Guide', 'MaxPro Financials', 'https://maxprofinancials.ca/articles/accounting-cost-in-canada/',
   'MaxPro-Accounting-2026', '2026-03-01', 'ALL', 'accounting_firm_pricing', 2, 'Monthly accounting fees $450-$800', false, null),

  ('Average Cost of Professional Liability Insurance', 'Acera Insurance', 'https://acera.ca/average-cost-of-professional-liability-insurance/',
   'Acera-EO-2025', '2026-03-01', 'ALL', 'industry_benchmark_report', 2, 'E&O insurance $500-$1,500/year for small business', false, null),

  ('Corporate Services List', 'Edmonton Registry', 'https://services.edmontonregistry.com/article/181-corporate-services-list',
   'EdmontonRegistry-2026', '2026-03-01', 'AB', 'registry_agent_schedule', 2, 'AB incorporation via agent $490, extra-prov $490', true, null),

  ('Annual Return for Alberta Corporations', 'Edmonton Registry', 'https://services.edmontonregistry.com/article/159-annual-return-for-alberta-and-extra-provincial-corporations',
   'EdmontonRegistry-AR-2026', '2026-03-01', 'AB', 'registry_agent_schedule', 2, 'AB annual return at registry agent', true, null),

  -- Tier 2: Industry benchmark
  ('Your First 90 Days as a Consultant', 'Metaintro', 'https://www.metaintro.com/blog/first-90-days-consulting-business-career-change-2026',
   'Metaintro-90Days-2026', '2026-03-01', 'ALL', 'industry_benchmark_report', 2, 'Months to first reliable revenue, ramp benchmarks', false, null),

  ('How Long It Really Takes To Start A Business', 'Life Skills That Matter', 'https://www.lifeskillsthatmatter.com/blog/how-long-it-really-takes-to-start-a-business',
   'LSTM-Timing-2025', '2026-03-01', 'ALL', 'industry_benchmark_report', 2, 'Financial stability timeline from 500+ solopreneurs survey', false, null),

  ('Do Your Utilization Rates Compare to Industry Benchmarks?', 'Runn', 'https://www.runn.io/blog/utilization-rate-benchmarks',
   'Runn-Utilization-2025', '2026-03-01', 'ALL', 'industry_benchmark_report', 2, 'Management consulting firm-wide billable utilization ~70%', false, null),

  -- Tier 3: Aggregators
  ('Cost Of Hiring A Marketing Agency In Canada', 'Bark.com', 'https://www.bark.com/en/ca/marketing/marketing-agency-price-guide/',
   'Bark-Marketing-2025', '2026-03-01', 'ALL', 'market_pricing_aggregator', 3, 'Marketing agency retainer pricing ranges', false, null),

  ('How Much Does An Accountant Cost 2025', 'Bark.com', 'https://www.bark.com/en/ca/accountants/how-much-does-an-accountant-cost/',
   'Bark-Accounting-2025', '2026-03-01', 'ALL', 'market_pricing_aggregator', 3, 'Accountant hourly rates $150-$400', false, null),

  ('Website Design Pricing in Canada: 2026 Cost Guide', 'Holler Digital', 'https://hollerdigital.com/insights/how-much-does-a-website-cost/',
   'Holler-WebDesign-2026', '2026-03-01', 'ALL', 'secondary_pricing_research', 3, 'Website costs $4,500-$14,000 for strategic sites', false, null),

  ('Fractional CFO Cost: Truth About Rates & Pricing', 'The Expert CFO', 'https://theexpertcfo.com/fractional-cfo-cost-truth-about-rates-pricing/',
   'ExpertCFO-Pricing-2025', '2026-03-01', 'ALL', 'secondary_pricing_research', 3, 'Fractional CFO $3,000-$7,500/month retainer', false, null);


-- ---------------------------------------------------------------------------
-- D. BENCHMARK VALUES — Province-Specific + National
-- ---------------------------------------------------------------------------
-- We reference regions and categories by their known codes/slugs via subqueries.
-- This keeps the seed idempotent and avoids hardcoding UUIDs.

-- Helper: create a temporary function to simplify inserts
create or replace function _seed_benchmark(
  p_category_slug text,
  p_region_code text,  -- null for all regions
  p_scenario text,
  p_low numeric, p_median numeric, p_high numeric,
  p_unit text, p_engagement text,
  p_includes text, p_excludes text,
  p_confidence int, p_notes text
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

  insert into public.benchmark_values (
    benchmark_category_id, region_id, scenario,
    value_low, value_median, value_high,
    unit, engagement_structure,
    includes, excludes,
    confidence_score, notes, effective_date
  ) values (
    v_cat_id, v_region_id, p_scenario,
    p_low, p_median, p_high,
    p_unit, p_engagement,
    p_includes, p_excludes,
    p_confidence, p_notes, '2026-01-01'
  ) returning id into v_bv_id;

  return v_bv_id;
end;
$$ language plpgsql;


-- ---- INCORPORATION GOVT FEE (province-specific) ----
select _seed_benchmark('incorporation_govt_fee', 'AB', 'all',
  480, 550, 560, 'CAD', 'govt_fee',
  'Provincial filing + name search via registry agent', null,
  5, 'AB has no direct govt portal; registry agent mandatory. Includes NUANS.');

select _seed_benchmark('incorporation_govt_fee', 'ON', 'all',
  300, 300, 360, 'CAD', 'govt_fee',
  'Ontario Business Registry filing fee', null,
  5, 'OBR direct filing. Additional $60 for NUANS.');

select _seed_benchmark('incorporation_govt_fee', 'BC', 'all',
  350, 380, 380, 'CAD', 'govt_fee',
  'BC Registries filing fee + name approval', null,
  5, 'BC uses own name system, not NUANS. $350 base + $30 name approval.');

select _seed_benchmark('incorporation_govt_fee', 'FED', 'all',
  200, 260, 260, 'CAD', 'govt_fee',
  'Corporations Canada online filing', 'Extra-provincial registration in operating province',
  5, 'Federal: $200 filing + $14-$60 NUANS. Extra-prov reg still needed.');

-- ---- NUANS NAME SEARCH ----
select _seed_benchmark('nuans_name_search', null, 'all',
  14, 48, 60, 'CAD', 'govt_fee',
  'NUANS name reservation search report', null,
  4, 'Federal $14 direct, agents $48-$60. Not required in BC.');

-- ---- INCORPORATION LEGAL/AGENT FEE ----
select _seed_benchmark('incorporation_legal_fee', null, 'professional',
  500, 1500, 3000, 'CAD', 'flat_fee',
  'Lawyer/agent professional fee for incorporation prep, articles, minute book setup', null,
  3, 'Wide range: online services $500, boutique law $1,500-$3,000.');

select _seed_benchmark('incorporation_legal_fee', null, 'full_stack',
  1500, 2500, 5000, 'CAD', 'flat_fee',
  'Full legal incorporation package with articles, SHA drafting, minute book', null,
  3, 'Full-service law firm package.');

-- ---- SHAREHOLDERS AGREEMENT ----
select _seed_benchmark('shareholders_agreement', null, 'professional',
  2000, 3500, 5000, 'CAD', 'flat_fee',
  'Drafting of shareholder agreement', 'Dispute resolution, audit defense',
  4, 'Per Kalfa Law published pricing. Standard complexity.');

select _seed_benchmark('shareholders_agreement', null, 'full_stack',
  3000, 5000, 8000, 'CAD', 'flat_fee',
  'Complex SHA with multiple classes, vesting schedules', null,
  3, 'Complex structures with investor provisions.');

-- ---- MSA / CLIENT CONTRACT ----
select _seed_benchmark('msa_client_contract', null, 'all',
  500, 1500, 3000, 'CAD', 'flat_fee',
  'Master services agreement or consulting contract template', null,
  3, 'One-time drafting; ranges from template customization to bespoke.');

-- ---- TRADEMARK GOVT FEE (CIPO) ----
select _seed_benchmark('trademark_govt_fee', null, 'all',
  478, 478, 956, 'CAD', 'govt_fee',
  'CIPO trademark application filing fee per class', 'Legal preparation fees',
  5, 'CIPO 2026: $478.15 first class + $347.86 each additional. High reflects 2 classes.');

-- ---- TRADEMARK LEGAL FEE ----
select _seed_benchmark('trademark_legal_fee', null, 'all',
  1500, 2500, 4000, 'CAD', 'flat_fee',
  'Trademark search, filing preparation, agent submission', 'Prosecution, office actions',
  4, 'Per Heer Law and Dickinson Wright published rates.');

-- ---- T2 CORPORATE TAX FILING ----
select _seed_benchmark('t2_corporate_filing', null, 'all',
  800, 1500, 3000, 'CAD', 'annual',
  'T2 corporate income tax return preparation and filing', 'Audit defense, personal T1',
  3, 'Solo consultant $800-$1,500. Complex corp with investments $2,000-$3,000.');

-- ---- BOOKKEEPING MONTHLY ----
select _seed_benchmark('bookkeeping_monthly', null, 'lean',
  200, 350, 500, 'CAD', 'monthly_retainer',
  'Monthly transaction categorization, bank reconciliation', 'Tax filing, advisory',
  3, 'Per CoCountant and MaxPro published guides. DIY/minimal transactions.');

select _seed_benchmark('bookkeeping_monthly', null, 'professional',
  350, 550, 800, 'CAD', 'monthly_retainer',
  'Monthly bookkeeping with expense tracking, invoicing reconciliation', 'Tax filing',
  3, 'Mid-complexity: 50-200 transactions/month.');

select _seed_benchmark('bookkeeping_monthly', null, 'full_stack',
  500, 800, 1500, 'CAD', 'monthly_retainer',
  'Full-service bookkeeping, AR/AP, payroll prep', null,
  3, 'Higher transaction volume, payroll, multi-entity.');

-- ---- CPA ADVISORY HOURLY ----
select _seed_benchmark('cpa_advisory_hourly', null, 'all',
  150, 275, 400, 'CAD', 'hourly',
  'Ad hoc CPA advisory consultation', null,
  3, 'Per Bark.com accountant pricing guide and MaxPro.');

-- ---- TAX PLANNING ----
select _seed_benchmark('tax_planning_incorporated', null, 'all',
  500, 1500, 3000, 'CAD', 'annual',
  'Salary vs dividends optimization, RDTOH, tax deferral strategy', null,
  3, 'Annual planning engagement with incorporated professional.');

-- ---- SRED CONTINGENCY FEE ----
select _seed_benchmark('sred_contingency_fee', null, 'all',
  10, 20, 30, 'pct_of_claim', 'contingency_pct',
  'T661 preparation, cost quantification, CRA review support', 'CRA audit defense (typically billed separately)',
  4, 'Big 4: 15-25%; boutiques: 20-30%. Per GrowWise Partners.');

-- ---- SRED FLAT FEE ----
select _seed_benchmark('sred_flat_fee', null, 'all',
  5000, 12000, 25000, 'CAD', 'flat_fee',
  'Fixed-fee SR&ED claim preparation', 'Audit defense',
  4, 'Per SRED.ca flat fee model. Scales with claim complexity.');

-- ---- ANNUAL RETURN (province-specific) ----
select _seed_benchmark('annual_return_registry', 'AB', 'all',
  80, 90, 90, 'CAD', 'annual',
  'Annual return filing via registry agent', null,
  5, 'AB requires registry agent. No direct portal. $80-$90 at agent.');

select _seed_benchmark('annual_return_registry', 'ON', 'all',
  0, 0, 0, 'CAD', 'annual',
  'Annual return via Ontario Business Registry (OBR)', null,
  5, 'Ontario $0 govt fee. Requires Company Key + My Ontario Account.');

select _seed_benchmark('annual_return_registry', 'BC', 'all',
  43.39, 43.39, 43.39, 'CAD', 'annual',
  'Annual report filing via BC Corporate Online', null,
  5, 'Due within 2 months of incorporation anniversary.');

select _seed_benchmark('annual_return_registry', 'FED', 'all',
  12, 12, 12, 'CAD', 'annual',
  'Federal annual return via Corporations Canada online', null,
  5, '$12/year online. Separate from extra-prov obligations.');

-- ---- GST/HST REGISTRATION ----
select _seed_benchmark('gst_hst_registration', null, 'all',
  0, 0, 0, 'CAD', 'govt_fee',
  'CRA GST/HST business number registration', null,
  5, 'Free to register. Mandatory at $30K revenue. Online via CRA Business Registration.');

-- ---- GST/HST FILING PREP ----
select _seed_benchmark('gst_hst_filing_preparation', null, 'all',
  200, 400, 800, 'CAD', 'annual',
  'GST/HST return preparation', null,
  3, 'Annual filing prep. Quarterly filers pay more. Often bundled with bookkeeping.');

-- ---- MINUTE BOOK MAINTENANCE ----
select _seed_benchmark('minute_book_maintenance', null, 'all',
  200, 350, 500, 'CAD', 'annual',
  'Annual resolutions, officer/director updates, share allotments', null,
  3, 'Lawyer-managed. Risk of non-compliance if self-managed.');

-- ---- E&O / PROFESSIONAL LIABILITY ----
select _seed_benchmark('e_and_o_insurance', null, 'all',
  400, 750, 1500, 'CAD', 'annual',
  'Professional liability / errors & omissions coverage', null,
  4, 'Solo consultant $400-$800; professional practice $700-$1,500. Per Acera.');

-- ---- GENERAL LIABILITY ----
select _seed_benchmark('general_liability_insurance', null, 'all',
  400, 600, 1200, 'CAD', 'annual',
  'Commercial general liability coverage ($2M typical)', null,
  3, 'Standard CGL policy for office-based professional.');

-- ---- WCB PREMIUM (province-specific) ----
select _seed_benchmark('wcb_premium', 'AB', 'all',
  1.41, 1.41, 1.41, 'pct_of_claim', 'annual',
  'WCB Alberta premium as % of assessable payroll', null,
  5, 'WCB-Alberta 2025 average industry rate. Optional for sole proprietors in most classes.');

select _seed_benchmark('wcb_premium', 'BC', 'all',
  1.55, 1.55, 1.55, 'pct_of_claim', 'annual',
  'WorkSafeBC premium as % of assessable payroll', null,
  5, 'WorkSafeBC 2025 average base premium rate.');

-- ---- MARKETING AGENCY RETAINER ----
select _seed_benchmark('agency_retainer_monthly', null, 'full_stack',
  1500, 3500, 7500, 'CAD', 'monthly_retainer',
  'Digital marketing: SEO, content, social media management', null,
  3, 'Per Bark.com and JavaLogix. Premature for most founders in Year 1.');

-- ---- WEBSITE DESIGN ----
select _seed_benchmark('website_design', null, 'professional',
  3000, 5000, 8000, 'CAD', 'flat_fee',
  'Brand identity + website design and development', null,
  3, 'Professional/consultant site. Per Holler Digital and Creatif.');

select _seed_benchmark('website_design', null, 'full_stack',
  5000, 10000, 14000, 'CAD', 'flat_fee',
  'Strategic website with lead gen, integrations, custom design', null,
  3, 'Productized/product business site. Per Holler Digital.');

-- ---- FRACTIONAL CFO ----
select _seed_benchmark('fractional_cfo_monthly', null, 'full_stack',
  3000, 5000, 7500, 'CAD', 'monthly_retainer',
  'Part-time CFO advisory, financial modeling, fundraising support', null,
  3, 'Per The Expert CFO published pricing.');

-- ---- STRATEGY CONSULTANT ----
select _seed_benchmark('strategy_consultant_project', null, 'full_stack',
  2000, 5000, 10000, 'CAD', 'flat_fee',
  'Per-engagement strategy consulting', null,
  3, 'Project-based advisory. Wide range by scope.');

-- ---- DELAY / OPPORTUNITY COST ----
select _seed_benchmark('ramp_lag_months', null, 'all',
  1, 4, 9, 'months', null,
  'Months to first reliable revenue', null,
  3, 'Month 1-3 = investment phase. Month 4-6 = traction. Per Metaintro and MBO Partners.');

select _seed_benchmark('vendor_coordination_drag', null, 'fragmented_founder_path',
  2, 6, 12, 'weeks', null,
  'Estimated weeks lost to managing fragmented advisors', null,
  3, 'Time cost of multi-vendor coordination. Expressed as weeks of lost capacity.');


-- ---------------------------------------------------------------------------
-- E. EXECOM TIER ASSUMPTIONS
-- ---------------------------------------------------------------------------
insert into public.execom_tier_assumptions (
  tier_slug, tier_label,
  price_low, price_median, price_high,
  founder_tax_displaced_low, founder_tax_displaced_high,
  roi_multiple_low, roi_multiple_high,
  replaces_categories, does_not_replace,
  target_segment, timeline_weeks,
  headline_saving_description, effective_date
) values
  ('independence_launch', 'Independence Launch',
   2997, 3497, 4497,
   8000, 16800,
   2.0, 4.8,
   '{incorporation_govt_fee,nuans_name_search,incorporation_legal_fee,msa_client_contract,gst_hst_registration,annual_return_registry,minute_book_maintenance}',
   '{bookkeeping_monthly,t2_corporate_filing,e_and_o_insurance}',
   '{solo_consultant,professional_practice}', 2,
   'Replaces $8K–$17K in fragmented legal and compliance setup',
   '2026-01-01'),

  ('operator_system', 'Operator System',
   7997, 9997, 11997,
   16800, 35000,
   2.1, 3.5,
   '{incorporation_govt_fee,nuans_name_search,incorporation_legal_fee,shareholders_agreement,msa_client_contract,gst_hst_registration,annual_return_registry,minute_book_maintenance,trademark_govt_fee,trademark_legal_fee,bookkeeping_monthly}',
   '{t2_corporate_filing,e_and_o_insurance,agency_retainer_monthly}',
   '{professional_practice,productized_service}', 3,
   'Replaces $17K–$35K in legal, compliance, and accounting setup',
   '2026-01-01'),

  ('asset_builder', 'Asset Builder',
   18997, 21997, 24997,
   35000, 56600,
   1.8, 2.7,
   '{incorporation_govt_fee,nuans_name_search,incorporation_legal_fee,shareholders_agreement,msa_client_contract,gst_hst_registration,annual_return_registry,minute_book_maintenance,trademark_govt_fee,trademark_legal_fee,bookkeeping_monthly,tax_planning_incorporated,sred_contingency_fee,website_design}',
   '{e_and_o_insurance,agency_retainer_monthly,fractional_cfo_monthly}',
   '{productized_service,product_business}', 4,
   'Replaces $35K–$57K in full founder stack including SR&ED',
   '2026-01-01'),

  ('executive_transition', 'Executive Transition',
   24997, 29997, 34997,
   56600, 107000,
   2.3, 3.1,
   '{incorporation_govt_fee,nuans_name_search,incorporation_legal_fee,shareholders_agreement,msa_client_contract,gst_hst_registration,annual_return_registry,minute_book_maintenance,trademark_govt_fee,trademark_legal_fee,bookkeeping_monthly,tax_planning_incorporated,sred_contingency_fee,website_design,fractional_cfo_monthly,strategy_consultant_project}',
   '{e_and_o_insurance,agency_retainer_monthly}',
   '{executive_transition,product_business}', 4,
   'Replaces $57K–$107K full-service founder infrastructure',
   '2026-01-01');


-- ---------------------------------------------------------------------------
-- F. METHODOLOGY CONFIGS
-- ---------------------------------------------------------------------------
insert into public.methodology_configs (key, label, value, description, scenario_scope, effective_date)
values
  ('weeks_per_month', 'Weeks per Month', '4.33', 'Industry-standard weeks per month', 'all', '2026-01-01'),
  ('billable_weeks_per_year', 'Billable Weeks per Year', '46', '52 weeks minus ~6 weeks holidays/PTO', 'all', '2026-01-01'),
  ('utilization_default_year1', 'Year 1 Utilization Rate', '0.35', 'Conservative first-year solo consultant utilization', 'all', '2026-01-01'),
  ('utilization_default_established', 'Established Utilization Rate', '0.70', 'Target for established independent professional', 'all', '2026-01-01'),
  ('ramp_months_to_full_utilization', 'Months to Full Utilization', '9', 'Median months to reach target utilization', 'all', '2026-01-01'),
  ('conservative_ramp_factor', 'Conservative Ramp Factor', '0.70', 'Multiply utilization by this when conservative toggle is on', 'all', '2026-01-01'),
  ('ei_replacement_rate', 'EI Replacement Rate', '0.55', '55% of insurable earnings', 'delay', '2026-01-01'),
  ('ei_max_weekly_benefit_2026', 'EI Max Weekly Benefit (2026)', '729', '$729/week as of Jan 1, 2026', 'delay', '2026-01-01'),
  ('ei_max_insurable_earnings_2026', 'EI Max Insurable Earnings (2026)', '68900', 'Annual cap for EI calculation', 'delay', '2026-01-01'),
  ('delay_cost_method', 'Delay Cost Method', '"income_minus_ei"', '(monthly_income - ei_monthly) per month delayed', 'delay', '2026-01-01'),
  ('gst_registration_threshold', 'GST Registration Threshold', '30000', 'CRA mandatory registration threshold', 'all', '2026-01-01'),
  ('first_revenue_lag_median_months', 'First Revenue Lag (Median)', '4', 'Median months: 1-3 = setup, revenue starts month 4', 'all', '2026-01-01'),
  ('first_invoice_to_cash_days_b2b', 'Invoice to Cash (B2B)', '60', 'Net-30 invoice + 30-day payment drag', 'all', '2026-01-01'),
  ('income_buffer_runway_months', 'Recommended Runway Buffer', '9', 'Midpoint of 6-12 month advisor recommendation', 'all', '2026-01-01'),
  ('sred_avg_claim_value', 'Average SR&ED Claim Value', '198000', 'Average Canadian SR&ED claim per CCIPC', 'all', '2026-01-01'),
  ('benchmark_dataset_version', 'Benchmark Dataset Version', '"2026.03.1"', 'Current version of benchmark dataset', 'all', '2026-01-01'),
  ('disclosure_text', 'Calculator Disclosure', '"Estimates are based on published government fees, law firm and CPA firm pricing guides, and industry benchmarks as of March 2026. Actual costs vary by provider, complexity, and jurisdiction. This calculator is for informational purposes only and does not constitute financial or legal advice."',
   'Legal disclosure language for calculator output', 'all', '2026-01-01');


-- Clean up helper function
drop function if exists _seed_benchmark;
