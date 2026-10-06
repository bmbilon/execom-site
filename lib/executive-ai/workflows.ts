import 'server-only'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db, tables, AdmissionError } from './db'
import { transaction, digest } from './service'
import { practicum } from './config'

export const courseSchema = z
  .object({
    legalEntity: z.string().trim().max(200),
    providerAddress: z.string().trim().max(500),
    buildAllowance: z.string().trim().max(3000),
    terms: z.string().trim().max(6000),
    curriculum: z.string().trim().min(30).max(6000),
    assessment: z.string().trim().min(20).max(3000),
    trainingCostCAD: z.number().min(0).max(10000).nullable(),
    buildCostCAD: z.number().min(0).max(10000).nullable(),
    softwareAndIntegrations: z.string().trim().max(3000),
    providerEligibility: z.enum(['unresolved', 'evidence_reviewed']),
    courseEligibility: z.enum(['unresolved', 'evidence_reviewed']),
    eligibilityEvidence: z.string().trim().max(3000),
    approved: z.boolean(),
  })
  .strict()
  .superRefine((v, c) => {
    if (
      v.approved &&
      (!v.legalEntity ||
        !v.providerAddress ||
        v.buildAllowance.length < 10 ||
        v.terms.length < 20 ||
        v.softwareAndIntegrations.length < 10)
    )
      c.addIssue({
        code: 'custom',
        message:
          'An offer-ready version needs the legal entity, address, build allowance, commercial terms, and software/integration responsibilities.',
      })
    if (
      (v.providerEligibility === 'evidence_reviewed' ||
        v.courseEligibility === 'evidence_reviewed') &&
      v.eligibilityEvidence.length < 20
    )
      c.addIssue({
        code: 'custom',
        message:
          'Record the dated source and verification evidence for eligibility.',
      })
    if (
      v.trainingCostCAD !== null &&
      v.buildCostCAD !== null &&
      v.trainingCostCAD + v.buildCostCAD !== 10000
    )
      c.addIssue({
        code: 'custom',
        message:
          'The training/build allocation must total C$10,000 before tax.',
      })
  })
export type CourseContent = z.infer<typeof courseSchema>
export const defaultCourse: CourseContent = {
  legalEntity: '',
  providerAddress: '',
  buildAllowance: '',
  terms: '',
  trainingCostCAD: null,
  buildCostCAD: null,
  softwareAndIntegrations: '',
  curriculum:
    'Ten weekly 60-minute working sessions: define the process and baseline; choose approved tools; build and test; evaluate outputs and safeguards; document operation; complete an employer acceptance review.',
  assessment:
    'A working demonstration, baseline/result comparison, documented operating instructions and limitations, and employer acceptance review.',
  providerEligibility: 'unresolved',
  courseEligibility: 'unresolved',
  eligibilityEvidence: '',
  approved: false,
}
export async function courseVersions() {
  return (
    await db().query(`SELECT * FROM ${tables().versions} ORDER BY version DESC`)
  ).rows
}
export async function saveCourse(input: CourseContent, actor: string) {
  const { approved, ...content } = input
  return transaction(async (c) => {
    const result = await c.query(
      `INSERT INTO ${tables().versions}(content,approved,created_by) VALUES($1,$2,$3) RETURNING id,version`,
      [JSON.stringify(content), approved, actor],
    )
    await c.query(
      `INSERT INTO ${tables().audit}(actor_id,action,detail) VALUES($1,'course_version_created',$2)`,
      [actor, JSON.stringify(result.rows[0])],
    )
    return result.rows[0]
  })
}
export async function applicationAccess(
  id: string,
  user: { id: string; email: string },
  isStaff = false,
) {
  const a = (
    await db().query(`SELECT * FROM ${tables().applications} WHERE id=$1`, [id])
  ).rows[0]
  if (!a) throw new AdmissionError(404, 'Application not found.')
  if (isStaff) return { application: a, role: 'staff' as const }
  if (a.owner_id === user.id) return { application: a, role: 'owner' as const }
  if (
    a.sponsor_verified &&
    a.sponsor_shared_at &&
    a.sponsor_brief?.email === user.email.toLowerCase() &&
    a.sponsor_response?.decision === 'confirmed'
  )
    return { application: a, role: 'sponsor' as const }
  throw new AdmissionError(404, 'Application not found.')
}
export async function applicantDetail(
  id: string,
  user: { id: string; email: string },
) {
  const { application: a, role } = await applicationAccess(id, user),
    t = tables()
  const [offers, messages, grant, packages] = await Promise.all([
    db().query(
      `SELECT id,snapshot,expires_at,state,accepted_at,created_at FROM ${t.offers} WHERE application_id=$1 ORDER BY created_at DESC`,
      [id],
    ),
    role === 'owner'
      ? db().query(
          `SELECT id,from_staff,body,created_at FROM ${t.messages} WHERE application_id=$1 ORDER BY created_at`,
          [id],
        )
      : Promise.resolve({ rows: [] }),
    db().query(
      `SELECT status,evidence_reference,notes,updated_at FROM ${t.grants} WHERE application_id=$1`,
      [id],
    ),
    packageHistory(id),
  ])
  return {
    packages,
    id: a.id,
    reference: a.reference,
    name: a.name,
    employer: a.employer,
    kind: a.kind,
    status: a.status,
    version: a.version,
    intake: role === 'owner' ? a.intake : undefined,
    sponsorBrief: a.sponsor_brief,
    sponsorVerified: a.sponsor_verified,
    sponsorDecision: a.sponsor_response?.decision ?? null,
    role,
    offers: offers.rows,
    messages: messages.rows,
    grant: grant.rows[0] ?? null,
  }
}
export async function packageHistory(
  applicationId: string,
): Promise<
  { id: string; created_at: string; course_version: number | null }[]
