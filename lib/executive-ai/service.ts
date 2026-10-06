import 'server-only'
import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import type { PoolClient } from 'pg'
import type { z } from 'zod'
import { db, tables, schemaName, AdmissionError } from './db'
import { practicum, transitions, type Stage } from './config'
import type {
  Intake,
  cohortSchema,
  reviewSchema,
  sponsorSchema,
} from './validation'
import { peakConcurrent } from './capacity'

export interface Cohort {
  id: string
  name: string
  location: string
  starts_at: string | null
  ends_at: string | null
  deadline: string | null
  capacity: number
  state: string
  schedule: string
  instructional_hours: number | null
  occupied: number
  available: number
  version: number
}
export const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex')
function receiptToken(requestId: string) {
  if (!process.env.BETTER_AUTH_SECRET)
    throw new Error('Missing application security configuration')
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET)
    .update(`practicum:${schemaName()}:${requestId}`)
    .digest('hex')
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await db().connect()
  try {
    await client.query('BEGIN')
    // Serialize admissions decisions and cohort edits across all server instances.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      schemaName(),
    ])
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
export async function rateLimit(key: string, max = 8) {
  const t = tables()
  const { rows } = await db().query(
    `INSERT INTO ${t.rates}(key,count,expires_at) VALUES($1,1,now()+interval '1 hour')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN ${t.rates}.expires_at<now() THEN 1 ELSE ${t.rates}.count+1 END,
    expires_at=CASE WHEN ${t.rates}.expires_at<now() THEN now()+interval '1 hour' ELSE ${t.rates}.expires_at END RETURNING count`,
    [digest(key)],
  )
  if (rows[0].count > max)
    throw new AdmissionError(
      429,
      'Too many attempts. Please try again in an hour.',
    )
}
export async function cohorts(includePrivate = false): Promise<Cohort[]> {
  const t = tables()
  const { rows } = await db().query(`SELECT c.*, count(a.id)::int AS occupied,
    greatest(0,c.capacity-count(a.id)::int) AS available FROM ${t.cohorts} c
    LEFT JOIN ${t.applications} a ON a.cohort_id=c.id AND (a.status IN ('accepted','enrolled') OR (a.status='offered' AND EXISTS(SELECT 1 FROM ${t.offers} o WHERE o.application_id=a.id AND o.state='issued' AND o.expires_at>now())))
    ${includePrivate ? '' : "WHERE c.state='open' AND c.starts_at>now() AND c.deadline>now()"}
    GROUP BY c.id ORDER BY c.starts_at NULLS LAST,c.created_at`)
  return rows
}
export async function submitIntake(input: Intake, ownerId: string) {
  const t = tables(),
    hash = digest(JSON.stringify(input)),
    token = receiptToken(input.requestId)
  return transaction(async (client) => {
    const previous = (
      await client.query(
        `SELECT id,reference,request_hash,owner_id FROM ${t.applications} WHERE request_id=$1`,
        [input.requestId],
      )
    ).rows[0]
    if (previous) {
      if (previous.owner_id !== ownerId)
        throw new AdmissionError(
          403,
          'This application is not available to this account.',
        )
      if (previous.request_hash !== hash)
        throw new AdmissionError(
          409,
          'This submission has already been saved with different answers. Start a new application to change them.',
        )
      return { reference: previous.reference, applicationId: previous.id }
    }
    const draft = (
      await client.query(`SELECT owner_id FROM ${t.drafts} WHERE id=$1`, [
        input.requestId,
      ])
    ).rows[0]
    if (draft && draft.owner_id !== ownerId)
      throw new AdmissionError(
        403,
        'This draft is not available to this account.',
      )
    if (input.cohortId) {
      const c = (
        await client.query(
          `SELECT id FROM ${t.cohorts} WHERE id=$1 AND state='open' AND starts_at>now() AND deadline>now()`,
          [input.cohortId],
        )
      ).rows[0]
      if (!c)
        throw new AdmissionError(
          409,
          'That cohort is no longer accepting applications. Choose future cohort interest instead.',
        )
    }
    const reference = 'EAI-' + randomBytes(6).toString('hex').toUpperCase()
    const { rows } = await client.query(
      `INSERT INTO ${t.applications}
      (reference,request_id,request_hash,kind,name,email,employer,intake,cohort_id,data_approval,sponsor_token_hash,sponsor_expires_at,consent_version,owner_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now()+interval '30 days',$12,$13) RETURNING id`,
      [
        reference,
        input.requestId,
        hash,
        input.kind,
        input.name,
        input.email,
        input.employer,
        JSON.stringify(input),
        input.cohortId,
        input.dataApproval,
        digest(token),
        practicum.consentVersion,
        ownerId,
      ],
    )
    await client.query(
      `UPDATE ${t.drafts} SET application_id=$1,updated_at=now() WHERE id=$2 AND owner_id=$3`,
      [rows[0].id, input.requestId, ownerId],
    )
    if (input.kind === 'executive')
      await client.query(
        `UPDATE ${t.nominations} SET application_id=$1 WHERE claimed_by=$2 AND draft_id=$3 AND application_id IS NULL`,
        [rows[0].id, ownerId, input.requestId],
      )
    await client.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,'applicant','submitted',$2)`,
      [
        rows[0].id,
        JSON.stringify({
          kind: input.kind,
          consentVersion: practicum.consentVersion,
        }),
      ],
    )
    return { reference, applicationId: rows[0].id }
  })
}
export async function sponsorLookup(token: string) {
  const t = tables()
  const { rows } = await db().query(
    `SELECT reference,name,employer,sponsor_brief,sponsor_response IS NOT NULL AS responded FROM ${t.applications}
    WHERE sponsor_token_hash=$1 AND sponsor_expires_at>now() AND sponsor_shared_at IS NOT NULL AND kind='executive' AND status NOT IN ('withdrawn','declined')`,
    [digest(token)],
  )
  if (!rows.length)
    throw new AdmissionError(
      404,
      'This sponsorship link is invalid or expired. Ask the applicant or admissions for a new link.',
    )
  return rows[0]
}
export async function respondSponsor(input: z.infer<typeof sponsorSchema>) {
  const t = tables()
  return transaction(async (client) => {
    const a = (
      await client.query(
        `SELECT * FROM ${t.applications} WHERE sponsor_token_hash=$1 AND sponsor_expires_at>now() AND sponsor_shared_at IS NOT NULL AND kind='executive'`,
        [digest(input.token)],
      )
    ).rows[0]
    if (
      !a ||
      ['withdrawn', 'declined', 'accepted', 'enrolled'].includes(a.status)
    )
      throw new AdmissionError(
        404,
        'This sponsorship link is no longer available.',
      )
    if (a.sponsor_response)
      throw new AdmissionError(
        409,
        'A sponsorship response is already saved. Contact admissions if it needs to change.',
      )
    if (a.sponsor_brief?.email && input.email !== a.sponsor_brief.email)
      throw new AdmissionError(
        403,
        'Use the sponsor email nominated in the application, or ask the applicant to update the sponsor.',
      )
    const { token: _, ...response } = input
    await client.query(
      `UPDATE ${t.applications} SET sponsor_response=$1,version=version+1,updated_at=now() WHERE id=$2`,
      [
        JSON.stringify({ ...response, receivedAt: new Date().toISOString() }),
        a.id,
      ],
    )
    await client.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,'sponsor','sponsor_response',$2)`,
      [a.id, JSON.stringify({ decision: input.decision })],
    )
    return { reference: a.reference }
  })
}
export async function admissionsList(status?: string, query?: string) {
  const t = tables()
  const { rows } = await db().query(
    `SELECT id,reference,kind,name,email,employer,status,cohort_id,sponsor_verified,data_approval,created_at,version,
    intake->>'grantInterest' AS grant_interest,intake->>'seats' AS requested_seats,sponsor_response->>'decision' AS sponsor_decision
    FROM ${t.applications} WHERE ($1::text IS NULL OR status=$1) AND ($2::text IS NULL OR concat_ws(' ',name,email,employer,reference) ILIKE $2)
    ORDER BY created_at DESC LIMIT 200`,
    [
      status || null,
      query
        ? `%${query.slice(0, 120).replaceAll('%', '').replaceAll('_', '')}%`
        : null,
    ],
  )
  return rows
}
export async function application(id: string) {
  const t = tables()
  const { rows } = await db().query(
    `SELECT id,reference,kind,name,email,employer,intake,status,cohort_id,sponsor_verified,data_approval,sponsor_response,sponsor_brief,sponsor_shared_at,consent_version,consent_at,version,created_at,updated_at FROM ${t.applications} WHERE id=$1`,
    [id],
  )
  if (!rows.length) throw new AdmissionError(404, 'Application not found.')
  const audit = await db().query(
    `SELECT actor_id,action,detail,created_at FROM ${t.audit} WHERE application_id=$1 ORDER BY id DESC`,
    [id],
  )
  return { ...rows[0], audit: audit.rows }
}
export async function review(
  id: string,
  input: z.infer<typeof reviewSchema>,
  actor: string,
) {
  const t = tables()
  return transaction(async (client) => {
    const a = (
      await client.query(
        `SELECT * FROM ${t.applications} WHERE id=$1 FOR UPDATE`,
        [id],
      )
    ).rows[0]
    if (!a) throw new AdmissionError(404, 'Application not found.')
    if (a.version !== input.version)
      throw new AdmissionError(
        409,
        'This application changed. Reload before saving your decision.',
      )
    if (
      ['offered', 'accepted', 'enrolled'].includes(a.status) &&
      ['offered', 'accepted', 'enrolled'].includes(input.status) &&
      (input.cohortId !== a.cohort_id ||
        !input.sponsorVerified ||
        input.dataApproval !== 'approved')
    )
      throw new AdmissionError(
        409,
        'An active offer or admission cannot be silently moved or lose its approvals. Withdraw or supersede the offer before changing its terms.',
      )
    if (
      a.status !== input.status &&
      !transitions[a.status as Stage].includes(input.status)
    )
      throw new AdmissionError(409, 'This status transition is not allowed.')
    if (input.status === 'offered' && a.status !== 'offered')
      throw new AdmissionError(
        422,
        'Issue a documented offer to enter this status.',
      )
    if (input.status === 'accepted' && a.status !== 'accepted')
      throw new AdmissionError(
        422,
        'The applicant must accept their documented offer.',
      )
    if (['accepted', 'enrolled'].includes(input.status)) {
      if (a.kind !== 'executive')
        throw new AdmissionError(
          422,
          'Employer enquiries do not reserve seats. Each participant needs an executive application.',
        )
      if (
        !input.sponsorVerified ||
        input.dataApproval !== 'approved' ||
        !input.cohortId
      )
        throw new AdmissionError(
          422,
          'Acceptance requires verified sponsorship, approved tools and data, and a cohort.',
        )
      const c = (
        await client.query(
          `SELECT * FROM ${t.cohorts} WHERE id=$1 FOR UPDATE`,
          [input.cohortId],
        )
      ).rows[0]
      const alreadyHolding =
        a.cohort_id === input.cohortId &&
        ['accepted', 'enrolled'].includes(a.status)
      if (
        !c ||
        (!alreadyHolding &&
          (c.state !== 'open' ||
            new Date(c.starts_at) <= new Date() ||
            new Date(c.deadline) <= new Date()))
      )
        throw new AdmissionError(
          409,
          'This cohort is not available for a new admission.',
        )
      if (['cancelled', 'completed'].includes(c.state))
        throw new AdmissionError(
          409,
          'This cohort no longer accepts admission changes.',
        )
      const occupied = Number(
        (
          await client.query(
            `SELECT count(*) AS n FROM ${t.applications} a WHERE cohort_id=$1 AND id<>$2 AND (status IN ('accepted','enrolled') OR (status='offered' AND EXISTS(SELECT 1 FROM ${t.offers} o WHERE o.application_id=a.id AND o.state='issued' AND o.expires_at>now())))`,
            [input.cohortId, id],
          )
        ).rows[0].n,
      )
      if (occupied >= c.capacity)
        throw new AdmissionError(
          409,
          'The cohort is full. Put this application on the waitlist or choose another cohort.',
        )
    }
    if (
      input.cohortId &&
      !(
        await client.query(`SELECT id FROM ${t.cohorts} WHERE id=$1`, [
          input.cohortId,
        ])
      ).rowCount
    )
      throw new AdmissionError(422, 'Cohort not found.')
    await client.query(
      `UPDATE ${t.applications} SET status=$1,cohort_id=$2,sponsor_verified=$3,data_approval=$4,version=version+1,updated_at=now() WHERE id=$5`,
      [
        input.status,
        input.cohortId,
        input.sponsorVerified,
        input.dataApproval,
        id,
      ],
    )
    if (a.status === 'offered' && input.status !== 'offered')
      await client.query(
        `UPDATE ${t.offers} SET state='superseded' WHERE application_id=$1 AND state='issued'`,
        [id],
      )
    await client.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,'reviewed',$3)`,
      [
        id,
        actor,
        JSON.stringify({
          from: a.status,
          to: input.status,
          cohortId: input.cohortId,
          note: input.note,
          sponsorVerified: input.sponsorVerified,
          dataApproval: input.dataApproval,
        }),
      ],
    )
    return { saved: true }
  })
}
export async function saveCohort(
  input: z.infer<typeof cohortSchema>,
  actor: string,
) {
  const t = tables()
  return transaction(async (client) => {
    const id = input.id ?? randomUUID()
    if (input.state === 'open' && input.startsAt && input.endsAt) {
      const scheduled = (
        await client.query(
          `SELECT starts_at,ends_at FROM ${t.cohorts} WHERE id<>$1 AND state IN ('open','closed') AND ends_at>now()`,
          [id],
        )
      ).rows
      const limit = (
        await client.query(
          `SELECT max_active_cohorts FROM ${t.settings} WHERE id=true`,
        )
      ).rows[0].max_active_cohorts
      if (
        peakConcurrent([
          ...scheduled,
          { starts_at: input.startsAt, ends_at: input.endsAt },
        ]) > limit
      )
        throw new AdmissionError(
          409,
          'These dates exceed the operator’s active-cohort limit. Change the dates or update the planning limit.',
        )
    }
    if (input.id) {
      const previous = (
        await client.query(`SELECT * FROM ${t.cohorts} WHERE id=$1`, [id])
      ).rows[0]
      if (!previous) throw new AdmissionError(404, 'Cohort not found.')
      if (previous.version !== input.version)
        throw new AdmissionError(
          409,
          'This cohort changed. Reload before saving.',
        )
      const n = Number(
        (
          await client.query(
            `SELECT count(*) n FROM ${t.applications} a WHERE cohort_id=$1 AND (status IN ('accepted','enrolled') OR (status='offered' AND EXISTS(SELECT 1 FROM ${t.offers} o WHERE o.application_id=a.id AND o.state='issued' AND o.expires_at>now())))`,
            [id],
          )
        ).rows[0].n,
      )
      if (n > input.capacity)
        throw new AdmissionError(
          409,
          'Capacity cannot be lower than accepted and enrolled seats.',
        )
      if (
        n &&
        (new Date(previous.starts_at).getTime() !==
          new Date(input.startsAt!).getTime() ||
          new Date(previous.ends_at).getTime() !==
            new Date(input.endsAt!).getTime() ||
          previous.location !== input.location ||
          previous.schedule !== input.schedule ||
          Number(previous.instructional_hours) !== input.instructionalHours)
      )
        throw new AdmissionError(
          409,
          'A cohort with allocated places cannot silently change its schedule, hours or location. Resolve the offers/admissions before changing delivery terms.',
        )
      if (n && ['draft', 'cancelled'].includes(input.state))
        throw new AdmissionError(
          409,
          'Resolve admitted participants before cancelling or unpublishing a cohort.',
        )
    }
    await client.query(
      `INSERT INTO ${t.cohorts}(id,name,location,starts_at,ends_at,deadline,capacity,state,schedule,instructional_hours)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET name=$2,location=$3,starts_at=$4,ends_at=$5,deadline=$6,capacity=$7,state=$8,schedule=$9,instructional_hours=$10,version=${t.cohorts}.version+1,updated_at=now()`,
      [
        id,
        input.name,
        input.location,
        input.startsAt,
        input.endsAt,
        input.deadline,
        input.capacity,
        input.state,
        input.schedule,
        input.instructionalHours,
      ],
    )
    await client.query(
      `INSERT INTO ${t.audit}(cohort_id,actor_id,action,detail) VALUES($1,$2,'cohort_saved',$3)`,
      [id, actor, JSON.stringify(input)],
    )
    return { id }
  })
}
export async function renewSponsor(id: string, actor: string) {
  const t = tables(),
    token = randomBytes(32).toString('hex')
  return transaction(async (client) => {
    const a = (
      await client.query(
        `SELECT status,kind FROM ${t.applications} WHERE id=$1`,
        [id],
      )
    ).rows[0]
    if (
      !a ||
      a.kind !== 'executive' ||
      ['offered', 'accepted', 'enrolled', 'withdrawn', 'declined'].includes(
        a.status,
      )
    )
      throw new AdmissionError(
        409,
        'Sponsorship cannot be reopened in this state.',
      )
    await client.query(
      `UPDATE ${t.applications} SET sponsor_token_hash=$1,sponsor_expires_at=now()+interval '30 days',sponsor_response=NULL,sponsor_verified=false,version=version+1,updated_at=now() WHERE id=$2`,
      [digest(token), id],
    )
    await client.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action) VALUES($1,$2,'sponsor_link_renewed')`,
      [id, actor],
    )
    return { sponsorToken: token }
  })
}
