/**
 * Calculator engine types — Supabase-backed pricing engine
 *
 * These types mirror the database schema from 020_calculator_schema.sql
 * and provide the contract for the service layer and calculator component.
 */

// ---------------------------------------------------------------------------
// Database row types (mirror schema)
// ---------------------------------------------------------------------------

export interface Region {
  id: string
  code: string
  name: string
  incorporation_type: string
  registry_agent_required: boolean
  uses_nuans: boolean
  gst_hst_type: string
  gst_hst_rate: number
  pst_rate: number | null
  wcb_avg_rate_pct: number | null
  residency_director_requirement: boolean
  extra_prov_registration_required: boolean
  annual_return_fee: number | null
  annual_return_gov_fee: number | null
  filing_floor: number
  notes: string | null
  /** Province-specific compliance warnings (Ontario CRA, AB agent, etc.) */
  compliance_risk_flags: ComplianceRiskFlag[]
  effective_date: string
  superseded_date: string | null
}

export interface ComplianceRiskFlag {
  flag: string
  label: string
  source: string
  date?: string
}

export interface BenchmarkCategory {
  id: string
  slug: string
  label: string
  category_group: string
  applies_to_scenarios: string[]
  is_one_time: boolean
  recurrence_unit: string | null
  requires_sred: boolean
  is_optional: boolean
  description: string | null
}

export interface BenchmarkValue {
  id: string
  benchmark_category_id: string
  region_id: string | null
  scenario: string
  value_low: number | null
  value_median: number | null
  value_high: number | null
  unit: string
  engagement_structure: string | null
  includes: string | null
  excludes: string | null
  confidence_score: number | null
  source_freshness: string | null
  notes: string | null
  effective_date: string
  superseded_date: string | null
  version: number
  manual_override: boolean
  admin_notes: string | null
  /** Provenance: government_official, institutional_research, law_firm_published_pricing, insurance_brokerage, methodology_assumption */
  source_type: string
  /** true = may appear in "sources used" UI section; false = methodology/internal only */
  is_citable: boolean
  // Joined fields (populated via select with joins)
  category?: BenchmarkCategory
  sources?: Source[]
}

export interface Source {
  id: string
  title: string
  publisher: string | null
  url: string | null
  citation_label: string
  accessed_date: string | null
  region_code: string | null
  source_type: string
  trust_tier: number
  claim_supported: string | null
  is_primary: boolean
  active: boolean
}

export interface BenchmarkSourceLink {
  id: string
  benchmark_value_id: string
  source_id: string
  relevance_note: string | null
  is_primary_source: boolean
  source?: Source
}

export interface ExecomTierAssumption {
  id: string
  tier_slug: string
  tier_label: string
  price_low: number
  price_median: number
  price_high: number
  founder_tax_displaced_low: number | null
  founder_tax_displaced_high: number | null
  roi_multiple_low: number | null
  roi_multiple_high: number | null
  replaces_categories: string[]
  does_not_replace: string[]
  target_segment: string[]
  timeline_weeks: number | null
  headline_saving_description: string | null
  effective_date: string
  superseded_date: string | null
}

export interface MethodologyConfig {
  id: string
  key: string
  label: string
  value: unknown // jsonb — could be number, string, boolean, or object
  description: string | null
  scenario_scope: string | null
  /** 1=internal assumption, 2=demoted benchmark, 3=reasonable default, 4-5=verified */
  confidence_score: number
  /** Provenance: government_official, institutional_research, demoted_benchmark, methodology_assumption */
  source_type: string
  effective_date: string
  superseded_date: string | null
}

export interface CalculatorRun {
  id: string
  session_id: string | null
  user_id: string | null
  created_at: string
  inputs: CalculatorInputs
  outputs: CalculatorOutputs
  province_code: string | null
  business_model_segment: string | null
  includes_sred: boolean
  benchmark_version_snapshot: string | null
  methodology_config_snapshot: Record<string, unknown> | null
  recommended_tier: string | null
  lead_captured: boolean
}

// ---------------------------------------------------------------------------
// Calculator input / output types
// ---------------------------------------------------------------------------

export interface CalculatorInputs {
  annualComp: number
  severanceMonths: number
  hourlyRate: number
  weeklyHours: number
  industry: string
  businessModel: string
  pursuingSred: boolean
  province: string
  timeToAct: number
  conservativeRamp: boolean
  // Extended inputs (Phase 2)
  primaryModel: PrimaryModel
  revenueRamp: RevenueRamp
  capitalStructure: CapitalStructure
  timeToFirstClient: TimeToFirstClient
  outsideMarketing: LikelihoodToggle
  acceleratorIntent: LikelihoodToggle
}

