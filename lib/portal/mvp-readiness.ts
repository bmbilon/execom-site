import type {
  AnswerMap,
  QuestionDef,
  SectionDef,
} from './prototype-readiness'

// ════════════════════════════════════════════════════════════════════════════
// MVP Readiness — the software / platform counterpart to Prototype Readiness.
//
// Why this exists: the physical instrument scores shipping, materials, unit
// cost, and retail channel. Run a software marketplace through it and every
// one of those produces a false risk flag, the score lands mid-band, and the
// founder gets recommended a Prototype Blueprint, a product that does not
// exist for software. See the Ownly submission.
//
// Two failure modes this instrument is built to catch, because the physical
// one cannot see either:
//
//   1. Scope sprawl. Several revenue models stacked on one unbuilt product.
//      In physical goods, scope is bounded by tooling cost. In software it
//      is bounded by nothing, so it has to be asked about directly.
//   2. Unpriced data or regulatory dependency. Licensed data feeds and
//      provincially regulated activity decide whether the product is legal
//      in its current shape. That is a workstream, not a footnote.
// ════════════════════════════════════════════════════════════════════════════

export const MVP_SECTIONS: SectionDef[] = [
  {
    id: 'mvp_product',
    label: 'The product',
    blurb:
      'What you are building, in plain language. Write it the way you would explain it to a friend who does not work in tech.',
    questions: [
      {
        id: 'product_name',
        label: 'Working product name',
        helper: 'A temporary name is fine.',
        type: 'short_text',
        required: true,
      },
      {
        id: 'product_description',
        label: 'What is the product?',
        helper:
          'What does someone open it to do? Skip the technology, describe the job it does.',
        type: 'long_text',
        required: true,
        maxScore: 2,
      },
      {
        id: 'problem',
        label: 'What problem does it solve, and for whom?',
        helper: 'One specific person with one specific problem beats a category.',
        type: 'long_text',
        required: true,
        maxScore: 2,
      },
      {
        id: 'today_alternative',
        label: 'What do those people use today instead?',
        helper:
          '"Nothing" is almost never true. Spreadsheets, phone calls, and a competitor all count.',
        type: 'long_text',
        required: true,
        maxScore: 2,
      },
      {
        id: 'differentiation',
        label: 'What makes your version meaningfully different?',
        helper:
          'Adjectives like convenient, safe, and efficient are claims every competitor also makes. What can you do that they structurally cannot?',
        type: 'long_text',
        required: true,
        maxScore: 2,
      },
      {
        id: 'wedge',
        label:
          'If you could only ship one screen or flow, and everything else waited a year, which one would you ship?',
        helper:
          'This is the question that decides the budget. A single answer here is worth more than a long feature list.',
        type: 'long_text',
        required: true,
        maxScore: 3,
      },
      {
        id: 'scope_breadth',
        label:
          'How many distinct products or revenue models are in your current plan?',
        helper:
          'Count honestly. A marketplace that also sells ads and also runs a separate vertical is three.',
        type: 'select',
        required: true,
        options: [
          { value: 'one', label: 'One. I know exactly what it is.', weight: 6 },
          {
            value: 'one_plus_later',
            label: 'One now, others deliberately parked for later',
            weight: 5,
          },
          { value: 'two', label: 'Two, and I have not chosen between them', weight: -2 },
          {
            value: 'three_plus',
            label: 'Three or more, they all feel important',
            weight: -6,
          },
        ],
      },
    ],
  },

  {
    id: 'mvp_users',
    label: 'Users and who pays',
    blurb:
      'The person who uses it and the person who pays for it are often not the same. Both matter.',
    questions: [
      {
        id: 'user_type',
        label: 'Who is the primary user?',
        type: 'select',
        required: true,
        options: [
          { value: 'consumer', label: 'Consumers / general public', weight: 1 },
          { value: 'smb', label: 'Small businesses', weight: 3 },
          { value: 'enterprise', label: 'Larger companies / enterprise', weight: 2 },
          { value: 'professional', label: 'Licensed professionals in a trade', weight: 3 },
          { value: 'two_sided', label: 'Two-sided marketplace, both sides', weight: -1 },
          { value: 'internal', label: 'Internal tool for one organization', weight: 2 },
          { value: 'unsure_mixed', label: 'Not sure yet / several groups', weight: -4 },
        ],
      },
      {
        id: 'who_pays',
        label: 'Who actually pays?',
        type: 'select',
        required: true,
        options: [
          { value: 'end_user', label: 'The person using it', weight: 3 },
          { value: 'business_side', label: 'A business, on behalf of its users', weight: 3 },
          { value: 'commission', label: 'A cut of each transaction', weight: 1 },
          { value: 'advertisers', label: 'Advertisers or sponsors', weight: -2 },
          { value: 'unsure_pays', label: 'Not sure yet', weight: -5 },
        ],
      },
      {
        id: 'pricing_model',
        label: 'How would they pay?',
        type: 'select',
        required: true,
        options: [
          { value: 'subscription', label: 'Recurring subscription', weight: 3 },
          { value: 'per_transaction', label: 'Per transaction or per use', weight: 2 },
          { value: 'one_time', label: 'One-time purchase', weight: 1 },
          { value: 'freemium', label: 'Free tier, paid upgrade', weight: 0 },
          { value: 'ads', label: 'Free to users, funded by ads', weight: -2 },
          { value: 'unsure_model', label: 'Not sure yet', weight: -4 },
        ],
      },
      {
        id: 'price_point',
        label: 'What would you charge?',
        helper: 'Your best current guess, per month or per transaction.',
        type: 'currency',
      },
      {
        id: 'price_rationale',
        label: 'Where does that number come from?',
        helper:
          'A competitor’s pricing page, a conversation with a potential customer, or a cost calculation. "It felt right" is an honest answer, and useful to us.',
        type: 'long_text',
        maxScore: 2,
      },
      {
        id: 'shown_to_strangers',
        label: 'Have you shown this to people who do not know you personally?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_many', label: 'Yes, many people', weight: 6 },
          { value: 'yes_few', label: 'Yes, a handful', weight: 4 },
          { value: 'friends_family', label: 'Only friends and family', weight: -3 },
          { value: 'no_one', label: 'Not yet', weight: -5 },
        ],
      },
      {
        id: 'willingness_to_pay',
        label: 'Has anyone said they would pay for it?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_specific', label: 'Yes, and they named a price', weight: 7 },
          { value: 'yes_casual', label: 'Yes, in general terms', weight: 4 },
          { value: 'not_asked', label: 'I have not asked', weight: -4 },
          { value: 'no', label: 'I asked, and no', weight: -6 },
        ],
      },
    ],
  },

  {
    id: 'mvp_shape',
    label: 'How it works',
    blurb:
      'The technical shape of the thing. You do not need to know the answers in engineering terms.',
    questions: [
      {
        id: 'platforms',
        label: 'Where does it run?',
        type: 'multi_select',
        required: true,
        options: [
          { value: 'web', label: 'Web app in a browser', weight: 2 },
          { value: 'ios', label: 'iPhone app', weight: 0 },
          { value: 'android', label: 'Android app', weight: 0 },
          { value: 'desktop', label: 'Desktop application', weight: 0 },
          { value: 'api', label: 'An API other software calls', weight: 1 },
          { value: 'unsure_platform', label: 'Not sure yet', weight: -3 },
        ],
      },
      {
        id: 'core_flows',
        label: 'Walk through what a user does, start to finish.',
        helper: 'They open it, and then what? Three or four steps is plenty.',
        type: 'long_text',
        required: true,
        maxScore: 3,
      },
      {
        id: 'existing_assets',
        label: 'What exists today?',
        type: 'select',
        required: true,
        options: [
          { value: 'live_users', label: 'Something live with real users', weight: 8 },
          { value: 'working_code', label: 'Working code, not launched', weight: 6 },
          { value: 'clickable', label: 'A clickable prototype or mockups', weight: 4 },
          { value: 'designs', label: 'Designs or wireframes', weight: 2 },
          { value: 'written_only', label: 'Written notes and ideas', weight: 0 },
          { value: 'nothing', label: 'Nothing yet', weight: -2 },
        ],
      },
      {
        id: 'integrations',
        label: 'What other systems does it need to talk to?',
        helper: 'Select everything that applies. Each one is real work.',
        type: 'multi_select',
        options: [
          { value: 'payments', label: 'Payments', weight: 0 },
          { value: 'maps', label: 'Maps or location', weight: 0 },
          { value: 'licensed_data', label: 'A licensed industry data feed', weight: -3 },
          { value: 'gov_registry', label: 'A government registry or records system', weight: -3 },
          { value: 'calendar', label: 'Calendars or scheduling', weight: 0 },
          { value: 'crm_erp', label: 'A CRM or accounting system', weight: 0 },
          { value: 'ai_model', label: 'An AI or machine learning model', weight: 0 },
          { value: 'none_integrations', label: 'None that I know of', weight: 1 },
        ],
      },
      {
        id: 'data_origin',
        label: 'Where does the data in your product come from?',
        helper:
          'Users entering it, an existing database you have, a third party feed, or scraped from public sources.',
        type: 'long_text',
        maxScore: 2,
      },
    ],
  },

  {
    id: 'mvp_access',
    label: 'Data access and rules',
    blurb:
      'The questions that decide whether the product is possible in its current shape. Answering "not sure" here is fine and common.',
    questions: [
      {
        id: 'third_party_data',
        label:
          'Does the product depend on data you would need someone else’s permission to use?',
        helper:
          'Listing data, industry databases, another platform’s content. Licensing terms often decide the business model.',
        type: 'select',
        required: true,
        options: [
          { value: 'not_needed', label: 'No, all data is ours or user-entered', weight: 4 },
          {
            value: 'needed_secured',
            label: 'Yes, and we already have access or an agreement',
            weight: 5,
          },
          {
            value: 'needed_not_secured',
            label: 'Yes, and we do not have it yet',
            weight: -6,
          },
          { value: 'unsure_data', label: 'Not sure', weight: -4 },
        ],
      },
      {
        id: 'regulated_activity',
        label:
          'Does your product touch an activity that is licensed or regulated?',
        helper:
          'Real estate transactions, lending, insurance, health records, legal advice, and childcare are all regulated, usually provincially.',
        type: 'select',
        required: true,
        options: [
          { value: 'not_regulated', label: 'No', weight: 3 },
          {
            value: 'adjacent',
            label: 'We sit next to it but do not perform the regulated act',
            weight: 0,
          },
          {
            value: 'regulated_unresolved',
            label: 'Yes, and we have not worked out what that requires',
            weight: -6,
          },
          {
            value: 'regulated_resolved',
            label: 'Yes, and we have advice or a licence in place',
            weight: 3,
          },
          { value: 'unsure_regulated', label: 'Not sure', weight: -4 },
        ],
      },
      {
        id: 'personal_data',
        label: 'What personal information does it hold?',
        type: 'select',
        options: [
          { value: 'none_personal', label: 'None', weight: 2 },
          { value: 'basic_accounts', label: 'Names, emails, basic accounts', weight: 1 },
          { value: 'sensitive_personal', label: 'Addresses, ID, or personal circumstances', weight: -1 },
          { value: 'financial', label: 'Financial or payment details', weight: -2 },
          { value: 'health', label: 'Health information', weight: -3 },
        ],
      },
      {
        id: 'access_notes',
        label: 'Anything you already know about the rules in your space?',
        helper: 'Optional. Even a half-formed concern is useful here.',
        type: 'long_text',
      },
    ],
  },

  {
    id: 'mvp_traction',
    label: 'Evidence and distribution',
    blurb:
      'What exists outside your own conviction, and how the first hundred users would find you.',
    questions: [
      {
        id: 'users_today',
        label: 'Does anyone use it today?',
        type: 'select',
        required: true,
        options: [
          { value: 'paying', label: 'Yes, and some of them pay', weight: 10 },
          { value: 'active_free', label: 'Yes, actively, for free', weight: 6 },
          { value: 'pilot', label: 'A small pilot or test group', weight: 4 },
          { value: 'waitlist', label: 'A waitlist or signup list', weight: 2 },
          { value: 'none_users', label: 'Not yet', weight: -2 },
        ],
      },
      {
        id: 'competitors',
        label: 'Who else is doing something similar?',
        helper: 'Name them. "Nobody" reads as not having looked.',
        type: 'long_text',
        required: true,
        maxScore: 2,
      },
      {
        id: 'distribution',
        label: 'How would the first hundred users find you?',
        type: 'multi_select',
        required: true,
        options: [
          { value: 'existing_audience', label: 'An audience or list I already have', weight: 5 },
          { value: 'partnerships', label: 'Partnerships with organizations', weight: 3 },
          { value: 'direct_sales', label: 'Me selling directly', weight: 3 },
          { value: 'organic_search', label: 'Search and content', weight: 1 },
          { value: 'paid_ads', label: 'Paid advertising', weight: 0 },
          { value: 'app_store', label: 'App store discovery', weight: -1 },
          { value: 'unsure_distribution', label: 'Not sure yet', weight: -5 },
        ],
      },
    ],
  },

  {
    id: 'mvp_working_with_execom',
    label: 'Working with execom',
    blurb: 'What you want from us, and what is realistically available to spend.',
    questions: [
      {
        id: 'help_needed',
        label: 'What kind of help are you looking for right now?',
        type: 'select',
        required: true,
        options: [
          { value: 'scoping', label: 'Help deciding what to build first', weight: 5 },
          { value: 'investor_materials', label: 'Investor deck and materials', weight: 2 },
          { value: 'clickable_demo', label: 'A clickable demo to show people', weight: 3 },
          { value: 'marketing_site', label: 'A marketing site', weight: 1 },
          { value: 'mvp_build', label: 'Build the actual product', weight: 2 },
          { value: 'unsure_help', label: 'Not sure, I want advice', weight: 2 },
        ],
      },
      {
        id: 'budget',
        label: 'Approximate budget available in the next 90 days',
        helper: 'A range is fine. This decides what we can honestly recommend.',
        type: 'select',
        required: true,
        options: [
          { value: 'under_2500', label: 'Under $2,500', weight: -5 },
          { value: '2500_10000', label: '$2,500 to $10,000', weight: 0 },
          { value: '10000_25000', label: '$10,000 to $25,000', weight: 4 },
          { value: '25000_60000', label: '$25,000 to $60,000', weight: 7 },
          { value: '60000_plus', label: 'Over $60,000', weight: 8 },
          { value: 'unsure_budget', label: 'Not sure yet', weight: -5 },
        ],
      },
      {
        id: 'funding_status',
        label: 'Where is that money coming from?',
        type: 'select',
        options: [
          { value: 'revenue', label: 'Revenue from an existing business', weight: 4 },
          { value: 'personal', label: 'Personal funds', weight: 1 },
          { value: 'raised', label: 'Money already raised', weight: 5 },
          { value: 'raising', label: 'Still to be raised', weight: -4 },
          { value: 'grant', label: 'A grant or program', weight: 1 },
          { value: 'unsure_funding', label: 'Not sure yet', weight: -3 },
        ],
      },
      {
        id: 'decision_maker',
        label: 'Who decides whether to go ahead?',
        helper:
          'If someone else signs off, it saves everyone time to get them on the first call.',
        type: 'select',
        options: [
          { value: 'me_alone', label: 'Me', weight: 3 },
          { value: 'cofounder', label: 'Me and a co-founder', weight: 1 },
          { value: 'partner_spouse', label: 'Me and a spouse or partner', weight: 0 },
          { value: 'investor_board', label: 'An investor or board', weight: -1 },
          { value: 'unsure_decision', label: 'Not sure', weight: -3 },
        ],
      },
      {
        id: 'validation_first',
        label:
          'If we recommended validating demand before building, would you be open to that?',
        type: 'yes_no_unsure',
        required: true,
        maxScore: 6,
      },
      {
        id: 'licensing_intent',
        label: 'Do you want to build and run this, or license the idea to someone else?',
        type: 'select',
        options: [
          { value: 'build_run', label: 'Build and run it myself', weight: 2 },
          { value: 'license_out', label: 'License it to someone else to run', weight: 0 },
          { value: 'either', label: 'Either, whichever works', weight: -1 },
          { value: 'unsure_intent', label: 'Not sure', weight: -2 },
        ],
      },
    ],
  },
]

