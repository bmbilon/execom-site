/**
 * Calculator service — computation engine for the execom homepage calculator.
 *
 * Consumes ResolvedBenchmarkData from benchmarkService and produces
 * structured CalculatorOutputs with full benchmark audit trail.
 *
 * Phase 2: Extended with time-economics, business-model-specific logic,
 * capital-structure shaping, and optional 5-year economic delta.
 *
 * Pattern: pure functions, no Supabase dependency at computation time.
 * Supabase is only used for persisting calculator runs.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  CalculatorInputs,
  CalculatorOutputs,
  ScenarioResult,
  RecommendedTier,
  MethodologySnapshot,
  TimeEconomics,
  ResolvedBenchmarkData,
  BenchmarkValueWithSources,
  ExecomTierAssumption,
  TierSlug,
  PrimaryModel,
} from '@/lib/calculator/types'
import {
  getBestBenchmark,
  getBenchmarkOrFallback,
  getConfigNumber,
  getConfigString,
  collectCitableSourceIds,
} from './benchmarkService'

// ═══════════════════════════════════════════════════════════════
// Core calculation engine
// ═══════════════════════════════════════════════════════════════

export function computeCalculatorResults(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData
): CalculatorOutputs {
  const methodology = buildMethodologySnapshot(data)
  const delay = computeDelayScenario(inputs, data, methodology)
  const fragmented = computeFragmentedScenario(inputs, data, methodology)
  const recommendedTier = recommendTier(inputs, data)
  const execom = computeExecomScenario(inputs, data, methodology, recommendedTier)
  const timeEconomics = computeTimeEconomics(inputs, data, methodology)

  return { delay, fragmented, execom, recommendedTier, methodology, timeEconomics }
}

// ═══════════════════════════════════════════════════════════════
// Methodology snapshot
// ═══════════════════════════════════════════════════════════════

function buildMethodologySnapshot(data: ResolvedBenchmarkData): MethodologySnapshot {
  return {
    version: getConfigString(data, 'benchmark_dataset_version', '2026.03.1'),
    conservativeRampFactor: getConfigNumber(data, 'conservative_ramp_factor', 0.7),
    eiMaxWeeklyBenefit: getConfigNumber(data, 'ei_max_weekly_benefit_2026', 729),
    eiReplacementRate: getConfigNumber(data, 'ei_replacement_rate', 0.55),
    eiMaxInsurableEarnings: getConfigNumber(data, 'ei_max_insurable_earnings_2026', 68900),
    weeksPerMonth: getConfigNumber(data, 'weeks_per_month', 4.33),
    billableWeeksPerYear: getConfigNumber(data, 'billable_weeks_per_year', 46),
    disclosureText: getConfigString(data, 'disclosure_text', ''),
  }
}

// ═══════════════════════════════════════════════════════════════
// Business-model-specific category selection
// ═══════════════════════════════════════════════════════════════

/** Returns the benchmark categories relevant for the fragmented path given the user's model */
function getModelCategories(inputs: CalculatorInputs): {
  core: string[]
  conditional: string[]
} {
  const core = [
    'incorporation_govt_fee',
    'nuans_name_search',
    'incorporation_legal_fee',
    'msa_client_contract',
    'annual_return_registry',
    'gst_hst_filing_preparation',
    'bookkeeping_monthly',
    't2_corporate_filing',
    'e_and_o_insurance',
    'software_stack_annual',
  ]

  const conditional: string[] = []
  const model = inputs.primaryModel

  // SR&ED
  if (inputs.pursuingSred || inputs.capitalStructure === 'sred_supported') {
    conditional.push('sred_contingency_fee')
  }

  // Model-specific categories
  switch (model) {
    case 'consulting':
      // Lower complexity, E&O matters more — already in core
      if (inputs.annualComp >= 150000) conditional.push('tax_planning_incorporated')
      break

    case 'professional_practice':
      conditional.push('minute_book_maintenance')
      if (inputs.annualComp >= 120000) conditional.push('tax_planning_incorporated')
      // Higher E&O already in core — professional practice has higher liability
      break

    case 'productized_service':
      conditional.push('trademark_govt_fee', 'trademark_legal_fee', 'website_design')
      conditional.push('shareholders_agreement')
      if (inputs.outsideMarketing === 'likely') conditional.push('agency_retainer_monthly')
      if (inputs.annualComp >= 120000) conditional.push('tax_planning_incorporated')
      break

    case 'product_business':
      conditional.push('trademark_govt_fee', 'trademark_legal_fee', 'website_design')
      conditional.push('shareholders_agreement')
      conditional.push('fractional_cfo_monthly')
      if (inputs.outsideMarketing !== 'no') conditional.push('agency_retainer_monthly')
      conditional.push('tax_planning_incorporated')
      break
  }

  // Capital structure additions
  if (inputs.capitalStructure === 'venture_path') {
    conditional.push('venture_legal_setup')
    if (inputs.acceleratorIntent !== 'no') {
      conditional.push('accelerator_program_cost')
      if (inputs.acceleratorIntent === 'likely') {
        conditional.push('accelerator_equity_proxy')
      }
    }
  }

  // Hidden costs of independence (always present but optional in UI)
  conditional.push('health_dental_insurance')
  conditional.push('retirement_contribution_gap')
  if (inputs.annualComp >= 100000) {
    conditional.push('disability_income_insurance')
  }

  // Deduplicate
  return { core, conditional: [...new Set(conditional)] }
}

