// ════════════════════════════════════════════════════════════════════════════
// Prototype Readiness Assessment — question catalog + internal scoring rubric
//
// The founder fills a 6-step wizard. Each answer key in the JSONB column maps
// to a `QuestionDef.id` below. Scoring runs internally on submit (and can be
// re-run by staff); the founder never sees the score, tier, or lead type.
//
// Audience: armchair inventors, first-time product founders, tradespeople,
// and non-technical business owners. Language is intentionally plain — no
// startup/product jargon (no "hero mode," "ICP," "GTM," "buyer mindset").
//
// Scoring philosophy:
//   • The strongest positive signals are (a) prior stranger feedback,
//     (b) someone actually offering to pay, (c) a specific buyer and
//     channel, (d) realistic price logic, and (e) openness to validation
//     before tooling.
//   • The strongest negative signals are "everyone," "all of the above,"
//     no price rationale, no stranger feedback, no budget, and a
//     prototype-only attitude when the demand side is still hypothetical.
// ════════════════════════════════════════════════════════════════════════════

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'select'
  | 'multi_select'
  | 'currency'
  | 'number'
  | 'yes_no'
  | 'yes_no_unsure'

export interface QuestionOption {
  value: string
  label: string
  // Internal weight. Positive = signal of readiness, negative = risk.
  // Only ever used server-side; never shipped to the founder.
  weight?: number
  // Optional optgroup label for `select` questions. Options that share the
  // same `group` value (and appear contiguously in the list) render under
  // one <optgroup>; options without a `group` render outside any group.
  group?: string
}

export interface QuestionDef {
  id: string
  label: string
  helper?: string
  type: QuestionType
  options?: QuestionOption[]
  required?: boolean
  placeholder?: string
  // Per-question max contribution to the total score (positive = on the
  // path to "ready", negative = subtracts).
  maxScore?: number
}

export interface SectionDef {
  id: string
  label: string
  blurb: string
  questions: QuestionDef[]
}

// ─── Sections ──────────────────────────────────────────────────────────────

