import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from 'vitest'
import { Pool } from 'pg'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
vi.mock('@/lib/neon/auth-server', () => ({
  getPortalPool: () => testPool,
  getPortalUser: async (h: Headers) => {
    const id = h.get('test-user')
    return id
      ? { id, email: 'verified@example.invalid', emailVerified: true }
      : null
  },
}))
import { intakeSchema, cohortSchema } from './validation'
import {
  submitIntake,
  cohorts,
  saveCohort,
  review,
  respondSponsor,
  sponsorLookup,
  rateLimit,
  application,
} from './service'
import {
  saveDraft,
  applicantHome,
  nominate,
  claimNomination,
} from './applicant'
import {
  requestSponsorship,
  applicantDetail,
  issueOffer,
  decideOffer,
  withdraw,
  saveCourse,
  defaultCourse,
  packageSnapshot,
  grantTriage,
  reportGrant,
  addMessage,
} from './workflows'
import { body, staff, endpoint, json } from './http'
import { schemaName } from './db'
import { programDocument, grantDocument } from './documents'
let testPool: Pool
const owner = randomUUID(),
  other = randomUUID(),
  hr = randomUUID(),
  admin = randomUUID()
const ownerUser = { id: owner, email: 'executive@example.invalid' },
  otherUser = { id: other, email: 'other@example.invalid' }
const input = (changes: Record<string, unknown> = {}) =>
  intakeSchema.parse({
    requestId: randomUUID(),
    kind: 'executive',
    name: 'Verification Executive',
    email: ownerUser.email,
    title: 'Operations lead',
    employer: 'Verification Company',
    province: 'AB',
    process:
      'The recurring weekly project briefing takes four hours to assemble.',
    outcome:
      'Produce a reviewed, traceable briefing with agreed baseline measures.',
    tools: 'Approved exports only',
    dataApproval: 'pending',
    employment: 'employee',
    grantInterest: true,
    seats: 1,
    consent: true,
    ...changes,
  })
const cohort = (changes: Record<string, unknown> = {}) =>
  cohortSchema.parse({
    name: 'Verification cohort',
    location: 'Calgary',
    startsAt: '2098-01-10T16:00:00Z',
    endsAt: '2098-03-20T17:00:00Z',
    deadline: '2098-01-01T00:00:00Z',
    capacity: 1,
    state: 'open',
    schedule: 'Ten weekly sessions each Wednesday at 9 AM America/Edmonton.',
    instructionalHours: 10,
    ...changes,
  })
