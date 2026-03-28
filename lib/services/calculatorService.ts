/**
 * Calculator service — computation engine for the execom homepage calculator.
 *
 * Consumes ResolvedBenchmarkData from benchmarkService and produces
 * structured CalculatorOutputs with full benchmark audit trail.
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
  ResolvedBenchmarkData,
  BenchmarkValueWithSources,
  ExecomTierAssumption,
  TierSlug,
} from '@/lib/calculator/types'
import {
  getBestBenchmark,
  lookupBenchmarks,
  getConfigNumber,
  getConfigString,
  collectSourceIds,
} from './benchmarkService'

// ═══════════════════════════════════════════════════════════════
// Core calculation engine
// ═══════════════════════════════════════════════════════════════

/**
 * Run the full calculator computation.
 *
 * This is the main entry point. It takes user inputs and resolved
 * benchmark data, and produces the three-scenario comparison output
 * with full audit trail (benchmark IDs, source IDs, methodology snapshot).
 */
export function computeCalculatorResults(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData
): CalculatorOutputs {
  const methodology = buildMethodologySnapshot(data)
  const delay = computeDelayScenario(inputs, data, methodology)
  const fragmented = computeFragmentedScenario(inputs, data, methodology)
  const recommendedTier = recommendTier(inputs, data)
  const execom = computeExecomScenario(inputs, data, methodology, recommendedTier)

  return { delay, fragmented, execom, recommendedTier, methodology }
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
// Scenario 1: Delay / Stay Put
// ═══════════════════════════════════════════════════════════════

function computeDelayScenario(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot
): ScenarioResult {
  const monthlyComp = inputs.annualComp / 12
  const severanceCushion = monthlyComp * inputs.severanceMonths

  // EI calculation
  const weeklyInsurable = Math.min(inputs.annualComp, methodology.eiMaxInsurableEarnings) / 52
  const weeklyEI = Math.min(weeklyInsurable * methodology.eiReplacementRate, methodology.eiMaxWeeklyBenefit)
  const monthlyEI = weeklyEI * methodology.weeksPerMonth

  // Monthly gap = income lost minus EI received
  const monthlyGap = monthlyComp - monthlyEI

  // Total delay cost over time_to_act months (minus severance cushion months)
  const effectiveDelayMonths = Math.max(0, inputs.timeToAct - inputs.severanceMonths)
  const totalDelayCost = monthlyGap * effectiveDelayMonths

  // Collect benchmark audit trail
  const usedBenchmarks: BenchmarkValueWithSources[] = []

  return {
    label: 'Delay / Stay Put',
    subtitle: 'Every month you wait costs real money',
    monthlyNet: monthlyComp,
    annualNet: inputs.annualComp,
    costRangeLow: Math.round(totalDelayCost * 0.85),
    costRangeHigh: Math.round(totalDelayCost),
    timelineWeeks: `${inputs.timeToAct} months of delay`,
    notes: [
      `Monthly income gap after EI: $${Math.round(monthlyGap).toLocaleString()}/mo`,
      `EI replaces ~$${Math.round(monthlyEI).toLocaleString()}/mo (55% of insurable, max $${methodology.eiMaxWeeklyBenefit}/wk)`,
      inputs.severanceMonths > 0
        ? `Severance covers ${inputs.severanceMonths} month(s) — delay cost starts after`
        : 'No severance cushion',
    ],
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectSourceIds(usedBenchmarks),
  }
}

// ═══════════════════════════════════════════════════════════════
// Scenario 2: Fragmented Founder Path (the "usual" way)
// ═══════════════════════════════════════════════════════════════

function computeFragmentedScenario(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData,
  methodology: MethodologySnapshot
): ScenarioResult {
  const usedBenchmarks: BenchmarkValueWithSources[] = []

  // Determine which scenario tier to use for benchmarks
  const benchmarkScenario = getFragmentedBenchmarkScenario(inputs)

  // Accumulate costs from benchmark categories
  let costLow = 0
  let costHigh = 0

  // Core categories that apply to all founders
  const coreCategories = [
    'incorporation_govt_fee',
    'nuans_name_search',
    'incorporation_legal_fee',
    'msa_client_contract',
    'annual_return_registry',
    'gst_hst_filing_preparation',
    'bookkeeping_monthly',
    't2_corporate_filing',
    'e_and_o_insurance',
  ]

  // Conditional categories
  const conditionalCategories: string[] = []
  if (inputs.pursuingSred) {
    conditionalCategories.push('sred_contingency_fee')
  }
  if (inputs.businessModel === 'productized' || inputs.businessModel === 'product') {
    conditionalCategories.push('trademark_govt_fee', 'trademark_legal_fee', 'website_design')
  }
  if (inputs.businessModel === 'product' || inputs.annualComp >= 200000) {
    conditionalCategories.push('shareholders_agreement')
  }
  if (inputs.businessModel === 'product') {
    conditionalCategories.push('fractional_cfo_monthly', 'agency_retainer_monthly')
  }

  const allCategories = [...coreCategories, ...conditionalCategories]

  for (const slug of allCategories) {
    const bv = getBestBenchmark(data, slug, benchmarkScenario)
    if (!bv) continue

    usedBenchmarks.push(bv)

    // For recurring costs, annualize
    const category = data.categories.find((c) => c.id === bv.benchmark_category_id)
    const isRecurring = category && !category.is_one_time
    let multiplier = 1

    if (isRecurring && category?.recurrence_unit === 'monthly') {
      multiplier = 12 // Annual cost from monthly
    }

    // SR&ED contingency fee is % of claim — compute dollar value
    if (slug === 'sred_contingency_fee') {
      const avgClaim = getConfigNumber(data, 'sred_avg_claim_value', 198000)
      costLow += ((bv.value_low ?? 0) / 100) * avgClaim
      costHigh += ((bv.value_high ?? 0) / 100) * avgClaim
    } else {
      costLow += (bv.value_low ?? 0) * multiplier
      costHigh += (bv.value_high ?? 0) * multiplier
    }
  }

  // Add province filing floor
  costLow += data.region.filing_floor
  costHigh += data.region.filing_floor

  // Independent gross income (for context)
  const utilization = inputs.conservativeRamp ? methodology.conservativeRampFactor : 1
  const monthlyGrossRaw = inputs.hourlyRate * inputs.weeklyHours * methodology.weeksPerMonth
  const monthlyGross = monthlyGrossRaw * utilization

  // Timeline: fragmented path takes 10-20 weeks to operational readiness
  const vendorDrag = getBestBenchmark(data, 'vendor_coordination_drag')
  const dragWeeksLow = vendorDrag?.value_low ?? 2
  const dragWeeksHigh = vendorDrag?.value_high ?? 12
  if (vendorDrag) usedBenchmarks.push(vendorDrag)

  return {
    label: 'Usual Founder Path',
    subtitle: 'Lawyers, accountants, consultants, agencies — all billing separately',
    monthlyNet: Math.round(monthlyGross - costHigh / 12),
    annualNet: Math.round(monthlyGross * 12 - costHigh),
    costRangeLow: Math.round(costLow),
    costRangeHigh: Math.round(costHigh),
    timelineWeeks: `${Math.round(dragWeeksLow + 8)}–${Math.round(dragWeeksHigh + 8)} weeks`,
    notes: [
      `Jurisdictional filing floor (${data.region.code}): $${data.region.filing_floor}`,
      `${usedBenchmarks.length} separate vendor relationships to manage`,
      inputs.pursuingSred ? 'SR&ED adds $20K–$60K in contingency fees alone' : '',
      `${Math.round(dragWeeksLow)}–${Math.round(dragWeeksHigh)} weeks lost to vendor coordination drag`,
    ].filter(Boolean),
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectSourceIds(usedBenchmarks),
  }
}

/** Determine which benchmark scenario tier to use based on inputs */
function getFragmentedBenchmarkScenario(inputs: CalculatorInputs): string {
  const { businessModel, pursuingSred, annualComp } = inputs
  if (
    pursuingSred ||
    businessModel === 'product' ||
    annualComp >= 200000
  ) {
    return 'full_stack'
  }
  if (
    businessModel === 'productized' ||
    businessModel === 'professional_practice' ||
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
  const utilization = inputs.conservativeRamp ? methodology.conservativeRampFactor : 1
  const monthlyGrossRaw = inputs.hourlyRate * inputs.weeklyHours * methodology.weeksPerMonth
  const monthlyGross = monthlyGrossRaw * utilization

  // Remaining costs: things execom doesn't replace
  const usedBenchmarks: BenchmarkValueWithSources[] = []
  let remainingCostLow = 0
  let remainingCostHigh = 0

  for (const slug of tier.doesNotReplace) {
    const bv = getBestBenchmark(data, slug)
    if (!bv) continue
    usedBenchmarks.push(bv)

    const category = data.categories.find((c) => c.id === bv.benchmark_category_id)
    let multiplier = 1
    if (category && !category.is_one_time && category.recurrence_unit === 'monthly') {
      multiplier = 12
    }

    remainingCostLow += (bv.value_low ?? 0) * multiplier
    remainingCostHigh += (bv.value_high ?? 0) * multiplier
  }

  // Total Year 1 cost = execom fee + remaining
  const totalLow = tier.priceLow + remainingCostLow
  const totalHigh = tier.priceHigh + remainingCostHigh

  return {
    label: 'the execom model',
    subtitle: 'One relationship. One invoice. Everything built to work together.',
    monthlyNet: Math.round(monthlyGross - totalHigh / 12),
    annualNet: Math.round(monthlyGross * 12 - totalHigh),
    costRangeLow: Math.round(totalLow),
    costRangeHigh: Math.round(totalHigh),
    timelineWeeks: tier.timelineWeeks ? `${tier.timelineWeeks} weeks` : '2–4 weeks',
    notes: [
      tier.headline ?? '',
      `Replaces ${tier.replaces.length} separate vendor categories`,
      `Remaining out-of-pocket: $${Math.round(remainingCostLow).toLocaleString()}–$${Math.round(remainingCostHigh).toLocaleString()} (${tier.doesNotReplace.length} categories)`,
      'The fastest credible path from employment risk to operating business.',
    ].filter(Boolean),
    benchmarkIds: usedBenchmarks.map((b) => b.id),
    sourceIds: collectSourceIds(usedBenchmarks),
  }
}

// ═══════════════════════════════════════════════════════════════
// Tier recommendation engine
// ═══════════════════════════════════════════════════════════════

export function recommendTier(
  inputs: CalculatorInputs,
  data: ResolvedBenchmarkData
): RecommendedTier {
  const tier = findBestTier(inputs)
  const assumption = data.tiers.find((t) => t.tier_slug === tier)

  if (!assumption) {
    // Fallback to independence_launch if tier not found
    const fallback = data.tiers[0]
    return tierAssumptionToRecommendation(fallback)
  }

  return tierAssumptionToRecommendation(assumption)
}

function findBestTier(inputs: CalculatorInputs): TierSlug {
  const { businessModel, pursuingSred, annualComp, hourlyRate } = inputs
  const isComplex =
    pursuingSred ||
    businessModel === 'product' ||
    businessModel === 'productized'

  if (annualComp >= 220000 && isComplex) return 'executive_transition'
  if (isComplex || pursuingSred) return 'asset_builder'
  if (
    businessModel === 'productized' ||
    hourlyRate >= 250 ||
    annualComp >= 150000
  ) {
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

/**
 * Persist a calculator run to Supabase for analytics and lead capture.
 */
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
      business_model_segment: inputs.businessModel,
      includes_sred: inputs.pursuingSred,
      benchmark_version_snapshot: outputs.methodology.version,
      methodology_config_snapshot: outputs.methodology,
      recommended_tier: outputs.recommendedTier.slug,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to save calculator run:', error.message)
    // Non-blocking: don't throw, just return empty
    return ''
  }

  return data.id
}

// ═══════════════════════════════════════════════════════════════
// Formatting helpers (shared with component)
// ═══════════════════════════════════════════════════════════════

/** Format currency */
export function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-CA')
}

/** Format currency range */
export function fmtRange(low: number, high: number): string {
  if (low === high) return fmt(low)
  return `${fmt(low)}–${fmt(high)}`
}
