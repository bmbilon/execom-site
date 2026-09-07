// ════════════════════════════════════════════════════════════════════════════
// SR&ED acquisition funnel — persistence
//
// Everything here is server-only and talks to the database exclusively through
// the SECURITY DEFINER functions in migration 019. The public assessor never
// gets a direct table grant, so a bug in a route handler cannot turn into an
// arbitrary write.
//
// Persistence is best-effort by design: if Supabase is not configured (a fresh
// clone with no .env.local, for instance) the applicant still gets their
// result. A funnel that 500s because a lead could not be filed is worse than a
// funnel that files the lead a minute later.
// ════════════════════════════════════════════════════════════════════════════

import { createHash, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import type { AssessmentInput, Attribution, LeadRequest } from './schema'
import type { InternalResult, Lane, PublicResult } from './engine'
import { SRED_CONSENT_VERSION } from './config'

if (typeof window !== 'undefined') {
  throw new Error('lib/sred/store.ts is server-only.')
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

/** Stable key ordering so the same answers always hash the same way. */
function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
}

export function fingerprint(value: unknown): string {
  return createHash('sha256').update(canonical(value)).digest('hex')
}

/**
 * 64 hex characters, which is exactly what the intake function's length check
 * expects, and which never carries a raw IP into the database.
 */
export function rateKey(scope: string, client: string, windowMs = 120_000): string {
  const bucket = Math.floor(Date.now() / windowMs)
  const salt = process.env.SRED_RATE_SALT ?? 'sred-rate'
  return createHash('sha256').update(`${salt}:${scope}:${client}:${bucket}`).digest('hex')
}

export function newRequestId(): string {
  return randomUUID()
}

export interface PersistLeadArgs {
  requestId: string
  answers: AssessmentInput
  publicResult: PublicResult
  internal: InternalResult
  contact: LeadRequest['contact']
  requested: LeadRequest['requested']
  serviceConsent: true
  marketingConsent: boolean
  attribution: Attribution
  clientKey: string
  priority: number
  lane: Lane
}

export type PersistOutcome =
  | { persisted: true; leadId: string }
  | { persisted: false; reason: 'not_configured' | 'rate_limited' | 'conflict' | 'error'; detail?: string }

export async function persistLead(args: PersistLeadArgs): Promise<PersistOutcome> {
  if (!isSupabaseConfigured()) {
    return { persisted: false, reason: 'not_configured' }
  }

  const lead = {
    company_name: args.answers.company_name,
    contact_name: args.contact.full_name,
    contact_email: args.contact.email,
    fiscal_year_end: args.answers.fiscal_year_end,
    claim_stage: args.answers.claim_stage,
    province: args.answers.province,
    lane: args.lane,
    priority: args.priority,
    answers: args.answers,
    result: args.publicResult,
    internal: args.internal,
    attribution: args.attribution,
    contact: args.contact,
    service_consent: args.serviceConsent,
    marketing_consent: args.marketingConsent,
    consent_version: SRED_CONSENT_VERSION,
    requested: args.requested,
    policy_version: args.publicResult.policyVersion,
  }

  try {
    const { data, error } = await serviceClient().rpc('sred_lead_intake', {
      p_request_id: args.requestId,
      p_fingerprint: fingerprint({ answers: args.answers, contact: args.contact }),
      p_rate_key: rateKey('lead', args.clientKey),
      p_lead: lead,
    })

    if (error) {
      const message = error.message ?? ''
      if (message.includes('RATE_LIMIT')) return { persisted: false, reason: 'rate_limited' }
      if (message.includes('IDEMPOTENCY_CONFLICT')) return { persisted: false, reason: 'conflict' }
      return { persisted: false, reason: 'error', detail: message }
    }
    return { persisted: true, leadId: data as string }
  } catch (e) {
    return {
      persisted: false,
      reason: 'error',
      detail: e instanceof Error ? e.message : 'unknown',
    }
  }
}

export interface TransitionArgs {
  leadId: string
  expectedVersion: number
  toStatus: string
  actorId: string
  note: string
}

export type TransitionOutcome =
  | { ok: true; version: number }
  | { ok: false; reason: string }

export async function transitionLead(args: TransitionArgs): Promise<TransitionOutcome> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not_configured' }

  const { data, error } = await serviceClient().rpc('sred_lead_transition', {
    p_lead_id: args.leadId,
    p_expected_version: args.expectedVersion,
    p_to: args.toStatus,
    p_actor: args.actorId,
    p_note: args.note,
  })

  if (error) return { ok: false, reason: error.message ?? 'error' }
  return { ok: true, version: data as number }
}
