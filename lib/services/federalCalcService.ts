/**
 * Federal ITC calculation service.
 *
 * Implements the T661 / Schedule T2SCH31 waterfall for CCPC and
 * non-CCPC claimants under both proxy and traditional methods.
 *
 * Key rates are defined as named constants to allow easy update
 * when legislation changes.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  FederalLineValue,
  FederalWaterfall,
  CostLineClassification,
  CostLineProjectSplit,
  AssistanceItem,
} from './types'

// ── Configurable constants ──

/** Proxy amount (prescribed percentage of salary base). ITA Reg. 2900(4). */
const PROXY_RATE = 0.55

/** CCPC enhanced ITC rate on first $expenditure_limit of qualified expenditures. */
const CCPC_ENHANCED_RATE = 0.35

/** Basic (non-enhanced) ITC rate. */
const BASIC_ITC_RATE = 0.15

/** Expenditure limit for tax years starting before 2024-12-16. */
const EXPENDITURE_LIMIT_PRE_2024 = 3_000_000

/** Expenditure limit for tax years starting on or after 2024-12-16. */
const EXPENDITURE_LIMIT_POST_2024 = 6_000_000

/** Date after which capital property is eligible for SR&ED (Budget 2025). */
const CAPITAL_PROPERTY_REINSTATEMENT_DATE = '2024-12-16'

/** Arms-length contract inclusion rate. */
const ARMS_LENGTH_CONTRACT_RATE = 0.80

/** Non-arms-length contract inclusion rate (look-through). */
const NON_ARMS_LENGTH_CONTRACT_RATE = 0.80

// ── Helpers ──

function expenditureLimitForYear(taxYearStart: string): number {
  const cutoff = new Date(CAPITAL_PROPERTY_REINSTATEMENT_DATE)
  const start = new Date(taxYearStart)
  return start >= cutoff ? EXPENDITURE_LIMIT_POST_2024 : EXPENDITURE_LIMIT_PRE_2024
}

interface CategoryTotals {
  salary: number
  contractor_arms: number
  contractor_non_arms: number
  materials: number
  overhead: number
  capital_property: number
  other: number
  excluded: number
}

async function fetchCategoryTotals(
  sb: SupabaseClient,
  claimYearId: string
): Promise<CategoryTotals> {
  const { data: items, error: itemErr } = await sb
    .from('cost_line_items')
    .select('id, net_amount')
    .eq('claim_year_id', claimYearId)

  if (itemErr) throw itemErr
  const allItems = (items ?? []) as Array<{ id: string; net_amount: number | null }>
  const itemIds = allItems.map((i) => i.id)

  if (itemIds.length === 0) {
    return {
      salary: 0,
      contractor_arms: 0,
      contractor_non_arms: 0,
      materials: 0,
      overhead: 0,
      capital_property: 0,
      other: 0,
      excluded: 0,
    }
  }

  const { data: cls, error: clsErr } = await sb
    .from('cost_line_classifications')
    .select('*')
    .in('cost_line_item_id', itemIds)

  if (clsErr) throw clsErr
  const classifications = (cls ?? []) as CostLineClassification[]

  const { data: splits, error: spErr } = await sb
    .from('cost_line_project_splits')
    .select('*')
    .in('cost_line_item_id', itemIds)
    .neq('review_status', 'excluded')

  if (spErr) throw spErr
  const allSplits = (splits ?? []) as CostLineProjectSplit[]

  // Build a map from line item id -> allocated amount (sum of confirmed splits)
  const allocatedAmounts = new Map<string, number>()
  for (const s of allSplits) {
    allocatedAmounts.set(
      s.cost_line_item_id,
      (allocatedAmounts.get(s.cost_line_item_id) ?? 0) + s.allocation_amount
    )
  }

  const totals: CategoryTotals = {
    salary: 0,
    contractor_arms: 0,
    contractor_non_arms: 0,
    materials: 0,
    overhead: 0,
    capital_property: 0,
    other: 0,
    excluded: 0,
  }

  for (const c of classifications) {
    if (c.excluded_flag) {
      const item = allItems.find((i) => i.id === c.cost_line_item_id)
      totals.excluded += item?.net_amount ?? 0
      continue
    }

    const amount = allocatedAmounts.get(c.cost_line_item_id) ?? 0
    const cat = c.likely_category.toLowerCase()

    if (cat === 'salary_wages' || cat === 'specified_employee') {
      totals.salary += amount
    } else if (cat === 'arms_length_contractor') {
      totals.contractor_arms += amount
    } else if (cat === 'non_arms_length_contractor' || cat === 'third_party_payment') {
      totals.contractor_non_arms += amount
    } else if (cat === 'materials_consumed' || cat === 'materials_transformed') {
      totals.materials += amount
    } else if (cat === 'overhead') {
      totals.overhead += amount
    } else if (cat === 'capital_property') {
      totals.capital_property += amount
    } else {
      totals.other += amount
    }
  }

  return totals
}

// ── Main calculation ──

export interface FederalCalcOptions {
  /** ISO date string for tax year start. Used to determine expenditure limit. */
  taxYearStart: string
  /** Whether the claimant is a CCPC (Canadian-Controlled Private Corporation). */
  isCcpc: boolean
  /** 'proxy' or 'traditional'. Defaults to 'proxy'. */
  method?: 'proxy' | 'traditional'
}