export type PrimaryModel =
  | 'consulting'
  | 'professional_practice'
  | 'productized_service'
  | 'product_business'

export type RevenueRamp = 'conservative' | 'moderate' | 'aggressive'

export type CapitalStructure =
  | 'bootstrapped'
  | 'sred_supported'
  | 'venture_path'
  | 'unsure'

export type TimeToFirstClient =
  | 'already_have_one'
  | 'within_30_days'
  | '2_to_3_months'
  | 'unknown'

export type LikelihoodToggle = 'no' | 'maybe' | 'likely'

export interface ScenarioResult {
  label: string
  subtitle: string
  monthlyNet: number | null
  annualNet: number | null
  costRangeLow: number
  costRangeHigh: number
  timelineWeeks: string
  notes: string[]
  /** Human-readable profile label, e.g. "For an Alberta solo consulting business" */
  profileLabel?: string
  /** Benchmark value IDs used in this scenario for audit trail */
  benchmarkIds: string[]
  /** Source IDs backing citable (Tier 1/2) benchmarks only */
  sourceIds: string[]
  /** Short descriptions of methodology assumptions used (not externally verified) */
  assumptionNotes: string[]
}

/** Time-economics metrics — converted to dollars */
export interface TimeEconomics {
  /** Weeks to operational readiness */
  operationalReadinessWeeks: { fragmented: number; execom: number }
  /** Weeks to first invoice / first revenue */
  firstRevenueWeeks: { fragmented: number; execom: number }
  /** Vendor coordination drag in weeks */
  vendorDragWeeks: { low: number; high: number }
  /** Dollar cost of operational-readiness delay */
  operationalDelayDollars: number
  /** Dollar cost of first-invoice delay gap */
  invoiceDelayDollars: number
  /** Dollar cost of vendor coordination drag */
  vendorDragDollars: number
  /** Earlier-revenue advantage (execom vs fragmented, in dollars) */
  earlierRevenueAdvantage: number
  /** Total time-economics advantage */
  totalTimeAdvantage: number
  /** Source IDs for each time-economics metric */
  sourceIds: {
    operationalReadiness: string[]
    firstRevenue: string[]
    vendorDrag: string[]
    invoiceLag: string[]
  }
}

export interface CalculatorOutputs {
  delay: ScenarioResult
  fragmented: ScenarioResult
  execom: ScenarioResult
  recommendedTier: RecommendedTier
  methodology: MethodologySnapshot
  timeEconomics: TimeEconomics
}

export interface RecommendedTier {
  slug: string
  label: string
  priceLow: number
  priceHigh: number
  headline: string | null
  timelineWeeks: number | null
  replaces: string[]
  doesNotReplace: string[]
}

export interface MethodologySnapshot {
  version: string
  conservativeRampFactor: number
  eiMaxWeeklyBenefit: number
  eiReplacementRate: number
  eiMaxInsurableEarnings: number
  weeksPerMonth: number
  billableWeeksPerYear: number
  disclosureText: string
}

// ---------------------------------------------------------------------------
// Resolved benchmark data (post-fetch, pre-calculation)
// ---------------------------------------------------------------------------

/** All data fetched from Supabase, ready for the calculator engine */
export interface ResolvedBenchmarkData {
  region: Region
  categories: BenchmarkCategory[]
  benchmarks: BenchmarkValueWithSources[]
  tiers: ExecomTierAssumption[]
  configs: Record<string, unknown>
  configRecords: MethodologyConfig[]
  sources: Source[]
}

/** Benchmark value with joined source data */
export interface BenchmarkValueWithSources extends BenchmarkValue {
  sourceLinks: BenchmarkSourceLink[]
}

// ---------------------------------------------------------------------------
// Convenience types
// ---------------------------------------------------------------------------

export type TierSlug =
  | 'independence_launch'
  | 'operator_system'
  | 'asset_builder'
  | 'executive_transition'

export type ScenarioSlug = 'delay' | 'fragmented_founder_path' | 'execom'

export type CategoryGroup =
  | 'legal'
  | 'accounting_tax'
  | 'compliance'
  | 'insurance'
  | 'marketing'
  | 'advisory'
  | 'delay_opportunity'
