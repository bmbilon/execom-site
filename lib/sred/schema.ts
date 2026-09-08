// ════════════════════════════════════════════════════════════════════════════
// SR&ED assessor — request validation
//
// Every public endpoint validates against these schemas before any logic runs.
// The objects are STRICT on purpose: a client that posts its own `lane`,
// `estimate`, `economics` or `is_execom_staff` gets a 400, not a silently
// ignored field. All routing and all money math is recomputed server-side from
// the answers alone.
// ════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

export const CLAIM_STAGES = ['not_filed', 'filed', 'assessed', 'unsure'] as const
export const CORPORATION_TYPES = ['ccpc', 'other', 'unsure'] as const
export const WORK_CATEGORIES = [
  'software',
  'hardware_electronics',
  'manufacturing_process',
  'materials_chemistry',
  'life_sciences',
  'other',
] as const
export const TRISTATE = ['yes', 'no', 'unsure'] as const
export const EVIDENCE_ITEMS = [
  'payroll_records',
  'project_records',
  'time_tracking',
  'contracts_invoices',
] as const
export const EXPERIMENTAL_SHARES = ['25-50', '50-75', '75-100'] as const
export const CLAIM_HISTORY = ['two_clean', 'one', 'none', 'issues', 'unsure'] as const
export const COLLECTION_WINDOWS = ['30', '60', '120', 'unsure'] as const
export const ROUTE_PREFERENCE = ['cash', 'service', 'unsure'] as const
export const PROVINCE_CODES = [
  'AB', 'BC', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'NL', 'YT', 'PE', 'NT', 'NU',
] as const

const MAX_SPEND = 20_000_000

const moneyField = z
  .number()
  .refine((n) => Number.isFinite(n), 'Enter a number')
  .min(0, 'Cannot be negative')
  .max(MAX_SPEND, 'That figure is outside the range this estimate handles')

/** Strict YYYY-MM-DD that must round-trip, so 2025-02-31 is rejected. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a YYYY-MM-DD fiscal year end')
  .refine((s) => {
    const d = new Date(s + 'T12:00:00Z')
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
  }, 'Not a real date')
  .refine((s) => {
    const y = Number(s.slice(0, 4))
    return y >= 2015 && y <= new Date().getUTCFullYear() + 2
  }, 'Fiscal year end is outside the supported range')

export const assessmentInputSchema = z.strictObject({
  // ── Company ──
  company_name: z.string().trim().min(2, 'Company name is required').max(160),
  corporation: z.enum(CORPORATION_TYPES),
  province: z.enum(PROVINCE_CODES),

  // ── The claim ──
  claim_stage: z.enum(CLAIM_STAGES),
  fiscal_year_end: isoDateSchema,
  /** Applicant-reported expected net SR&ED cash. Only meaningful once filed. */
  reported_refund_cad: moneyField.optional(),

  /**
   * Field of work. One tap, and it routes a lead to the right reviewer.
   *
   * There is deliberately no free-text "describe the technological uncertainty"
   * field here. It was the highest-friction control on the form, and it asked a
   * founder to self-assess the exact question execom's subject-matter review
   * exists to answer. Intake registers the company and sizes the opportunity;
   * eligibility is judged internally, from documents, later.
   */
  work_category: z.enum(WORK_CATEGORIES),

  // ── Money ──
  salary_cad: moneyField,
  contractor_cad: moneyField,
  materials_cad: moneyField,
  assistance_cad: moneyField,
  experimental_share: z.enum(EXPERIMENTAL_SHARES),

  // ── Records and history ──
  evidence: z.array(z.enum(EVIDENCE_ITEMS)).max(EVIDENCE_ITEMS.length).default([]),
  claim_history: z.enum(CLAIM_HISTORY),
  preference: z.enum(ROUTE_PREFERENCE),

  // ── Underwriting screen. Only asked when the file otherwise clears. ──
  /** Unresolved CRA offsets, tax debt or collection issues. */
  debt: z.enum(TRISTATE).optional(),
  /** Existing assignment, pledge or competing security over the refund. */
  security: z.enum(TRISTATE).optional(),
  /** Expected days to collection. */
  timing: z.enum(COLLECTION_WINDOWS).optional(),
})