// ═══════════════════════════════════════════════════════════════
// Ramp profile logic
// ═══════════════════════════════════════════════════════════════

/** Get first-year average utilization based on ramp profile and time-to-first-client */
function getRampUtilization(inputs: CalculatorInputs, data: ResolvedBenchmarkData): number {
  const ramp = inputs.revenueRamp
  const m1_6 = getConfigNumber(data, `ramp_profile_${ramp}_m1_6`, ramp === 'conservative' ? 0.25 : ramp === 'moderate' ? 0.40 : 0.55)
  const m7_12 = getConfigNumber(data, `ramp_profile_${ramp}_m7_12`, ramp === 'conservative' ? 0.55 : ramp === 'moderate' ? 0.70 : 0.85)

  // Time-to-first-client adjusts the early months
  let earlyBoost = 0
  if (inputs.timeToFirstClient === 'already_have_one') earlyBoost = 0.15
  else if (inputs.timeToFirstClient === 'within_30_days') earlyBoost = 0.08

  const adjustedM1_6 = Math.min(1, m1_6 + earlyBoost)
  // Weighted average: 6 months at each rate
  return (adjustedM1_6 + m7_12) / 2
}

// ═══════════════════════════════════════════════════════════════
// Scenario 1: Delay / Stay Put
// ═══════════════════════════════════════════════════════════════

function computeDelayScenario(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot
): ScenarioResult {
  const monthlyComp = inputs.annualComp / 12

  // EI calculation
  const weeklyInsurable = Math.min(inputs.annualComp, methodology.eiMaxInsurableEarnings) / 52
  const weeklyEI = Math.min(weeklyInsurable * methodology.eiReplacementRate, methodology.eiMaxWeeklyBenefit)
  const monthlyEI = weeklyEI * methodology.weeksPerMonth

  const monthlyGap = monthlyComp - monthlyEI
  const effectiveDelayMonths = Math.max(0, inputs.timeToAct - inputs.severanceMonths)
  const totalDelayCost = monthlyGap * effectiveDelayMonths

  const usedBenchmarks: BenchmarkValueWithSources[] = []

  // Surface province-specific compliance flags
  const complianceNotes: string[] = []
  for (const flag of (data.region.compliance_risk_flags ?? [])) {
    complianceNotes.push(flag.label)
  }

  return {
    label: 'Delay / Stay Put',
    subtitle: 'Every month you wait costs real money',
    monthlyNet: monthlyComp,
    annualNet: inputs.annualComp,
    costRangeLow: Math.round(totalDelayCost * 0.85),
    costRangeHigh: Math.round(totalDelayCost),
    timelineWeeks: `${inputs.timeToAct} months of delay`,
    notes: [
      `Monthly income gap after EI: ${fmt(Math.round(monthlyGap))}/mo`,
      `EI replaces ~${fmt(Math.round(monthlyEI))}/mo (55% of insurable, max $${methodology.eiMaxWeeklyBenefit}/wk)`,
      inputs.severanceMonths > 0
        ? `Severance covers ${inputs.severanceMonths} month(s) — delay cost starts after`
        : 'No severance cushion',
    ],
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectCitableSourceIds(usedBenchmarks),
    assumptionNotes: [],
  }
}

