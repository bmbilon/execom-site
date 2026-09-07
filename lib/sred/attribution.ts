// ════════════════════════════════════════════════════════════════════════════
// SR&ED funnel — first-party attribution and analytics payloads
//
// Isomorphic on purpose: the page reads campaign parameters in the browser and
// the API stores them on the server, and both must agree on the shape.
//
// The hard rule this file enforces: nothing about the applicant's business
// leaves for an analytics or ad destination. No payroll, no refund figures, no
// tax debts, no technical narrative, no underwriting reasons, no contact
// details. `buildAnalyticsPayload` is an allowlist, not a filter, so a future
// caller cannot leak a field by forgetting to strip it.
// ════════════════════════════════════════════════════════════════════════════

import type { Attribution } from './schema'
import type { Lane } from './engine'

export const SRED_ANALYTICS_EVENTS = [
  'sred_landing_view',
  'sred_assessment_started',
  'sred_assessment_step_completed',
  'sred_preliminary_result_viewed',
  'sred_review_requested',
  'sred_purchase_review_candidate',
  'sred_preparation_interest',
  'sred_existing_client_login',
] as const

export type SredAnalyticsEvent = (typeof SRED_ANALYTICS_EVENTS)[number]

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'partner',
] as const

const MAX_LEN = 160

function trim(v: string | null | undefined, max = MAX_LEN): string | undefined {
  if (!v) return undefined
  const s = v.trim().slice(0, max)
  return s.length ? s : undefined
}

/**
 * Read campaign parameters out of a URL query string. Called once on landing;
 * the result is stored tab-scoped so it survives the whole assessment.
 */
export function captureAttribution(
  search: string,
  referrer?: string,
  now: Date = new Date()
): Attribution {
  const params = new URLSearchParams(search)
  const out: Attribution = {}

  for (const key of UTM_KEYS) {
    const v = trim(params.get(key))
    if (v) out[key] = v
  }

  const variant = trim(params.get('v') ?? params.get('variant'), 60)
  if (variant) out.landing_variant = variant

  const ref = trim(referrer, 500)
  // Same-origin referrers say nothing useful and add a fingerprinting surface.
  if (ref && !/^https?:\/\/(www\.)?execom\.ca/i.test(ref) && !/^https?:\/\/localhost/i.test(ref)) {
    out.referrer = ref
  }

  out.first_touch_at = now.toISOString()
  return out
}

const STORAGE_KEY = 'sred.attribution.v1'

/** Tab-scoped so a shared device does not blend two people's campaigns. */
export function persistAttribution(a: Attribution): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a))
  } catch {
    // Private mode, storage disabled — attribution is best-effort, never a gate.
  }
}

export function readAttribution(): Attribution | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Attribution) : undefined
  } catch {
    return undefined
  }
}

/**
 * Resolve attribution once per tab: first touch wins, so a user who lands from
 * a campaign and then navigates internally keeps the campaign that brought them.
 */
export function resolveAttribution(
  search: string,
  referrer?: string,
  now: Date = new Date()
): Attribution {
  const existing = readAttribution()
  if (existing?.first_touch_at) return existing
  const fresh = captureAttribution(search, referrer, now)
  persistAttribution(fresh)
  return fresh
}

// ─── Analytics payloads ────────────────────────────────────────────────────

export interface AnalyticsContext {
  attribution?: Attribution
  /** Index of the step just completed. Never the answers themselves. */
  step?: number
  stepId?: string
  lane?: Lane
  /** Opaque conversion event id for ad-platform deduplication. */
  eventId?: string
}

export interface AnalyticsPayload {
  event: SredAnalyticsEvent
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  partner?: string
  landing_variant?: string
  referrer?: string
  first_touch_at?: string
  step?: number
  step_id?: string
  lane?: Lane
  event_id?: string
}

/**
 * Build the ONLY payload shape allowed to leave the page for analytics. Every
 * property is copied explicitly. Adding a field here is a deliberate act.
 */
export function buildAnalyticsPayload(
  event: SredAnalyticsEvent,
  ctx: AnalyticsContext = {}
): AnalyticsPayload {
  const a = ctx.attribution ?? {}
  const payload: AnalyticsPayload = { event }

  if (a.utm_source) payload.utm_source = a.utm_source
  if (a.utm_medium) payload.utm_medium = a.utm_medium
  if (a.utm_campaign) payload.utm_campaign = a.utm_campaign
  if (a.utm_content) payload.utm_content = a.utm_content
  if (a.utm_term) payload.utm_term = a.utm_term
  if (a.partner) payload.partner = a.partner
  if (a.landing_variant) payload.landing_variant = a.landing_variant
  if (a.referrer) payload.referrer = a.referrer
  if (a.first_touch_at) payload.first_touch_at = a.first_touch_at

  if (typeof ctx.step === 'number') payload.step = ctx.step
  if (ctx.stepId) payload.step_id = ctx.stepId
  if (ctx.lane) payload.lane = ctx.lane
  if (ctx.eventId) payload.event_id = ctx.eventId

  return payload
}

/**
 * Field names that must never appear in an analytics payload. Exported so the
 * test suite can assert against the real list rather than a copy of it.
 */
export const ANALYTICS_FORBIDDEN_KEYS = [
  'salary_cad',
  'contractor_cad',
  'materials_cad',
  'work_description',
  'company_name',
  'full_name',
  'email',
  'phone',
  'cra_offsets',
  'prior_claim_issues',
  'cashRefund',
  'cash_refund',
  'federalCredit',
  'provincialCredit',
  'estimate',
  'reasons',
  'blockers',
  'gates',
  'economics',
  'missingEvidence',
] as const

// ─── Emission ──────────────────────────────────────────────────────────────

/**
 * Third-party pixels and conversion APIs stay OFF until consent handling and
 * production configuration are approved. Until then this pushes to a first-party
 * dataLayer only, which is inert unless the site owner wires a destination.
 *
 * This is the adapter seam. Do not add a network call here without the launch
 * gate in SRED_LAUNCH_GATES.md being signed off.
 */
export function emitSredEvent(
  event: SredAnalyticsEvent,
  ctx: AnalyticsContext = {}
): AnalyticsPayload {
  const payload = buildAnalyticsPayload(event, ctx)
  if (typeof window !== 'undefined') {
    const w = window as unknown as { dataLayer?: unknown[] }
    w.dataLayer = w.dataLayer ?? []
    w.dataLayer.push(payload)
  }
  return payload
}
