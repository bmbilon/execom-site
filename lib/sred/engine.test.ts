import { describe, expect, it } from 'vitest'
import { assess, evidenceLevel, purchaseEconomics, type Lane } from './engine'
import { getPurchasePolicy, type PurchasePolicy } from './config'
import { addMonths, sredReportingDeadline } from './rates'
import { assessmentInputSchema, type AssessmentInput } from './schema'

const TODAY = '2026-01-15'

/**
 * A file that clears every purchase gate. Individual tests bend one answer at a
 * time so a failure names the exact rule that moved.
 */
function baseAnswers(overrides: Partial<AssessmentInput> = {}): AssessmentInput {
  return assessmentInputSchema.parse({
    company_name: 'Northfield Systems Inc.',
    corporation: 'ccpc',
    province: 'AB',
    claim_stage: 'assessed',
    fiscal_year_end: '2025-06-30',
    reported_refund_cad: 200_000,
    work_category: 'software',
    work_description:
      'We could not hold p99 latency under 40ms while re-sharding live, and no published approach covered our write pattern.',
    research: 'yes',
    systematic: 'yes',
    salary_cad: 600_000,
    contractor_cad: 100_000,
    materials_cad: 0,
    assistance_cad: 0,
    experimental_share: '75-100',
    evidence: ['payroll_records', 'project_records', 'time_tracking', 'contracts_invoices'],
    claim_history: 'two_clean',
    preapproval: 'no',
    preference: 'cash',
    debt: 'no',
    security: 'no',
    timing: '30',
    ...overrides,
  })
}

function laneOf(overrides: Partial<AssessmentInput>, policy?: Partial<PurchasePolicy>): Lane {
  const p = { ...getPurchasePolicy(), ...policy }
  return assess(baseAnswers(overrides), p, TODAY).publicResult.lane
}

describe('deadline arithmetic', () => {
  it('clamps to month end rather than overflowing', () => {
    expect(addMonths('2025-08-31', 18)).toBe('2027-02-28')
    expect(addMonths('2024-08-31', 18)).toBe('2026-02-28')
  })

  it('puts the SR&ED reporting deadline 18 months after year end', () => {
    expect(sredReportingDeadline('2025-06-30')).toBe('2026-12-30')
  })
})

describe('evidence level', () => {
  it('needs all four core records to read as strong', () => {
    expect(evidenceLevel([])).toBe('none')
    expect(evidenceLevel(['payroll_records'])).toBe('partial')
    expect(evidenceLevel(['payroll_records', 'project_records', 'time_tracking'])).toBe('partial')
    expect(
      evidenceLevel([
        'payroll_records',
        'project_records',
        'time_tracking',
        'contracts_invoices',
      ])
    ).toBe('strong')
  })
})

describe('lane routing', () => {
  it('routes a clean filed file that clears every gate to purchase_review', () => {
    expect(laneOf({})).toBe('purchase_review')
  })

  it('routes an unfiled but supportable claim to preparation_offer', () => {
    expect(
      laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, fiscal_year_end: '2025-06-30' })
    ).toBe('preparation_offer')
  })

  it('routes an uncertain technical story to technical_review, not to a sales lane', () => {
    expect(laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, research: 'unsure' })).toBe(
      'technical_review'
    )
    expect(laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, systematic: 'unsure' })).toBe(
      'technical_review'
    )
    expect(laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, evidence: [] })).toBe(
      'technical_review'
    )
    expect(
      laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, corporation: 'other' })
    ).toBe('technical_review')
  })

  it('routes work with no technological uncertainty to not_ready', () => {
    expect(laneOf({ claim_stage: 'not_filed', reported_refund_cad: undefined, research: 'no' })).toBe(
      'not_ready'
    )
  })

  it('routes an expired unfiled period to not_ready', () => {
    expect(
      laneOf({
        claim_stage: 'not_filed',
        reported_refund_cad: undefined,
        fiscal_year_end: '2023-01-31',
      })
    ).toBe('not_ready')
  })

  it('routes a tax year that has not closed to not_ready', () => {
    expect(
      laneOf({
        claim_stage: 'not_filed',
        reported_refund_cad: undefined,
        fiscal_year_end: '2027-01-31',
      })
    ).toBe('not_ready')
  })

  it('never turns a technically weak claim into a preparation lead', () => {
    const weak = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined, research: 'no' }),
      getPurchasePolicy(),
      TODAY
    )
    expect(weak.publicResult.lane).toBe('not_ready')
    expect(weak.publicResult.preparationAvailable).toBe(false)
  })

  it('never auto-enrols an already-filed claim into preparation', () => {
    // Filed, but the applicant would rather keep it: still an existing-claim
    // review, never a preparation offer.
    const filed = assess(baseAnswers({ preference: 'service' }), getPurchasePolicy(), TODAY)
    expect(filed.publicResult.lane).toBe('already_filed_review')
    expect(filed.publicResult.preparationAvailable).toBe(false)
  })
})