// ═══════════════════════════════════════════════════════════════
// Scenario 2: Fragmented Founder Path
// ═══════════════════════════════════════════════════════════════

function computeFragmentedScenario(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot
): ScenarioResult {
  const usedBenchmarks: BenchmarkValueWithSources[] = []
  const assumptionNotes: string[] = []
  const benchmarkScenario = getFragmentedBenchmarkScenario(inputs)

  let costLow = 0
  let costHigh = 0

  const { core, conditional } = getModelCategories(inputs)
  const coreSet = new Set(core)
  const allCategories = [...core, ...conditional]

  for (const slug of allCategories) {
    // Four-tier resolution handles region × scenario fallback internally;
    // no need for a manual retry without scenario.
    const resolved = getBestBenchmark(data, slug, benchmarkScenario)
    if (!resolved) continue

    usedBenchmarks.push(resolved)
    const cost = benchmarkToDollars(resolved, slug, data, inputs)

    if (coreSet.has(slug)) {
      // Core categories: use median for a tighter, more realistic range.
      // Apply a small ±10% band around median to show a range without
      // the full low–high spread that inflates the headline number.
      costLow += Math.round(cost.median * 0.9)
      costHigh += Math.round(cost.median * 1.1)
    } else {
      // Conditional categories: keep full low–high spread (more variable)
      costLow += cost.low
      costHigh += cost.high
    }

    // Track if this was an assumption rather than a verified benchmark
    if (!resolved.is_citable) {
      const cat = data.categories.find((c) => c.id === resolved!.benchmark_category_id)
      assumptionNotes.push(`${cat?.label ?? slug}: methodology assumption`)
    }
  }

  // Province filing floor
  costLow += data.region.filing_floor
  costHigh += data.region.filing_floor

  // Revenue context
  const utilization = getRampUtilization(inputs, data)
  const monthlyGrossRaw = inputs.hourlyRate * inputs.weeklyHours * methodology.weeksPerMonth
  const monthlyGross = monthlyGrossRaw * utilization

  // Timeline from benchmarks (methodology assumptions — not citable)
  const opReady = getBenchmarkOrFallback(data, 'time_to_operational_readiness', 10, 14, 20, 'weeks', 'fragmented_founder_path')
  const vendorDrag = getBenchmarkOrFallback(data, 'vendor_coordination_drag', 2, 6, 12, 'weeks')

  if (!opReady.fromDb || (opReady.bv && !opReady.bv.is_citable)) {
    assumptionNotes.push('Timeline to operational: methodology assumption')
  }
  if (!vendorDrag.fromDb || (vendorDrag.bv && !vendorDrag.bv.is_citable)) {
    assumptionNotes.push('Vendor coordination drag: methodology assumption')
  }
  assumptionNotes.push(`Utilization ramp (${inputs.revenueRamp}): methodology assumption`)

  const vendorCount = allCategories.length
  const timelineWeeksLow = Math.round(opReady.low)
  const timelineWeeksHigh = Math.round(opReady.high)

  // Province-specific compliance notes
  const complianceNotes = (data.region.compliance_risk_flags ?? []).map((f) => f.label)

  // Build human-readable profile label
  const profileLabel = buildProfileLabel(inputs, data)

  return {
    label: 'Usual Founder Path',
    subtitle: 'Fragmented specialists, sequential delays, recurring retainers, and capital inefficiency',
    monthlyNet: Math.round(monthlyGross - costHigh / 12),
    annualNet: Math.round(monthlyGross * 12 - costHigh),
    costRangeLow: Math.round(costLow),
    costRangeHigh: Math.round(costHigh),
    timelineWeeks: `${timelineWeeksLow}–${timelineWeeksHigh} weeks`,
    profileLabel,
    notes: [
      `Jurisdictional filing floor (${data.region.code}): ${fmt(data.region.filing_floor)}`,
      `${vendorCount} separate vendor relationships to manage`,
      `${Math.round(vendorDrag.low)}–${Math.round(vendorDrag.high)} weeks estimated vendor coordination drag`,
      inputs.pursuingSred || inputs.capitalStructure === 'sred_supported'
        ? 'SR&ED adds contingency fees on top of the advisor stack'
        : '',
      inputs.capitalStructure === 'venture_path'
        ? 'Venture path adds legal complexity: SAFEs, cap table, investor agreements'
        : '',
      inputs.outsideMarketing === 'likely'
        ? 'Agency retainer adds recurring monthly cost before revenue is reliable'
        : '',
      `Modeled at ${Math.round(utilization * 100)}% first-year utilization (${inputs.revenueRamp} ramp)`,
      ...complianceNotes,
    ].filter(Boolean),
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectCitableSourceIds(usedBenchmarks),
    assumptionNotes,
  }
}

