'use client'

/**
 * ExecomCalculator — Supabase-backed homepage calculator component.
 *
 * Phase 2: Extended with 6 new inputs (primaryModel, revenueRamp,
 * capitalStructure, timeToFirstClient, outsideMarketing, acceleratorIntent),
 * time-economics metrics and sharper scenario notes.
 *
 * Brand rule: "execom" always lowercase in UI copy.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/portal/supabase-client'
import { fetchCalculatorData } from '@/lib/services/benchmarkService'
import {
  computeCalculatorResults,
  saveCalculatorRun,
  fmt,
  fmtRange,
} from '@/lib/services/calculatorService'
import type {
  CalculatorInputs,
  CalculatorOutputs,
  ResolvedBenchmarkData,
  Source,
  PrimaryModel,
  RevenueRamp,
  CapitalStructure,
  TimeToFirstClient,
  LikelihoodToggle,
} from '@/lib/calculator/types'
import { resolveSources, getSourceTrustLabel } from '@/lib/services/benchmarkService'

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: 'software', label: 'Software / Technical' },
  { value: 'consulting', label: 'Consulting / Advisory' },
  { value: 'marketing', label: 'Marketing / Creative' },
  { value: 'operations', label: 'Operations / Supply Chain' },
  { value: 'finance', label: 'Finance / Accounting' },
  { value: 'healthcare', label: 'Healthcare / Regulated Professional' },
  { value: 'beauty', label: 'Beauty / Consumer / Product' },
  { value: 'other', label: 'Other' },
]

const PRIMARY_MODELS: { value: PrimaryModel; label: string; help: string }[] = [
  { value: 'consulting', label: 'Solo Services / Consulting', help: 'Billing for your time and expertise' },
  { value: 'professional_practice', label: 'Professional Practice', help: 'Regulated or credentialed practice (CPA, engineer, etc.)' },
  { value: 'productized_service', label: 'Productized Service', help: 'Defined scope, fixed pricing, repeatable delivery' },
  { value: 'product_business', label: 'Product Business', help: 'SaaS, digital product, or IP-driven model' },
]

const REVENUE_RAMPS: { value: RevenueRamp; label: string; help: string }[] = [
  { value: 'conservative', label: 'Conservative', help: '25% utilization months 1–6, 55% months 7–12' },
  { value: 'moderate', label: 'Moderate', help: '40% utilization months 1–6, 70% months 7–12' },
  { value: 'aggressive', label: 'Aggressive', help: '55% utilization months 1–6, 85% months 7–12' },
]

const CAPITAL_STRUCTURES: { value: CapitalStructure; label: string; help: string }[] = [
  { value: 'bootstrapped', label: 'Bootstrapped', help: 'Self-funded from savings or revenue' },
  { value: 'sred_supported', label: 'SR&ED Supported', help: 'Pursuing R&D tax credits to fund development' },
  { value: 'venture_path', label: 'Venture Path', help: 'Raising capital — adds legal complexity' },
  { value: 'unsure', label: 'Not Sure Yet', help: 'Still deciding — modeled as bootstrapped' },
]

const TIME_TO_FIRST_CLIENT: { value: TimeToFirstClient; label: string }[] = [
  { value: 'already_have_one', label: 'Already have a client lined up' },
  { value: 'within_30_days', label: 'Expect one within 30 days' },
  { value: '2_to_3_months', label: '2–3 months out' },
  { value: 'unknown', label: 'Not sure yet' },
]

const LIKELIHOOD_OPTIONS: { value: LikelihoodToggle; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'likely', label: 'Likely' },
]

/** Province codes match the regions table */
const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'FED', label: 'Federal or Other Province' },
]