> {
  return (
    await db().query(
      `SELECT id,created_at,snapshot->'courseVersion' AS course_version FROM ${tables().packages} WHERE application_id=$1 ORDER BY created_at DESC`,
      [applicationId],
    )
  ).rows
}
export const sponsorshipRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    email: z
      .email()
      .max(254)
      .transform((s) => s.toLowerCase()),
    summary: z.string().trim().min(20).max(3000),
    outcome: z.string().trim().min(20).max(3000),
    permission: z.literal(true),
  })
  .strict()
export async function requestSponsorship(
  id: string,
  input: z.infer<typeof sponsorshipRequestSchema>,
  user: { id: string; email: string },
) {
  const t = tables(),
    token = randomBytes(32).toString('hex')
  return transaction(async (c) => {
    const a = (
      await c.query(
        `SELECT * FROM ${t.applications} WHERE id=$1 AND owner_id=$2 AND kind='executive'`,
        [id, user.id],
      )
    ).rows[0]
    if (
      !a ||
      ['offered', 'accepted', 'enrolled', 'declined', 'withdrawn'].includes(
        a.status,
      )
    )
      throw new AdmissionError(
        409,
        'Sponsorship cannot be changed in this state.',
      )
    await c.query(
      `UPDATE ${t.applications} SET sponsor_brief=$1,sponsor_shared_at=now(),sponsor_token_hash=$2,sponsor_expires_at=now()+interval '30 days',sponsor_response=NULL,sponsor_verified=false,version=version+1,updated_at=now() WHERE id=$3`,
      [JSON.stringify(input), digest(token), id],
    )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,'sponsor_requested',$3)`,
      [
        id,
        user.id,
        JSON.stringify({
          sharedFields: ['name', 'employer', 'summary', 'outcome'],
        }),
      ],
    )
    return { sponsorToken: token }
  })
}
export async function addMessage(
  id: string,
  text: string,
  actor: string,
  isStaff: boolean,
) {
  return transaction(async (c) => {
    const t = tables(),
      a = (
        await c.query(
          `SELECT owner_id,status FROM ${t.applications} WHERE id=$1`,
          [id],
        )
      ).rows[0]
    if (!a || (!isStaff && a.owner_id !== actor))
      throw new AdmissionError(404, 'Application not found.')
    await c.query(
      `INSERT INTO ${t.messages}(application_id,actor_id,from_staff,body) VALUES($1,$2,$3,$4)`,
      [id, actor, isStaff, text],
    )
    if (!isStaff && a.status === 'needs_information')
      await c.query(
        `UPDATE ${t.applications} SET status='reviewing',version=version+1,updated_at=now() WHERE id=$1`,
        [id],
      )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action) VALUES($1,$2,$3)`,
      [id, actor, isStaff ? 'message_to_applicant' : 'applicant_reply'],
    )
    return { saved: true }
  })
}
export const offerSchema = z
  .object({
    version: z.number().int().positive(),
    courseVersionId: z.uuid(),
    cohortId: z.uuid(),
    expiresAt: z.iso.datetime({ offset: true }),
    projectScope: z.string().trim().min(40).max(5000),
    acceptanceCriteria: z.string().trim().min(20).max(4000),
  })
  .strict()
