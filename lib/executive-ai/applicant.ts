import 'server-only'
import { randomBytes, randomUUID } from 'node:crypto'
import { db, tables, AdmissionError } from './db'
import { digest, transaction } from './service'

export async function applicantHome(owner: string, email = '') {
  const t = tables()
  const [drafts, applications, nominations, invitations, sponsorships] =
    await Promise.all([
      db().query(
        `SELECT id,kind,answers,updated_at FROM ${t.drafts} WHERE owner_id=$1 AND application_id IS NULL ORDER BY updated_at DESC`,
        [owner],
      ),
      db().query(
        `SELECT id,reference,kind,name,employer,status,cohort_id,created_at,updated_at,sponsor_response->>'decision' AS sponsor_decision FROM ${t.applications} WHERE owner_id=$1 ORDER BY created_at DESC`,
        [owner],
      ),
      db().query(
        `SELECT n.id,n.employer_application_id,n.name,n.email,n.claimed_by IS NOT NULL AS claimed,n.application_id IS NOT NULL AS applied FROM ${t.nominations} n JOIN ${t.applications} a ON a.id=n.employer_application_id WHERE a.owner_id=$1 ORDER BY n.created_at`,
        [owner],
      ),
      db().query(
        `SELECT n.id,n.name,a.employer FROM ${t.nominations} n JOIN ${t.applications} a ON a.id=n.employer_application_id WHERE lower(n.email)=$1 AND n.claimed_by IS NULL AND n.expires_at>now() AND a.status NOT IN ('withdrawn','declined')`,
        [email.toLowerCase()],
      ),
      db().query(
        `SELECT id,reference,name,employer,status FROM ${t.applications} WHERE owner_id<>$1 AND sponsor_verified AND sponsor_shared_at IS NOT NULL AND sponsor_brief->>'email'=$2 AND sponsor_response->>'decision'='confirmed' ORDER BY updated_at DESC`,
        [owner, email.toLowerCase()],
      ),
    ])
  return {
    sponsorships: sponsorships.rows,
    drafts: drafts.rows,
    applications: applications.rows,
    nominations: nominations.rows,
    invitations: invitations.rows,
  }
}
export async function saveDraft(
  id: string,
  kind: string,
  answers: Record<string, unknown>,
  owner: string,
) {
  const t = tables()
  const result = await db().query(
    `INSERT INTO ${t.drafts}(id,owner_id,kind,answers) VALUES($1,$2,$3,$4)
    ON CONFLICT(id) DO UPDATE SET answers=$4,updated_at=now() WHERE ${t.drafts}.owner_id=$2 AND ${t.drafts}.kind=$3 AND ${t.drafts}.application_id IS NULL RETURNING updated_at`,
    [id, owner, kind, JSON.stringify(answers)],
  )
  if (!result.rowCount)
    throw new AdmissionError(
      409,
      'This draft is unavailable or has already been submitted. Reload your applications.',
    )
  return { savedAt: result.rows[0].updated_at }
}
export async function nominate(
  applicationId: string,
  input: { name: string; email: string },
  owner: string,
) {
  const t = tables(),
    token = randomBytes(32).toString('hex')
  return transaction(async (c) => {
    const a = (
      await c.query(
        `SELECT id FROM ${t.applications} WHERE id=$1 AND owner_id=$2 AND kind='employer' AND status NOT IN ('withdrawn','declined')`,
        [applicationId, owner],
      )
    ).rows[0]
    if (!a) throw new AdmissionError(404, 'Employer enquiry not found.')
    const count = Number(
      (
        await c.query(
          `SELECT count(*) n FROM ${t.nominations} WHERE employer_application_id=$1`,
          [applicationId],
        )
      ).rows[0].n,
    )
    if (count >= 30)
      throw new AdmissionError(
        422,
        'Contact admissions to nominate more than 30 participants.',
      )
    const result = await c.query(
      `INSERT INTO ${t.nominations}(employer_application_id,name,email,token_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '30 days')
    ON CONFLICT(employer_application_id,email) DO UPDATE SET token_hash=$4,expires_at=now()+interval '30 days' WHERE ${t.nominations}.claimed_by IS NULL RETURNING id`,
      [applicationId, input.name, input.email, digest(token)],
    )
    if (!result.rowCount)
      throw new AdmissionError(
        409,
        'This nominee has already claimed their invitation.',
      )
    await c.query(
      `INSERT INTO ${t.audit}(application_id,actor_id,action,detail) VALUES($1,$2,'nomination_requested',$3)`,
      [
        applicationId,
        owner,
        JSON.stringify({
          nominationId: result.rows[0].id,
          permissionConfirmed: true,
        }),
      ],
    )
    return { token }
  })
}
export async function claimNomination(
  token: string,
  user: { id: string; email: string },
  byId = false,
) {
  const t = tables()
  return transaction(async (c) => {
    const n = (
      await c.query(
        `SELECT n.*,a.employer FROM ${t.nominations} n JOIN ${t.applications} a ON a.id=n.employer_application_id WHERE ${byId ? 'n.id' : 'n.token_hash'}=$1 AND lower(n.email)=$2 AND expires_at>now() AND a.status NOT IN ('withdrawn','declined') AND (claimed_by IS NULL OR claimed_by=$3)`,
        [byId ? token : digest(token), user.email.toLowerCase(), user.id],
      )
    ).rows[0]
    if (!n)
      throw new AdmissionError(
        404,
        'This invitation is invalid, expired, or addressed to a different verified email.',
      )
    const draftId = n.draft_id || randomUUID()
    if (!n.draft_id)
      await c.query(
        `INSERT INTO ${t.drafts}(id,owner_id,kind,answers) VALUES($1,$2,'executive',$3)`,
        [
          draftId,
          user.id,
          JSON.stringify({
            name: n.name,
            email: user.email,
            employer: n.employer,
          }),
        ],
      )
    await c.query(
      `UPDATE ${t.nominations} SET claimed_by=$1,draft_id=$2 WHERE id=$3`,
      [user.id, draftId, n.id],
    )
    return { claimed: true, draftId }
  })
}