export type AssessmentInput = z.infer<typeof assessmentInputSchema>

/**
 * First-party attribution. Deliberately narrow: campaign identifiers and an
 * off-site referrer. Nothing from the assessment itself is ever carried here.
 */
export const attributionSchema = z.strictObject({
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(160).optional(),
  utm_content: z.string().trim().max(160).optional(),
  utm_term: z.string().trim().max(160).optional(),
  partner: z.string().trim().max(80).optional(),
  landing_variant: z.string().trim().max(60).optional(),
  referrer: z.string().trim().max(500).optional(),
  first_touch_at: z.string().max(40).optional(),
})

export type Attribution = z.infer<typeof attributionSchema>

export const assessRequestSchema = z.strictObject({
  answers: assessmentInputSchema,
  attribution: attributionSchema.optional(),
  /** Anonymous, tab-scoped draft id. Not a credential and never a user id. */
  draft_id: z.string().trim().min(8).max(64).optional(),
})

export const REVIEW_REQUESTS = [
  'purchase_review',
  'preparation',
  'technical_review',
  'existing_claim_review',
  'next_steps',
] as const

const UUID_V4ISH = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const contactSchema = z.strictObject({
  full_name: z.string().trim().min(2, 'Your name is required').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid business email').max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  role: z.string().trim().max(120).optional().or(z.literal('')),
})

export const leadRequestSchema = z.strictObject({
  answers: assessmentInputSchema,
  contact: contactSchema,
  requested: z.enum(REVIEW_REQUESTS),
  /**
   * Consent to be contacted about THIS assessment. Required, and separate from
   * marketing consent below. Submitting the form is not treated as consent on
   * its own — the applicant ticks this.
   */
  service_consent: z.literal(true, {
    message: 'Confirm we may contact you about this assessment',
  }),
  /**
   * Future marketing. Defaults to false, never pre-checked in the UI, and never
   * inferred from service consent.
   */
  marketing_consent: z.boolean().default(false),
  attribution: attributionSchema.optional(),
  draft_id: z.string().trim().min(8).max(64).optional(),
  /** Idempotency key so a retried submit on a flaky mobile connection is safe. */
  request_id: z.string().regex(UUID_V4ISH, 'Invalid request id'),
  /** Honeypot. Real users never fill this; bots do. Must be absent or empty. */
  company_website: z.string().max(0).optional(),
})

export type LeadRequest = z.infer<typeof leadRequestSchema>

/**
 * Reviewer-desk state machine. Deliberately has NO approved or funded state:
 * financial execution is out of scope for this build.
 */
export const LEAD_STATUSES = [
  'new',
  'triaged',
  'awaiting_documents',
  'specialist_review',
  'purchase_underwriting',
  'preparation_offered',
  'closed',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['triaged', 'closed'],
  triaged: [
    'awaiting_documents',
    'specialist_review',
    'purchase_underwriting',
    'preparation_offered',
    'closed',
  ],
  awaiting_documents: ['specialist_review', 'purchase_underwriting', 'closed'],
  specialist_review: [
    'awaiting_documents',
    'preparation_offered',
    'purchase_underwriting',
    'closed',
  ],
  purchase_underwriting: ['awaiting_documents', 'specialist_review', 'closed'],
  preparation_offered: ['awaiting_documents', 'closed'],
  closed: [],
}

export const staffTransitionSchema = z.strictObject({
  lead_id: z.string().uuid(),
  to_status: z.enum(LEAD_STATUSES),
  /** A reviewer must say why. Audited alongside the transition. */
  note: z.string().trim().min(5, 'Say why in a sentence').max(1000),
  /** Optimistic concurrency — the row version the reviewer was looking at. */
  expected_version: z.number().int().min(1),
})
