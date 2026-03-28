-- =============================================================================
-- 022_calculator_extended_benchmarks.sql
-- Extends the calculator with time-economics, capital-structure,
-- and startup-industrial-complex cost categories
-- =============================================================================

-- ---------------------------------------------------------------------------
-- A. NEW BENCHMARK CATEGORIES
-- ---------------------------------------------------------------------------
insert into public.benchmark_categories (slug, label, category_group, applies_to_scenarios, is_one_time, recurrence_unit, requires_sred, is_optional, description)
values
  -- Time economics
  ('time_to_operational_readiness', 'Time to Operational Readiness', 'delay_opportunity',
   '{fragmented_founder_path,execom}', false, null, false, false,
   'Weeks from decision to fully operational business entity (accounts, compliance, contracts ready)'),
  ('time_to_first_revenue', 'Time to First Revenue', 'delay_opportunity',
   '{fragmented_founder_path,execom}', false, null, false, false,
   'Weeks from decision to first invoice sent'),
  ('first_invoice_lag', 'First Invoice Lag', 'delay_opportunity',
   '{fragmented_founder_path,execom}', false, null, false, false,
   'Weeks between operational readiness and first client invoice'),

  -- Venture / accelerator
  ('accelerator_program_cost', 'Accelerator / Cohort Program Fee', 'advisory',
   '{full_stack}', true, null, false, true,
   'Application fee + program fee for accelerator, incubator, or founder cohort'),
  ('accelerator_equity_proxy', 'Accelerator Equity Dilution (Proxy)', 'advisory',
   '{full_stack}', true, null, false, true,
   'Estimated economic cost of equity given to accelerator (typically 5-10% for $25K-$150K). Modeled as a dollar proxy, not real dilution.'),
  ('venture_legal_setup', 'Venture Legal Setup', 'legal',
   '{full_stack}', true, null, false, true,
   'Legal costs specific to venture path: SAFE/convertible notes, cap table setup, investor agreements'),

  -- Operating costs commonly missed
  ('retirement_contribution_gap', 'Retirement Contribution Gap', 'compliance',
   '{all}', false, 'annual', false, true,
   'Lost employer RRSP matching (typically 4-6% of salary). Real cost of independence vs employment.'),
  ('health_dental_insurance', 'Health & Dental Insurance', 'insurance',
   '{all}', false, 'monthly', false, true,
   'Self-funded health/dental coverage. No employer group plan once independent.'),
  ('disability_income_insurance', 'Disability Income Insurance', 'insurance',
   '{all}', false, 'monthly', false, true,
   'Income replacement insurance for self-employed. Critical for mid-career professionals.'),
  ('software_stack_annual', 'Software Stack (Annual)', 'compliance',
   '{all}', false, 'annual', false, false,
   'Accounting, CRM, invoicing, project management, e-signature, video conferencing tools')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- B. SEED BENCHMARK VALUES FOR NEW CATEGORIES
-- ---------------------------------------------------------------------------

-- Helper function (re-create if dropped)
create or replace function _seed_benchmark(
  p_category_slug text,
  p_region_code text,
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
    unit, engagement_structure, includes, excludes,
    confidence_score, notes, effective_date
  ) values (
    v_cat_id, v_region_id, p_scenario,
    p_low, p_median, p_high,
    p_unit, p_engagement, p_includes, p_excludes,
    p_confidence, p_notes, '2026-01-01'
  ) returning id into v_bv_id;
  return v_bv_id;
end;
$$ language plpgsql;

-- Time to operational readiness (weeks)
select _seed_benchmark('time_to_operational_readiness', null, 'fragmented_founder_path',
  10, 14, 20, 'weeks', null,
  'Incorporation + compliance + contracts + bookkeeping + insurance all sequentially through separate vendors', null,
  3, 'Fragmented path: sequential vendor onboarding. Each step waits for the previous.');

select _seed_benchmark('time_to_operational_readiness', null, 'execom',
  1.5, 2, 4, 'weeks', null,
  'Integrated execution: incorporation, compliance, contracts, accounts all coordinated in parallel', null,
  3, 'execom path: parallel execution, single coordination point.');

-- Time to first revenue (weeks)
select _seed_benchmark('time_to_first_revenue', null, 'fragmented_founder_path',
  16, 22, 36, 'weeks', null,
  'Operational readiness + client acquisition + first invoice + payment cycle', null,
  3, 'Fragmented: operational readiness delay compounds into revenue delay. B2B net-30 adds 4+ weeks.');

select _seed_benchmark('time_to_first_revenue', null, 'execom',
  4, 8, 14, 'weeks', null,
  'Faster operational readiness enables earlier client engagement', null,
  3, 'execom: earlier operational readiness means earlier pipeline activation.');