const TIME_TO_ACT = [
  { value: 1, label: 'Immediately' },
  { value: 2, label: 'Within 30 Days' },
  { value: 4, label: '2–3 Months' },
  { value: 6, label: 'Just Exploring' },
]

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ExecomCalculator() {
  const supabase = createClient()
  const router = useRouter()

  // Form state — Phase 2 extended inputs
  const [inputs, setInputs] = useState({
    annualComp: '' as string | number,
    severanceMonths: '' as string | number,
    hourlyRate: '' as string | number,
    weeklyHours: 20,
    industry: 'consulting',
    pursuingSred: false,
    province: 'AB',
    timeToAct: 1,
    // Phase 2 new inputs
    primaryModel: 'consulting' as PrimaryModel,
    revenueRamp: 'conservative' as RevenueRamp,
    capitalStructure: 'bootstrapped' as CapitalStructure,
    timeToFirstClient: 'unknown' as TimeToFirstClient,
    outsideMarketing: 'no' as LikelihoodToggle,
    acceleratorIntent: 'no' as LikelihoodToggle,
  })

  // Data & results state
  const [benchmarkData, setBenchmarkData] = useState<ResolvedBenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showMethodology, setShowMethodology] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showTimeEconomics, setShowTimeEconomics] = useState(true)
  // Fetch benchmark data when province changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCalculatorData(supabase, inputs.province)
      .then((data) => {
        if (!cancelled) {
          setBenchmarkData(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [inputs.province])

  const update = useCallback((field: string, value: unknown) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
    setShowResults(false)
  }, [])

  const canCalculate =
    Number(inputs.annualComp) > 0 &&
    Number(inputs.hourlyRate) > 0 &&
    benchmarkData !== null &&
    !loading

  // Build parsed inputs for the calculator engine
  const buildParsedInputs = useCallback((): CalculatorInputs => ({
    annualComp: Number(inputs.annualComp),
    severanceMonths: Number(inputs.severanceMonths) || 0,
    hourlyRate: Number(inputs.hourlyRate),
    weeklyHours: Number(inputs.weeklyHours),
    industry: inputs.industry,
    businessModel: inputs.primaryModel, // legacy field maps to primaryModel
    pursuingSred: inputs.pursuingSred || inputs.capitalStructure === 'sred_supported',
    province: inputs.province,
    timeToAct: Number(inputs.timeToAct),
    conservativeRamp: inputs.revenueRamp === 'conservative',
    primaryModel: inputs.primaryModel,
    revenueRamp: inputs.revenueRamp,
    capitalStructure: inputs.capitalStructure,
    timeToFirstClient: inputs.timeToFirstClient,
    outsideMarketing: inputs.outsideMarketing,
    acceleratorIntent: inputs.acceleratorIntent,
  }), [inputs])

  // Compute results from Supabase-backed data
  const results: CalculatorOutputs | null = useMemo(() => {
    if (!canCalculate || !benchmarkData) return null
    return computeCalculatorResults(buildParsedInputs(), benchmarkData)
  }, [inputs, canCalculate, benchmarkData, buildParsedInputs])

  // Collect citable sources only (Tier 1/2) for the "sources used" section
  const citedSources: Source[] = useMemo(() => {
    if (!results || !benchmarkData) return []
    const allSourceIds = [
      ...results.delay.sourceIds,
      ...results.fragmented.sourceIds,
      ...results.execom.sourceIds,
    ]
    const unique = [...new Set(allSourceIds)]
    // Only include Tier 1 and Tier 2 sources in the visible citation list
    return resolveSources(benchmarkData, unique, 2)
  }, [results, benchmarkData])

  // Per-scenario source labels for card footers
  const delaySources = useMemo(() => {
    if (!results || !benchmarkData) return ''
    const sources = resolveSources(benchmarkData, results.delay.sourceIds)
    if (sources.length === 0) return ''
    return sources.map((s) => s.citation_label).join('; ')
  }, [results, benchmarkData])

  const fragmentedSources = useMemo(() => {
    if (!results || !benchmarkData) return ''
    const sources = resolveSources(benchmarkData, results.fragmented.sourceIds)
    if (sources.length === 0) return ''
    return sources.map((s) => s.citation_label).join('; ')
  }, [results, benchmarkData])

  const execomSources = useMemo(() => {
    if (!results || !benchmarkData) return ''
    const sources = resolveSources(benchmarkData, results.execom.sourceIds)
    if (sources.length === 0) return ''
    return sources.map((s) => s.citation_label).join('; ')
  }, [results, benchmarkData])

  // Per-metric time-economics source labels
  const teSourceLabels = useMemo(() => {
    if (!results || !benchmarkData) return { operationalReadiness: '', firstRevenue: '', vendorDrag: '', invoiceLag: '' }
    const resolve = (ids: string[]) => {
      const sources = resolveSources(benchmarkData, ids)
      return sources.length > 0 ? sources.map((s) => s.citation_label).join('; ') : ''
    }
    return {
      operationalReadiness: resolve(results.timeEconomics.sourceIds.operationalReadiness),
      firstRevenue: resolve(results.timeEconomics.sourceIds.firstRevenue),
      vendorDrag: resolve(results.timeEconomics.sourceIds.vendorDrag),
      invoiceLag: resolve(results.timeEconomics.sourceIds.invoiceLag),
    }
  }, [results, benchmarkData])

  // Persist run on calculate
  const handleCalculate = useCallback(async () => {
    setShowResults(true)
    if (results) {
      // Fire-and-forget: don't block UI on persistence
      saveCalculatorRun(supabase, buildParsedInputs(), results).catch(() => {})
    }
  }, [results, inputs, supabase, buildParsedInputs])

  /** Navigate to portal signup with calculator context */
  const handleReviewModel = useCallback(() => {
    const params = new URLSearchParams({ source: 'calculator' })
    if (results) {
      params.set('province', String(inputs.province))
      params.set('rate', String(inputs.hourlyRate))
      params.set('hours', String(inputs.weeklyHours))
      params.set('model', String(inputs.primaryModel))
      params.set('stack', String(results.fragmented.costRangeHigh))
      params.set('execom', String(results.recommendedTier.priceHigh))
    }
    router.push(`/portal/signup?${params.toString()}`)
  }, [results, inputs, router])

  const urgencyLabel =
    inputs.timeToAct === 1
      ? 'Your window is now.'
      : inputs.timeToAct === 2
        ? 'Every week compounds.'
        : inputs.timeToAct === 4
          ? 'The cost of waiting is already accumulating.'
          : ''

  // Show venture-specific fields only when relevant
  const showVentureFields = inputs.capitalStructure === 'venture_path'

  return (
    <div style={styles.wrapper}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <p style={styles.eyebrow}>The startup-industrial complex</p>
        <h2 style={styles.headline}>
          See what starting a business actually costs.
        </h2>
        <p style={styles.subhead}>
          Calculate the cost of doing nothing, doing things the usual way,
          or executing through execom.
        </p>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div style={styles.errorBanner}>
          Unable to load benchmark data. Using estimated defaults.
        </div>
      )}

      {/* ── CALCULATOR FORM ── */}
      <div style={styles.formGrid}>
        {/* Row 1: Compensation & Severance */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Current annual compensation</label>
          <p style={styles.helpText}>Salary + bonus if meaningful</p>
          <div style={styles.inputWrap}>
            <span style={styles.inputPrefix}>$</span>
            <input
              type="number"
              style={styles.inputWithPrefix}
              placeholder="150,000"
              value={inputs.annualComp}
              onChange={(e) => update('annualComp', e.target.value)}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Months of severance</label>
          <p style={styles.helpText}>Enter 0 if none</p>
          <input
            type="number"
            style={styles.input}
            placeholder="3"
            value={inputs.severanceMonths}
            onChange={(e) => update('severanceMonths', e.target.value)}
          />
        </div>

        {/* Row 2: Rate & Hours */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Expected independent hourly rate</label>
          <p style={styles.helpText}>Current consulting market equivalent</p>
          <div style={styles.inputWrap}>
            <span style={styles.inputPrefix}>$</span>
            <input
              type="number"
              style={styles.inputWithPrefix}
              placeholder="175"
              value={inputs.hourlyRate}
              onChange={(e) => update('hourlyRate', e.target.value)}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Expected weekly billable hours</label>
          <p style={styles.helpText}>Range: 10–40 hours</p>
          <div style={styles.rangeWrap}>
            <input
              type="range"
              min="10"
              max="40"
              step="1"
              value={inputs.weeklyHours}
              onChange={(e) => update('weeklyHours', Number(e.target.value))}
              style={styles.range}
            />
            <span style={styles.rangeValue}>{inputs.weeklyHours} hrs/wk</span>
          </div>
        </div>

        {/* Row 3: Industry & Primary Model */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Industry</label>
          <select
            style={styles.select}
            value={inputs.industry}
            onChange={(e) => update('industry', e.target.value)}
          >
            {INDUSTRIES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Primary business model</label>
          <select
            style={styles.select}
            value={inputs.primaryModel}
            onChange={(e) => update('primaryModel', e.target.value)}
          >
            {PRIMARY_MODELS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p style={styles.helpText}>
            {PRIMARY_MODELS.find((m) => m.value === inputs.primaryModel)?.help}
          </p>
        </div>

        {/* Row 4: Revenue Ramp & Capital Structure */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Revenue ramp assumption</label>
          <div style={styles.pillRow}>
            {REVENUE_RAMPS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={{
                  ...styles.pillBtn,
                  ...(inputs.revenueRamp === o.value ? styles.pillActive : {}),
                }}
                onClick={() => update('revenueRamp', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p style={styles.helpText}>
            {REVENUE_RAMPS.find((r) => r.value === inputs.revenueRamp)?.help}
          </p>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Capital structure</label>
          <select
            style={styles.select}
            value={inputs.capitalStructure}
            onChange={(e) => update('capitalStructure', e.target.value)}
          >
            {CAPITAL_STRUCTURES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p style={styles.helpText}>
            {CAPITAL_STRUCTURES.find((c) => c.value === inputs.capitalStructure)?.help}
          </p>
        </div>

        {/* Row 5: SR&ED & Province */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Pursuing SR&ED or product development?</label>
          <div style={styles.toggleRow}>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(inputs.pursuingSred ? styles.toggleActive : {}),
              }}
              onClick={() => update('pursuingSred', true)}
            >
              Yes
            </button>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(!inputs.pursuingSred ? styles.toggleActive : {}),
              }}
              onClick={() => update('pursuingSred', false)}
            >
              No
            </button>
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Province</label>
          <select
            style={styles.select}
            value={inputs.province}
            onChange={(e) => update('province', e.target.value)}
          >
            {PROVINCES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {loading && <p style={styles.loadingHint}>Loading benchmarks...</p>}
          {benchmarkData && (
            <p style={styles.provinceNote}>{benchmarkData.region.notes}</p>
          )}
        </div>

        {/* Row 6: Time to First Client & Time to Act */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Time to first client</label>
          <select
            style={styles.select}
            value={inputs.timeToFirstClient}
            onChange={(e) => update('timeToFirstClient', e.target.value)}
          >
            {TIME_TO_FIRST_CLIENT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Time to act</label>
          <select
            style={styles.select}
            value={inputs.timeToAct}
            onChange={(e) => update('timeToAct', Number(e.target.value))}
          >
            {TIME_TO_ACT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Row 7: Outside Marketing & Accelerator Intent */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Outside marketing agency</label>
          <p style={styles.helpText}>Will you engage a marketing or branding agency?</p>
          <div style={styles.pillRow}>
            {LIKELIHOOD_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={{
                  ...styles.pillBtn,
                  ...(inputs.outsideMarketing === o.value ? styles.pillActive : {}),
                }}
                onClick={() => update('outsideMarketing', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {showVentureFields && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Accelerator / cohort intent</label>
            <p style={styles.helpText}>Applying to an accelerator, incubator, or startup cohort?</p>
            <div style={styles.pillRow}>
              {LIKELIHOOD_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  style={{
                    ...styles.pillBtn,
                    ...(inputs.acceleratorIntent === o.value ? styles.pillActive : {}),
                  }}
                  onClick={() => update('acceleratorIntent', o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CALCULATE BUTTON ── */}
      <div style={styles.btnRow}>
        <button
          type="button"
          disabled={!canCalculate}
          style={{
            ...styles.calcBtn,
            ...(!canCalculate ? styles.calcBtnDisabled : {}),
          }}
          onClick={handleCalculate}
        >
          Estimate my cost to start a business
        </button>
        <button
          type="button"
          style={styles.sampleBtn}
          onClick={() => {
            setInputs({
              annualComp: 150000,
              severanceMonths: 1,
              hourlyRate: 175,
              weeklyHours: 20,
              industry: 'consulting',
              pursuingSred: false,
              province: 'AB',
              timeToAct: 1,
              primaryModel: 'consulting',
              revenueRamp: 'conservative',
              capitalStructure: 'bootstrapped',
              timeToFirstClient: 'within_30_days',
              outsideMarketing: 'no',
              acceleratorIntent: 'no',
            })
            setShowResults(false)
          }}
        >
          Use sample inputs
        </button>
      </div>

      {/* ── RESULTS ── */}
      {showResults && results && (
        <div style={styles.resultsSection}>
          {/* Key Metrics Banner */}
          <div style={styles.metricsBanner}>
            <div style={styles.metricBox}>
              <p style={styles.metricLabel}>Monthly income at risk</p>
              <p style={styles.metricValue}>
                {fmt(results.delay.monthlyNet ?? 0)}
              </p>
            </div>
            <div style={styles.metricBox}>
              <p style={styles.metricLabel}>Typical startup advisory cost</p>
              <p style={styles.metricValue}>
                {fmtRange(
                  results.fragmented.costRangeLow,
                  results.fragmented.costRangeHigh
                )}
              </p>
              {results.fragmented.profileLabel && (
                <p style={styles.metricProfile}>{results.fragmented.profileLabel}</p>
              )}
            </div>
            <div style={styles.metricBox}>
              <p style={styles.metricLabel}>execom model</p>
              <p style={styles.metricValue}>
                {fmtRange(
                  results.recommendedTier.priceLow,
                  results.recommendedTier.priceHigh
                )}
              </p>
            </div>
            <div style={{ ...styles.metricBox, ...styles.metricBoxHighlight }}>
              <p style={styles.metricLabel}>Startup tax avoided</p>
              <p
                style={{
                  ...styles.metricValue,
                  ...styles.metricValueHighlight,
                }}
              >
                {fmt(
                  Math.max(
                    0,
                    results.fragmented.costRangeHigh -
                      results.recommendedTier.priceHigh
                  )
                )}
              </p>
            </div>
          </div>

          {urgencyLabel && <p style={styles.urgencyNote}>{urgencyLabel}</p>}

          {/* Speed comparison note */}
          <p style={styles.speedNote}>
            Usual path: {results.fragmented.timelineWeeks} to operational.
            execom: {results.execom.timelineWeeks}.
          </p>

          {/* ── TIME ECONOMICS ── */}
          <div style={styles.timeEconSection}>
            <button
              type="button"
              style={styles.sectionToggle}
              onClick={() => setShowTimeEconomics(!showTimeEconomics)}
            >
              <span style={styles.sectionToggleLabel}>Time economics</span>
              <span style={styles.sectionToggleArrow}>{showTimeEconomics ? '−' : '+'}</span>
            </button>
            {showTimeEconomics && (
              <div style={styles.timeEconGrid}>
                <div style={styles.timeEconRow}>
                  <div style={styles.timeEconMetric}>
                    <p style={styles.timeEconLabel}>Operational readiness</p>
                    <p style={styles.timeEconComparison}>
                      <span style={styles.timeEconBad}>
                        {results.timeEconomics.operationalReadinessWeeks.fragmented} weeks
                      </span>
                      <span style={styles.timeEconArrow}>→</span>
                      <span style={styles.timeEconGood}>
                        {results.timeEconomics.operationalReadinessWeeks.execom} weeks
                      </span>
                    </p>
                    {teSourceLabels.operationalReadiness && (
                      <p style={styles.timeEconSource}>{teSourceLabels.operationalReadiness}</p>
                    )}
                  </div>
                  <div style={styles.timeEconDollar}>
                    <p style={styles.timeEconDollarLabel}>Delay cost</p>
                    <p style={styles.timeEconDollarValue}>
                      {fmt(results.timeEconomics.operationalDelayDollars)}
                    </p>
                  </div>
                </div>

                <div style={styles.timeEconRow}>
                  <div style={styles.timeEconMetric}>
                    <p style={styles.timeEconLabel}>First invoice lag</p>
                    <p style={styles.timeEconDesc}>
                      Gap between operational readiness and first client invoice
                    </p>
                    {teSourceLabels.invoiceLag && (
                      <p style={styles.timeEconSource}>{teSourceLabels.invoiceLag}</p>
                    )}
                  </div>
                  <div style={styles.timeEconDollar}>
                    <p style={styles.timeEconDollarLabel}>Invoice delay cost</p>
                    <p style={styles.timeEconDollarValue}>
                      {fmt(results.timeEconomics.invoiceDelayDollars)}
                    </p>
                  </div>
                </div>

                <div style={styles.timeEconRow}>
                  <div style={styles.timeEconMetric}>
                    <p style={styles.timeEconLabel}>Vendor coordination drag</p>
                    <p style={styles.timeEconDesc}>
                      {results.timeEconomics.vendorDragWeeks.low}–{results.timeEconomics.vendorDragWeeks.high} weeks
                      of scheduling, follow-ups, and hand-offs
                    </p>
                    {teSourceLabels.vendorDrag && (
                      <p style={styles.timeEconSource}>{teSourceLabels.vendorDrag}</p>
                    )}
                  </div>
                  <div style={styles.timeEconDollar}>
                    <p style={styles.timeEconDollarLabel}>Drag cost</p>
                    <p style={styles.timeEconDollarValue}>
                      {fmt(results.timeEconomics.vendorDragDollars)}
                    </p>
                  </div>
                </div>

                <div style={styles.timeEconRow}>
                  <div style={styles.timeEconMetric}>
                    <p style={styles.timeEconLabel}>First revenue</p>
                    <p style={styles.timeEconComparison}>
                      <span style={styles.timeEconBad}>
                        {results.timeEconomics.firstRevenueWeeks.fragmented} weeks
                      </span>
                      <span style={styles.timeEconArrow}>→</span>
                      <span style={styles.timeEconGood}>
                        {results.timeEconomics.firstRevenueWeeks.execom} weeks
                      </span>
                    </p>
                    {teSourceLabels.firstRevenue && (
                      <p style={styles.timeEconSource}>{teSourceLabels.firstRevenue}</p>
                    )}
                  </div>
                  <div style={styles.timeEconDollar}>
                    <p style={styles.timeEconDollarLabel}>Earlier-revenue advantage</p>
                    <p style={{ ...styles.timeEconDollarValue, ...styles.timeEconHighlight }}>
                      {fmt(results.timeEconomics.earlierRevenueAdvantage)}
                    </p>
                  </div>
                </div>

                <div style={styles.timeEconSummary}>
                  <span style={styles.timeEconSummaryLabel}>
                    Total time-economics advantage
                  </span>
                  <span style={styles.timeEconSummaryValue}>
                    {fmt(results.timeEconomics.totalTimeAdvantage)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Three Scenario Cards */}
          <div style={styles.scenarioGrid}>
            {/* Scenario 1: Delay */}
            <div style={{ ...styles.scenarioCard, ...styles.scenarioDelay }}>
              <div style={styles.scenarioHeader}>
                <h3 style={styles.scenarioTitle}>{results.delay.label}</h3>
                <p style={styles.scenarioSub}>{results.delay.subtitle}</p>
              </div>
              <div style={styles.scenarioBody}>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>Cost of delay</span>
                  <span style={{ ...styles.lineValue, ...styles.lineValueWarn }}>
                    {fmtRange(
                      results.delay.costRangeLow,
                      results.delay.costRangeHigh
                    )}
                  </span>
                </div>
                {results.delay.notes.map((note, i) => (
                  <p key={i} style={styles.noteText}>{note}</p>
                ))}
              </div>
              <p style={styles.scenarioFootnote}>
                This is a modeled opportunity cost, not a guarantee of earnings.
              </p>
              {delaySources && (
                <p style={styles.scenarioSources}>Sources: {delaySources}</p>
              )}
            </div>

            {/* Scenario 2: Fragmented */}
            <div
              style={{ ...styles.scenarioCard, ...styles.scenarioFragmented }}
            >
              <div style={styles.scenarioHeader}>
                <h3 style={styles.scenarioTitle}>{results.fragmented.label}</h3>
                <p style={styles.scenarioSub}>{results.fragmented.subtitle}</p>
              </div>
              <div style={styles.scenarioBody}>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>Advisor-stack cost range</span>
                  <span style={styles.lineValue}>
                    {fmtRange(
                      results.fragmented.costRangeLow,
                      results.fragmented.costRangeHigh
                    )}
                  </span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>Timeline to operational</span>
                  <span style={styles.lineValue}>
                    {results.fragmented.timelineWeeks}
                  </span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>Time-economics drag</span>
                  <span style={{ ...styles.lineValue, ...styles.lineValueWarn }}>
                    {fmt(results.timeEconomics.totalTimeAdvantage)}
                  </span>
                </div>
                {results.fragmented.notes.map((note, i) => (
                  <p key={i} style={styles.noteText}>{note}</p>
                ))}
              </div>
              {results.fragmented.profileLabel && (
                <p style={styles.profileNote}>{results.fragmented.profileLabel}</p>
              )}
              <p style={styles.scenarioFootnote}>
                Based on published law firm, CPA, and agency pricing for your
                province and profile.
              </p>
              {fragmentedSources && (
                <p style={styles.scenarioSources}>Sources: {fragmentedSources}</p>
              )}
            </div>

            {/* Scenario 3: execom */}
            <div style={{ ...styles.scenarioCard, ...styles.scenarioExecom }}>
              <div
                style={{
                  ...styles.scenarioHeader,
                  ...styles.scenarioHeaderExecom,
                }}
              >
                <h3 style={styles.scenarioTitle}>{results.execom.label}</h3>
                <p style={styles.scenarioSub}>{results.execom.subtitle}</p>
              </div>
              <div style={styles.scenarioBody}>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>
                    {results.recommendedTier.label}
                  </span>
                  <span style={styles.lineValue}>
                    {fmtRange(
                      results.recommendedTier.priceLow,
                      results.recommendedTier.priceHigh
                    )}
                  </span>
                </div>
                <div style={styles.lineItem}>
                  <span style={styles.lineLabel}>Timeline to operational</span>
                  <span style={styles.lineValue}>
                    {results.execom.timelineWeeks}
                  </span>
                </div>
                {results.execom.notes.map((note, i) => (
                  <p key={i} style={styles.noteText}>{note}</p>
                ))}
              </div>
              {execomSources && (
                <p style={styles.scenarioSources}>Sources: {execomSources}</p>
              )}
            </div>
          </div>

          {/* ── SOURCE CITATIONS (Tier 1/2 only) ── */}
          {citedSources.length > 0 && (
            <div style={styles.sourcesSection}>
              <button
                type="button"
                style={styles.sourcesToggle}
                onClick={() => setShowSources(!showSources)}
              >
                {showSources ? 'Hide' : 'Show'} sources ({citedSources.length})
              </button>
              {showSources && (
                <div style={styles.sourcesList}>
                  {citedSources.map((source) => (
                    <div key={source.id} style={styles.sourceItem}>
                      <span style={{
                        ...styles.sourceTier,
                        ...(source.trust_tier === 1 ? styles.sourceTierGovt : {}),
                      }}>
                        {getSourceTrustLabel(source)}
                      </span>
                      <span style={styles.sourceLabel}>
                        {source.citation_label}
                      </span>
                      <span style={styles.sourcePublisher}>
                        {source.publisher}
                      </span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.sourceLink}
                        >
                          source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── METHODOLOGY (collapsed single line) ── */}
          <div style={styles.methodologyLine}>
            <button
              type="button"
              style={styles.methodologyToggle}
              onClick={() => setShowMethodology(!showMethodology)}
            >
              {showMethodology ? 'Hide methodology' : 'View modeling assumptions'}
            </button>
            {showMethodology && (
              <p style={styles.methodologyBody}>
                {results.methodology.disclosureText}{' '}
                Benchmark v{results.methodology.version}.{' '}
                Ramp: {inputs.revenueRamp}.{' '}
                Model: {inputs.primaryModel.replace(/_/g, ' ')}.
              </p>
            )}
          </div>

          {/* ── CTA ── */}
          <div style={styles.ctaSection}>
            <h3 style={styles.ctaTitle}>Your execom model</h3>
            <p style={styles.ctaSupportLine}>
              The fastest path from employment to an operating business.
            </p>
            <button
              type="button"
              onClick={handleReviewModel}
              style={styles.ctaBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E8E8E0'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FAFAF8'
                e.currentTarget.style.transform = 'none'
              }}
            >
              Review my execom model
            </button>
          </div>

          {/* ── STICKY CTA (desktop) ── */}
          <div style={styles.stickyCta}>
            <span style={styles.stickyCtaText}>
              {results.recommendedTier.label}: {fmtRange(results.recommendedTier.priceLow, results.recommendedTier.priceHigh)}
            </span>
            <button
              type="button"
              onClick={handleReviewModel}
              style={styles.stickyCtaBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E8E8E0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FAFAF8'
              }}
            >
              Review my execom model
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 920,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1A1A18',
    background: '#FAFAF8',
  },
  header: { marginBottom: 24, maxWidth: 680 },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8C8C80',
    marginBottom: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: 12,
    color: '#1A1A18',
  },
  subhead: { fontSize: 15, lineHeight: 1.6, color: '#5A5A50' },

  errorBanner: {
    padding: '12px 16px',
    background: '#FEF3CD',
    border: '1px solid #F5C518',
    borderRadius: 6,
    fontSize: 13,
    color: '#856404',
    marginBottom: 24,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  label: { fontSize: 13, fontWeight: 600, color: '#1A1A18' },
  helpText: { fontSize: 12, color: '#8C8C80', marginBottom: 2 },
  input: {
    padding: '10px 12px',
    border: '1px solid #D4D4C8',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
    color: '#1A1A18',
    outline: 'none',
  },
  inputWrap: { display: 'flex', alignItems: 'center' },
  inputPrefix: {
    padding: '10px 8px 10px 12px',
    background: '#F0F0E8',
    border: '1px solid #D4D4C8',
    borderRight: 'none',
    borderRadius: '6px 0 0 6px',
    fontSize: 14,
    color: '#8C8C80',
  },
  inputWithPrefix: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #D4D4C8',
    borderRadius: '0 6px 6px 0',
    fontSize: 14,
    background: '#fff',
    color: '#1A1A18',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #D4D4C8',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
    color: '#1A1A18',
    outline: 'none',
  },
  rangeWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  range: { flex: 1, accentColor: '#1A1A18' },
  rangeValue: { fontSize: 14, fontWeight: 600, minWidth: 70 },
  toggleRow: { display: 'flex', gap: 8 },
  toggleBtn: {
    padding: '8px 20px',
    border: '1px solid #D4D4C8',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    background: '#fff',
    color: '#5A5A50',
    cursor: 'pointer',
  },
  toggleActive: {
    background: '#1A1A18',
    color: '#FAFAF8',
    borderColor: '#1A1A18',
  },

  // Pill buttons (for ramp, likelihood)
  pillRow: { display: 'flex', gap: 6 },
  pillBtn: {
    padding: '7px 16px',
    border: '1px solid #D4D4C8',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    background: '#fff',
    color: '#5A5A50',
    cursor: 'pointer',
  },
  pillActive: {
    background: '#1A1A18',
    color: '#FAFAF8',
    borderColor: '#1A1A18',
  },

  loadingHint: {
    fontSize: 11,
    color: '#8C8C80',
    fontStyle: 'italic' as const,
    marginTop: 2,
  },
  provinceNote: {
    fontSize: 11,
    color: '#8C8C80',
    marginTop: 4,
    lineHeight: 1.4,
  },

  btnRow: { textAlign: 'center' as const, marginBottom: 28, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8 },
  calcBtn: {
    padding: '12px 28px',
    background: '#1A1A18',
    color: '#FAFAF8',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  calcBtnDisabled: {
    background: '#D4D4C8',
    color: '#8C8C80',
    cursor: 'not-allowed',
  },

  sampleBtn: {
    fontSize: 12,
    color: '#8C8C80',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline' as const,
    padding: 0,
  },

  resultsSection: { marginTop: 4 },

  metricsBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    marginBottom: 16,
  },
  metricBox: {
    padding: 12,
    background: '#fff',
    border: '1px solid #E8E8E0',
    borderRadius: 8,
  },
  metricBoxHighlight: { background: '#1A1A18' },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#8C8C80',
    marginBottom: 2,
  },
  metricValue: { fontSize: 20, fontWeight: 700, marginBottom: 0 },
  metricProfile: {
    fontSize: 10,
    color: '#8C8C80',
    marginTop: 2,
    marginBottom: 0,
    fontStyle: 'italic' as const,
  },
  metricValueHighlight: { color: '#FAFAF8' },

  urgencyNote: {
    fontSize: 13,
    fontWeight: 600,
    color: '#B45309',
    textAlign: 'center' as const,
    marginBottom: 10,
  },
  speedNote: {
    fontSize: 12,
    color: '#8C8C80',
    lineHeight: 1.5,
    maxWidth: 680,
    margin: '0 auto 20px',
    textAlign: 'center' as const,
  },

  // Time economics section
  timeEconSection: {
    marginBottom: 20,
    border: '1px solid #E8E8E0',
    borderRadius: 8,
    overflow: 'hidden' as const,
    background: '#fff',
  },
  sectionToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 16px',
    background: '#F7F7F0',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '1px solid #E8E8E0',
  },
  sectionToggleLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1A18',
  },
  sectionToggleArrow: {
    fontSize: 16,
    color: '#8C8C80',
  },
  timeEconGrid: {
    padding: '8px 16px',
  },
  timeEconRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #F0F0E8',
  },
  timeEconMetric: { flex: 1 },
  timeEconLabel: { fontSize: 13, fontWeight: 600, color: '#1A1A18', marginBottom: 2 },
  timeEconDesc: { fontSize: 12, color: '#8C8C80', lineHeight: 1.4 },
  timeEconComparison: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 },
  timeEconBad: { color: '#DC2626', fontWeight: 600 },
  timeEconArrow: { color: '#8C8C80', fontSize: 11 },
  timeEconGood: { color: '#16A34A', fontWeight: 600 },
  timeEconDollar: { textAlign: 'right' as const, minWidth: 140 },
  timeEconDollarLabel: { fontSize: 11, color: '#8C8C80', marginBottom: 2 },
  timeEconDollarValue: { fontSize: 16, fontWeight: 700, color: '#1A1A18' },
  timeEconHighlight: { color: '#16A34A' },
  timeEconSource: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    marginBottom: 0,
    lineHeight: 1.3,
  },
  timeEconSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0 4px',
    marginTop: 2,
  },
  timeEconSummaryLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1A1A18',
  },
  timeEconSummaryValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1A1A18',
  },

  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
    marginBottom: 20,
  },
  scenarioCard: {
    border: '1px solid #E8E8E0',
    borderRadius: 8,
    overflow: 'hidden' as const,
    background: '#fff',
  },
  scenarioDelay: { borderColor: '#F5C518' },
  scenarioFragmented: { borderColor: '#DC2626' },
  scenarioExecom: { borderColor: '#1A1A18' },
  scenarioHeader: {
    padding: '10px 14px',
    background: '#F7F7F0',
    borderBottom: '1px solid #E8E8E0',
  },
  scenarioHeaderExecom: { background: '#1A1A18' },
  scenarioTitle: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  scenarioSub: { fontSize: 11, color: '#8C8C80', lineHeight: 1.3 },
  scenarioBody: { padding: '10px 14px' },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '4px 0',
    borderBottom: '1px solid #F0F0E8',
  },
  lineLabel: { fontSize: 12, color: '#5A5A50' },
  lineValue: { fontSize: 13, fontWeight: 600 },
  lineValueWarn: { color: '#B45309' },
  noteText: {
    fontSize: 12,
    color: '#8C8C80',
    lineHeight: 1.4,
    padding: '4px 0',
  },
  profileNote: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6B7280',
    padding: '6px 14px 0',
    margin: 0,
  },
  scenarioFootnote: {
    fontSize: 10,
    color: '#A0A090',
    padding: '4px 14px 8px',
    fontStyle: 'italic' as const,
  },
  scenarioSources: {
    fontSize: 10,
    color: '#9CA3AF',
    padding: '2px 14px 8px',
    lineHeight: 1.4,
    margin: 0,
  },

  // Source citations
  sourcesSection: {
    marginBottom: 16,
    padding: '0 4px',
  },
  sourcesToggle: {
    fontSize: 12,
    color: '#8C8C80',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline' as const,
    padding: 0,
  },
  sourcesList: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  sourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#5A5A50',
  },
  sourceTier: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    background: '#F0F0E8',
    color: '#8C8C80',
  },
  sourceLabel: { fontWeight: 600, color: '#1A1A18' },
  sourcePublisher: { color: '#8C8C80' },
  sourceTierGovt: {
    background: '#E8F4E8',
    color: '#2D6A2E',
  },
  sourceLink: {
    fontSize: 11,
    color: '#195E8E',
    textDecoration: 'none',
  },

  // Methodology (single line toggle)
  methodologyLine: {
    marginBottom: 20,
    padding: '0 4px',
  },
  methodologyToggle: {
    fontSize: 11,
    color: '#8C8C80',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline' as const,
    padding: 0,
  },
  methodologyBody: {
    fontSize: 11,
    color: '#8C8C80',
    lineHeight: 1.5,
    marginTop: 6,
  },

  // CTA
  ctaSection: {
    textAlign: 'center' as const,
    padding: '28px 24px',
    background: '#1A1A18',
    borderRadius: 10,
    color: '#FAFAF8',
  },
  ctaTitle: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
  ctaSupportLine: {
    fontSize: 13,
    color: '#A0A090',
    marginBottom: 16,
  },
  ctaBtn: {
    padding: '12px 32px',
    background: '#FAFAF8',
    color: '#1A1A18',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'background 0.15s ease, transform 0.15s ease',
  },

  // Sticky CTA bar (desktop)
  stickyCta: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: '#1A1A18',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    zIndex: 50,
    borderTop: '1px solid #333',
  },
  stickyCtaText: {
    fontSize: 13,
    color: '#A0A090',
  },
  stickyCtaBtn: {
    padding: '10px 28px',
    background: '#FAFAF8',
    color: '#1A1A18',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
}
