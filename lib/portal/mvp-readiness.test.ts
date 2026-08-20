import { describe, it, expect } from 'vitest'
import { scoreMvpAssessment, MVP_SECTIONS } from '@/lib/portal/mvp-readiness'
import { resolveTrack, getSections, scoreForTrack } from '@/lib/portal/readiness-track'
import type { AnswerMap } from '@/lib/portal/prototype-readiness'

// A founder who has done the work: narrowed scope, real users, money in hand,
// no external data dependency.
const strong: AnswerMap = {
  build_type: 'software',
  product_name: 'Shiftboard',
  product_description:
    'A scheduling tool for independent trades contractors who currently run their week out of text messages and a paper calendar.',
  problem:
    'Contractors double-book themselves and lose a day of billable work every time it happens. They know it, and they hate it.',
  today_alternative:
    'Text messages, a paper day planner, and occasionally a shared Google Calendar that nobody else updates.',
  differentiation:
    'We write back to the customer automatically when a job moves, which is the part every competitor leaves to the contractor to do manually.',
  wedge:
    'The single reschedule screen: move a job, and every affected customer is notified without the contractor typing anything.',
  scope_breadth: 'one',
  user_type: 'smb',
  who_pays: 'end_user',
  pricing_model: 'subscription',
  price_point: 49,
  price_rationale:
    'Jobber charges $69 a month for a much bigger product, and four contractors told us they would pay under fifty.',
  shown_to_strangers: 'yes_many',
  willingness_to_pay: 'yes_specific',
  platforms: ['web', 'ios'],
  core_flows:
    'Contractor logs in, sees the week, drags a job to a new day, customers get a text, contractor confirms.',
  existing_assets: 'working_code',
  integrations: ['payments', 'calendar'],
  data_origin: 'Everything is entered by the contractor or their customers. No external feeds.',
  third_party_data: 'not_needed',
  regulated_activity: 'not_regulated',
  personal_data: 'basic_accounts',
  users_today: 'paying',
  competitors: 'Jobber, ServiceTitan, and a lot of paper.',
  distribution: ['existing_audience', 'direct_sales'],
  help_needed: 'mvp_build',
  budget: '25000_60000',
  funding_status: 'revenue',
  decision_maker: 'me_alone',
  validation_first: 'yes',
  licensing_intent: 'build_run',
}

// The Ownly shape: engaged, articulate, four products at once, no validation,
// no budget, and a licensed-data plus provincial-regulation dependency that
// has not been priced.
const sprawling: AnswerMap = {
  build_type: 'software',
  product_name: 'Ownly',
  product_description:
    'A platform where buyers can find homes, see a full record of the property, and make an offer without the usual friction.',
  problem:
    'Buying a home is opaque and buyers do not have access to the information they need to make a decision.',
  today_alternative: 'Realtor.ca and calling an agent.',
  differentiation: 'Access, privacy, safety, convenience and efficiency for the buyer.',
  wedge: '',
  scope_breadth: 'three_plus',
  user_type: 'unsure_mixed',
  who_pays: 'unsure_pays',
  pricing_model: 'per_transaction',
  price_point: 40,
  price_rationale: 'It felt about right.',
  shown_to_strangers: 'no_one',
  willingness_to_pay: 'not_asked',
  platforms: ['web'],
  core_flows: 'Buyer searches, opens a property passport, makes an offer.',
  existing_assets: 'written_only',
  integrations: ['licensed_data', 'maps'],
  data_origin: 'Listing data from the MLS, plus records we would gather per property.',
  third_party_data: 'needed_not_secured',
  regulated_activity: 'regulated_unresolved',
  personal_data: 'sensitive_personal',
  users_today: 'none_users',
  competitors: 'Realtor.ca, Zolo.',
  distribution: ['unsure_distribution'],
  help_needed: 'investor_materials',
  budget: 'unsure_budget',
  funding_status: 'unsure_funding',
  decision_maker: 'unsure_decision',
  validation_first: 'yes',
  licensing_intent: 'either',
}

describe('track resolution', () => {
  it('routes software to the MVP instrument', () => {
    expect(resolveTrack({ build_type: 'software' })).toBe('software')
    expect(getSections('software')[1].id).toBe('mvp_product')
  })

  it('routes physical, hardware-with-software, and unanswered to physical', () => {
    expect(resolveTrack({ build_type: 'physical' })).toBe('physical')
    expect(resolveTrack({ build_type: 'physical_with_software' })).toBe('physical')
    expect(resolveTrack({})).toBe('physical')
  })

  it('never asks a software founder a shipping question', () => {
    const ids = getSections('software').flatMap((s) => s.questions.map((q) => q.id))
    for (const physicalOnly of [
      'packaging_state',
      'shipping_method',
      'unit_cost',
      'materials',
      'channels',
    ]) {
      expect(ids).not.toContain(physicalOnly)
    }
  })

  it('discriminates the score union by track', () => {
    const scored = scoreForTrack(sprawling)
    expect(scored.track).toBe('software')
    if (scored.track === 'software') {
      expect(Array.isArray(scored.result.addOns)).toBe(true)
    }
  })
})