// ─── Result shape ──────────────────────────────────────────────────────────

export type MvpPath =
  | 'not_ready'
  | 'scoping_sprint'
  | 'investor_deck'
  | 'clickable_demo'
  | 'marketing_site'
  | 'mvp_build'

// Add-ons are recommended alongside the main path rather than instead of it.
// A regulated product with unsecured data still needs a scoping sprint; it
// also needs somebody to find out whether the thing is legal.
export type MvpAddOn = 'feasibility_memo'

export type MvpLeadType =
  | 'commercially_serious'
  | 'strong_build_candidate'
  | 'strong_demo_candidate'
  | 'strong_validation_candidate'
  | 'scope_sprawl'
  | 'blocked_on_access'
  | 'licensing_candidate'
  | 'underfunded'
  | 'fantasy_risk'
  | 'general_prospect'

export interface MvpScoreResult {
  score: number
  tier: 'high' | 'medium' | 'risky' | 'not_ready'
  recommendedPath: MvpPath
  addOns: MvpAddOn[]
  leadType: MvpLeadType
  signals: { positive: string[]; risks: string[] }
}

// ─── Scoring ───────────────────────────────────────────────────────────────

/**
 * Internal-only scoring for software and platform submissions. Same shape as
 * scoreAssessment for physical products, different weights and different
 * hard signals. Never shown to the founder.
 */
