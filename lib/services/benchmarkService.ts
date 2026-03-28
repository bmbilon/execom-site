/**
 * Benchmark service — fetches all calculator reference data from Supabase.
 *
 * Follows the same pattern as trademarkService.ts:
 *   - each function takes SupabaseClient as first arg
 *   - returns typed results
 *   - throws on error
 *
 * All queries filter for current rows (superseded_date IS NULL).
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Region,
  BenchmarkCategory,
  BenchmarkValue,
  BenchmarkValueWithSources,
  BenchmarkSourceLink,
  Source,
  ExecomTierAssumption,
  MethodologyConfig,
  ResolvedBenchmarkData,
} from '@/lib/calculator/types'

// ═══════════════════════════════════════════════════════════════
// Individual table fetchers
// ═══════════════════════════════════════════════════════════════

/** Fetch a single current region by code */
export async function fetchRegion(
  supabase: SupabaseClient,
  regionCode: string
): Promise<Region> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('code', regionCode)
    .is('superseded_date', null)
    .single()

  if (error) throw new Error(`Failed to fetch region ${regionCode}: ${error.message}`)
  return data as Region
}

/** Fetch all current regions */
export async function fetchAllRegions(
  supabase: SupabaseClient
): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .is('superseded_date', null)
    .order('code')

  if (error) throw new Error(`Failed to fetch regions: ${error.message}`)
  return (data ?? []) as Region[]
}

/** Fetch all benchmark categories */
export async function fetchCategories(
  supabase: SupabaseClient
): Promise<BenchmarkCategory[]> {
  const { data, error } = await supabase
    .from('benchmark_categories')
    .select('*')
    .order('category_group, slug')

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return (data ?? []) as BenchmarkCategory[]
}

/** Fetch current benchmark values for a region, with optional scenario filter */
export async function fetchBenchmarkValues(
  supabase: SupabaseClient,
  regionId: string | null,
  scenario?: string
): Promise<BenchmarkValue[]> {
  let query = supabase
    .from('benchmark_values')
    .select('*')
    .is('superseded_date', null)

  // Get values for this region OR values that apply to all regions (null region_id)
  if (regionId) {
    query = query.or(`region_id.eq.${regionId},region_id.is.null`)
  }

  if (scenario) {
    query = query.or(`scenario.eq.${scenario},scenario.eq.all`)
  }

  const { data, error } = await query.order('benchmark_category_id')

  if (error) throw new Error(`Failed to fetch benchmark values: ${error.message}`)
  return (data ?? []) as BenchmarkValue[]
}

/** Fetch source links for a set of benchmark value IDs */
export async function fetchSourceLinks(
  supabase: SupabaseClient,
  benchmarkValueIds: string[]
): Promise<BenchmarkSourceLink[]> {
  if (benchmarkValueIds.length === 0) return []

  const { data, error } = await supabase
    .from('benchmark_source_links')
    .select(`
      *,
      source:sources(*)
    `)
    .in('benchmark_value_id', benchmarkValueIds)

  if (error) throw new Error(`Failed to fetch source links: ${error.message}`)
  return (data ?? []) as BenchmarkSourceLink[]
}

/** Fetch all active sources */
export async function fetchSources(
  supabase: SupabaseClient
): Promise<Source[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('active', true)
    .order('trust_tier, citation_label')

  if (error) throw new Error(`Failed to fetch sources: ${error.message}`)
  return (data ?? []) as Source[]
}

/** Fetch current execom tier assumptions */
export async function fetchTierAssumptions(
  supabase: SupabaseClient
): Promise<ExecomTierAssumption[]> {
  const { data, error } = await supabase
    .from('execom_tier_assumptions')
    .select('*')
    .is('superseded_date', null)
    .order('price_low')

  if (error) throw new Error(`Failed to fetch tier assumptions: ${error.message}`)
  return (data ?? []) as ExecomTierAssumption[]
}

/** Fetch current methodology configs as a key-value map */
export async function fetchMethodologyConfigs(
  supabase: SupabaseClient
): Promise<{ configs: Record<string, unknown>; records: MethodologyConfig[] }> {
  const { data, error } = await supabase
    .from('methodology_configs')
    .select('*')
    .is('superseded_date', null)
    .order('key')

  if (error) throw new Error(`Failed to fetch methodology configs: ${error.message}`)

  const records = (data ?? []) as MethodologyConfig[]
  const configs: Record<string, unknown> = {}
  for (const row of records) {
    configs[row.key] = row.value
  }

  return { configs, records }
}

