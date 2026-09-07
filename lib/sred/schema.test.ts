import { describe, expect, it } from 'vitest'
import {
  assessRequestSchema,
  assessmentInputSchema,
  isoDateSchema,
  leadRequestSchema,
  staffTransitionSchema,
  LEAD_TRANSITIONS,
} from './schema'

const VALID_ANSWERS = {
  company_name: 'Northfield Systems Inc.',
  corporation: 'ccpc',
  province: 'AB',
  claim_stage: 'not_filed',
  fiscal_year_end: '2025-06-30',
  work_category: 'software',
  work_description:
    'We could not hold p99 latency under 40ms while re-sharding live, and no published approach fit.',
  research: 'yes',
  systematic: 'yes',
  salary_cad: 600_000,
  contractor_cad: 0,
  materials_cad: 0,
  assistance_cad: 0,
  experimental_share: '75-100',
  evidence: ['payroll_records'],
  claim_history: 'none',
  preapproval: 'no',
  preference: 'unsure',
}

const VALID_LEAD = {
  answers: VALID_ANSWERS,
  contact: { full_name: 'Dana Reyes', email: 'dana@northfield.ca' },
  requested: 'preparation',
  service_consent: true,
  request_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
}

describe('date validation', () => {
  it('rejects a date that does not exist', () => {
    expect(isoDateSchema.safeParse('2025-02-31').success).toBe(false)
    expect(isoDateSchema.safeParse('2025-13-01').success).toBe(false)
  })

  it('rejects a loose format', () => {
    expect(isoDateSchema.safeParse('2025-6-3').success).toBe(false)
    expect(isoDateSchema.safeParse('June 30 2025').success).toBe(false)
  })

  it('rejects a year outside the supported range', () => {
    expect(isoDateSchema.safeParse('1999-06-30').success).toBe(false)
  })

  it('accepts a real date', () => {
    expect(isoDateSchema.safeParse('2025-06-30').success).toBe(true)
  })
})