// An honest founder answering "not sure" to eight questions should not be
// punished eight times over. Negative weights accumulate in their own bucket
// and are clamped, so the score reflects the worst few problems rather than
// the raw count of them. Without this, a candid early-stage submission scores
// below a dishonest confident one.
const MAX_TOTAL_PENALTY = -30

// Credit is normalised against the most any submission could earn, so the
// top of the scale means "answered everything as well as it can be answered"
// rather than "tripped enough positive weights". Without this, every decent
// submission pins at 100 and the high band stops discriminating. Derived
// from MVP_SECTIONS, so it re-derives itself when a question changes.
const MAX_CREDIT = MVP_SECTIONS.reduce((total, section) => {
  for (const q of section.questions) {
    if (q.type === 'long_text') {
      total += Math.min(q.maxScore ?? 2, 3)
    } else if (q.type === 'yes_no_unsure') {
      total += q.maxScore ?? 0
    } else if (q.type === 'select') {
      total += Math.max(0, ...(q.options ?? []).map((o) => o.weight ?? 0))
    } else if (q.type === 'multi_select') {
      // Every positive option can be selected at once.
      total += (q.options ?? []).reduce(
        (sum, o) => sum + Math.max(0, o.weight ?? 0),
        0
      )
    }
  }
  return total
}, 0)