// ═══════════════════════════════════════════════════════════════
// Composite fetcher — everything the calculator needs in one call
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch all benchmark data needed for a calculator run.
 *
 * This is the primary entry point for the calculator component.
 * It fetches the region, all categories, relevant benchmark values
 * with their source links, tier assumptions, and methodology configs.
 */
export async function fetchCalculatorData(
  supabase: SupabaseClient,
  regionCode: string
): Promise<ResolvedBenchmarkData> {
  // Step 1: Fetch region and categories in parallel
  const [region, categories, tiers, { configs, records: configRecords }, allSources] =
    await Promise.all([
      fetchRegion(supabase, regionCode),
      fetchCategories(supabase),
      fetchTierAssumptions(supabase),
      fetchMethodologyConfigs(supabase),
      fetchSources(supabase),
    ])

  // Step 2: Fetch benchmark values for this region
  const benchmarkValues = await fetchBenchmarkValues(supabase, region.id)

  // Step 3: Fetch source links for all benchmark values
  const benchmarkIds = benchmarkValues.map((bv) => bv.id)
  const sourceLinks = await fetchSourceLinks(supabase, benchmarkIds)

  // Step 4: Attach source links to benchmark values
  const sourceLinksByBenchmark = new Map<string, BenchmarkSourceLink[]>()
  for (const link of sourceLinks) {
    const existing = sourceLinksByBenchmark.get(link.benchmark_value_id) ?? []
    existing.push(link)
    sourceLinksByBenchmark.set(link.benchmark_value_id, existing)
  }

  const benchmarks: BenchmarkValueWithSources[] = benchmarkValues.map((bv) => ({
    ...bv,
    sourceLinks: sourceLinksByBenchmark.get(bv.id) ?? [],
  }))

  return {
    region,
    categories,
    benchmarks,
    tiers,
    configs,
    configRecords,
    sources: allSources,
  }
}

// ═══════════════════════════════════════════════════════════════
// Lookup helpers — used by calculatorService
// ═══════════════════════════════════════════════════════════════

/**
 * Find benchmark values by category slug, optionally filtered by scenario.
 * Returns values for the specific region first, then fallback to national.
 */
export function lookupBenchmarks(
  data: ResolvedBenchmarkData,
  categorySlug: string,
  scenario?: string
): BenchmarkValueWithSources[] {
  const category = data.categories.find((c) => c.slug === categorySlug)
  if (!category) return []

  return data.benchmarks.filter((bv) => {
    if (bv.benchmark_category_id !== category.id) return false
    if (scenario && bv.scenario !== scenario && bv.scenario !== 'all') return false
    return true
  })
}

/**
 * Get the best (most specific) benchmark value for a category/scenario.
 * Prefers region-specific over national (null region_id).
 */
export function getBestBenchmark(
  data: ResolvedBenchmarkData,
  categorySlug: string,
  scenario?: string
): BenchmarkValueWithSources | null {
  const matches = lookupBenchmarks(data, categorySlug, scenario)
  if (matches.length === 0) return null

  // Prefer region-specific (non-null region_id)
  const regionSpecific = matches.find((bv) => bv.region_id !== null)
  return regionSpecific ?? matches[0]
}

/**
 * Get the methodology config value, parsed as a number.
 */
export function getConfigNumber(
  data: ResolvedBenchmarkData,
  key: string,
  fallback: number = 0
): number {
  const val = data.configs[key]
  if (val === undefined || val === null) return fallback
  const num = typeof val === 'string' ? parseFloat(val) : Number(val)
  return isNaN(num) ? fallback : num
}

/**
 * Get the methodology config value as a string.
 */
export function getConfigString(
  data: ResolvedBenchmarkData,
  key: string,
  fallback: string = ''
): string {
  const val = data.configs[key]
  if (val === undefined || val === null) return fallback
  return typeof val === 'string' ? val : String(val)
}

/**
 * Collect all source IDs referenced by a set of benchmark values.
 */
export function collectSourceIds(benchmarks: BenchmarkValueWithSources[]): string[] {
  const ids = new Set<string>()
  for (const bv of benchmarks) {
    for (const link of bv.sourceLinks) {
      ids.add(link.source_id)
    }
  }
  return Array.from(ids)
}

/**
 * Resolve source objects from their IDs.
 */
export function resolveSources(
  data: ResolvedBenchmarkData,
  sourceIds: string[]
): Source[] {
  return data.sources.filter((s) => sourceIds.includes(s.id))
}