export async function calculateFederalWaterfall(
  sb: SupabaseClient,
  claimYearId: string,
  opts: FederalCalcOptions
): Promise<FederalWaterfall> {
  const method = opts.method ?? 'proxy'
  const totals = await fetchCategoryTotals(sb, claimYearId)

  // Fetch assistance for this claim year
  const { data: assistRows, error: assErr } = await sb
    .from('assistance_items')
    .select('amount')
    .eq('claim_year_id', claimYearId)

  if (assErr) throw assErr
  const totalAssistance = (assistRows ?? []).reduce(
    (sum: number, a: { amount: number }) => sum + a.amount,
    0
  )

  // Proxy amount or traditional overhead
  // Capital property is always a direct expenditure, never proxied
  const proxyOrOverhead =
    method === 'proxy'
      ? totals.salary * PROXY_RATE
      : totals.overhead

  // Capital property: eligible only for tax years starting on or after Budget 2025 date
  const capitalCutoff = new Date(CAPITAL_PROPERTY_REINSTATEMENT_DATE)
  const taxStart = new Date(opts.taxYearStart)
  const capitalPropertyIncluded = taxStart >= capitalCutoff ? totals.capital_property : 0

  // Total expenditures before adjustments
  const totalExpenditures =
    totals.salary +
    totals.contractor_arms * ARMS_LENGTH_CONTRACT_RATE +
    totals.contractor_non_arms * NON_ARMS_LENGTH_CONTRACT_RATE +
    totals.materials +
    proxyOrOverhead +
    capitalPropertyIncluded +
    totals.other

  // Exclusions (already excluded in classification, but capture for waterfall display)
  const exclusions = totals.excluded

  // Qualified expenditures
  const qualifiedExpenditures = Math.max(
    totalExpenditures - totalAssistance,
    0
  )

  // ITC calculation
  const expLimit = expenditureLimitForYear(opts.taxYearStart)
  let enhancedItc = 0
  let basicItc = 0

  if (opts.isCcpc) {
    const enhancedBase = Math.min(qualifiedExpenditures, expLimit)
    enhancedItc = enhancedBase * CCPC_ENHANCED_RATE
    const remainingBase = Math.max(qualifiedExpenditures - expLimit, 0)
    basicItc = remainingBase * BASIC_ITC_RATE
  } else {
    basicItc = qualifiedExpenditures * BASIC_ITC_RATE
  }

  const totalItc = enhancedItc + basicItc

  return {
    totalExpenditures,
    exclusions,
    proxyOrOverhead,
    assistance: totalAssistance,
    qualifiedExpenditures,
    enhancedItc,
    basicItc,
    totalItc,
  }
}

// ── Persist line values ──

export async function saveFederalLineValues(
  sb: SupabaseClient,
  claimYearId: string,
  snapshotId: string | null,
  waterfall: FederalWaterfall
): Promise<FederalLineValue[]> {
  const lines: Array<{
    claim_year_id: string
    snapshot_id: string | null
    form_code: string
    line_code: string
    value: number
    explanation: string | null
  }> = [
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T661',
      line_code: 'total_expenditures',
      value: waterfall.totalExpenditures,
      explanation: 'Sum of all eligible expenditure categories',
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T661',
      line_code: 'exclusions',
      value: waterfall.exclusions,
      explanation: 'Excluded cost lines',
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T661',
      line_code: 'proxy_or_overhead',
      value: waterfall.proxyOrOverhead,
      explanation: 'Proxy prescribed percentage amount or traditional overhead',
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T661',
      line_code: 'assistance',
      value: waterfall.assistance,
      explanation: 'Government and non-government assistance deducted',
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T661',
      line_code: 'qualified_expenditures',
      value: waterfall.qualifiedExpenditures,
      explanation: 'Total expenditures less assistance',
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T2SCH31',
      line_code: 'enhanced_itc',
      value: waterfall.enhancedItc,
      explanation: `CCPC enhanced ITC at ${CCPC_ENHANCED_RATE * 100}%`,
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T2SCH31',
      line_code: 'basic_itc',
      value: waterfall.basicItc,
      explanation: `Basic ITC at ${BASIC_ITC_RATE * 100}%`,
    },
    {
      claim_year_id: claimYearId,
      snapshot_id: snapshotId,
      form_code: 'T2SCH31',
      line_code: 'total_itc',
      value: waterfall.totalItc,
      explanation: 'Enhanced + basic ITC',
    },
  ]

  const { data, error } = await sb
    .from('federal_line_values')
    .upsert(lines, {
      onConflict: 'claim_year_id,snapshot_id,form_code,line_code',
    })
    .select()

  if (error) throw error
  return (data ?? []) as FederalLineValue[]
}

// ── Read stored line values ──

export async function getFederalLineValues(
  sb: SupabaseClient,
  claimYearId: string,
  snapshotId?: string
): Promise<FederalLineValue[]> {
  let query = sb
    .from('federal_line_values')
    .select('*')
    .eq('claim_year_id', claimYearId)

  if (snapshotId) {
    query = query.eq('snapshot_id', snapshotId)
  } else {
    query = query.is('snapshot_id', null)
  }

  const { data, error } = await query.order('form_code').order('line_code')
  if (error) throw error
  return (data ?? []) as FederalLineValue[]
}