describe('assessment answers', () => {
  it('accepts a complete set', () => {
    expect(assessmentInputSchema.safeParse(VALID_ANSWERS).success).toBe(true)
  })

  it('rejects a missing required answer', () => {
    const { corporation, ...rest } = VALID_ANSWERS
    void corporation
    expect(assessmentInputSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects an unknown enum value', () => {
    expect(
      assessmentInputSchema.safeParse({ ...VALID_ANSWERS, province: 'CA' }).success
    ).toBe(false)
    expect(
      assessmentInputSchema.safeParse({ ...VALID_ANSWERS, claim_stage: 'maybe' }).success
    ).toBe(false)
  })

  it('rejects negative, infinite and absurd money', () => {
    expect(assessmentInputSchema.safeParse({ ...VALID_ANSWERS, salary_cad: -1 }).success).toBe(false)
    expect(
      assessmentInputSchema.safeParse({ ...VALID_ANSWERS, salary_cad: Number.POSITIVE_INFINITY })
        .success
    ).toBe(false)
    expect(
      assessmentInputSchema.safeParse({ ...VALID_ANSWERS, salary_cad: 999_999_999 }).success
    ).toBe(false)
    expect(assessmentInputSchema.safeParse({ ...VALID_ANSWERS, salary_cad: '600000' }).success).toBe(
      false
    )
  })

  it('rejects a technical description too thin to screen', () => {
    expect(
      assessmentInputSchema.safeParse({ ...VALID_ANSWERS, work_description: 'we did stuff' }).success
    ).toBe(false)
  })
})

describe('server recalculation is not negotiable', () => {
  it('rejects a client that posts its own lane', () => {
    const res = assessRequestSchema.safeParse({
      answers: { ...VALID_ANSWERS, lane: 'purchase_review' },
    })
    expect(res.success).toBe(false)
  })

  it('rejects a client that posts its own estimate', () => {
    expect(
      assessRequestSchema.safeParse({
        answers: VALID_ANSWERS,
        estimate: { low: 999_999, high: 999_999 },
      }).success
    ).toBe(false)
  })

  it('rejects a client that tries to smuggle in a staff flag', () => {
    expect(
      leadRequestSchema.safeParse({ ...VALID_LEAD, is_execom_staff: true }).success
    ).toBe(false)
    expect(
      leadRequestSchema.safeParse({
        ...VALID_LEAD,
        contact: { ...VALID_LEAD.contact, is_execom_staff: true },
      }).success
    ).toBe(false)
  })

  it('rejects a client that tries to set its own status or priority', () => {
    expect(leadRequestSchema.safeParse({ ...VALID_LEAD, status: 'closed' }).success).toBe(false)
    expect(leadRequestSchema.safeParse({ ...VALID_LEAD, priority: 100 }).success).toBe(false)
  })
})

describe('lead submission', () => {
  it('accepts a complete request', () => {
    expect(leadRequestSchema.safeParse(VALID_LEAD).success).toBe(true)
  })

  it('defaults marketing consent to false and never infers it', () => {
    const parsed = leadRequestSchema.parse(VALID_LEAD)
    expect(parsed.marketing_consent).toBe(false)
  })

  it('keeps marketing consent independent of service consent', () => {
    const parsed = leadRequestSchema.parse({ ...VALID_LEAD, marketing_consent: true })
    expect(parsed.marketing_consent).toBe(true)
    expect(parsed.service_consent).toBe(true)
  })

  it('refuses a submission without explicit service consent', () => {
    expect(leadRequestSchema.safeParse({ ...VALID_LEAD, service_consent: false }).success).toBe(
      false
    )
    const { service_consent, ...withoutConsent } = VALID_LEAD
    void service_consent
    expect(leadRequestSchema.safeParse(withoutConsent).success).toBe(false)
  })

  it('requires an idempotency key shaped like a uuid', () => {
    expect(leadRequestSchema.safeParse({ ...VALID_LEAD, request_id: 'abc' }).success).toBe(false)
    const { request_id, ...withoutId } = VALID_LEAD
    void request_id
    expect(leadRequestSchema.safeParse(withoutId).success).toBe(false)
  })

  it('rejects a bad email', () => {
    expect(
      leadRequestSchema.safeParse({
        ...VALID_LEAD,
        contact: { full_name: 'Dana Reyes', email: 'dana@' },
      }).success
    ).toBe(false)
  })

  it('lowercases the email so duplicates collapse', () => {
    const parsed = leadRequestSchema.parse({
      ...VALID_LEAD,
      contact: { full_name: 'Dana Reyes', email: 'Dana@Northfield.CA' },
    })
    expect(parsed.contact.email).toBe('dana@northfield.ca')
  })

  it('rejects a filled honeypot', () => {
    expect(
      leadRequestSchema.safeParse({ ...VALID_LEAD, company_website: 'http://spam.example' }).success
    ).toBe(false)
  })
})

describe('reviewer state machine', () => {
  it('has no approved or funded state anywhere', () => {
    const all = Object.entries(LEAD_TRANSITIONS).flatMap(([from, to]) => [from, ...to])
    expect(all.some((s) => /approved|funded|paid/i.test(s))).toBe(false)
  })

  it('is terminal at closed', () => {
    expect(LEAD_TRANSITIONS.closed).toEqual([])
  })

  it('requires a note and the row version the reviewer was looking at', () => {
    const good = {
      lead_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      to_status: 'triaged',
      note: 'Records look complete, moving to triage.',
      expected_version: 1,
    }
    expect(staffTransitionSchema.safeParse(good).success).toBe(true)
    expect(staffTransitionSchema.safeParse({ ...good, note: 'ok' }).success).toBe(false)
    const { expected_version, ...noVersion } = good
    void expected_version
    expect(staffTransitionSchema.safeParse(noVersion).success).toBe(false)
  })
})
