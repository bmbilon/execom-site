import { z } from 'zod'
import { stages } from './config'

const short = z.string().trim().min(2).max(160)
const email = z
  .email()
  .max(254)
  .transform((s) => s.toLowerCase())
const answer = z
  .string()
  .trim()
  .min(20, 'Please give at least 20 characters of detail.')
  .max(4000)
const optionalText = z.string().trim().max(1500).default('')
export const intakeSchema = z
  .object({
    requestId: z.uuid(),
    kind: z.enum(['executive', 'employer']),
    name: short,
    email,
    title: short,
    employer: short,
    phone: z.string().trim().max(40).default(''),
    province: z.enum([
      'AB',
      'BC',
      'SK',
      'MB',
      'ON',
      'QC',
      'NB',
      'NS',
      'PE',
      'NL',
      'YT',
      'NT',
      'NU',
      'Other',
    ]),
    process: answer,
    outcome: answer,
    tools: optionalText,
    dataApproval: z.enum(['approved', 'pending', 'not_started']),
    sponsorName: z.string().trim().max(160).default(''),
    sponsorEmail: z.union([email, z.literal('')]).default(''),
    employment: z.enum([
      'employee',
      'owner_shareholder_board',
      'other',
      'unknown',
    ]),
    grantInterest: z.boolean(),
    seats: z.number().int().min(1).max(30),
    cohortId: z.uuid().nullable().default(null),
    notes: optionalText,
    consent: z.literal(true, {
      error: 'Consent is required to process this application.',
    }),
    website: z.string().max(0, 'Unable to submit this request.').default(''),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.kind === 'executive' && v.seats !== 1)
      ctx.addIssue({
        code: 'custom',
        path: ['seats'],
        message: 'An executive application is for one participant.',
      })
  })
export type Intake = z.infer<typeof intakeSchema>

export const sponsorSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    name: short,
    email,
    title: short,
    employer: short,
    decision: z.enum(['confirmed', 'declined']),
    funding: z.enum(['employer', 'conditional_grant', 'not_confirmed']),
    dataApproval: z.enum(['approved', 'pending', 'not_started']),
    notes: optionalText,
    authorized: z.literal(true),
    consent: z.literal(true),
  })
  .strict()

export const cohortSchema = z
  .object({
    id: z.uuid().optional(),
    version: z.number().int().positive().optional(),
    name: short,
    location: short,
    startsAt: z.iso.datetime({ offset: true }).nullable(),
    endsAt: z.iso.datetime({ offset: true }).nullable(),
    deadline: z.iso.datetime({ offset: true }).nullable(),
    capacity: z.number().int().min(1).max(6),
    state: z.enum(['draft', 'open', 'closed', 'completed', 'cancelled']),
    schedule: z.string().trim().max(4000),
    instructionalHours: z.number().min(1).max(500).nullable(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (
      v.state === 'open' &&
      (!v.startsAt ||
        !v.endsAt ||
        !v.deadline ||
        !v.instructionalHours ||
        v.schedule.length < 10)
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'An open cohort needs confirmed dates, deadline, hours and a schedule.',
      })
    if (v.startsAt && v.endsAt && new Date(v.startsAt) >= new Date(v.endsAt))
      ctx.addIssue({ code: 'custom', message: 'End must be after start.' })
    if (v.deadline && v.startsAt && new Date(v.deadline) > new Date(v.startsAt))
      ctx.addIssue({
        code: 'custom',
        message: 'Application deadline must be before the start.',
      })
    if (v.state === 'open' && v.startsAt && new Date(v.startsAt) <= new Date())
      ctx.addIssue({
        code: 'custom',
        message: 'An open cohort must start in the future.',
      })
  })

export const reviewSchema = z
  .object({
    version: z.number().int().positive(),
    status: z.enum(stages),
    cohortId: z.uuid().nullable(),
    note: z.string().trim().min(3).max(4000),
    dataApproval: z.enum(['approved', 'pending', 'not_started']),
    sponsorVerified: z.boolean(),
  })
  .strict()