describe('purchase gates open and close', () => {
  it('closes the purchase lane when the programme is switched off', () => {
    expect(laneOf({}, { programOpen: false })).toBe('already_filed_review')
  })

  it('closes the purchase lane below the reported-cash floor', () => {
    expect(laneOf({ reported_refund_cad: 30_000 })).toBe('already_filed_review')
  })

  it('opens the purchase lane exactly at the advertised floor', () => {
    expect(laneOf({ reported_refund_cad: 50_000 })).toBe('purchase_review')
  })

  it('closes the purchase lane above the reported-cash ceiling', () => {
    expect(laneOf({ reported_refund_cad: 900_000 })).toBe('already_filed_review')
  })

  it('reopens the purchase lane when the band is widened by configuration', () => {
    expect(laneOf({ reported_refund_cad: 900_000 }, { maxExpectedCashCad: 1_000_000 })).toBe(
      'purchase_review'
    )
  })

  it('closes the purchase lane on unresolved tax debt or competing security', () => {
    expect(laneOf({ debt: 'yes' })).toBe('already_filed_review')
    expect(laneOf({ debt: 'unsure' })).toBe('already_filed_review')
    expect(laneOf({ security: 'yes' })).toBe('already_filed_review')
  })

  it('closes the purchase lane on a long collection window', () => {
    expect(laneOf({ timing: '120' })).toBe('already_filed_review')
    expect(laneOf({ timing: 'unsure' })).toBe('already_filed_review')
  })

  it('closes the purchase lane on thin records or a thin claim history', () => {
    expect(laneOf({ evidence: ['payroll_records'] })).toBe('already_filed_review')
    expect(laneOf({ claim_history: 'issues' })).toBe('already_filed_review')
    expect(laneOf({ claim_history: 'one' })).toBe('already_filed_review')
  })

  it('accepts a single prior claim once the policy stops requiring two', () => {
    expect(laneOf({ claim_history: 'one' }, { requirePriorClaimsClean: false })).toBe(
      'purchase_review'
    )
  })

  it('requires a filed claim while the pilot says so, and not after', () => {
    expect(laneOf({ claim_stage: 'not_filed' })).toBe('preparation_offer')
  })
})

describe('underwriting screen', () => {
  it('asks the three collectability questions only when nothing else blocks', () => {
    const r = assess(
      baseAnswers({ debt: undefined, security: undefined, timing: undefined }),
      getPurchasePolicy(),
      TODAY
    )
    expect(r.publicResult.needsUnderwritingScreen).toBe(true)
    // Unanswered gates hold the purchase lane closed until they are answered.
    expect(r.publicResult.lane).toBe('already_filed_review')
  })

  it('does not ask them when the file already fails on something else', () => {
    const r = assess(
      baseAnswers({
        debt: undefined,
        security: undefined,
        timing: undefined,
        claim_history: 'issues',
      }),
      getPurchasePolicy(),
      TODAY
    )
    expect(r.publicResult.needsUnderwritingScreen).toBe(false)
  })

  it('does not ask an unfiled applicant about collection at all', () => {
    const r = assess(
      baseAnswers({
        claim_stage: 'not_filed',
        reported_refund_cad: undefined,
        debt: undefined,
        security: undefined,
        timing: undefined,
      }),
      getPurchasePolicy(),
      TODAY
    )
    expect(r.publicResult.needsUnderwritingScreen).toBe(false)
  })
})