describe('scoreMvpAssessment', () => {
  it('rates a narrowed, validated, funded founder as a build candidate', () => {
    const r = scoreMvpAssessment(strong)
    expect(r.score).toBeGreaterThanOrEqual(70)
    expect(r.recommendedPath).toBe('mvp_build')
    expect(r.leadType).toBe('strong_build_candidate')
    expect(r.addOns).toHaveLength(0)
  })

  it('sends a sprawling submission to scoping, not to a build', () => {
    const r = scoreMvpAssessment(sprawling)
    expect(r.recommendedPath).toBe('scoping_sprint')
    expect(r.leadType).toBe('scope_sprawl')
    expect(r.tier).not.toBe('high')
  })

  it('recommends the feasibility memo when data or regulation is unresolved', () => {
    expect(scoreMvpAssessment(sprawling).addOns).toContain('feasibility_memo')
    expect(
      scoreMvpAssessment({ ...strong, third_party_data: 'needed_not_secured' }).addOns
    ).toContain('feasibility_memo')
    expect(
      scoreMvpAssessment({ ...strong, regulated_activity: 'unsure_regulated' }).addOns
    ).toContain('feasibility_memo')
  })

  it('names the sprawl and the access problem in the risk list', () => {
    const risks = scoreMvpAssessment(sprawling).signals.risks.join(' | ')
    expect(risks).toMatch(/three or more products/i)
    expect(risks).toMatch(/cannot name a single first flow/i)
    expect(risks).toMatch(/licensed third-party data/i)
    expect(risks).toMatch(/regulated activity/i)
    expect(risks).toMatch(/nobody has been asked to pay/i)
  })

  it('never recommends a band the founder cannot reach', () => {
    const broke = scoreMvpAssessment({ ...strong, budget: 'under_2500' })
    expect(broke.recommendedPath).toBe('scoping_sprint')

    const thin = scoreMvpAssessment({ ...strong, budget: '2500_10000' })
    expect(thin.recommendedPath).not.toBe('mvp_build')
  })

  it('caps a build sale when the founder refuses validation', () => {
    const r = scoreMvpAssessment({ ...strong, validation_first: 'no' })
    expect(r.recommendedPath).not.toBe('mvp_build')
  })

  it('will not build on zero demand evidence, however good the rest looks', () => {
    const r = scoreMvpAssessment({
      ...strong,
      users_today: 'none_users',
      willingness_to_pay: 'not_asked',
      shown_to_strangers: 'no_one',
    })
    expect(r.recommendedPath).toBe('scoping_sprint')
  })

  it('routes a narrowed founder who wants investor materials to the deck', () => {
    const r = scoreMvpAssessment({
      ...strong,
      help_needed: 'investor_materials',
      budget: '2500_10000',
      users_today: 'pilot',
      existing_assets: 'clickable',
      funding_status: 'personal',
    })
    expect(['investor_deck', 'clickable_demo']).toContain(r.recommendedPath)
  })

  it('clamps to 0-100 for empty and for maximal input', () => {
    expect(scoreMvpAssessment({}).score).toBeGreaterThanOrEqual(0)
    expect(scoreMvpAssessment({}).score).toBeLessThanOrEqual(100)
    expect(scoreMvpAssessment(strong).score).toBeLessThanOrEqual(100)
  })

  it('has no duplicate question ids across sections', () => {
    const ids = MVP_SECTIONS.flatMap((s) => s.questions.map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every select option a label and value', () => {
    for (const s of MVP_SECTIONS) {
      for (const q of s.questions) {
        if (q.options) {
          for (const o of q.options) {
            expect(o.value).toBeTruthy()
            expect(o.label).toBeTruthy()
          }
        }
      }
    }
  })
})

// Calibration guards. These pin the three reference points the instrument was
// tuned against, so a future weight change cannot quietly re-break the thing
// this track exists to fix.
describe('calibration', () => {
  it('an empty form scores below a real but unvalidated submission', () => {
    expect(scoreMvpAssessment({}).score).toBeLessThan(
      scoreMvpAssessment(sprawling).score
    )
  })

  it('an empty form is the only one of the three that reads not ready', () => {
    expect(scoreMvpAssessment({}).recommendedPath).toBe('not_ready')
    expect(scoreMvpAssessment(sprawling).recommendedPath).not.toBe('not_ready')
    expect(scoreMvpAssessment(strong).recommendedPath).not.toBe('not_ready')
  })

  it('does not pin a good submission at the ceiling', () => {
    // If a strong fixture hits 100 the top band has stopped discriminating.
    expect(scoreMvpAssessment(strong).score).toBeLessThan(100)
    expect(scoreMvpAssessment(strong).score).toBeGreaterThanOrEqual(75)
  })

  it('does not punish honesty more than eight ways at once', () => {
    // Answering "not sure" everywhere is a bad submission, not a zero.
    const allUnsure = scoreMvpAssessment({
      ...sprawling,
      user_type: 'unsure_mixed',
      who_pays: 'unsure_pays',
      pricing_model: 'unsure_model',
      third_party_data: 'unsure_data',
      regulated_activity: 'unsure_regulated',
      budget: 'unsure_budget',
      funding_status: 'unsure_funding',
      decision_maker: 'unsure_decision',
      distribution: ['unsure_distribution'],
      platforms: ['unsure_platform'],
    })
    expect(allUnsure.score).toBeGreaterThan(0)
  })
})
