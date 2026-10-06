// Synthetic verified accounts are supplied through an ignored local file.
// Never run this against production or point it at real applicant accounts.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
const { origin, users } = JSON.parse(
  fs.readFileSync('.local/verification-users.json', 'utf8'),
)
if (!/^https:\/\/execom-site-[a-z0-9]+-execom\.vercel\.app$/.test(origin))
  throw new Error('Expected an immutable execom preview URL')
if (users.some((u) => !u.email.endsWith('@example.invalid')))
  throw new Error('Only synthetic verification accounts are allowed')
fs.mkdirSync('.local/http', { recursive: true })
const results = []
function request(
  path,
  { role = 'guest', method = 'GET', body, originHeader = origin } = {},
) {
  const output = '.local/http/response',
    cookie = '.local/http/' + role + '.cookies'
  const args = [
    'curl',
    path,
    '--deployment',
    origin,
    '--scope',
    'execom',
    '--',
    '-sS',
    '-X',
    method,
    '-c',
    cookie,
    '-b',
    cookie,
    '-o',
    output,
    '-w',
    '%{http_code}',
    '-H',
    'Origin: ' + originHeader,
    '--max-time',
    '60',
  ]
  if (body !== undefined)
    args.push('-H', 'Content-Type: application/json', '--data-binary', '@-')
  const r = spawnSync('vercel', args, {
    input: body === undefined ? undefined : JSON.stringify(body),
    encoding: 'utf8',
  })
  if (r.status !== 0) throw new Error('Request failed: ' + path)
  const status = Number(r.stdout.trim()),
    text = fs.readFileSync(output, 'utf8')
  let data
  try {
    data = JSON.parse(text)
  } catch {}
  return { status, data, text }
}
function ok(path, options, status = 200) {
  const r = request(path, options)
  assert.equal(
    r.status,
    status,
    `${path}: ${r.data?.error || r.text.slice(0, 100)}`,
  )
  return r.data
}
const getUser = (role) => users.find((u) => u.role === role)
for (const role of ['executive', 'other', 'hr', 'staff']) {
  const u = getUser(role)
  ok('/api/auth/sign-in/email', {
    method: 'POST',
    role,
    body: { email: u.email, password: u.password },
  })
}
assert.equal(request('/api/executive-ai/admin').status, 401)
assert.equal(
  request('/api/executive-ai/admin', { role: 'executive' }).status,
  403,
)
ok('/api/executive-ai/admin', { role: 'staff' })
results.push('Verified portal login; guest and nonstaff admin denial')
const draftId = randomUUID()
ok('/api/executive-ai/me', {
  role: 'executive',
  method: 'PUT',
  body: {
    id: draftId,
    kind: 'executive',
    answers: { process: 'A partly completed private draft.' },
  },
})
assert.equal(
  ok('/api/executive-ai/me', { role: 'executive' }).drafts.some(
    (d) => d.id === draftId,
  ),
  true,
)
assert.equal(
  ok('/api/executive-ai/me', { role: 'other' }).drafts.some(
    (d) => d.id === draftId,
  ),
  false,
)
assert.equal(
  request('/api/executive-ai/me', {
    role: 'other',
    method: 'PUT',
    body: { id: draftId, kind: 'executive', answers: { process: 'overwrite' } },
  }).status,
  409,
)
results.push('Durable private draft save/resume and cross-account isolation')
const intake = {
  requestId: draftId,
  kind: 'executive',
  name: 'Verification Executive',
  email: getUser('executive').email,
  title: 'Operations leader',
  employer: 'Verification Employer',
  province: 'AB',
  process: 'Build a traceable weekly project briefing from approved exports.',
  outcome: 'Reduce assembly time and measure completeness against a baseline.',
  tools: 'Approved project exports',
  dataApproval: 'pending',
  sponsorName: 'Verification HR',
  sponsorEmail: getUser('hr').email,
  employment: 'employee',
  grantInterest: true,
  seats: 1,
  notes: 'Private verification note, never shared.',
  consent: true,
}
assert.equal(
  request('/api/executive-ai/applications', {
    role: 'executive',
    method: 'POST',
    body: intake,
    originHeader: 'https://evil.invalid',
  }).status,
  403,
)
const submitted = ok(
  '/api/executive-ai/applications',
  { role: 'executive', method: 'POST', body: intake },
  201,
)
assert.equal(
  ok(
    '/api/executive-ai/applications',
    { role: 'executive', method: 'POST', body: intake },
    201,
  ).applicationId,
  submitted.applicationId,
)
const id = submitted.applicationId
assert.equal(
  request('/api/executive-ai/me/' + id, { role: 'other' }).status,
  404,
)
const sponsor = ok('/api/executive-ai/me/' + id, {
  role: 'executive',
  method: 'POST',
  body: {
    action: 'sponsor',
    input: {
      name: 'Verification HR',
      email: getUser('hr').email,
      summary: 'Approved shared weekly-briefing project description.',
      outcome: 'Approved shared output quality and time-saving objective.',
      permission: true,
    },
  },
})
const brief = ok('/api/executive-ai/sponsorship', {
  method: 'POST',
  body: { action: 'lookup', token: sponsor.sponsorToken },
})
assert.equal(JSON.stringify(brief).includes('Private verification note'), false)
ok('/api/executive-ai/sponsorship', {
  method: 'POST',
  body: {
    token: sponsor.sponsorToken,
    name: 'Verification HR',
    email: getUser('hr').email,
    title: 'HR Director',
    employer: 'Verification Employer',
    decision: 'confirmed',
    funding: 'employer',
    dataApproval: 'approved',
    notes: 'Employer scope review complete.',
    authorized: true,
    consent: true,
  },
})
results.push(
  'Real intake, idempotent retry, CSRF denial and deliberate sponsor handoff',
)
const employer = ok(
  '/api/executive-ai/applications',
  {
    role: 'hr',
    method: 'POST',
    body: {
      ...intake,
      requestId: randomUUID(),
      kind: 'employer',
      email: getUser('hr').email,
      name: 'Verification HR',
      seats: 3,
    },
  },
  201,
)
const nominee = ok('/api/executive-ai/nominations', {
  role: 'hr',
  method: 'POST',
  body: {
    action: 'nominate',
    permission: true,
    applicationId: employer.applicationId,
    name: 'Verification Nominee',
    email: getUser('other').email,
  },
})
assert.equal(
  request('/api/executive-ai/nominations', {
    role: 'executive',
    method: 'POST',
    body: { action: 'claim', token: nominee.token },
  }).status,
  404,
)
ok('/api/executive-ai/nominations', {
  role: 'other',
  method: 'POST',
  body: { action: 'claim', token: nominee.token },
})
results.push('HR intake, private nomination, verified-email invitation claim')
for (const status of ['reviewing', 'qualified']) {
  const a = ok('/api/executive-ai/admin/' + id, { role: 'staff' })
  ok('/api/executive-ai/admin/' + id, {
    role: 'staff',
    method: 'PATCH',
    body: {
      version: a.version,
      status,
      cohortId: null,
      dataApproval: 'approved',
      sponsorVerified: true,
      note: 'Verified employer authority and documented process fit for this synthetic test.',
    },
  })
}
const version = ok('/api/executive-ai/admin/config', {
  role: 'staff',
  method: 'POST',
  body: {
    action: 'course',
    input: {
      legalEntity: 'Verification Training Inc.',
      providerAddress: 'Calgary, Alberta',
      buildAllowance: 'Ten scoped provider hours for the prototype.',
      terms:
        'Synthetic verification terms only. Payment, cancellation, IP and acceptance are defined in this test record.',
      curriculum:
        'Ten weekly working sessions: scope, build, test, measure and hand off.',
      assessment: 'Measured demonstration and employer acceptance review.',
      trainingCostCAD: null,
      buildCostCAD: null,
      softwareAndIntegrations:
        'Employer supplies approved data exports and software licenses.',
      providerEligibility: 'unresolved',
      courseEligibility: 'unresolved',
      eligibilityEvidence: '',
      approved: true,
    },
  },
})
const cohort = ok('/api/executive-ai/admin/cohorts', {
  role: 'staff',
  method: 'POST',
  body: {
    name: 'Verification hosted cohort',
    location: 'Calgary',
    startsAt: '2098-01-10T16:00:00Z',
    endsAt: '2098-03-20T17:00:00Z',
    deadline: '2098-01-01T00:00:00Z',
    capacity: 1,
    state: 'open',
    schedule:
      'Ten weekly verification sessions, Wednesdays at 9 AM America/Edmonton.',
    instructionalHours: 10,
  },
})
const a = ok('/api/executive-ai/admin/' + id, { role: 'staff' })
const offer = ok('/api/executive-ai/admin/' + id + '/workflow', {
  role: 'staff',
  method: 'POST',
  body: {
    action: 'offer',
    input: {
      version: a.version,
      courseVersionId: version.id,
      cohortId: cohort.id,
      expiresAt: '2097-12-25T00:00:00Z',
      projectScope:
        'A bounded recurring project briefing using approved exports and human review.',
      acceptanceCriteria:
        'Employer validates completeness, traceability and the baseline comparison.',
    },
  },
})
assert.equal(
  ok('/api/executive-ai/cohorts').cohorts.find((c) => c.id === cohort.id)
    .available,
  0,
)
ok('/api/executive-ai/me/' + id, {
  role: 'executive',
  method: 'POST',
  body: {
    action: 'offer_decision',
    offerId: offer.id,
    decision: 'accepted',
    acknowledged: true,
  },
})
assert.ok(
  ok('/api/executive-ai/me', { role: 'hr' }).sponsorships.some(
    (a) => a.id === id,
  ),
)
const packet = ok('/api/executive-ai/me/' + id, {
  role: 'hr',
  method: 'POST',
  body: { action: 'prepare_package' },
})
assert.ok(
  ok('/api/executive-ai/me/' + id, { role: 'hr' }).packages.some(
    (p) => p.id === packet.packageId,
  ),
)
const pdf = request(
  '/api/executive-ai/documents/grant?packageId=' + packet.packageId,
  { role: 'hr' },
)
assert.equal(pdf.status, 200)
assert.equal(pdf.text.slice(0, 5), '%PDF-')
fs.copyFileSync('.local/http/response', '.local/employer-package.pdf')
assert.equal(
  request('/api/executive-ai/documents/grant?packageId=' + packet.packageId, {
    role: 'other',
  }).status,
  404,
)
ok('/api/executive-ai/me/' + id, {
  role: 'hr',
  method: 'POST',
  body: {
    action: 'grant_report',
    input: {
      status: 'employer_reported_submitted',
      evidenceReference: 'Synthetic receipt 2097-12-01 TEST-ONLY',
      notes: 'Verification only; not an actual government submission.',
    },
  },
})
assert.equal(
  ok('/api/executive-ai/me/' + id, { role: 'hr' }).grant.status,
  'employer_reported_submitted',
)
results.push(
  'Staff qualification, immutable offer, real seat allocation, acceptance, employer PDF and attributed funding report',
)
ok('/api/executive-ai/admin/prospects', {
  role: 'staff',
  method: 'POST',
  body: {
    action: 'import',
    rows: [
      {
        sourceKey: 'verification-employer',
        recordType: 'employer',
        name: 'Verification research only',
        sourceUrl: 'https://example.com/evidence',
        researchNotes: 'Synthetic test record. No outreach or consent.',
      },
    ],
  },
})
assert.equal(
  request('/api/executive-ai/admin/prospects', { role: 'executive' }).status,
  403,
)
results.push('Private prospect import and nonstaff denial')
fs.writeFileSync(
  '.local/verification-records.json',
  JSON.stringify(
    {
      applicationId: id,
      employerId: employer.applicationId,
      cohortId: cohort.id,
      packageId: packet.packageId,
    },
    null,
    2,
  ),
)
fs.writeFileSync(
  '.local/http-results.json',
  JSON.stringify({ origin, passed: results, emailsSent: 0 }, null, 2),
)
console.log(JSON.stringify({ origin, passed: results, emailsSent: 0 }, null, 2))