export const SECTIONS: SectionDef[] = [
  {
    id: 'product',
    label: 'The product',
    blurb:
      'A few simple questions about what you are actually building. Plain language is fine.',
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
          'Describe it like you were explaining it to someone at a backyard BBQ, job site, store counter, or family dinner.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'value_proposition',
        label: 'Why would someone want this?',
        helper:
          'Examples: it saves space, makes something easier, replaces several products, makes an activity more fun, solves an annoying problem, looks better, costs less, or creates a better experience.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'comparison',
        label: 'What would someone compare this to?',
        helper:
          'List the products, tools, games, services, or workarounds people use today.',
        type: 'long_text',
        required: true,
        maxScore: 4,
      },
      {
        id: 'differentiation',
        label: 'What makes your version meaningfully different?',
        helper:
          'Avoid general answers like "better" or "more fun." What is actually different?',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'clarity_trap',
        label:
          'If you had to remove everything except the most important use case, what would remain?',
        helper:
          'This helps us understand what the product is really about.',
        type: 'long_text',
        required: true,
        maxScore: 4,
      },
    ],
  },

  {
    id: 'buyer',
    label: 'The buyer',
    blurb:
      'Who is most likely to actually pay for this, what have they told you, and what do you think they would pay?',
    questions: [
      {
        id: 'category',
        label: 'Expected buyer type',
        helper: 'Who do you think is most likely to actually pay for this first?',
        type: 'select',
        required: true,
        options: [
          // ── General consumers (and subcategories) ────────────────
          { value: 'consumer_home',           label: 'Home / household',                  group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_outdoor',        label: 'Outdoor / backyard / patio',        group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_entertainment',  label: 'Games / entertainment',             group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_sports',         label: 'Sports / recreation',               group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_baby_kids',      label: 'Kids / family',                     group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_apparel',        label: 'Clothing / wearable',               group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_beauty',         label: 'Beauty / wellness',                 group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_electronics',    label: 'Electronics / gadgets',             group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_food_kitchen',   label: 'Food / kitchen',                    group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_pet',            label: 'Pet product',                       group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_travel_camping', label: 'Travel / camping',                  group: 'General consumers / shoppers', weight: 1 },
          { value: 'consumer_other',          label: 'Other consumer product',            group: 'General consumers / shoppers' },
          // ── Businesses ──────────────────────────────────────────
          { value: 'b2b_small',          label: 'Small businesses',                  group: 'Businesses', weight: 1 },
          { value: 'b2b_retail',         label: 'Retail stores',                     group: 'Businesses', weight: 1 },
          { value: 'b2b_hospitality',    label: 'Restaurants / bars / venues',       group: 'Businesses', weight: 1 },
          { value: 'b2b_service',        label: 'Service businesses',                group: 'Businesses', weight: 1 },
          { value: 'b2b_enterprise',     label: 'Corporate / enterprise buyers',     group: 'Businesses', weight: 1 },
          { value: 'b2b_distributor',    label: 'Distributors / wholesalers',        group: 'Businesses', weight: 1 },
          { value: 'b2b_other',          label: 'Other business buyer',              group: 'Businesses' },
          // ── Institutions ────────────────────────────────────────
          { value: 'inst_education',     label: 'Schools / education',               group: 'Institutions', weight: 1 },
          { value: 'inst_healthcare',    label: 'Healthcare organizations',          group: 'Institutions', weight: 1 },
          { value: 'inst_government',    label: 'Government',                        group: 'Institutions', weight: 1 },
          { value: 'inst_nonprofit',     label: 'Non-profit / community organizations', group: 'Institutions', weight: 1 },
          { value: 'inst_recreation',    label: 'Recreation centres / municipalities', group: 'Institutions', weight: 1 },
          { value: 'inst_other',         label: 'Other institution',                 group: 'Institutions' },
          // ── Mixed ────────────────────────────────────────────────
          { value: 'unsure_mixed', label: 'Not sure yet / could be many of the above', weight: -3 },
        ],
        maxScore: 3,
      },
      {
        id: 'shown_to_strangers',
        label: 'Have you shown this to people who do not know you personally?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_many',     label: 'Yes, many people',  weight: 6 },
          { value: 'yes_few',      label: 'Yes, a few people', weight: 4 },
          { value: 'friends_only', label: 'Only friends / family', weight: 0 },
          { value: 'not_yet',      label: 'Not yet',           weight: -3 },
        ],
        maxScore: 6,
      },
      {
        id: 'willingness_to_pay',
        label: 'Has anyone said they would pay for it?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes_specific', label: 'Yes, and they gave a specific price', weight: 8 },
          { value: 'yes_casual',   label: 'Yes, but casually',                  weight: 5 },
          { value: 'not_yet',      label: 'Not yet',                            weight: -2 },
          { value: 'not_asked',    label: 'I have not asked',                   weight: -3 },
        ],
        maxScore: 8,
      },
      {
        id: 'price_guess',
        label: 'What price do you think people would pay?',
        helper: 'Your best guess is fine. We are looking for assumptions, not perfection.',
        type: 'currency',
        required: true,
      },
      {
        id: 'price_rationale',
        label: 'What makes you believe that price is realistic?',
        helper:
          'Examples: similar products, retailer pricing, customer comments, manufacturing cost, your own experience.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
    ],
  },

  {
    id: 'how_it_works',
    label: 'How it works',
    blurb:
      'A picture of how the product is built — parts, materials, size, and storage.',
    questions: [
      {
        id: 'physical_mechanism',
        label: 'How does it physically work?',
        helper:
          'Explain the moving parts, attachments, folding, locking, clips, magnets, bolts, hinges, stands, straps, or any other mechanism.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'custom_parts',
        label: 'What parts would need to be custom-made?',
        helper: 'List anything that cannot be bought off the shelf.',
        type: 'long_text',
        maxScore: 3,
      },
      {
        id: 'off_the_shelf_parts',
        label: 'What parts could be bought off the shelf?',
        helper:
          'Examples: poles, fasteners, wheels, handles, bags, straps, electronics, motors, fabric, packaging.',
        type: 'long_text',
        maxScore: 3,
      },
      {
        id: 'materials',
        label: 'What materials do you imagine using?',
        helper:
          'Examples: plastic, aluminum, steel, wood, fabric, rubber, silicone, foam, glass, electronics.',
        type: 'long_text',
        maxScore: 3,
      },
      {
        id: 'size_weight',
        label: 'How big and heavy do you think it should be?',
        helper: 'Think about carrying, shipping, storing, and retail display.',
        type: 'long_text',
        maxScore: 3,
      },
      {
        id: 'storage',
        label: 'How would someone store it when not in use?',
        helper: 'Closet, garage, car trunk, shed, retail shelf, warehouse, etc.',
        type: 'long_text',
      },
    ],
  },

  {
    id: 'packaging',
    label: 'Packaging & shipping',
    blurb:
      'How the finished product moves through the box, the truck, and onto the buyer’s shelf or doorstep.',
    questions: [
      {
        id: 'ship_method',
        label: 'How would this ship?',
        type: 'select',
        required: true,
        options: [
          { value: 'small_parcel',     label: 'Small parcel box',  weight: 3 },
          { value: 'large_parcel',     label: 'Large parcel box',  weight: 2 },
          { value: 'oversized_parcel', label: 'Oversized box',     weight: 0 },
          { value: 'freight',          label: 'Freight / pallet',  weight: -2 },
          { value: 'unsure',           label: 'Not sure',          weight: -2 },
        ],
        maxScore: 3,
      },
      {
        id: 'ships_flat',
        label: 'Does it need to come apart or fold flat?',
        type: 'yes_no_unsure',
        required: true,
        maxScore: 3,
      },
      {
        id: 'box_contents',
        label: 'What would be included in the box?',
        helper:
          'Main product, attachments, accessories, instructions, carrying case, spare parts, etc.',
        type: 'long_text',
        required: true,
        maxScore: 3,
      },
    ],
  },

  {
    id: 'where_people_buy',
    label: 'Where people buy',
    blurb:
      'How a buyer would actually come across this product and the path from "saw it" to "bought it."',
    questions: [
      {
        id: 'channels',
        label: 'Where do you imagine people buying this?',
        type: 'multi_select',
        required: true,
        options: [
          { value: 'amazon',         label: 'Amazon',                                       weight: 2 },
          { value: 'shopify_dtc',    label: 'Shopify / direct website',                     weight: 2 },
          { value: 'retail',         label: 'Retail stores',                                weight: 3 },
          { value: 'costco_clubs',   label: 'Costco / warehouse clubs',                     weight: 3 },
          { value: 'cdn_tire_outdoor', label: 'Canadian Tire / hardware / outdoor stores',  weight: 3 },
          { value: 'specialty',      label: 'Specialty stores',                             weight: 2 },
          { value: 'tradeshow',      label: 'Trade shows / events',                         weight: 1 },
          { value: 'distributor',    label: 'Distributor / wholesale',                      weight: 2 },
          { value: 'licensing',      label: 'Licensing to another company',                 weight: 2 },
          { value: 'unsure',         label: 'Not sure yet',                                 weight: -3 },
        ],
        maxScore: 6,
      },
      {
        id: 'channel_rationale',
        label: 'Why would that channel work?',
        helper:
          'For example: impulse buy, demo-friendly, giftable, solves a clear business problem, easy to ship, strong visuals, repeat purchases.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
    ],
  },

  {
    id: 'working_with_execom',
    label: 'Working with execom',
    blurb:
      'The kind of help you are looking for, what is realistic for budget right now, and how we can reach you.',
    questions: [
      {
        id: 'help_needed',
        label: 'What kind of help are you looking for right now?',
        type: 'select',
        required: true,
        options: [
          { value: 'validate',           label: 'I need help figuring out if people would buy it', weight: 5 },
          { value: 'design',             label: 'I need help improving the design',                weight: 3 },
          { value: 'prototype',          label: 'I need a prototype',                              weight: 2 },
          { value: 'manufacturing',      label: 'I need manufacturing / supplier help',            weight: 3 },
          { value: 'branding_launch',    label: 'I need branding / website / launch help',         weight: 3 },
          { value: 'investor_licensing', label: 'I need investor / licensing materials',           weight: 3 },
          { value: 'unsure',             label: 'I’m not sure',                                    weight: -1 },
        ],
        maxScore: 5,
      },
      {
        id: 'validation_first',
        label:
          'If execom recommended validation before prototyping, would you be open to that?',
        type: 'select',
        required: true,
        options: [
          { value: 'yes',   label: 'Yes',                                       weight: 6 },
          { value: 'maybe', label: 'Maybe, if the reasoning makes sense',       weight: 3 },
          { value: 'no',    label: 'No, I only want a prototype built',         weight: -5 },
        ],
        maxScore: 6,
      },
      {
        id: 'budget',
        label: 'Approximate budget available for the next step',
        type: 'select',
        required: true,
        options: [
          { value: 'under_1000',     label: 'Under $1,000',         weight: -4 },
          { value: '1000_3000',      label: '$1,000–$3,000',        weight: -2 },
          { value: '3000_7500',      label: '$3,000–$7,500',        weight: 1 },
          { value: '7500_15000',     label: '$7,500–$15,000',       weight: 3 },
          { value: '15000_50000',    label: '$15,000–$50,000',      weight: 5 },
          { value: '50000_plus',     label: '$50,000+',             weight: 6 },
          { value: 'unsure_budget',  label: 'Not sure yet',         weight: -3 },
        ],
        maxScore: 6,
      },
      {
        id: 'founder_name',
        label: 'Your full name',
        type: 'short_text',
        required: true,
      },
      {
        id: 'founder_email',
        label: 'Best email to reach you',
        type: 'short_text',
        required: true,
      },
      {
        id: 'company_name',
        label: 'Company name (if you have one yet)',
        type: 'short_text',
      },
    ],
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────

export type AnswerValue = string | number | boolean | string[] | null | undefined
export type AnswerMap = Record<string, AnswerValue>

export function findQuestion(id: string): QuestionDef | null {
  for (const s of SECTIONS) {
    const q = s.questions.find((q) => q.id === id)
    if (q) return q
  }
  return null
}

export function getSectionIndex(sectionId: string): number {
  return SECTIONS.findIndex((s) => s.id === sectionId)
}

// ─── Scoring ───────────────────────────────────────────────────────────────

export type LeadType =
  | 'commercially_serious'
  | 'strong_build_candidate'
  | 'strong_validation_candidate'
  | 'strong_licensing_candidate'
  | 'prototype_first_coachable'
  | 'underfunded'
  | 'fantasy_risk'
  | 'general_prospect'

export interface ScoreResult {
  score: number
  tier: 'high' | 'medium' | 'risky' | 'not_ready'
  recommendedPath:
    | 'reality_review'
    | 'validation_sprint'
    | 'prototype_blueprint'
    | 'build_launch'
    | 'not_ready'
  leadType: LeadType
  signals: { positive: string[]; risks: string[] }
}

/**
 * Internal-only scoring. Folds per-option weights, long-text substance
 * bonuses, and a handful of hard signals (budget, validation-first stance,
 * willingness-to-pay, stranger feedback) into a 0–100 score. Then derives
 * a tier, recommended path, and a single dominant lead-type bucket.
 */
export function scoreAssessment(answers: AnswerMap): ScoreResult {
  let raw = 50 // start at the middle and let signals push it
  const positive: string[] = []
  const risks: string[] = []

  for (const section of SECTIONS) {
    for (const q of section.questions) {
      const v = answers[q.id]

      // Long-text questions get a small bonus if the answer is substantive.
      if (q.type === 'long_text' && typeof v === 'string' && v.trim().length >= 60) {
        raw += Math.min(q.maxScore ?? 2, 2)
      } else if (
        q.type === 'long_text' &&
        q.required &&
        (!v || (typeof v === 'string' && v.trim().length < 20))
      ) {
        risks.push(`Thin or missing answer: ${q.label}`)
        raw -= 1
      }

      // Selects / multi-selects use explicit per-option weights.
      if (q.type === 'select' && typeof v === 'string') {
        const opt = q.options?.find((o) => o.value === v)
        if (opt?.weight) {
          raw += opt.weight
          if (opt.weight >= 3) positive.push(`${q.label}: ${opt.label}`)
          if (opt.weight <= -2) risks.push(`${q.label}: ${opt.label}`)
        }
      }
      if (q.type === 'multi_select' && Array.isArray(v)) {
        for (const vv of v) {
          const opt = q.options?.find((o) => o.value === vv)
          if (opt?.weight) {
            raw += opt.weight
            if (opt.weight >= 3) positive.push(`${q.label}: ${opt.label}`)
            if (opt.weight <= -2) risks.push(`${q.label}: ${opt.label}`)
          }
        }
      }

      // Yes/no/unsure with maxScore: yes earns full credit
      if (q.type === 'yes_no_unsure') {
        const max = q.maxScore ?? 0
        if (v === 'yes') raw += max
        else if (v === 'no') raw -= Math.round(max / 2)
        else if (v === 'unsure') raw -= 1
      }
    }
  }

  // ─── Hard signals ─────────────────────────────────────────────────────
  const budget = answers['budget'] as string | undefined
  const validation = answers['validation_first'] as string | undefined
  const helpNeeded = answers['help_needed'] as string | undefined
  const shownStrangers = answers['shown_to_strangers'] as string | undefined
  const willPay = answers['willingness_to_pay'] as string | undefined
  const buyerType = answers['category'] as string | undefined
  const channels = (answers['channels'] as string[] | undefined) ?? []
  const priceRationale = answers['price_rationale'] as string | undefined
  const differentiation = answers['differentiation'] as string | undefined

  const isWellFunded =
    budget === '15000_50000' || budget === '50000_plus'
  const isFunded =
    isWellFunded || budget === '7500_15000' || budget === '3000_7500'
  const isUnderfunded =
    budget === 'under_1000' || budget === '1000_3000' || budget === 'unsure_budget'

  const hasStrangerFeedback =
    shownStrangers === 'yes_many' || shownStrangers === 'yes_few'
  const hasWtp = willPay === 'yes_specific' || willPay === 'yes_casual'
  const hasSpecificBuyer = !!buyerType && buyerType !== 'unsure_mixed'
  const hasSpecificChannel =
    channels.length > 0 && !channels.every((c) => c === 'unsure')
  const hasChannelClarity =
    hasSpecificChannel && !channels.includes('unsure')
  const hasPriceRationale =
    typeof priceRationale === 'string' && priceRationale.trim().length >= 40
  const hasDifferentiation =
    typeof differentiation === 'string' && differentiation.trim().length >= 40

  if (validation === 'yes') positive.push('Open to validation before tooling.')
  if (validation === 'no') {
    risks.push('Refuses validation — wants prototype-first regardless.')
  }
  if (hasWtp) positive.push('Someone has already said they would pay.')
  if (hasStrangerFeedback) positive.push('Has shown it to people outside friends and family.')
  if (!hasStrangerFeedback) risks.push('No feedback from anyone outside friends or family.')
  if (!hasPriceRationale) risks.push('Price guess has no underlying logic.')
  if (!hasDifferentiation) risks.push('Differentiation is vague.')
  if (channels.includes('unsure')) risks.push('No idea where the product would be sold.')

  // Clamp
  const score = Math.max(0, Math.min(100, Math.round(raw)))

  // ─── Tier + recommended path ──────────────────────────────────────────
  let tier: ScoreResult['tier']
  let recommendedPath: ScoreResult['recommendedPath']
  if (score >= 75) {
    tier = 'high'
    recommendedPath = 'build_launch'
  } else if (score >= 60) {
    tier = 'high'
    recommendedPath = 'prototype_blueprint'
  } else if (score >= 45) {
    tier = 'medium'
    recommendedPath = 'validation_sprint'
  } else if (score >= 30) {
    tier = 'risky'
    recommendedPath = 'reality_review'
  } else {
    tier = 'not_ready'
    recommendedPath = 'not_ready'
  }

  // Override: anyone who refuses to validate first is capped at Reality
  // Review regardless of score. Their willingness to listen is the gate.
  if (validation === 'no' && recommendedPath !== 'not_ready') {
    recommendedPath = 'reality_review'
    if (tier === 'high') tier = 'medium'
  }

  // ─── Lead-type bucket (priority-ordered) ──────────────────────────────
  let leadType: LeadType = 'general_prospect'

  if (validation === 'no' && helpNeeded === 'prototype') {
    leadType = 'fantasy_risk'
  } else if (
    isWellFunded &&
    hasSpecificBuyer &&
    hasChannelClarity &&
    hasPriceRationale &&
    hasStrangerFeedback &&
    score >= 70
  ) {
    leadType = 'strong_build_candidate'
  } else if (
    isFunded &&
    validation !== 'no' &&
    hasStrangerFeedback &&
    (hasWtp || hasPriceRationale)
  ) {
    leadType = 'commercially_serious'
  } else if (
    helpNeeded === 'investor_licensing' &&
    (hasSpecificBuyer || hasDifferentiation)
  ) {
    leadType = 'strong_licensing_candidate'
  } else if (helpNeeded === 'prototype' && validation === 'maybe') {
    leadType = 'prototype_first_coachable'
  } else if (
    !hasStrangerFeedback &&
    !hasWtp &&
    (validation === 'yes' || validation === 'maybe') &&
    score >= 35
  ) {
    leadType = 'strong_validation_candidate'
  } else if (isUnderfunded) {
    leadType = 'underfunded'
  } else if (
    !hasStrangerFeedback &&
    !hasDifferentiation &&
    !hasSpecificBuyer
  ) {
    leadType = 'fantasy_risk'
  }

  return { score, tier, recommendedPath, leadType, signals: { positive, risks } }
}

export const PATH_LABELS: Record<ScoreResult['recommendedPath'], string> = {
  reality_review: 'Product Reality Review',
  validation_sprint: 'Validation Sprint',
  prototype_blueprint: 'Prototype Blueprint',
  build_launch: 'Build & Launch Plan',
  not_ready: 'Not yet ready — nurture',
}

export const PATH_PRICE_RANGES: Record<ScoreResult['recommendedPath'], string> = {
  reality_review: '$750–$1,500',
  validation_sprint: '$3,500–$7,500',
  prototype_blueprint: '$8,000–$15,000',
  build_launch: '$15,000–$50,000+',
  not_ready: 'n/a',
}

export const TIER_LABELS: Record<ScoreResult['tier'], string> = {
  high: 'High-value lead',
  medium: 'Worth a conversation',
  risky: 'Risky — needs reality check',
  not_ready: 'Not ready',
}

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  commercially_serious: 'Commercially serious',
  strong_build_candidate: 'Strong build candidate',
  strong_validation_candidate: 'Strong validation candidate',
  strong_licensing_candidate: 'Strong licensing / IP candidate',
  prototype_first_coachable: 'Prototype-first but coachable',
  underfunded: 'Underfunded / early idea',
  fantasy_risk: 'Fantasy risk',
  general_prospect: 'General prospect',
}

export const LEAD_TYPE_TONE: Record<LeadType, 'good' | 'neutral' | 'caution' | 'bad'> = {
  commercially_serious: 'good',
  strong_build_candidate: 'good',
  strong_validation_candidate: 'good',
  strong_licensing_candidate: 'good',
  prototype_first_coachable: 'neutral',
  underfunded: 'caution',
  general_prospect: 'neutral',
  fantasy_risk: 'bad',
}
