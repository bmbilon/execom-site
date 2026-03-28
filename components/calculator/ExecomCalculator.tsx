'use client'

/**
 * ExecomCalculator — Supabase-backed homepage calculator component.
 *
 * Fetches benchmark data from Supabase via benchmarkService, runs
 * calculations via calculatorService, renders the three-scenario
 * comparison, and persists runs for analytics.
 *
 * Brand rule: "execom" always lowercase in UI copy.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
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
} from '@/lib/calculator/types'
import { resolveSources } from '@/lib/services/benchmarkService'

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

const BUSINESS_MODELS = [
  { value: 'solo', label: 'Solo Services / Consulting' },
  { value: 'practice', label: 'Professional Practice' },
  { value: 'productized', label: 'Productized Service' },
  { value: 'product', label: 'Product Business' },
  { value: 'unsure', label: 'Not Sure Yet' },
]

/** Province codes match the regions table */
const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'FED', label: 'Federal / Not Sure' },
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

  // Form state
  const [inputs, setInputs] = useState({
    annualComp: '' as string | number,
    severanceMonths: '' as string | number,
    hourlyRate: '' as string | number,
    weeklyHours: 20,
    industry: 'consulting',
    businessModel: 'solo',
    pursuingSred: false,
    province: 'AB',
    timeToAct: 1,
    conservativeRamp: true,
  })

  // Data & results state
  const [benchmarkData, setBenchmarkData] = useState<ResolvedBenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showMethodology, setShowMethodology] = useState(false)
  const [showSources, setShowSources] = useState(false)

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

  // Compute results from Supabase-backed data
  const results: CalculatorOutputs | null = useMemo(() => {
    if (!canCalculate || !benchmarkData) return null
    const parsedInputs: CalculatorInputs = {
      annualComp: Number(inputs.annualComp),
      severanceMonths: Number(inputs.severanceMonths) || 0,
      hourlyRate: Number(inputs.hourlyRate),
      weeklyHours: Number(inputs.weeklyHours),
      industry: inputs.industry,
      businessModel: inputs.businessModel,
      pursuingSred: inputs.pursuingSred,
      province: inputs.province,
      timeToAct: Number(inputs.timeToAct),
      conservativeRamp: inputs.conservativeRamp,
    }
    return computeCalculatorResults(parsedInputs, benchmarkData)
  }, [inputs, canCalculate, benchmarkData])

  // Collect all cited sources for the results
  const citedSources: Source[] = useMemo(() => {
    if (!results || !benchmarkData) return []
    const allSourceIds = [
      ...results.delay.sourceIds,
      ...results.fragmented.sourceIds,
      ...results.execom.sourceIds,
    ]
    const unique = [...new Set(allSourceIds)]
    return resolveSources(benchmarkData, unique)
  }, [results, benchmarkData])

  // Persist run on calculate
  const handleCalculate = useCallback(async () => {
    setShowResults(true)
    if (results) {
      const parsedInputs: CalculatorInputs = {
        annualComp: Number(inputs.annualComp),
        severanceMonths: Number(inputs.severanceMonths) || 0,
        hourlyRate: Number(inputs.hourlyRate),
        weeklyHours: Number(inputs.weeklyHours),
        industry: inputs.industry,
        businessModel: inputs.businessModel,
        pursuingSred: inputs.pursuingSred,
        province: inputs.province,
        timeToAct: Number(inputs.timeToAct),
        conservativeRamp: inputs.conservativeRamp,
      }
      // Fire-and-forget: don't block UI on persistence
      saveCalculatorRun(supabase, parsedInputs, results).catch(() => {})
    }
  }, [results, inputs, supabase])

  const urgencyLabel =
    inputs.timeToAct === 1
      ? 'Your window is now.'
      : inputs.timeToAct === 2
        ? 'Every week compounds.'
        : inputs.timeToAct === 4
          ? 'The cost of waiting is already accumulating.'
          : ''

  return (
    <div style={styles.wrapper}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <p style={styles.eyebrow}>The startup-industrial complex</p>
        <h2 style={styles.headline}>
          See what the usual founder path actually costs.
        </h2>
        <p style={styles.subhead}>
          Most professionals do not fail because they lack expertise. They get
          slowed down and overcharged by a fragmented stack of lawyers,
          accountants, consultants, and agencies before revenue is even
          operating. This model compares the cost of delay, the cost of the
          usual founder path, and the cost of executing through execom.
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

        {/* Row 3: Industry & Business Model */}
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
          <label style={styles.label}>Business model starting point</label>
          <select
            style={styles.select}
            value={inputs.businessModel}
            onChange={(e) => update('businessModel', e.target.value)}
          >
            {BUSINESS_MODELS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Row 4: SR&ED Toggle & Province */}
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

        {/* Row 5: Time to Act */}
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

        {/* Row 6: Conservative Ramp */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Use conservative ramp assumptions</label>
          <p style={styles.helpText}>
            Applies {benchmarkData
              ? `${Math.round(Number(benchmarkData.configs.conservative_ramp_factor ?? 0.7) * 100)}%`
              : '70%'
            } utilization to modeled revenue — reflects realistic early-stage billing
          </p>
          <div style={styles.toggleRow}>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(inputs.conservativeRamp ? styles.toggleActive : {}),
              }}
              onClick={() => update('conservativeRamp', true)}
            >
              On
            </button>
            <button
              type="button"
              style={{
                ...styles.toggleBtn,
                ...(!inputs.conservativeRamp ? styles.toggleActive : {}),
              }}
              onClick={() => update('conservativeRamp', false)}
            >
              Off
            </button>
          </div>
        </div>
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
          Estimate My Founder-Path Cost
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
              <p style={styles.metricNote}>
                Every month of delay may defer approximately{' '}
                {fmt(results.delay.monthlyNet ?? 0)} of potential independent
                revenue.
              </p>
            </div>
            <div style={styles.metricBox}>
              <p style={styles.metricLabel}>Usual founder-stack cost</p>
              <p style={styles.metricValue}>
                {fmtRange(
                  results.fragmented.costRangeLow,
                  results.fragmented.costRangeHigh
                )}
              </p>
              <p style={styles.metricNote}>
                Lawyer + accountant + consultant + agency stack for your profile.
              </p>
            </div>
            <div style={styles.metricBox}>
              <p style={styles.metricLabel}>execom model cost</p>
              <p style={styles.metricValue}>
                {fmtRange(
                  results.recommendedTier.priceLow,
                  results.recommendedTier.priceHigh
                )}
              </p>
              <p style={styles.metricNote}>
                {results.recommendedTier.label} — one execution layer instead of
                five vendors.
              </p>
            </div>
            <div style={{ ...styles.metricBox, ...styles.metricBoxHighlight }}>
              <p style={styles.metricLabel}>Founder-tax drag avoided</p>
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
              <p style={styles.metricNote}>
                Fees + coordination cost + delay cost you avoid with execom.
              </p>
            </div>
          </div>

          {urgencyLabel && <p style={styles.urgencyNote}>{urgencyLabel}</p>}

          {/* Speed comparison note */}
          <p style={styles.speedNote}>
            The usual founder path often consumes{' '}
            {results.fragmented.timelineWeeks} before a business is properly
            operational. execom compresses much of that setup into{' '}
            {results.execom.timelineWeeks} by replacing multiple vendors with one
            integrated execution layer.
          </p>

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
                {results.fragmented.notes.map((note, i) => (
                  <p key={i} style={styles.noteText}>{note}</p>
                ))}
              </div>
              <p style={styles.scenarioFootnote}>
                Based on published law firm, CPA, and agency pricing for your
                province and profile.
              </p>
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
            </div>
          </div>

          {/* ── SOURCE CITATIONS ── */}
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
                      <span style={styles.sourceTier}>
                        T{source.trust_tier}
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

          {/* ── METHODOLOGY DISCLOSURE ── */}
          <div style={styles.disclosureSection}>
            <button
              type="button"
              style={styles.disclosureToggle}
              onClick={() => setShowMethodology(!showMethodology)}
            >
              {showMethodology ? 'Hide' : 'Show'} methodology
            </button>
            {showMethodology && (
              <div style={styles.disclosureBody}>
                <p style={styles.disclosureText}>
                  {results.methodology.disclosureText}
                </p>
                <p style={styles.disclosureText}>
                  Benchmark dataset version: {results.methodology.version}.
                  Conservative ramp factor:{' '}
                  {Math.round(results.methodology.conservativeRampFactor * 100)}%.
                  EI parameters: {Math.round(results.methodology.eiReplacementRate * 100)}%
                  replacement rate, max ${results.methodology.eiMaxWeeklyBenefit}/week.
                </p>
              </div>
            )}
          </div>

          {/* ── CTA ── */}
          <div style={styles.ctaSection}>
            <h3 style={styles.ctaTitle}>your execom model</h3>
            <p style={styles.ctaSupportLine}>
              The fastest credible path from employment risk to operating
              business.
            </p>
            <button type="button" style={styles.ctaBtn}>
              Review My execom model
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
    padding: '48px 24px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1A1A18',
    background: '#FAFAF8',
  },
  header: { marginBottom: 40, maxWidth: 680 },
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
    gap: 24,
    marginBottom: 32,
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

  btnRow: { textAlign: 'center' as const, marginBottom: 40 },
  calcBtn: {
    padding: '14px 32px',
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

  resultsSection: { marginTop: 8 },

  metricsBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  metricBox: {
    padding: 16,
    background: '#fff',
    border: '1px solid #E8E8E0',
    borderRadius: 8,
  },
  metricBoxHighlight: { background: '#1A1A18' },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#8C8C80',
    marginBottom: 4,
  },
  metricValue: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  metricValueHighlight: { color: '#FAFAF8' },
  metricNote: { fontSize: 12, color: '#8C8C80', lineHeight: 1.4 },

  urgencyNote: {
    fontSize: 14,
    fontWeight: 600,
    color: '#B45309',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  speedNote: {
    fontSize: 13,
    color: '#5A5A50',
    lineHeight: 1.6,
    maxWidth: 680,
    margin: '0 auto 32px',
    textAlign: 'center' as const,
  },

  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 32,
  },
  scenarioCard: {
    border: '1px solid #E8E8E0',
    borderRadius: 10,
    overflow: 'hidden' as const,
    background: '#fff',
  },
  scenarioDelay: { borderColor: '#F5C518' },
  scenarioFragmented: { borderColor: '#DC2626' },
  scenarioExecom: { borderColor: '#1A1A18' },
  scenarioHeader: {
    padding: '16px 20px',
    background: '#F7F7F0',
    borderBottom: '1px solid #E8E8E0',
  },
  scenarioHeaderExecom: { background: '#1A1A18' },
  scenarioTitle: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  scenarioSub: { fontSize: 12, color: '#8C8C80', lineHeight: 1.4 },
  scenarioBody: { padding: '16px 20px' },
  lineItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '6px 0',
    borderBottom: '1px solid #F0F0E8',
  },
  lineLabel: { fontSize: 13, color: '#5A5A50' },
  lineValue: { fontSize: 14, fontWeight: 600 },
  lineValueWarn: { color: '#B45309' },
  noteText: {
    fontSize: 12,
    color: '#8C8C80',
    lineHeight: 1.4,
    padding: '4px 0',
  },
  scenarioFootnote: {
    fontSize: 11,
    color: '#A0A090',
    padding: '8px 20px 12px',
    fontStyle: 'italic' as const,
  },

  // Source citations
  sourcesSection: {
    marginBottom: 24,
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
  sourceLink: {
    fontSize: 11,
    color: '#195E8E',
    textDecoration: 'none',
  },

  // Methodology disclosure
  disclosureSection: { marginBottom: 32, padding: '0 4px' },
  disclosureToggle: {
    fontSize: 12,
    color: '#8C8C80',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline' as const,
    padding: 0,
  },
  disclosureBody: { marginTop: 12 },
  disclosureText: {
    fontSize: 12,
    color: '#8C8C80',
    lineHeight: 1.5,
    marginBottom: 8,
  },

  // CTA
  ctaSection: {
    textAlign: 'center' as const,
    padding: '40px 24px',
    background: '#1A1A18',
    borderRadius: 12,
    color: '#FAFAF8',
  },
  ctaTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  ctaSupportLine: {
    fontSize: 14,
    color: '#A0A090',
    marginBottom: 20,
  },
  ctaBtn: {
    padding: '14px 40px',
    background: '#FAFAF8',
    color: '#1A1A18',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
}
