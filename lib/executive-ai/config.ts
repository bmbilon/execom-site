// Keep the working name and approved starting price in one place.
export const practicum = {
  name: 'execom Executive AI Practicum',
  priceCAD: 10_000,
  instructor: 'Brett Bilon',
  location: 'Calgary, Alberta',
  grantSource: 'https://www.alberta.ca/canada-alberta-productivity-grant',
  grantReviewed: '2026-10-06',
  consentVersion: '2026-10-06',
  weeks: 10,
  sessionMinutes: 60,
  minCohort: 4,
  maxCohort: 6,
} as const

export const stages = [
  'submitted',
  'reviewing',
  'needs_information',
  'qualified',
  'awaiting_sponsor',
  'waitlisted',
  'offered',
  'accepted',
  'enrolled',
  'declined',
  'withdrawn',
] as const
export type Stage = (typeof stages)[number]
export const transitions: Record<Stage, readonly Stage[]> = {
  submitted: ['reviewing', 'waitlisted', 'declined', 'withdrawn'],
  reviewing: [
    'needs_information',
    'qualified',
    'awaiting_sponsor',
    'waitlisted',
    'declined',
    'withdrawn',
  ],
  needs_information: ['reviewing', 'withdrawn', 'declined'],
  qualified: [
    'awaiting_sponsor',
    'reviewing',
    'waitlisted',
    'declined',
    'withdrawn',
  ],
  awaiting_sponsor: [
    'reviewing',
    'qualified',
    'waitlisted',
    'declined',
    'withdrawn',
  ],
  waitlisted: ['reviewing', 'qualified', 'declined', 'withdrawn'],
  offered: ['reviewing', 'waitlisted', 'declined', 'withdrawn'],
  accepted: ['enrolled', 'waitlisted', 'withdrawn'],
  enrolled: ['withdrawn'],
  declined: ['reviewing'],
  withdrawn: ['reviewing'],
}
export const stageLabel = (value: string) =>
  value.replaceAll('_', ' ').replace(/^./, (s) => s.toUpperCase())
export const priceLabel = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})
  .format(practicum.priceCAD)
  .replace('$', 'C$')