describe('purchase economics', () => {
  const policy = getPurchasePolicy()

  it('reproduces the documented Discounting Act figures at $200,000', () => {
    const e = purchaseEconomics(200_000, policy)
    expect(e.paymentCad).toBe(189_970)
    expect(e.grossDiscountCad).toBe(10_030)
  })

  it('clears the floor in base and stress on a healthy file', () => {
    const e = purchaseEconomics(200_000, policy)
    expect(e.baseContributionCad).toBeGreaterThan(policy.minBaseContributionCad)
    expect(e.stressContributionCad).toBeGreaterThanOrEqual(policy.minStressContributionCad)
    expect(e.clearsFloor).toBe(true)
  })

  it('lets the advertised floor actually clear, which is the whole point of it', () => {
    // The advertised band floor and the economics gate must agree. If the page
    // says $50,000 is the minimum, a $50,000 file has to survive underwriting
    // rather than being advertised and then declined on contribution.
    const e = purchaseEconomics(policy.minExpectedCashCad, policy)
    expect(policy.minExpectedCashCad).toBe(50_000)
    expect(e.paymentCad).toBe(47_470)
    expect(e.baseContributionCad).toBeCloseTo(644.75, 2)
    expect(e.clearsFloor).toBe(true)
  })

  it('leaves only thin margin at the floor, which is a deliberate pilot choice', () => {
    // $1,050 of fixed review and acquisition cost dominates a small file. This
    // is pinned so nobody mistakes the floor for a comfortable one.
    const e = purchaseEconomics(50_000, policy)
    expect(e.baseContributionCad).toBeLessThan(1_000)
    expect(e.stressContributionCad).toBeGreaterThanOrEqual(0)
    expect(e.stressContributionCad).toBeLessThan(100)
  })

  it('scales sensibly across the band', () => {
    const at50 = purchaseEconomics(50_000, policy)
    const at150 = purchaseEconomics(150_000, policy)
    const at300 = purchaseEconomics(300_000, policy)
    expect(at150.baseContributionCad).toBeGreaterThan(at50.baseContributionCad)
    expect(at300.baseContributionCad).toBeGreaterThan(at150.baseContributionCad)
    for (const e of [at50, at150, at300]) expect(e.clearsFloor).toBe(true)
  })

  it('declines a file below the advertised floor', () => {
    // Not because the economics fail, but because the band says so. Both gates
    // exist and neither is redundant.
    const e = purchaseEconomics(30_000, policy)
    expect(e.clearsFloor).toBe(false)
  })

  it('fails the floor when the contribution threshold is raised', () => {
    const e = purchaseEconomics(200_000, { ...policy, minBaseContributionCad: 50_000 })
    expect(e.clearsFloor).toBe(false)
  })

  it('closes the purchase lane when the economics fail', () => {
    expect(laneOf({}, { minBaseContributionCad: 50_000 })).toBe('already_filed_review')
  })
})