// Headroom above the neutral 50 baseline that perfect answers can earn.
const CREDIT_HEADROOM = 45

export function scoreMvpAssessment(answers: AnswerMap): MvpScoreResult {
  let credit = 0
  let penalty = 0
  const positive: string[] = []
  const risks: string[] = []
  const add = (delta: number) => {
    if (delta >= 0) credit += delta
    else penalty += delta
  }

  for (const section of MVP_SECTIONS) {
    for (const q of section.questions) {
      applyQuestion(q, answers[q.id], add, positive, risks)
    }
  }

  // ─── Hard signals ───────────────────────────────────────────────────────
  const scopeBreadth = answers['scope_breadth'] as string | undefined
  const wedge = answers['wedge'] as string | undefined
  const thirdPartyData = answers['third_party_data'] as string | undefined
  const regulated = answers['regulated_activity'] as string | undefined
  const budget = answers['budget'] as string | undefined
  const funding = answers['funding_status'] as string | undefined
  const validation = answers['validation_first'] as string | undefined
  const helpNeeded = answers['help_needed'] as string | undefined
  const shownStrangers = answers['shown_to_strangers'] as string | undefined
  const willPay = answers['willingness_to_pay'] as string | undefined
  const usersToday = answers['users_today'] as string | undefined
  const whoPays = answers['who_pays'] as string | undefined
  const userType = answers['user_type'] as string | undefined
  const distribution = (answers['distribution'] as string[] | undefined) ?? []
  const integrations = (answers['integrations'] as string[] | undefined) ?? []
  const licensingIntent = answers['licensing_intent'] as string | undefined
  const differentiation = answers['differentiation'] as string | undefined
  const competitors = answers['competitors'] as string | undefined
  const priceRationale = answers['price_rationale'] as string | undefined

  const isWellFunded = budget === '25000_60000' || budget === '60000_plus'
  const isFunded = isWellFunded || budget === '10000_25000'
  const isUnderfunded = budget === 'under_2500' || budget === 'unsure_budget'
  const fundingIsHypothetical =
    funding === 'raising' || funding === 'unsure_funding'

  const hasStrangerFeedback =
    shownStrangers === 'yes_many' || shownStrangers === 'yes_few'
  const hasWtp = willPay === 'yes_specific' || willPay === 'yes_casual'
  const hasRealUsers =
    usersToday === 'paying' || usersToday === 'active_free' || usersToday === 'pilot'
  const knowsWhoPays = !!whoPays && whoPays !== 'unsure_pays'
  const knowsUser = !!userType && userType !== 'unsure_mixed'
  const hasDistribution =
    distribution.length > 0 && !distribution.includes('unsure_distribution')
  const hasSubstance = (v: unknown, min = 40) =>
    typeof v === 'string' && v.trim().length >= min

  const hasWedge = hasSubstance(wedge, 30)
  const hasDifferentiation = hasSubstance(differentiation)
  const hasCompetitorAwareness = hasSubstance(competitors, 20)
  const hasPriceRationale = hasSubstance(priceRationale)

  // Scope. The physical instrument has no equivalent, because tooling cost
  // caps scope for a physical product. Nothing caps it for software.
  const isSprawling = scopeBreadth === 'three_plus' || scopeBreadth === 'two'
  if (scopeBreadth === 'three_plus') {
    risks.push('Three or more products in one plan, none chosen.')
  } else if (scopeBreadth === 'two') {
    risks.push('Two competing products, no decision between them.')
  } else if (scopeBreadth === 'one' || scopeBreadth === 'one_plus_later') {
    positive.push('Scope is narrowed to a single product.')
  }
  if (hasWedge) {
    positive.push('Can name the one flow that matters most.')
  } else {
    risks.push('Cannot name a single first flow to ship.')
    add(-3)
  }

  // Access and regulation. These gate feasibility, so they are weighted
  // heavily and drive the feasibility memo add-on.
  const dataBlocked =
    thirdPartyData === 'needed_not_secured' || thirdPartyData === 'unsure_data'
  const regulatoryOpen =
    regulated === 'regulated_unresolved' || regulated === 'unsure_regulated'
  if (thirdPartyData === 'needed_not_secured') {
    risks.push('Depends on licensed third-party data that is not secured.')
  }
  if (thirdPartyData === 'unsure_data') {
    risks.push('Unclear whether the product needs licensed third-party data.')
  }
  if (regulated === 'regulated_unresolved') {
    risks.push('Touches regulated activity with no advice in place.')
  }
  if (regulated === 'unsure_regulated') {
    risks.push('Unclear whether the product touches regulated activity.')
  }
  if (regulated === 'regulated_resolved') {
    positive.push('Regulatory position already worked out.')
  }
  if (
    integrations.includes('licensed_data') ||
    integrations.includes('gov_registry')
  ) {
    risks.push('Depends on an external data feed or registry.')
  }

  // Evidence.
  if (usersToday === 'paying') positive.push('Already has paying users.')
  else if (hasRealUsers) positive.push('Already has real users.')
  if (hasWtp) positive.push('Someone has already said they would pay.')
  if (hasStrangerFeedback) {
    positive.push('Has shown it to people outside friends and family.')
  } else {
    risks.push('No feedback from anyone outside friends or family.')
  }
  if (!hasWtp && !hasRealUsers) risks.push('Nobody has been asked to pay.')
  if (!knowsWhoPays) risks.push('Unclear who actually pays.')
  if (!knowsUser) risks.push('Primary user is undefined or several groups at once.')
  if (!hasDistribution) risks.push('No idea how the first users would arrive.')
  if (!hasDifferentiation) risks.push('Differentiation is a wish list, not a moat.')
  if (!hasCompetitorAwareness) risks.push('No named competitors.')
  if (!hasPriceRationale) risks.push('Price has no evidence behind it.')

  // Money.
  if (fundingIsHypothetical && isWellFunded) {
    risks.push('Budget is stated but the money is not in hand.')
    add(-3)
  }
  if (budget === 'unsure_budget') risks.push('No budget figure given.')
  if (validation === 'yes') positive.push('Open to validation before building.')
  if (validation === 'no') risks.push('Refuses validation, wants a build regardless.')

  const normalisedCredit =
    MAX_CREDIT > 0 ? (credit / MAX_CREDIT) * CREDIT_HEADROOM : 0
  const raw = 50 + normalisedCredit + Math.max(penalty, MAX_TOTAL_PENALTY)
  const score = Math.max(0, Math.min(100, Math.round(raw)))

  // ─── Tier and recommended path ──────────────────────────────────────────
  let tier: MvpScoreResult['tier']
  let recommendedPath: MvpPath

  if (score >= 75) {
    tier = 'high'
    recommendedPath = 'mvp_build'
  } else if (score >= 60) {
    tier = 'high'
    recommendedPath = 'clickable_demo'
  } else if (score >= 45) {
    tier = 'medium'
    recommendedPath = 'scoping_sprint'
  } else if (score >= 28) {
    tier = 'risky'
    recommendedPath = 'scoping_sprint'
  } else {
    tier = 'not_ready'
    recommendedPath = 'not_ready'
  }

  // A low score means "not ready to build", which is not the same as "not
  // worth a call". A founder who filled the form out properly and is willing
  // to validate is exactly who the scoping sprint is for, however little
  // evidence they have today. Reserve not_ready for submissions that are
  // also disengaged: empty, or unwilling to be advised.
  const substantiveAnswers = MVP_SECTIONS.flatMap((sec) =>
    sec.questions.filter(
      (q) => q.type === 'long_text' && hasSubstance(answers[q.id], 60)
    )
  ).length
  const isEngaged = validation !== 'no' && substantiveAnswers >= 3
  if (recommendedPath === 'not_ready' && isEngaged) {
    tier = 'risky'
    recommendedPath = 'scoping_sprint'
    positive.push('Filled the form out properly and is open to being advised.')
  }

  // Overrides, in priority order. Each one exists because a high score can
  // still sit on top of a problem that makes a build the wrong sale.

  // 1. Sprawl. Anything built before scope resolves gets rebuilt.
  if (isSprawling && recommendedPath !== 'not_ready') {
    recommendedPath = 'scoping_sprint'
    if (tier === 'high') tier = 'medium'
  }

  // 2. No demand evidence at all. A demo of an unwanted product is a
  //    prettier version of the same guess.
  if (
    !hasRealUsers &&
    !hasWtp &&
    !hasStrangerFeedback &&
    recommendedPath !== 'not_ready'
  ) {
    recommendedPath = 'scoping_sprint'
    if (tier === 'high') tier = 'medium'
  }

  // 3. Refusing validation caps the sale at a sprint regardless of score.
  if (validation === 'no' && recommendedPath === 'mvp_build') {
    recommendedPath = 'clickable_demo'
  }

  // 4. Budget reality. Never recommend a band the founder cannot reach.
  if (isUnderfunded && recommendedPath !== 'not_ready') {
    recommendedPath = 'scoping_sprint'
  }
  if (budget === '2500_10000' && recommendedPath === 'mvp_build') {
    recommendedPath = 'clickable_demo'
  }

  // 5. Investor materials are what they asked for, and they have enough
  //    substance to build them honestly.
  if (
    helpNeeded === 'investor_materials' &&
    !isSprawling &&
    (hasStrangerFeedback || hasWtp || hasRealUsers) &&
    recommendedPath === 'scoping_sprint'
  ) {
    recommendedPath = 'investor_deck'
  }

  // 6. Marketing site only makes sense once positioning is settled.
  if (
    helpNeeded === 'marketing_site' &&
    !isSprawling &&
    hasDifferentiation &&
    recommendedPath === 'scoping_sprint'
  ) {
    recommendedPath = 'marketing_site'
  }

  const addOns: MvpAddOn[] = []
  if (dataBlocked || regulatoryOpen) addOns.push('feasibility_memo')

  // ─── Lead type, priority-ordered ────────────────────────────────────────
  let leadType: MvpLeadType = 'general_prospect'

  if (validation === 'no' && !hasStrangerFeedback && !hasRealUsers) {
    leadType = 'fantasy_risk'
  } else if (isSprawling && (hasWedge || hasDifferentiation || score >= 45)) {
    // Engaged and capable, but pointed at four things at once. This is the
    // Ownly case: real instinct, no narrowing.
    leadType = 'scope_sprawl'
  } else if (
    (thirdPartyData === 'needed_not_secured' ||
      regulated === 'regulated_unresolved') &&
    score >= 40
  ) {
    leadType = 'blocked_on_access'
  } else if (
    isWellFunded &&
    !fundingIsHypothetical &&
    hasRealUsers &&
    knowsWhoPays &&
    hasDistribution &&
    score >= 70
  ) {
    leadType = 'strong_build_candidate'
  } else if (
    isFunded &&
    validation !== 'no' &&
    (hasWtp || hasRealUsers) &&
    knowsWhoPays
  ) {
    leadType = 'commercially_serious'
  } else if (licensingIntent === 'license_out') {
    leadType = 'licensing_candidate'
  } else if (
    helpNeeded === 'investor_materials' ||
    helpNeeded === 'clickable_demo'
  ) {
    leadType = 'strong_demo_candidate'
  } else if (
    !hasStrangerFeedback &&
    !hasWtp &&
    validation !== 'no' &&
    score >= 35
  ) {
    leadType = 'strong_validation_candidate'
  } else if (isUnderfunded) {
    leadType = 'underfunded'
  } else if (!hasStrangerFeedback && !hasDifferentiation && !knowsUser) {
    leadType = 'fantasy_risk'
  }

  return {
    score,
    tier,
    recommendedPath,
    addOns,
    leadType,
    signals: { positive, risks },
  }
}