/** Build a contextual profile label like "For an Alberta solo consulting business" */
function buildProfileLabel(inputs: CalculatorInputs, data: ResolvedBenchmarkData): string {
  const provinceName = data.region.code === 'FED' ? 'Canadian' : data.region.name
  const modelLabels: Record<string, string> = {
    consulting: 'solo consulting',
    professional_practice: 'professional practice',
    productized_service: 'productized service',
    product_business: 'product',
  }
  const modelLabel = modelLabels[inputs.primaryModel] ?? inputs.primaryModel
  // Use "a" vs "an" based on first letter of province name
  const article = /^[AEIOU]/i.test(provinceName) ? 'an' : 'a'
  return `For ${article} ${provinceName} ${modelLabel} business`
}

/** Convert a benchmark value to a dollar cost (annualized if recurring, pct-of-claim if SR&ED) */
function benchmarkToDollars(
  bv: BenchmarkValueWithSources,
  slug: string,
  data: ResolvedBenchmarkData,
  inputs: CalculatorInputs
): { low: number; median: number; high: number } {
  const category = data.categories.find((c) => c.id === bv.benchmark_category_id)
  let multiplier = 1

  if (category && !category.is_one_time && category.recurrence_unit === 'monthly') {
    multiplier = 12
  }

  // SR&ED contingency fee is % of claim
  if (slug === 'sred_contingency_fee') {
    const avgClaim = getConfigNumber(data, 'sred_avg_claim_value', 198000)
    const low = ((bv.value_low ?? 0) / 100) * avgClaim
    const high = ((bv.value_high ?? 0) / 100) * avgClaim
    const median = bv.value_median != null ? (bv.value_median / 100) * avgClaim : (low + high) / 2
    return { low, median, high }
  }

  // Retirement gap scales with comp — rates from methodology configs
  if (slug === 'retirement_contribution_gap') {
    const rateLow = getConfigNumber(data, 'retirement_gap_match_rate_low', 0.04)
    const rateHigh = getConfigNumber(data, 'retirement_gap_match_rate_high', 0.06)
    const low = inputs.annualComp * rateLow
    const high = inputs.annualComp * rateHigh
    return { low, median: (low + high) / 2, high }
  }

  const low = (bv.value_low ?? 0) * multiplier
  const high = (bv.value_high ?? 0) * multiplier
  const median = bv.value_median != null ? bv.value_median * multiplier : (low + high) / 2
  return { low, median, high }
}

function getFragmentedBenchmarkScenario(inputs: CalculatorInputs): string {
  const { primaryModel, pursuingSred, annualComp, capitalStructure } = inputs
  if (
    pursuingSred ||
    primaryModel === 'product_business' ||
    capitalStructure === 'venture_path' ||
    annualComp >= 200000
  ) {
    return 'full_stack'
  }
  if (
    primaryModel === 'productized_service' ||
    primaryModel === 'professional_practice' ||
    annualComp >= 120000
  ) {
    return 'professional'
  }
  return 'lean'
}

// ═══════════════════════════════════════════════════════════════
// Scenario 3: execom Model
// ═══════════════════════════════════════════════════════════════

