import { describe, expect, it } from 'vitest'
import {
  ANALYTICS_FORBIDDEN_KEYS,
  SRED_ANALYTICS_EVENTS,
  buildAnalyticsPayload,
  captureAttribution,
} from './attribution'

const CAMPAIGN =
  '?utm_source=linkedin&utm_medium=paid_social&utm_campaign=sred_q3&utm_content=carousel_a&utm_term=sred%20refund&v=b'

describe('attribution capture', () => {
  it('reads every campaign parameter the acquisition spec names', () => {
    const a = captureAttribution(CAMPAIGN, undefined, new Date('2026-09-07T12:00:00Z'))
    expect(a.utm_source).toBe('linkedin')
    expect(a.utm_medium).toBe('paid_social')
    expect(a.utm_campaign).toBe('sred_q3')
    expect(a.utm_content).toBe('carousel_a')
    expect(a.utm_term).toBe('sred refund')
    expect(a.landing_variant).toBe('b')
    expect(a.first_touch_at).toBe('2026-09-07T12:00:00.000Z')
  })

  it('keeps an off-site referrer and drops a same-site one', () => {
    expect(captureAttribution('', 'https://www.linkedin.com/feed/').referrer).toBe(
      'https://www.linkedin.com/feed/'
    )
    expect(captureAttribution('', 'https://execom.ca/about').referrer).toBeUndefined()
    expect(captureAttribution('', 'http://localhost:3000/sred').referrer).toBeUndefined()
  })

  it('truncates hostile parameter lengths rather than storing them', () => {
    const long = 'x'.repeat(5000)
    const a = captureAttribution(`?utm_campaign=${long}`)
    expect(a.utm_campaign!.length).toBeLessThanOrEqual(160)
  })

  it('returns an empty-but-stamped record for direct traffic', () => {
    const a = captureAttribution('')
    expect(a.utm_source).toBeUndefined()
    expect(a.first_touch_at).toBeTruthy()
  })
})

describe('analytics payload privacy', () => {
  const attribution = captureAttribution(CAMPAIGN)

  it('carries campaign identifiers and the funnel stage, and nothing else', () => {
    const payload = buildAnalyticsPayload('sred_preliminary_result_viewed', {
      attribution,
      lane: 'purchase_review',
      step: 5,
      stepId: 'records',
      eventId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })
    expect(payload).toEqual({
      event: 'sred_preliminary_result_viewed',
      utm_source: 'linkedin',
      utm_medium: 'paid_social',
      utm_campaign: 'sred_q3',
      utm_content: 'carousel_a',
      utm_term: 'sred refund',
      landing_variant: 'b',
      first_touch_at: attribution.first_touch_at,
      step: 5,
      step_id: 'records',
      lane: 'purchase_review',
      event_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    })
  })

  it('is an allowlist: a caller cannot leak a field by passing it in', () => {
    const payload = buildAnalyticsPayload('sred_review_requested', {
      attribution,
      // Everything below is deliberately hostile input.
      ...({
        salary_cad: 600_000,
        work_description: 'confidential technical narrative',
        email: 'dana@northfield.ca',
        estimate: { low: 100_000, high: 200_000 },
        economics: { baseContributionCad: 5_637 },
      } as never),
    })
    const serialized = JSON.stringify(payload)
    for (const forbidden of ANALYTICS_FORBIDDEN_KEYS) {
      expect(serialized).not.toContain(forbidden)
    }
    expect(serialized).not.toContain('600000')
    expect(serialized).not.toContain('northfield')
  })

  it('never carries a refund figure, a payroll number or a decline reason', () => {
    for (const event of SRED_ANALYTICS_EVENTS) {
      const payload = buildAnalyticsPayload(event, {
        attribution,
        lane: 'not_ready',
      })
      const keys = Object.keys(payload)
      for (const forbidden of ANALYTICS_FORBIDDEN_KEYS) {
        expect(keys).not.toContain(forbidden)
      }
    }
  })

  it('covers exactly the event set the acquisition spec requires', () => {
    expect([...SRED_ANALYTICS_EVENTS].sort()).toEqual(
      [
        'sred_assessment_started',
        'sred_assessment_step_completed',
        'sred_existing_client_login',
        'sred_landing_view',
        'sred_preliminary_result_viewed',
        'sred_preparation_interest',
        'sred_purchase_review_candidate',
        'sred_review_requested',
      ].sort()
    )
  })
})