// Shared per-question folding, kept out of the main function so the hard
// signals below it stay readable.
function applyQuestion(
  q: QuestionDef,
  v: unknown,
  add: (delta: number) => void,
  positive: string[],
  risks: string[]
) {
  if (q.type === 'long_text' && typeof v === 'string' && v.trim().length >= 60) {
    add(Math.min(q.maxScore ?? 2, 3))
  } else if (
    q.type === 'long_text' &&
    q.required &&
    (!v || (typeof v === 'string' && v.trim().length < 20))
  ) {
    risks.push(`Thin or missing answer: ${q.label}`)
    add(-2)
  }

  if (q.type === 'select' && typeof v === 'string') {
    const opt = q.options?.find((o) => o.value === v)
    if (opt?.weight) {
      add(opt.weight)
      if (opt.weight >= 4) positive.push(`${q.label}: ${opt.label}`)
      if (opt.weight <= -3) risks.push(`${q.label}: ${opt.label}`)
    }
  }

  if (q.type === 'multi_select' && Array.isArray(v)) {
    for (const vv of v as string[]) {
      const opt = q.options?.find((o) => o.value === vv)
      if (opt?.weight) {
        add(opt.weight)
        if (opt.weight >= 4) positive.push(`${q.label}: ${opt.label}`)
        if (opt.weight <= -3) risks.push(`${q.label}: ${opt.label}`)
      }
    }
  }

  if (q.type === 'yes_no_unsure') {
    const max = q.maxScore ?? 0
    if (v === 'yes') add(max)
    else if (v === 'no') add(-Math.round(max / 2))
    else if (v === 'unsure') add(-1)
  }

  // Skipping a required question must cost at least what the worst available
  // answer costs. Otherwise a blank form outscores an honest one, because
  // silence dodges every negative weight.
  const unanswered =
    v === undefined ||
    v === null ||
    v === '' ||
    (Array.isArray(v) && v.length === 0)
  if (q.required && unanswered && q.type !== 'long_text') {
    const worst = Math.min(0, ...(q.options ?? []).map((o) => o.weight ?? 0))
    add(worst < 0 ? worst : -3)
    risks.push(`Unanswered: ${q.label}`)
  }
}