function computeExecomScenario(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot,
  tier: RecommendedTier
): ScenarioResult {
  const utilization = getRampUtilization(inputs, data)
  const monthlyGrossRaw = inputs.hourlyRate * inputs.weeklyHours * methodology.weeksPerMonth
  const monthlyGross = monthlyGrossRaw * utilization

  const usedBenchmarks: BenchmarkValueWithSources[] = []
  let remainingCostLow = 0
  let remainingCostHigh = 0

  for (const slug of tier.doesNotReplace) {
    const bv = getBestBenchmark(data, slug)
    if (!bv) continue
    usedBenchmarks.push(bv)

    const cost = benchmarkToDollars(bv, slug, data, inputs)
    remainingCostLow += cost.low
    remainingCostHigh += cost.high
  }

  const totalLow = tier.priceLow + remainingCostLow
  const totalHigh = tier.priceHigh + remainingCostHigh

  const opReady = getBenchmarkOrFallback(data, 'time_to_operational_readiness', 3, 4, 5, 'days', 'execom')
  const timelineLabel = `${opReady.low}–${opReady.high} days`

  const assumptionNotes: string[] = [
    `Utilization ramp (${inputs.revenueRamp}): methodology assumption`,
  ]
  if (!opReady.fromDb || (opReady.bv && !opReady.bv.is_citable)) {
    assumptionNotes.push('Timeline to operational: methodology assumption')
  }

  return {
    label: 'the execom model',
    subtitle: 'One relationship. One invoice. Integrated execution. Earlier revenue.',
    monthlyNet: Math.round(monthlyGross - totalHigh / 12),
    annualNet: Math.round(monthlyGross * 12 - totalHigh),
    costRangeLow: Math.round(totalLow),
    costRangeHigh: Math.round(totalHigh),
    timelineWeeks: timelineLabel,
    notes: [
      tier.headline ?? '',
      `Replaces ${tier.replaces.length} separate vendor categories`,
      `Remaining out-of-pocket: ${fmtRange(Math.round(remainingCostLow), Math.round(remainingCostHigh))} (${tier.doesNotReplace.length} categories)`,
      'Integrated execution — no vendor coordination drag',
      'Operational readiness in weeks, not months',
      `Modeled at ${Math.round(utilization * 100)}% first-year utilization (${inputs.revenueRamp} ramp)`,
    ].filter(Boolean),
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectCitableSourceIds(usedBenchmarks),
    assumptionNotes,
  }
}

// ═══════════════════════════════════════════════════════════════
// Time Economics
// ═══════════════════════════════════════════════════════════════