async function qualify(id: string) {
  await review(
    id,
    {
      version: 1,
      status: 'reviewing',
      cohortId: null,
      note: 'Initial project review recorded.',
      dataApproval: 'approved',
      sponsorVerified: true,
    },
    admin,
  )
  await review(
    id,
    {
      version: 2,
      status: 'qualified',
      cohortId: null,
      note: 'Qualified project and employer permissions.',
      dataApproval: 'approved',
      sponsorVerified: true,
    },
    admin,
  )
}
async function offerSetup() {
  const c = await saveCohort(cohort(), admin)
  const v = await saveCourse(
    {
      ...defaultCourse,
      legalEntity: 'Verification Training Inc.',
      providerAddress: 'Calgary, AB',
      buildAllowance: 'Ten provider hours for a bounded prototype.',
      softwareAndIntegrations:
        'Employer provides approved licenses and exports.',
      terms:
        'Verification-only commercial terms with payment, cancellation and acceptance provisions.',
      approved: true,
    },
    admin,
  )
  return { c, v }
}
describe.skipIf(!process.env.PRACTICUM_TEST_DATABASE_URL)(
  'Practicum against isolated PostgreSQL',
  () => {
    beforeAll(async () => {
      const url = new URL(process.env.PRACTICUM_TEST_DATABASE_URL!)
      if (
        !['127.0.0.1', 'localhost'].includes(url.hostname) ||
        url.pathname !== '/eai_test'
      )
        throw new Error('Only local eai_test is allowed')
      process.env.PRACTICUM_SCHEMA = 'executive_ai_preview'
      process.env.BETTER_AUTH_SECRET = 'synthetic-test-secret-only'
      testPool = new Pool({ connectionString: url.toString(), max: 8 })
      await testPool.query(
        'CREATE TABLE IF NOT EXISTS public.profiles(id uuid PRIMARY KEY,is_execom_staff boolean NOT NULL DEFAULT false)',
      )
      await testPool.query(
        'INSERT INTO public.profiles VALUES($1,false),($2,false),($3,false),($4,true) ON CONFLICT DO NOTHING',
        [owner, other, hr, admin],
      )
      await testPool.query('DROP SCHEMA IF EXISTS executive_ai_preview CASCADE')
      await testPool.query(
        readFileSync('029_executive_ai_practicum.sql', 'utf8').replaceAll(
          'executive_ai',
          'executive_ai_preview',
        ),
      )
    })
    beforeEach(async () => {
      await testPool.query(
        'TRUNCATE executive_ai_preview.applications,executive_ai_preview.cohorts,executive_ai_preview.course_versions,executive_ai_preview.prospects,executive_ai_preview.rate_limits RESTART IDENTITY CASCADE',
      )
      await testPool.query(
        'UPDATE executive_ai_preview.settings SET max_active_cohorts=1',
      )
    })
    afterAll(async () => {
      await testPool.query('DROP SCHEMA executive_ai_preview CASCADE')
      await testPool.end()
    })
    it('initializes one explicitly unapproved course draft without inventing launch details', async () => {
      for (let pass = 0; pass < 2; pass++) {
        for (const migration of [
          '030_executive_ai_nomination_drafts.sql',
          '031_executive_ai_initial_course.sql',
        ]) {
          await testPool.query(
            readFileSync(migration, 'utf8').replaceAll(
              'executive_ai',
              'executive_ai_preview',
            ),
          )
        }
      }
      const { rows } = await testPool.query(
        'SELECT * FROM executive_ai_preview.course_versions',
      )
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({
        approved: false,
        content: {
          legalEntity: '',
          providerEligibility: 'unresolved',
          courseEligibility: 'unresolved',
          trainingCostCAD: null,
        },
      })
      expect(await cohorts()).toEqual([])
    })
    it('rejects missing consent, honeypots, oversized fields and seven-seat cohorts', () => {
      expect(() => input({ consent: false })).toThrow()
      expect(() => input({ website: 'bot' })).toThrow()
      expect(() => input({ process: 'x'.repeat(4001) })).toThrow()
      expect(() => cohort({ capacity: 7 })).toThrow()
      expect(() => cohort({ startsAt: null })).toThrow()
    })
    it('saves incomplete drafts durably and denies another account overwriting them', async () => {
      const id = randomUUID()
      await saveDraft(id, 'executive', { process: 'unfinished' }, owner)
      expect((await applicantHome(owner)).drafts[0].answers.process).toBe(
        'unfinished',
      )
      expect((await applicantHome(other)).drafts).toEqual([])
      await expect(
        saveDraft(id, 'executive', { process: 'attacker' }, other),
      ).rejects.toMatchObject({ status: 409 })
    })
    it('submits atomically, deduplicates retries and protects request IDs', async () => {
      const v = input()
      await saveDraft(v.requestId, 'executive', v, owner)
      const [a, b] = await Promise.all([
        submitIntake(v, owner),
        submitIntake(v, owner),
      ])
      expect(a.applicationId).toBe(b.applicationId)
      expect((await applicantHome(owner)).drafts).toHaveLength(0)
      expect((await applicantHome(owner)).applications).toHaveLength(1)
      await expect(
        submitIntake({ ...v, notes: 'changed' }, owner),
      ).rejects.toMatchObject({ status: 409 })
      await expect(submitIntake(v, other)).rejects.toMatchObject({
        status: 403,
      })
    })
    it('shares only a deliberately released sponsor brief and requires nominated email', async () => {
      const a = await submitIntake(
        input({ notes: 'Private sensitive intake note' }),
        owner,
      )
      const s = await requestSponsorship(
        a.applicationId,
        {
          name: 'Sponsor Person',
          email: 'sponsor@example.invalid',
          summary: 'Approved shared project description only.',
          outcome: 'Approved shared outcome description only.',
          permission: true,
        },
        ownerUser,
      )
      const lookup = await sponsorLookup(s.sponsorToken)
      expect(JSON.stringify(lookup)).not.toContain('Private sensitive')
      await expect(
        respondSponsor({
          token: s.sponsorToken,
          name: 'Spoofed sponsor',
          email: 'wrong@example.invalid',
          title: 'Director',
          employer: 'Verification Company',
          decision: 'confirmed',
          funding: 'employer',
          dataApproval: 'approved',
          notes: '',
          authorized: true,
          consent: true,
        }),
      ).rejects.toMatchObject({ status: 403 })
      await respondSponsor({
        token: s.sponsorToken,
        name: 'Real Sponsor',
        email: 'sponsor@example.invalid',
        title: 'Director',
        employer: 'Verification Company',
        decision: 'confirmed',
        funding: 'employer',
        dataApproval: 'approved',
        notes: '',
        authorized: true,
        consent: true,
      })
      expect((await application(a.applicationId)).sponsor_verified).toBe(false)
      expect(
        (await applicantHome(other, 'sponsor@example.invalid')).sponsorships,
      ).toEqual([])
      await expect(
        applicantDetail(a.applicationId, {
          id: other,
          email: 'sponsor@example.invalid',
        }),
      ).rejects.toMatchObject({ status: 404 })
      const before = await application(a.applicationId)
      await review(
        a.applicationId,
        {
          version: before.version,
          status: 'reviewing',
          cohortId: null,
          sponsorVerified: true,
          dataApproval: 'approved',
          note: 'Sponsor authority verified for this test.',
        },
        admin,
      )
      const home = await applicantHome(other, 'sponsor@example.invalid')
      expect(home.sponsorships.map((s) => s.id)).toEqual([a.applicationId])
      expect(JSON.stringify(home.sponsorships)).not.toContain(
        'Private sensitive',
      )
      expect(
        (
          await applicantDetail(a.applicationId, {
            id: other,
            email: 'sponsor@example.invalid',
          })
        ).intake,
      ).toBeUndefined()
    })
    it('isolates nomination progress and individual applications', async () => {
      const a = await submitIntake(
        input({ kind: 'employer', email: 'hr@example.invalid', seats: 3 }),
        hr,
      )
      const invite = await nominate(
        a.applicationId,
        { name: 'Nominee', email: ownerUser.email },
        hr,
      )
      await expect(
        claimNomination(invite.token, otherUser),
      ).rejects.toMatchObject({ status: 404 })
      const claimed = await claimNomination(invite.token, ownerUser)
      await submitIntake(input({ requestId: claimed.draftId }), owner)
      const home = await applicantHome(hr)
      expect(home.nominations[0]).toMatchObject({
        claimed: true,
        applied: true,
      })
      expect(JSON.stringify(home)).not.toContain('weekly project briefing')
      expect(home.applications).toHaveLength(1)
    })
    it('keeps admin API authorization independent of page layouts and enforces origin checks', async () => {
      await expect(
        staff(new Request('https://example.test')),
      ).rejects.toMatchObject({ status: 401 })
      await expect(
        staff(
          new Request('https://example.test', {
            headers: { 'test-user': owner },
          }),
        ),
      ).rejects.toMatchObject({ status: 403 })
      expect(
        await staff(
          new Request('https://example.test', {
            headers: { 'test-user': admin },
          }),
        ),
      ).toBe(admin)
      await expect(
        body(
          new Request('https://example.test/api', {
            method: 'POST',
            headers: {
              origin: 'https://evil.test',
              'content-type': 'application/json',
            },
            body: JSON.stringify(input()),
          }),
          intakeSchema,
        ),
      ).rejects.toMatchObject({ status: 403 })
      const response = await endpoint(async () => json({ ok: true }))
      expect(response.headers.get('cache-control')).toContain('no-store')
    })
    it('serializes competing offers so the final place cannot be oversold', async () => {
      const { c, v } = await offerSetup(),
        a = await submitIntake(input(), owner),
        b = await submitIntake(input({ email: otherUser.email }), other)
      await qualify(a.applicationId)
      await qualify(b.applicationId)
      const offer = {
        version: 3,
        courseVersionId: v.id,
        cohortId: c.id,
        expiresAt: '2097-12-25T00:00:00Z',
        projectScope:
          'A bounded project briefing with approved exported data and human review.',
        acceptanceCriteria:
          'Sponsor confirms a traceable review pack and measures the baseline.',
      }
      const results = await Promise.allSettled([
        issueOffer(a.applicationId, offer, admin),
        issueOffer(b.applicationId, offer, admin),
      ])
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
      expect((await cohorts())[0]).toMatchObject({ occupied: 1, available: 0 })
      expect(
        (results.find((r) => r.status === 'rejected') as PromiseRejectedResult)
          .reason.status,
      ).toBe(409)
    })
    it('freezes offer terms, restricts acceptance to the owner and releases withdrawn seats', async () => {
      const { c, v } = await offerSetup(),
        a = await submitIntake(input(), owner)
      await qualify(a.applicationId)
      const offer = await issueOffer(
        a.applicationId,
        {
          version: 3,
          courseVersionId: v.id,
          cohortId: c.id,
          expiresAt: '2097-12-25T00:00:00Z',
          projectScope:
            'A bounded project briefing with approved exported data and human review.',
          acceptanceCriteria:
            'Sponsor confirms a traceable review pack and measures the baseline.',
        },
        admin,
      )
      await expect(
        decideOffer(a.applicationId, offer.id, 'accepted', other),
      ).rejects.toMatchObject({ status: 409 })
      await decideOffer(a.applicationId, offer.id, 'accepted', owner)
      expect(
        (await applicantDetail(a.applicationId, ownerUser)).offers[0].snapshot
          .courseVersion,
      ).toBe(v.version)
      expect((await cohorts())[0].available).toBe(0)
      const accepted = await application(a.applicationId)
      await expect(
        review(
          a.applicationId,
          {
            version: accepted.version,
            status: 'enrolled',
            cohortId: randomUUID(),
            sponsorVerified: true,
            dataApproval: 'approved',
            note: 'Attempted transfer without new agreement.',
          },
          admin,
        ),
      ).rejects.toMatchObject({ status: 409 })
      await review(
        a.applicationId,
        {
          version: accepted.version,
          status: 'enrolled',
          cohortId: c.id,
          sponsorVerified: true,
          dataApproval: 'approved',
          note: 'Enrolled on the accepted terms.',
        },
        admin,
      )
      await withdraw(a.applicationId, owner)
      expect((await cohorts())[0].available).toBe(1)
    })
    it('expires offer holds and rejects stale offer acceptance', async () => {
      const { c, v } = await offerSetup(),
        a = await submitIntake(input(), owner)
      await qualify(a.applicationId)
      const offer = await issueOffer(
        a.applicationId,
        {
          version: 3,
          courseVersionId: v.id,
          cohortId: c.id,
          expiresAt: '2097-12-25T00:00:00Z',
          projectScope:
            'A bounded project briefing with approved exported data and human review.',
          acceptanceCriteria:
            'Sponsor confirms a traceable review pack and measures the baseline.',
        },
        admin,
      )
      await testPool.query(
        "UPDATE executive_ai_preview.offers SET expires_at=now()-interval '1 minute' WHERE id=$1",
        [offer.id],
      )
      expect((await cohorts())[0].available).toBe(1)
      await expect(
        decideOffer(a.applicationId, offer.id, 'accepted', owner),
      ).rejects.toMatchObject({ status: 409 })
    })
    it('enforces concurrency and optimistic revisions', async () => {
      await saveCohort(cohort(), admin)
      await expect(
        saveCohort(cohort({ name: 'Overlapping cohort' }), admin),
      ).rejects.toMatchObject({ status: 409 })
      const a = await submitIntake(input(), owner)
      await qualify(a.applicationId)
      await expect(
        review(
          a.applicationId,
          {
            version: 1,
            status: 'waitlisted',
            cohortId: null,
            note: 'Stale decision',
            dataApproval: 'approved',
            sponsorVerified: true,
          },
          admin,
        ),
      ).rejects.toMatchObject({ status: 409 })
    })
    it('distinguishes funding restrictions from admission and keeps packages free of private notes', async () => {
      const a = await submitIntake(
        input({
          employment: 'owner_shareholder_board',
          notes: 'Never export this private phrase',
        }),
        owner,
      )
      const packet = await packageSnapshot(a.applicationId, owner)
      expect(packet.triage.status).toBe('likely_ineligible')
      expect(
        (await applicantDetail(a.applicationId, ownerUser)).packages.map(
          (p) => p.id,
        ),
      ).toContain(packet.id)
      expect(packet.triage.apiSubmissionSupported).toBe(false)
      expect(JSON.stringify(packet)).not.toContain('Never export')
      expect(
        grantTriage(
          {
            intake: { employment: 'employee', province: 'AB' },
            sponsor_verified: false,
            cohort_id: null,
          },
          null,
        ).unresolved.length,
      ).toBeGreaterThan(4)
      expect(
        (await PDFDocument.load(await grantDocument(packet))).getPageCount(),
      ).toBeGreaterThan(1)
      await expect(
        reportGrant(
          a.applicationId,
          {
            status: 'staff_evidence_reviewed',
            evidenceReference: 'A dated reference',
            notes: '',
          },
          owner,
          false,
        ),
      ).rejects.toMatchObject({ status: 403 })
    })
    it('keeps applicant-visible correspondence separate from private review notes', async () => {
      const a = await submitIntake(input(), owner)
      await qualify(a.applicationId)
      await addMessage(
        a.applicationId,
        'Please provide a representative process baseline.',
        admin,
        true,
      )
      const detail = await applicantDetail(a.applicationId, ownerUser)
      expect(detail.messages).toHaveLength(1)
      expect(JSON.stringify(detail)).not.toContain(
        'Qualified project and employer permissions.',
      )
      await expect(
        addMessage(a.applicationId, 'Wrong owner', other, false),
      ).rejects.toMatchObject({ status: 404 })
    })
    it('uses durable rate limits and a schema allowlist', async () => {
      await rateLimit('test', 1)
      await expect(rateLimit('test', 1)).rejects.toMatchObject({ status: 429 })
      process.env.PRACTICUM_SCHEMA = 'public'
      expect(() => schemaName()).toThrow()
      process.env.PRACTICUM_SCHEMA = 'executive_ai_preview'
    })
    it('renders an actual multipage program PDF', async () => {
      const bytes = await programDocument()
      expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe('%PDF-')
      expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(0)
    })
  },
)