// ─── Labels ────────────────────────────────────────────────────────────────

export const MVP_PATH_LABELS: Record<MvpPath, string> = {
  not_ready: 'Not yet ready, nurture',
  scoping_sprint: 'Scoping & Validation Sprint',
  investor_deck: 'Investor Deck',
  clickable_demo: 'Clickable Demo',
  marketing_site: 'Marketing Site',
  mvp_build: 'MVP Build',
}

// Placeholder bands taken from the Ownly call brief. Overwrite with the real
// execom rate card before this instrument goes live to founders.
export const MVP_PATH_PRICE_RANGES: Record<MvpPath, string> = {
  not_ready: 'n/a',
  scoping_sprint: '$1,500–$3,000',
  investor_deck: '$3,500–$6,000',
  clickable_demo: '$5,000–$9,000',
  marketing_site: '$4,000–$8,000',
  mvp_build: '$25,000–$60,000+',
}

export const MVP_ADD_ON_LABELS: Record<MvpAddOn, string> = {
  feasibility_memo: 'Data & regulatory feasibility memo',
}

export const MVP_ADD_ON_PRICE_RANGES: Record<MvpAddOn, string> = {
  feasibility_memo: '$1,500–$2,500',
}

export const MVP_TIER_LABELS: Record<MvpScoreResult['tier'], string> = {
  high: 'High-value lead',
  medium: 'Worth a conversation',
  risky: 'Risky, needs scoping',
  not_ready: 'Not ready',
}

export const MVP_LEAD_TYPE_LABELS: Record<MvpLeadType, string> = {
  commercially_serious: 'Commercially serious',
  strong_build_candidate: 'Strong build candidate',
  strong_demo_candidate: 'Wants demo / investor materials',
  strong_validation_candidate: 'Strong validation candidate',
  scope_sprawl: 'Capable, but scope is sprawling',
  blocked_on_access: 'Blocked on data or regulation',
  licensing_candidate: 'Wants to license, not build',
  underfunded: 'Underfunded / early idea',
  fantasy_risk: 'Fantasy risk',
  general_prospect: 'General prospect',
}

export const MVP_LEAD_TYPE_TONE: Record<
  MvpLeadType,
  'good' | 'neutral' | 'caution' | 'bad'
> = {
  commercially_serious: 'good',
  strong_build_candidate: 'good',
  strong_demo_candidate: 'good',
  strong_validation_candidate: 'good',
  scope_sprawl: 'caution',
  blocked_on_access: 'caution',
  licensing_candidate: 'neutral',
  underfunded: 'caution',
  general_prospect: 'neutral',
  fantasy_risk: 'bad',
}