export async function issueOffer(
  id: string,
  input: z.infer<typeof offerSchema>,
  actor: string,
) {
  return transaction(async (c) => {
    const t = tables(),
      a = (
        await c.query(
          `SELECT * FROM ${t.applications} WHERE id=$1 FOR UPDATE`,
          [id],
        )
      ).rows[0]
    if (
      !a ||
      a.kind !== 'executive' ||
      !['qualified', 'waitlisted'].includes(a.status)
    )
      throw new AdmissionError(
        422,
        'Qualify this individual project before issuing an offer.',
      )
    if (a.version !== input.version)
      throw new AdmissionError(
        409,
        'The application changed. Reload before issuing the offer.',
      )
    if (!a.sponsor_verified || a.data_approval !== 'approved')
      throw new AdmissionError(
        422,
        'Verify sponsorship and approved tools/data before issuing an offer.',
      )
    const course = (
      await c.query(`SELECT * FROM ${t.versions} WHERE id=$1 AND approved`, [
        input.courseVersionId,
      ])
    ).rows[0]
    if (!course)
      throw new AdmissionError(422, 'Select an approved course/terms version.')
    const cohort = (
      await c.query(
        `SELECT * FROM ${t.cohorts} WHERE id=$1 AND state='open' AND starts_at>now() AND deadline>now()`,
        [input.cohortId],
      )
    ).rows[0]
    if (!cohort)
      throw new AdmissionError(409, 'This cohort is not open for offers.')
    const expires = new Date(input.expiresAt)
    if (expires <= new Date() || expires > new Date(cohort.starts_at))
      throw new AdmissionError(
        422,
        'Offer expiry must be in the future and before training starts.',
      )
    const occupied = Number(
      (
        await c.query(
          `SELECT count(*) n FROM ${t.applications} a WHERE a.cohort_id=$1 AND a.id<>$2 AND (a.status IN ('accepted','enrolled') OR (a.status='offered' AND EXISTS(SELECT 1 FROM ${t.offers} o WHERE o.application_id=a.id AND o.state='issued' AND o.expires_at>now())))`,
          [cohort.id, id],
        )
      ).rows[0].n,
    )
    if (occupied >= cohort.capacity)
      throw new AdmissionError(
        409,
        'The cohort is full. Keep this application on the waitlist.',
      )
    const snapshot = {
      program: practicum.name,
      tuitionCAD: practicum.priceCAD,
      tax: 'Applicable tax additional; confirmed in the contract',
      courseVersion: course.version,
      course: course.content,
      cohort,
      projectScope: input.projectScope,
      acceptanceCriteria: input.acceptanceCriteria,
      participant: a.name,
      employer: a.employer,
      reference: a.reference,
    }
    await c.query(
      `UPDATE ${t.offers} SET state='superseded' WHERE application_id=$1 AND state='issued'`,
      [id],
    )
    const result = await c.query(
      `INSERT INTO ${t.offers}(application_id,course_version_id,snapshot,expires_at,created_by) VALUES($1,$2,$3,$4,$5) RETURNING id`,
      [id, course.id, JSON.stringify(snapshot), expires, actor],
    )
    await c.query(
      `UPDATE ${t.applications} SET status='offered',cohort_id=$1,version=version+1,updated_at=now() WHERE id=$2`,
      [cohort.id, id],
    )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,'offer_issued',$3)`,
      [
        id,
        actor,
        JSON.stringify({
          offerId: result.rows[0].id,
          courseVersion: course.version,
          expiresAt: input.expiresAt,
        }),
      ],
    )
    return result.rows[0]
  })
}
export async function decideOffer(
  id: string,
  offerId: string,
  decision: 'accepted' | 'declined',
  owner: string,
) {
  return transaction(async (c) => {
    const t = tables(),
      a = (
        await c.query(
          `SELECT * FROM ${t.applications} WHERE id=$1 AND owner_id=$2 FOR UPDATE`,
          [id, owner],
        )
      ).rows[0]
    if (!a || a.status !== 'offered')
      throw new AdmissionError(
        409,
        'There is no active offer available for a decision.',
      )
    const o = (
      await c.query(
        `SELECT * FROM ${t.offers} WHERE id=$1 AND application_id=$2 AND state='issued' AND expires_at>now()`,
        [offerId, id],
      )
    ).rows[0]
    if (!o)
      throw new AdmissionError(
        409,
        'This offer has expired or is no longer current. Contact admissions.',
      )
    const cohort = (
      await c.query(`SELECT * FROM ${t.cohorts} WHERE id=$1`, [a.cohort_id])
    ).rows[0]
    if (
      decision === 'accepted' &&
      (!cohort ||
        ['cancelled', 'completed', 'draft'].includes(cohort.state) ||
        new Date(cohort.starts_at) <= new Date())
    )
      throw new AdmissionError(
        409,
        'This cohort is no longer available. Contact admissions.',
      )
    await c.query(
      `UPDATE ${t.offers} SET state=$1,accepted_at=CASE WHEN $1='accepted' THEN now() END,accepted_by=$2 WHERE id=$3`,
      [decision, owner, offerId],
    )
    await c.query(
      `UPDATE ${t.applications} SET status=$1,version=version+1,updated_at=now() WHERE id=$2`,
      [decision === 'accepted' ? 'accepted' : 'withdrawn', id],
    )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,$3,$4)`,
      [
        id,
        owner,
        'offer_' + decision,
        JSON.stringify({ offerId, acknowledgedTerms: true }),
      ],
    )
    return { saved: true }
  })
}
export async function withdraw(id: string, owner: string) {
  return transaction(async (c) => {
    const t = tables()
    const result = await c.query(
      `UPDATE ${t.applications} SET status='withdrawn',version=version+1,updated_at=now() WHERE id=$1 AND owner_id=$2 RETURNING id`,
      [id, owner],
    )
    if (!result.rowCount)
      throw new AdmissionError(404, 'Application not found.')
    await c.query(
      `UPDATE ${t.offers} SET state='superseded' WHERE application_id=$1 AND state='issued'`,
      [id],
    )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action) VALUES($1,$2,'withdrawn')`,
      [id, owner],
    )
    return { saved: true }
  })
}

export function grantTriage(
  a: {
    intake: Record<string, unknown>
    sponsor_verified: boolean
    cohort_id: string | null
  },
  course: Record<string, unknown> | null,
) {
  const unresolved: string[] = []
  if (a.intake.employment !== 'employee')
    unresolved.push(
      a.intake.employment === 'owner_shareholder_board'
        ? 'Owner, shareholder or board member: ineligible trainee under CAPG. Private funding remains available.'
        : 'Confirm the trainee’s employment relationship and exclusions.',
    )
  if (a.intake.province !== 'AB')
    unresolved.push('Confirm Alberta location and training requirements.')
  if (!a.sponsor_verified)
    unresolved.push(
      'Verify the employer representative’s authority and financial commitment.',
    )
  if (!a.cohort_id)
    unresolved.push(
      'Confirm actual training dates, schedule and instructional hours.',
    )
  if (!course?.legalEntity)
    unresolved.push(
      'Confirm the contracting/training entity and provider details.',
    )
  if (course?.providerEligibility !== 'evidence_reviewed')
    unresolved.push(
      'Verify execom provider eligibility, including training as a main business activity.',
    )
  if (course?.courseEligibility !== 'evidence_reviewed')
    unresolved.push(
      'Verify course eligibility and separate instruction from implementation services.',
    )
  if (course?.trainingCostCAD === null || course?.trainingCostCAD === undefined)
    unresolved.push(
      'Confirm an itemized cost allocation; build services are not assumed eligible tuition.',
    )
  unresolved.push(
    'Employer must confirm trainee residency/status, family relationship exclusions, other assistance and current program requirements.',
    'Employer must submit through the official portal before training starts and retain the government receipt/decision.',
  )
  return {
    status:
      a.intake.employment === 'owner_shareholder_board'
        ? 'likely_ineligible'
        : 'requires_review',
    unresolved,
    source: practicum.grantSource,
    reviewedAt: practicum.grantReviewed,
    governmentPortal: 'https://capg.alberta.ca/',
    adapter: 'manual_employer_handoff',
    apiSubmissionSupported: false,
  }
}
export async function packageSnapshot(id: string, actor: string) {
  const t = tables(),
    a = (await db().query(`SELECT * FROM ${t.applications} WHERE id=$1`, [id]))
      .rows[0]
  if (!a) throw new AdmissionError(404, 'Application not found.')
  const offer = (
    await db().query(
      `SELECT course_version_id FROM ${t.offers} WHERE application_id=$1 AND state IN ('issued','accepted') ORDER BY created_at DESC LIMIT 1`,
      [id],
    )
  ).rows[0]
  const course = offer
    ? (
        await db().query(`SELECT * FROM ${t.versions} WHERE id=$1`, [
          offer.course_version_id,
        ])
      ).rows[0]
    : ((await courseVersions())[0] ?? null)
  const cohort = a.cohort_id
    ? (
        await db().query(`SELECT * FROM ${t.cohorts} WHERE id=$1`, [
          a.cohort_id,
        ])
      ).rows[0]
    : null
  // Only the deliberately shared sponsor brief is exported, never private intake answers or review notes.
  const snapshot = {
    reference: a.reference,
    participant: a.name,
    employer: a.employer,
    program: practicum,
    courseVersion: course?.version ?? null,
    course: course?.content ?? defaultCourse,
    cohort: cohort ?? null,
    sponsorBrief: a.sponsor_brief,
    triage: grantTriage(a, course?.content ?? null),
    generatedAt: new Date().toISOString(),
  }
  const result = await db().query(
    `INSERT INTO ${t.packages}(application_id,course_version_id,snapshot,created_by) VALUES($1,$2,$3,$4) RETURNING id`,
    [id, course?.id ?? null, JSON.stringify(snapshot), actor],
  )
  return { id: result.rows[0].id, ...snapshot }
}
export const grantReportSchema = z
  .object({
    status: z.enum([
      'preparing',
      'employer_reported_submitted',
      'employer_reported_approved',
      'employer_reported_declined',
      'staff_evidence_reviewed',
    ]),
    evidenceReference: z.string().trim().max(1500),
    notes: z.string().trim().max(3000),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.status !== 'preparing' && v.evidenceReference.length < 8)
      c.addIssue({
        code: 'custom',
        message:
          'A reported government status needs a dated receipt or decision reference.',
      })
  })
export async function reportGrant(
  id: string,
  input: z.infer<typeof grantReportSchema>,
  actor: string,
  isStaff: boolean,
) {
  if (input.status === 'staff_evidence_reviewed' && !isStaff)
    throw new AdmissionError(403, 'Only staff can record an evidence review.')
  return transaction(async (c) => {
    const t = tables()
    await c.query(
      `INSERT INTO ${t.grants}(application_id,status,evidence_reference,notes,reported_by) VALUES($1,$2,$3,$4,$5) ON CONFLICT(application_id) DO UPDATE SET status=$2,evidence_reference=$3,notes=$4,reported_by=$5,updated_at=now()`,
      [id, input.status, input.evidenceReference, input.notes, actor],
    )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,'grant_status_reported',$3)`,
      [
        id,
        actor,
        JSON.stringify({
          ...input,
          provenance: isStaff ? 'staff_record' : 'employer_report',
          governmentApiVerified: false,
        }),
      ],
    )
    return { saved: true }
  })
}
