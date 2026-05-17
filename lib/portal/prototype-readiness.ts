// ════════════════════════════════════════════════════════════════════════════
// Prototype Readiness Assessment — question catalog + internal scoring rubric
//
// The founder fills a 7-step wizard. Each answer key in the JSONB column maps
// to a `QuestionDef.id` below. Scoring runs internally on submit (and can be
// re-run by staff); the founder never sees the score or tier.
//
// Scoring philosophy:
//   • The strongest positive signals are (a) prior customer evidence,
//     (b) realistic price/manufacturing assumptions, (c) coachability, and
//     (d) willingness to validate before tooling.
//   • The strongest negative signals are "everyone will want it",
//     manufacturing-first thinking, and no defined buyer.
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
    id: 'concept',
    label: 'Product Concept',
    blurb:
      'A few questions about what you are actually building and what category it belongs in.',
    questions: [
      {
        id: 'product_name',
        label: 'Working product name',
        type: 'short_text',
        required: true,
        placeholder: 'e.g. ModBox, FlipDeck, RotoYard',
      },
      {
        id: 'concept_one_liner',
        label: 'In one sentence, what is the product?',
        helper:
          'Plain language. Imagine you are describing it to someone at a backyard BBQ.',
        type: 'long_text',
        required: true,
        maxScore: 4,
      },
      {
        id: 'problem_solved',
        label: 'What problem does this solve beyond "a fun thing to own"?',
        helper:
          'A real answer is fine. "It saves space," "we travel a lot," "kids get bored fast" — all valid.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'hero_use_case',
        label: 'Which single use case is the "hero" mode?',
        helper:
          'If you could only ship one version of this product, which one survives — and why?',
        type: 'long_text',
        required: true,
        maxScore: 4,
      },
      {
        id: 'category',
        label: 'Which category best fits the buyer mindset?',
        type: 'select',
        required: true,
        options: [
          { value: 'family', label: 'Family product', weight: 1 },
          { value: 'party', label: 'Party / hosting product', weight: 1 },
          { value: 'cottage', label: 'Cottage / lake / cabin product', weight: 1 },
          { value: 'tailgate', label: 'Tailgate / outdoor sports product', weight: 1 },
          { value: 'camping', label: 'Camping / overlanding product', weight: 1 },
          { value: 'patio', label: 'Bar / pub patio product', weight: 1 },
          { value: 'kids', label: 'Kids’ toy', weight: 1 },
          { value: 'multiple', label: 'All / many of the above', weight: -2 },
        ],
        maxScore: 3,
      },
      {
        id: 'friend_pitch',
        label:
          'What is the single strongest reason someone would tell a friend about this?',
        type: 'long_text',
        required: true,
        maxScore: 4,
      },
    ],
  },
  {
    id: 'customer',
    label: 'Target Customer',
    blurb:
      'Who buys it, what they buy today, what they would realistically pay, and what evidence (if any) you have so far.',
    questions: [
      {
        id: 'first_buyer',
        label: 'Who is the very first buyer?',
        helper:
          'Be specific. "Suburban dads with kids 5–12" beats "anyone with a backyard."',
        type: 'long_text',
        required: true,
        maxScore: 6,
      },
      {
        id: 'age_range',
        label: 'What age range buys this?',
        type: 'select',
        options: [
          { value: '18-24', label: '18–24' },
          { value: '25-34', label: '25–34' },
          { value: '35-44', label: '35–44' },
          { value: '45-54', label: '45–54' },
          { value: '55-64', label: '55–64' },
          { value: '65+', label: '65+' },
          { value: 'mixed', label: 'Mixed / not sure', weight: -1 },
        ],
      },
      {
        id: 'purchaser_type',
        label: 'Who specifically buys it?',
        type: 'multi_select',
        options: [
          { value: 'parents', label: 'Parents' },
          { value: 'grandparents', label: 'Grandparents / gifters' },
          { value: 'young_adults', label: 'Young adults' },
          { value: 'hosts', label: 'Hosts / entertainers' },
          { value: 'enthusiasts', label: 'Hobby enthusiasts' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        id: 'purchase_mode',
        label: 'Impulse purchase or researched purchase?',
        type: 'select',
        options: [
          { value: 'impulse', label: 'Impulse (<$60, seen on TikTok, etc.)' },
          { value: 'considered', label: 'Considered ($60–$300, some research)' },
          { value: 'researched', label: 'Researched ($300+, reviews, comparison shopping)' },
        ],
      },
      {
        id: 'competing_products',
        label: 'What do they currently buy instead?',
        helper:
          'Name actual products / brands you think you compete with. "Nothing" is almost never the right answer.',
        type: 'long_text',
        required: true,
        maxScore: 5,
      },
      {
        id: 'similar_modular_products',
        label:
          'Are there any existing products with a similar modular / convert-between-modes concept?',
        helper: 'Examples, links, brand names. "I don’t know" is a fine answer here.',
        type: 'long_text',
      },
      {
        id: 'retailers',
        label: 'Which retailers do you picture this on the shelf of?',
        type: 'multi_select',
        options: [
          { value: 'amazon', label: 'Amazon' },
          { value: 'costco', label: 'Costco' },
          { value: 'canadian_tire', label: 'Canadian Tire' },
          { value: 'walmart', label: 'Walmart' },
          { value: 'target', label: 'Target' },
          { value: 'rec_specialty', label: 'Recreation / sport specialty' },
          { value: 'dtc_only', label: 'Direct-to-consumer only (no retail)' },
          { value: 'unsure', label: 'Not sure', weight: -1 },
        ],
      },
      {
        id: 'shown_to_strangers',
        label: 'Have you shown the concept to people outside friends and family?',
        type: 'yes_no_unsure',
        required: true,
        maxScore: 6,
      },
      {
        id: 'preorders_or_intent',
        label: 'Has anyone tried to pre-order, buy, or put down a deposit yet?',
        type: 'yes_no_unsure',
        required: true,
        maxScore: 8,
      },
      {
        id: 'target_retail_price',
        label: 'What retail price do you think consumers would realistically pay?',
        helper: 'CAD, ballpark is fine.',
        type: 'currency',
        required: true,
      },
      {
        id: 'price_evidence',
        label: 'What is that price based on?',
        type: 'select',
        options: [
          { value: 'comparable_products', label: 'Pricing of comparable products', weight: 3 },
          { value: 'survey', label: 'A survey or willingness-to-pay test', weight: 4 },
          { value: 'retail_feedback', label: 'Feedback from a buyer / retailer', weight: 5 },
          { value: 'gut', label: 'Gut feel', weight: -2 },
        ],
        required: true,
      },
    ],
  },
  {
    id: 'design',
    label: 'Design & Mechanics',
    blurb:
      'How it goes together, how it stays together, what is likely to break.',
    questions: [
      {
        id: 'hero_mode',
        label: 'Which game / use mode is the hero?',
        type: 'long_text',
        required: true,
      },
      {
        id: 'sticky_modes',
        label: 'Which modes are genuinely fun for 30+ minutes, not just briefly novel?',
        type: 'long_text',
      },
      {
        id: 'conversion_time',
        label: 'How long does converting between modes take?',
        type: 'select',
        options: [
          { value: 'under_30s', label: 'Under 30 seconds', weight: 3 },
          { value: '30s_to_2m', label: '30 seconds to 2 minutes', weight: 2 },
          { value: '2m_to_5m', label: '2–5 minutes', weight: 0 },
          { value: 'over_5m', label: 'More than 5 minutes', weight: -2 },
          { value: 'unknown', label: 'Not sure yet', weight: -1 },
        ],
      },
      {
        id: 'attachment_method',
        label: 'How do the game modules attach to the base?',
        type: 'multi_select',
        options: [
          { value: 'magnetic', label: 'Magnetic' },
          { value: 'pinned', label: 'Pinned' },
          { value: 'bolted', label: 'Bolted' },
          { value: 'clipped', label: 'Clipped' },
          { value: 'slotted', label: 'Slotted' },
          { value: 'threaded', label: 'Threaded' },
          { value: 'undecided', label: 'Not decided yet', weight: -1 },
        ],
      },
      {
        id: 'setup_tools_required',
        label: 'Does setup require tools?',
        type: 'select',
        options: [
          { value: 'none', label: 'No tools', weight: 3 },
          { value: 'included', label: 'A single included tool', weight: 1 },
          { value: 'household', label: 'Common household tools', weight: -1 },
          { value: 'specialty', label: 'Specialty tools', weight: -3 },
        ],
      },
      {
        id: 'one_person_assembly',
        label: 'Can one person assemble it?',
        type: 'yes_no_unsure',
      },
      {
        id: 'stability_wind',
        label: 'How does it behave in wind or on uneven grass?',
        type: 'long_text',
      },
      {
        id: 'safety_kids',
        label: 'Is it safe around children?',
        type: 'long_text',
      },
      {
        id: 'fragile_parts',
        label: 'What parts are most likely to break, bend, or go missing?',
        type: 'long_text',
        maxScore: 3,
      },
      {
        id: 'accessory_storage',
        label: 'How are accessories stored between uses?',
        type: 'long_text',
      },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing & Packaging',
    blurb:
      'Materials, tooling, what it costs to actually make, and how it ships.',
    questions: [
      {
        id: 'use_environment',
        label: 'Where will this live?',
        type: 'select',
        options: [
          { value: 'indoor', label: 'Indoor only' },
          { value: 'outdoor', label: 'Outdoor only' },
          { value: 'both', label: 'Both' },
        ],
        required: true,
      },
      {
        id: 'weather_expectations',
        label: 'How long should it last outdoors?',
        type: 'select',
        options: [
          { value: '1_season', label: 'One season' },
          { value: '2_3_seasons', label: '2–3 seasons' },
          { value: '5_plus', label: '5+ years' },
          { value: 'lifetime', label: 'Lifetime / heirloom' },
        ],
      },
      {
        id: 'materials_frame',
        label: 'What materials do you picture for the frame?',
        type: 'long_text',
      },
      {
        id: 'materials_panels',
        label: 'Panels / faces?',
        type: 'long_text',
      },
      {
        id: 'materials_base',
        label: 'Base / ballast?',
        type: 'long_text',
      },
      {
        id: 'manufacturing_process',
        label: 'What manufacturing process do you think is required?',
        type: 'multi_select',
        options: [
          { value: 'injection_molding', label: 'Injection molding' },
          { value: 'rotomolding', label: 'Rotomolding' },
          { value: 'metal_stamping', label: 'Metal stamping' },
          { value: 'powder_coat', label: 'Powder coating' },
          { value: 'anodize', label: 'Anodizing' },
          { value: 'cnc', label: 'CNC machining' },
          { value: 'sewn_textile', label: 'Sewn textile' },
          { value: 'off_the_shelf', label: 'Mostly off-the-shelf parts', weight: 2 },
          { value: 'unsure', label: 'Not sure', weight: -2 },
        ],
      },
      {
        id: 'bom_estimate',
        label: 'Estimated bill-of-materials cost per unit (landed)',
        helper: 'CAD per unit. Ballpark is fine — "I have no idea" is a valid answer.',
        type: 'currency',
      },
      {
        id: 'bom_basis',
        label: 'What is that BOM estimate based on?',
        type: 'select',
        options: [
          { value: 'quote', label: 'Actual supplier quote(s)', weight: 6 },
          { value: 'comparable_bom', label: 'Teardown / comparable product BOM', weight: 4 },
          { value: 'engineering_estimate', label: 'Engineering build-up', weight: 3 },
          { value: 'gut', label: 'Gut feel', weight: -3 },
          { value: 'none', label: 'No estimate yet', weight: -2 },
        ],
      },
      {
        id: 'ships_flat',
        label: 'Does it disassemble flat for shipping?',
        type: 'yes_no_unsure',
      },
      {
        id: 'ship_weight_target',
        label: 'Target shipping weight (lbs)',
        type: 'number',
      },
      {
        id: 'one_person_carry',
        label: 'Can one person carry the boxed product comfortably?',
        type: 'yes_no_unsure',
      },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial Plan',
    blurb: 'How you would actually take this to market, and what economics you need to hit.',
    questions: [
      {
        id: 'gtm_primary',
        label: 'What is the primary go-to-market channel you imagine?',
        type: 'select',
        required: true,
        options: [
          { value: 'tiktok_ig', label: 'TikTok / Instagram virality' },
          { value: 'amazon', label: 'Amazon-driven' },
          { value: 'retail', label: 'Retail-driven (Canadian Tire / Costco / etc.)' },
          { value: 'dtc', label: 'Direct-to-consumer website' },
          { value: 'costco_demo', label: 'Costco-style in-store demo' },
          { value: 'licensing', label: 'License to a brand' },
          { value: 'unsure', label: 'Not sure', weight: -2 },
        ],
        maxScore: 4,
      },
      {
        id: 'fifteen_sec_ad',
        label: 'What does the 15-second ad look like?',
        helper:
          'Walk me through the shots. What makes someone stop scrolling?',
        type: 'long_text',
        maxScore: 4,
      },
      {
        id: 'emotional_hook',
        label: 'What is the emotional hook?',
        type: 'multi_select',
        options: [
          { value: 'competition', label: 'Competition' },
          { value: 'nostalgia', label: 'Nostalgia' },
          { value: 'family_bonding', label: 'Family bonding' },
          { value: 'portability', label: 'Portability' },
          { value: 'novelty', label: 'Novelty' },
          { value: 'skill_mastery', label: 'Skill mastery' },
          { value: 'social_hosting', label: 'Social hosting' },
        ],
      },
      {
        id: 'margin_understanding',
        label: 'What gross margin do retailers typically require?',
        type: 'select',
        options: [
          { value: 'under_30', label: 'Under 30%', weight: -2 },
          { value: '30_to_40', label: '30–40%', weight: 0 },
          { value: '40_to_50', label: '40–50%', weight: 2 },
          { value: '50_plus', label: '50%+ (keystone or better)', weight: 3 },
          { value: 'unsure', label: 'Not sure', weight: -2 },
        ],
      },
      {
        id: 'first_run_assumption',
        label: 'What size first production run are you imagining?',
        type: 'select',
        options: [
          { value: 'under_100', label: 'Under 100 units' },
          { value: '100_500', label: '100–500 units' },
          { value: '500_2500', label: '500–2,500 units' },
          { value: '2500_10000', label: '2,500–10,000 units' },
          { value: '10000_plus', label: '10,000+ units' },
        ],
      },
      {
        id: 'launch_budget',
        label: 'What launch budget have you set aside, all-in (tooling, manufacturing, marketing, fulfillment)?',
        type: 'select',
        required: true,
        options: [
          { value: 'under_10k', label: 'Under $10k', weight: -3 },
          { value: '10k_25k', label: '$10k–$25k', weight: -1 },
          { value: '25k_75k', label: '$25k–$75k', weight: 2 },
          { value: '75k_250k', label: '$75k–$250k', weight: 4 },
          { value: '250k_plus', label: '$250k+', weight: 5 },
          { value: 'looking_for_investor', label: 'Looking for an investor first', weight: -4 },
        ],
        maxScore: 5,
      },
      {
        id: 'launch_timeline',
        label: 'Target launch timeline',
        type: 'select',
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '6_months', label: 'Within 6 months' },
          { value: '12_months', label: 'Within 12 months' },
          { value: '18_24_months', label: '18–24 months' },
          { value: 'no_pressure', label: 'No specific timeline' },
        ],
      },
    ],
  },
  {
    id: 'evidence',
    label: 'Evidence & IP',
    blurb:
      'What proof exists today that this is a real business, and what protects it.',
    questions: [
      {
        id: 'evidence_artifacts',
        label: 'What evidence exists today? (select all that apply)',
        type: 'multi_select',
        options: [
          { value: 'sketches', label: 'Sketches / drawings', weight: 1 },
          { value: 'cad', label: 'CAD model', weight: 2 },
          { value: 'renders', label: 'Photoreal renders', weight: 2 },
          { value: 'rough_prototype', label: 'Rough working prototype', weight: 3 },
          { value: 'refined_prototype', label: 'Refined / demo-ready prototype', weight: 5 },
          { value: 'supplier_quotes', label: 'Supplier quotes', weight: 4 },
          { value: 'customer_interviews', label: 'Documented customer interviews', weight: 5 },
          { value: 'waitlist', label: 'Email waitlist', weight: 3 },
          { value: 'preorders', label: 'Pre-orders / deposits', weight: 8 },
          { value: 'retail_meetings', label: 'Meetings with a buyer / retailer', weight: 6 },
          { value: 'patent_search', label: 'Patent / prior-art search done', weight: 2 },
          { value: 'none', label: 'None of the above yet', weight: -4 },
        ],
        required: true,
        maxScore: 12,
      },
      {
        id: 'defensibility',
        label: 'What do you believe is actually defensible about this product?',
        type: 'multi_select',
        options: [
          { value: 'utility_patent', label: 'Utility patent / patentable mechanism' },
          { value: 'industrial_design', label: 'Industrial design / look-and-feel' },
          { value: 'brand', label: 'Brand and community' },
          { value: 'modular_mechanism', label: 'A specific modular mechanism' },
          { value: 'first_mover', label: 'Being first to market' },
          { value: 'nothing_yet', label: 'Honestly, not sure yet' },
        ],
      },
      {
        id: 'patent_search_done',
        label: 'Have you searched existing patents or competing products?',
        type: 'yes_no_unsure',
      },
      {
        id: 'clone_survival',
        label: 'If a larger company cloned this in 6 months, does the business survive?',
        type: 'long_text',
      },
    ],
  },
  {
    id: 'founder_fit',
    label: 'Founder Fit',
    blurb:
      'How you want to work with execom, and what kind of partner you are looking for.',
    questions: [
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
        label: 'Company name (if incorporated yet)',
        type: 'short_text',
      },
      {
        id: 'help_needed',
        label: 'What kind of help are you looking for from execom?',
        type: 'multi_select',
        required: true,
        options: [
          { value: 'advise', label: 'Strategic advice on whether to proceed', weight: 3 },
          { value: 'validate', label: 'Validate demand before I spend on tooling', weight: 5 },
          { value: 'design', label: 'Industrial / mechanical design', weight: 2 },
          { value: 'prototype', label: 'Build a working prototype', weight: 2 },
          { value: 'source', label: 'Source manufacturing', weight: 2 },
          { value: 'commercialize', label: 'Commercialize, brand, and launch', weight: 4 },
          { value: 'cheap_prototype_only', label: 'Just a cheap prototype, nothing else', weight: -4 },
        ],
        maxScore: 5,
      },
      {
        id: 'validation_first',
        label:
          'Would you rather discover product / demand flaws before tooling, or after?',
        type: 'select',
        required: true,
        options: [
          { value: 'before', label: 'Before tooling — happy to validate first', weight: 6 },
          { value: 'parallel', label: 'In parallel with prototyping', weight: 2 },
          { value: 'after', label: 'I’d rather just build it and find out', weight: -5 },
        ],
        maxScore: 6,
      },
      {
        id: 'decision_timeline',
        label: 'When do you want to make a decision on engagement?',
        type: 'select',
        required: true,
        options: [
          { value: 'this_week', label: 'This week', weight: 3 },
          { value: 'this_month', label: 'This month', weight: 3 },
          { value: 'this_quarter', label: 'This quarter', weight: 1 },
          { value: 'no_rush', label: 'No specific timeline', weight: -1 },
        ],
      },
      {
        id: 'biggest_uncertainty',
        label: 'What assumption are you most uncertain about?',
        type: 'long_text',
        maxScore: 4,
      },
      {
        id: 'failure_mode',
        label: 'If this failed, what is the most likely reason?',
        type: 'long_text',
        maxScore: 4,
      },
      {
        id: 'success_criteria',
        label: 'What would need to be true for this to become a real, scalable product?',
        type: 'long_text',
        maxScore: 4,
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

export interface ScoreResult {
  score: number
  tier: 'high' | 'medium' | 'risky' | 'not_ready'
  recommendedPath:
    | 'reality_review'
    | 'validation_sprint'
    | 'prototype_blueprint'
    | 'build_launch'
    | 'not_ready'
  signals: { positive: string[]; risks: string[] }
}

/**
 * Internal-only scoring. Walks every question and folds the answer's
 * weight into a 0–100 score. Tier and recommended path are derived from
 * the score plus a few hard signals (budget, validation_first, evidence).
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
      } else if (q.type === 'long_text' && q.required && (!v || (typeof v === 'string' && v.trim().length < 20))) {
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
            if (opt.weight >= 4) positive.push(`${q.label}: ${opt.label}`)
            if (opt.weight <= -3) risks.push(`${q.label}: ${opt.label}`)
          }
        }
      }

      // Yes/No/Unsure with maxScore — answering "yes" earns full credit
      if (q.type === 'yes_no_unsure') {
        const max = q.maxScore ?? 0
        if (v === 'yes') raw += max
        else if (v === 'no') raw -= Math.round(max / 2)
        else if (v === 'unsure') raw -= 1
      }
    }
  }

  // Hard signals (override / amplify)
  const helpNeeded = (answers['help_needed'] as string[] | undefined) ?? []
  const validation = answers['validation_first'] as string | undefined
  const budget = answers['launch_budget'] as string | undefined
  const evidenceArr = (answers['evidence_artifacts'] as string[] | undefined) ?? []
  const preorders = answers['preorders_or_intent']
  const shownStrangers = answers['shown_to_strangers']

  if (helpNeeded.includes('cheap_prototype_only')) {
    raw -= 6
    risks.push('Wants only a cheap prototype — not a partnership.')
  }
  if (validation === 'after') {
    raw -= 6
    risks.push('Would rather tool first and validate later.')
  }
  if (validation === 'before') {
    positive.push('Open to validation before tooling.')
  }
  if (budget === 'looking_for_investor' || budget === 'under_10k') {
    raw -= 4
    risks.push('No funded launch budget yet.')
  }
  if (budget === '75k_250k' || budget === '250k_plus') {
    raw += 4
    positive.push('Funded launch budget.')
  }
  if (evidenceArr.includes('preorders') || evidenceArr.includes('retail_meetings')) {
    raw += 6
    positive.push('Has real-world buying signal (pre-orders or retailer meetings).')
  }
  if (evidenceArr.includes('none')) {
    raw -= 6
    risks.push('No evidence of any kind yet.')
  }
  if (preorders === 'yes') {
    raw += 4
    positive.push('Someone has tried to actually buy it.')
  }
  if (shownStrangers === 'no') {
    raw -= 2
    risks.push('Hasn’t shown the concept outside friends and family.')
  }

  // Clamp
  const score = Math.max(0, Math.min(100, Math.round(raw)))

  // Tier + path
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

  // Override: anyone who refuses to validate first is capped at Reality Review
  if (validation === 'after' && recommendedPath !== 'not_ready') {
    recommendedPath = 'reality_review'
    if (tier === 'high') tier = 'medium'
  }

  return { score, tier, recommendedPath, signals: { positive, risks } }
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