function computeTimeEconomics(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot
): TimeEconomics {
  const weeklyRate = inputs.hourlyRate * inputs.weeklyHours

  // Operational readiness
  const opFragmented = getBenchmarkOrFallback(data, 'time_to_operational_readiness', 10, 14, 20, 'weeks', 'fragmented_founder_path')
  const opExecom = getBenchmarkOrFallback(data, 'time_to_operational_readiness', 1.5, 2, 4, 'weeks', 'execom')

  // First revenue
  const revFragmented = getBenchmarkOrFallback(data, 'time_to_first_revenue', 16, 22, 36, 'weeks', 'fragmented_founder_path')
  const revExecom = getBenchmarkOrFallback(data, 'time_to_first_revenue', 4, 8, 14, 'weeks', 'execom')

  // Adjust for time-to-first-client
  let execomRevMedian = revExecom.median
  if (inputs.timeToFirstClient === 'already_have_one') execomRevMedian = Math.max(2, execomRevMedian - 4)
  else if (inputs.timeToFirstClient === 'within_30_days') execomRevMedian = Math.max(3, execomRevMedian - 2)

  // Vendor drag
  const vendorDrag = getBenchmarkOrFallback(data, 'vendor_coordination_drag', 2, 6, 12, 'weeks')

  // First-invoice lag differential
  const invoiceLagFragmented = getBenchmarkOrFallback(data, 'first_invoice_lag', 6, 8, 16, 'weeks', 'fragmented_founder_path')
  const invoiceLagExecom = getBenchmarkOrFallback(data, 'first_invoice_lag', 2, 4, 8, 'weeks', 'execom')

  // Convert to dollars
  const utilization = getRampUtilization(inputs, data)
  const weeklyPotential = weeklyRate * utilization

  const opDelayWeeks = opFragmented.median - opExecom.median
  const operationalDelayDollars = Math.round(opDelayWeeks * weeklyPotential)

  const invoiceDelayWeeks = invoiceLagFragmented.median - invoiceLagExecom.median
  const invoiceDelayDollars = Math.round(invoiceDelayWeeks * weeklyPotential)

  // Vendor drag cost
  const vendorDragDollars = Math.round(vendorDrag.median * weeklyPotential)

  // Total earlier-revenue advantage
  const revenueWeeksDelta = revFragmented.median - execomRevMedian
  const earlierRevenueAdvantage = Math.round(revenueWeeksDelta * weeklyPotential)

  const totalTimeAdvantage = operationalDelayDollars + invoiceDelayDollars + vendorDragDollars

  // Collect source IDs from each benchmark group
  const collectIds = (...bvs: (BenchmarkValueWithSources | null)[]): string[] => {
    return collectCitableSourceIds(bvs.filter((b): b is BenchmarkValueWithSources => b !== null))
  }

  return {
    operationalReadinessWeeks: { fragmented: opFragmented.median, execom: opExecom.median },
    firstRevenueWeeks: { fragmented: revFragmented.median, execom: execomRevMedian },
    vendorDragWeeks: { low: vendorDrag.low, high: vendorDrag.high },
    operationalDelayDollars,
    invoiceDelayDollars,
    vendorDragDollars,
    earlierRevenueAdvantage,
    totalTimeAdvantage,
    sourceIds: {
      operationalReadiness: collectIds(opFragmented.bv, opExecom.bv),
      firstRevenue: collectIds(revFragmented.bv, revExecom.bv),
      vendorDrag: collectIds(vendorDrag.bv),
      invoiceLag: collectIds(invoiceLagFragmented.bv, invoiceLagExecom.bv),
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// Tier recommendation engine (uses primaryModel now)
// ═══════════════════════════════════════════════════════════════

export function recommendTier(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData
): RecommendedTier {
  const tier = findBestTier(inputs)
  const assumption = data.tiers.find((t) => t.tier_slug === tier)

  if (!assumption) {
    const fallback = data.tiers[0]
    return tierAssumptionToRecommendation(fallback)
  }

  return tierAssumptionToRecommendation(assumption)
}

function findBestTier(inputs: CalculatorInputs): TierSlug {
  const { primaryModel, pursuingSred, annualComp, hourlyRate, capitalStructure } = inputs
  const isComplex =
    pursuingSred ||
    primaryModel === 'product_business' ||
    primaryModel === 'productized_service' ||
    capitalStructure === 'venture_path'

  if (annualComp >= 220000 && isComplex) return 'executive_transition'
  if (primaryModel === 'product_business' || (pursuingSred && primaryModel !== 'consulting')) return 'asset_builder'
  if (isComplex || pursuingSred) return 'asset_builder'
  // productized_service already caught by isComplex → asset_builder above;
  // remaining models (consulting, professional_practice) upgrade on rate/comp.
  if (hourlyRate >= 250 || annualComp >= 150000) {
    return 'operator_system'
  }
  return 'independence_launch'
}

function tierAssumptionToRecommendation(
  assumption: ExecomTierAssumption
): RecommendedTier {
  return {
    slug: assumption.tier_slug,
    label: assumption.tier_label,
    priceLow: assumption.price_low,
    priceHigh: assumption.price_high,
    headline: assumption.headline_saving_description,
    timelineWeeks: assumption.timeline_weeks,
    replaces: assumption.replaces_categories,
    doesNotReplace: assumption.does_not_replace,
  }
}

// ═══════════════════════════════════════════════════════════════
// Calculator run persistence
// ═══════════════════════════════════════════════════════════════

export async function saveCalculatorRun(
  supabase: SupabaseClient,
  inputs: CalculatorInputs,
  outputs: CalculatorOutputs
): Promise<string> {
  const { data, error } = await supabase
    .from('calculator_runs')
    .insert({
      inputs,
      outputs,
      province_code: inputs.province,
      business_model_segment: inputs.primaryModel,
      includes_sred: inputs.pursuingSred,
      benchmark_version_snapshot: outputs.methodology.version,
      methodology_config_snapshot: outputs.methodology,
      recommended_tier: outputs.recommendedTier.slug,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to save calculator run:', error.message)
    return ''
  }

  return data.id
}

// ═══════════════════════════════════════════════════════════════
// Formatting helpers
// ═══════════════════════════════════════════════════════════════

export function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

export function fmtRange(low: number, high: number): string {
  if (low === high) return fmt(low)
  return `${fmt(low)}–${fmt(high)}`
}