describe('estimate', () => {
  it('uses the applicant-reported figure for a filed claim and says so', () => {
    const r = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    expect(r.publicResult.estimate).toEqual({
      low: 200_000,
      high: 200_000,
      kind: 'applicant_reported',
      verified: false,
    })
    expect(r.publicResult.assumptions.join(' ')).toContain('not an independent CRA verification')
  })

  it('models a range for an unfiled CCPC claim', () => {
    const r = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined }),
      getPurchasePolicy(),
      TODAY
    )
    const e = r.publicResult.estimate
    expect(e?.kind).toBe('modelled')
    expect(e!.low).toBeGreaterThan(0)
    expect(e!.high).toBeGreaterThanOrEqual(e!.low)
  })

  it('produces no modelled estimate outside a CCPC', () => {
    const r = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined, corporation: 'other' }),
      getPurchasePolicy(),
      TODAY
    )
    expect(r.publicResult.estimate).toBeNull()
  })

  it('reduces the estimate when government assistance was received', () => {
    const without = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined }),
      getPurchasePolicy(),
      TODAY
    ).publicResult.estimate!
    const withAssistance = assess(
      baseAnswers({
        claim_stage: 'not_filed',
        reported_refund_cad: undefined,
        assistance_cad: 200_000,
      }),
      getPurchasePolicy(),
      TODAY
    ).publicResult.estimate!
    expect(withAssistance.high).toBeLessThan(without.high)
  })

  it('shrinks the low end when the records are thin', () => {
    const strong = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined }),
      getPurchasePolicy(),
      TODAY
    ).publicResult.estimate!
    const thin = assess(
      baseAnswers({
        claim_stage: 'not_filed',
        reported_refund_cad: undefined,
        evidence: ['payroll_records', 'project_records'],
      }),
      getPurchasePolicy(),
      TODAY
    ).publicResult.estimate!
    expect(thin.low).toBeLessThan(strong.low)
  })

  it('discloses every assumption behind a modelled number', () => {
    const r = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined }),
      getPurchasePolicy(),
      TODAY
    )
    const text = r.publicResult.assumptions.join(' ')
    expect(text).toContain('35%')
    expect(text).toContain('proxy')
    expect(text).toContain('assistance')
    expect(text).toContain('not automatically cash')
  })

  it('never claims pre-claim approval approves an amount', () => {
    const r = assess(baseAnswers({ preapproval: 'yes' }), getPurchasePolicy(), TODAY)
    expect(r.publicResult.assumptions.join(' ')).toContain('does not approve an expenditure amount')
  })
})

describe('public and internal separation', () => {
  it('keeps gates, blockers and economics out of the applicant payload', () => {
    const { publicResult } = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    const serialized = JSON.stringify(publicResult)
    expect(serialized).not.toContain('economics')
    expect(serialized).not.toContain('purchaseBlockers')
    expect(serialized).not.toContain('gates')
    expect(serialized).not.toContain('Contribution')
    expect(Object.keys(publicResult)).not.toContain('internal')
  })

  it('never issues an offer or marks anything verified', () => {
    const { publicResult } = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    expect(publicResult.offerIssued).toBe(false)
    expect(publicResult.estimate?.verified).toBe(false)
  })

  it('stamps the policy version onto every result', () => {
    const { publicResult } = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    expect(publicResult.policyVersion).toMatch(/^\d{4}\.\d{2}\.\d{2}/)
  })

  it('is deterministic: the same answers give the same result', () => {
    const a = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    const b = assess(baseAnswers(), getPurchasePolicy(), TODAY)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('reviewer triage', () => {
  it('sorts purchase candidates above everything else', () => {
    const purchase = assess(baseAnswers(), getPurchasePolicy(), TODAY).internal.priority
    const prep = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined }),
      getPurchasePolicy(),
      TODAY
    ).internal.priority
    const notReady = assess(
      baseAnswers({ claim_stage: 'not_filed', reported_refund_cad: undefined, research: 'no' }),
      getPurchasePolicy(),
      TODAY
    ).internal.priority
    expect(purchase).toBeGreaterThan(prep)
    expect(prep).toBeGreaterThan(notReady)
  })

  it('records why a purchase was blocked', () => {
    const r = assess(baseAnswers({ debt: 'yes' }), getPurchasePolicy(), TODAY)
    expect(r.internal.purchaseBlockers.join(' ')).toContain('Tax balances')
    expect(r.internal.purchaseCandidate).toBe(false)
  })
})