-- First invoice lag (weeks after operational readiness)
select _seed_benchmark('first_invoice_lag', null, 'fragmented_founder_path',
  6, 8, 16, 'weeks', null,
  'Time from operationally ready to first client invoice sent', null,
  3, 'Fragmented: time spent on proposals, MSA negotiation, SOW drafting through separate lawyer.');

select _seed_benchmark('first_invoice_lag', null, 'execom',
  2, 4, 8, 'weeks', null,
  'Time from operationally ready to first client invoice sent', null,
  3, 'execom: contract templates ready at launch, faster proposal-to-engagement cycle.');

-- Accelerator program cost
select _seed_benchmark('accelerator_program_cost', null, 'full_stack',
  0, 5000, 15000, 'CAD', 'flat_fee',
  'Application fee + program fee for accelerator or cohort', 'Equity component modeled separately',
  3, 'Ranges from free (government-backed) to $15K+ (premium cohorts). Many Canadian programs are subsidized.');

-- Accelerator equity proxy
select _seed_benchmark('accelerator_equity_proxy', null, 'full_stack',
  0, 25000, 100000, 'CAD', 'flat_fee',
  'Estimated dollar value of equity given up (5-10% at modeled valuation)', null,
  2, 'Proxy only. Assumes 5-10% equity at $500K-$1M pre-money. Directional, not precise. YC takes 7% for $500K.');

-- Venture legal setup
select _seed_benchmark('venture_legal_setup', null, 'full_stack',
  3000, 7500, 15000, 'CAD', 'flat_fee',
  'SAFE/convertible note drafting, cap table setup, investor agreements, board formation', null,
  3, 'Venture-path legal complexity. Not needed for bootstrapped or SR&ED-only paths.');

-- Retirement contribution gap
select _seed_benchmark('retirement_contribution_gap', null, 'all',
  2400, 5400, 9000, 'CAD', 'annual',
  'Lost employer RRSP matching at 4-6% of salary', null,
  3, 'On $120K salary: $4,800-$7,200/year foregone. On $180K: $7,200-$10,800. Modeled at median.');

-- Health & dental insurance
select _seed_benchmark('health_dental_insurance', null, 'all',
  150, 300, 500, 'CAD', 'monthly_retainer',
  'Self-funded health/dental through Chamber of Commerce or CPA association plans', null,
  3, 'No employer group plan once independent. $1,800-$6,000/year.');

-- Disability income insurance
select _seed_benchmark('disability_income_insurance', null, 'all',
  100, 250, 500, 'CAD', 'monthly_retainer',
  'Income replacement insurance for self-employed professionals', null,
  3, 'Monthly premiums vary by coverage amount and elimination period.');

-- Software stack
select _seed_benchmark('software_stack_annual', null, 'all',
  2400, 4800, 7200, 'CAD', 'annual',
  'Accounting (QuickBooks/Xero), CRM, invoicing, project management, e-signature, video conferencing', null,
  3, 'Aggregate SaaS cost of independence: $200-$600/month.');


-- ---------------------------------------------------------------------------
-- C. NEW METHODOLOGY CONFIGS
-- ---------------------------------------------------------------------------
insert into public.methodology_configs (key, label, value, description, scenario_scope, effective_date)
values
  ('ramp_profile_conservative_m1_6', 'Conservative Ramp Months 1-6', '0.25',
   'Utilization rate months 1-6 under conservative ramp profile', 'all', '2026-01-01'),
  ('ramp_profile_conservative_m7_12', 'Conservative Ramp Months 7-12', '0.55',
   'Utilization rate months 7-12 under conservative ramp profile', 'all', '2026-01-01'),
  ('ramp_profile_moderate_m1_6', 'Moderate Ramp Months 1-6', '0.40',
   'Utilization rate months 1-6 under moderate ramp profile', 'all', '2026-01-01'),
  ('ramp_profile_moderate_m7_12', 'Moderate Ramp Months 7-12', '0.70',
   'Utilization rate months 7-12 under moderate ramp profile', 'all', '2026-01-01'),
  ('ramp_profile_aggressive_m1_6', 'Aggressive Ramp Months 1-6', '0.55',
   'Utilization rate months 1-6 under aggressive ramp profile', 'all', '2026-01-01'),
  ('ramp_profile_aggressive_m7_12', 'Aggressive Ramp Months 7-12', '0.85',
   'Utilization rate months 7-12 under aggressive ramp profile', 'all', '2026-01-01'),
  ('five_year_annual_growth_rate', 'Five-Year Annual Growth Rate', '0.10',
   'Assumed annual revenue growth rate for 5-year projection (conservative 10%)', 'all', '2026-01-01'),
  ('five_year_recurring_cost_inflation', 'Recurring Cost Inflation', '0.03',
   'Annual cost inflation for recurring vendor expenses in 5-year model', 'all', '2026-01-01')
on conflict do nothing;

-- Clean up
drop function if exists _seed_benchmark;
