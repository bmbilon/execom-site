import {
  SECTIONS,
  scoreAssessment,
  PATH_LABELS,
  PATH_PRICE_RANGES,
  TIER_LABELS,
  LEAD_TYPE_LABELS,
  LEAD_TYPE_TONE,
  type AnswerMap,
  type QuestionDef,
  type SectionDef,
  type ScoreResult,
} from './prototype-readiness'
import {
  MVP_SECTIONS,
  scoreMvpAssessment,
  MVP_PATH_LABELS,
  MVP_PATH_PRICE_RANGES,
  MVP_TIER_LABELS,
  MVP_LEAD_TYPE_LABELS,
  MVP_LEAD_TYPE_TONE,
  MVP_ADD_ON_LABELS,
  MVP_ADD_ON_PRICE_RANGES,
  type MvpScoreResult,
} from './mvp-readiness'

// ════════════════════════════════════════════════════════════════════════════
// One intake, two instruments.
//
// The founder answers a single fork question first, then sees only the
// section set that matches what they are building. Self-selection from the
// dashboard was the alternative and it fails in exactly the case that
// motivated this: a founder building a software marketplace thinks of it as
// "my product" and picks the prototype track.
//
// Everything downstream (wizard, admin queue, PDF, scoring) reads the track
// through this module rather than importing either instrument directly, so
// adding a third track later touches this file and nothing else.
// ════════════════════════════════════════════════════════════════════════════

export type ReadinessTrack = 'physical' | 'software'

export const TRACK_QUESTION_ID = 'build_type'

export const TRACK_QUESTION: QuestionDef = {
  id: TRACK_QUESTION_ID,
  label: 'What are you building?',
  helper:
    'This decides which questions we ask. Physical means something manufactured. Software means an app, website, or platform.',
  type: 'select',
  required: true,
  options: [
    { value: 'physical', label: 'A physical product' },
    { value: 'software', label: 'An app, website, or software platform' },
    {
      value: 'physical_with_software',
      label: 'A physical product with software attached',
    },
  ],
}

export const TRACK_SECTION: SectionDef = {
  id: 'track',
  label: 'First, the basics',
  blurb: 'One question, so the rest of the form is about your kind of product.',
  questions: [TRACK_QUESTION],
}

/**
 * Resolve the track from a raw answer map.
 *
 * A physical product with software attached routes to the physical
 * instrument: tooling, unit cost, and retail channel still dominate the
 * economics, and the software portion is a line item inside that. Revisit
 * if hardware-plus-platform submissions start arriving regularly.
 *
 * Anything unrecognised or missing falls back to physical, matching every
 * assessment that existed before this fork.
 */
export function resolveTrack(answers: AnswerMap): ReadinessTrack {
  const v = answers[TRACK_QUESTION_ID]
  return v === 'software' ? 'software' : 'physical'
}

export function getSections(track: ReadinessTrack): SectionDef[] {
  return [TRACK_SECTION, ...(track === 'software' ? MVP_SECTIONS : SECTIONS)]
}

export const TRACK_LABELS: Record<ReadinessTrack, string> = {
  physical: 'Prototype Readiness',
  software: 'MVP Readiness',
}

// A discriminated union so callers cannot read `addOns` off a physical
// result, or forget that the two path enums are different sets.
export type TrackedScore =
  | { track: 'physical'; result: ScoreResult }
  | { track: 'software'; result: MvpScoreResult }

export function scoreForTrack(answers: AnswerMap): TrackedScore {
  const track = resolveTrack(answers)
  return track === 'software'
    ? { track, result: scoreMvpAssessment(answers) }
    : { track, result: scoreAssessment(answers) }
}

// ─── Label lookups that work across both tracks ────────────────────────────
//
// The admin UI and the PDF render one submission at a time and should not
// care which instrument produced it.

export function pathLabel(scored: TrackedScore): string {
  return scored.track === 'software'
    ? MVP_PATH_LABELS[scored.result.recommendedPath]
    : PATH_LABELS[scored.result.recommendedPath]
}

export function pathPriceRange(scored: TrackedScore): string {
  return scored.track === 'software'
    ? MVP_PATH_PRICE_RANGES[scored.result.recommendedPath]
    : PATH_PRICE_RANGES[scored.result.recommendedPath]
}

export function tierLabel(scored: TrackedScore): string {
  return scored.track === 'software'
    ? MVP_TIER_LABELS[scored.result.tier]
    : TIER_LABELS[scored.result.tier]
}

export function leadTypeLabel(scored: TrackedScore): string {
  return scored.track === 'software'
    ? MVP_LEAD_TYPE_LABELS[scored.result.leadType]
    : LEAD_TYPE_LABELS[scored.result.leadType]
}

export function leadTypeTone(
  scored: TrackedScore
): 'good' | 'neutral' | 'caution' | 'bad' {
  return scored.track === 'software'
    ? MVP_LEAD_TYPE_TONE[scored.result.leadType]
    : LEAD_TYPE_TONE[scored.result.leadType]
}

/** Recommended add-ons, with price. Empty for the physical track. */
export function addOns(
  scored: TrackedScore
): { label: string; priceRange: string }[] {
  if (scored.track !== 'software') return []
  return scored.result.addOns.map((a) => ({
    label: MVP_ADD_ON_LABELS[a],
    priceRange: MVP_ADD_ON_PRICE_RANGES[a],
  }))
}
