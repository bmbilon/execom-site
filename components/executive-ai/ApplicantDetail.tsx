'use client'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import PackageHistory from './PackageHistory'
import { Field, TextArea } from './IntakeForm'
import { stageLabel, practicum } from '@/lib/executive-ai/config'
import type { applicantDetail } from '@/lib/executive-ai/workflows'
type Detail = Awaited<ReturnType<typeof applicantDetail>>
export default function ApplicantDetail({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false),
    [sponsorLink, setSponsorLink] = useState(''),
    [packageLink, setPackageLink] = useState('')
  const load = useCallback(async () => {
    const r = await fetch('/api/executive-ai/me/' + id, { cache: 'no-store' })
    const result = await r.json()
    if (!r.ok) throw new Error(result.error)
    setData(result)
  }, [id])
  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [load])
  async function act(payload: unknown) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const r = await fetch('/api/executive-ai/me/' + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      if (result.sponsorToken)
        setSponsorLink(
          location.origin + '/executive-ai/sponsor#' + result.sponsorToken,
        )
      if (result.packageId)
        setPackageLink(
          '/api/executive-ai/documents/grant?packageId=' + result.packageId,
        )
      setSuccess('Saved.')
      await load()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }
  async function sponsor(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    await act({
      action: 'sponsor',
      input: { ...Object.fromEntries(d), permission: d.has('permission') },
    })
  }
  return (
    <div className="space-y-7">
      <Link href="/portal/executive-ai" className="underline text-sm">
        ← My applications
      </Link>
      {error && (
        <p role="alert" className="eai-alert">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-green-800">
          {success}
        </p>
      )}
      {!data && !error && <p role="status">Loading application…</p>}
      {data && (
        <>
          <header>
            <p className="text-sm text-gray-500">
              {data.reference} · {stageLabel(data.status)}
            </p>
            <h1 className="portal-title text-3xl mt-3">
              {data.name} · {data.employer}
            </h1>
            <p className="portal-body mt-3">
              {data.role === 'sponsor'
                ? 'Employer view: the participant has deliberately shared the project brief below.'
                : 'Your submitted application and admissions updates.'}
            </p>
          </header>
          {data.role === 'owner' && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">Your project</h2>
              <p className="mt-4 whitespace-pre-wrap">
                {String(data.intake?.process || '')}
              </p>
              <h3 className="font-semibold mt-5">Desired result</h3>
              <p className="mt-2 whitespace-pre-wrap">
                {String(data.intake?.outcome || '')}
              </p>
            </section>
          )}
          {data.sponsorBrief && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">Shared employer brief</h2>
              <p className="mt-4 whitespace-pre-wrap">
                {data.sponsorBrief.summary}
              </p>
              <p className="mt-4 whitespace-pre-wrap">
                {data.sponsorBrief.outcome}
              </p>
              <p className="text-sm mt-5">
                Sponsor: {data.sponsorBrief.name} · {data.sponsorBrief.email}.
                Response: {data.sponsorDecision || 'pending'}. Authority{' '}
                {data.sponsorVerified
                  ? 'verified by admissions'
                  : 'awaiting admissions verification'}
                .
              </p>
            </section>
          )}
          {data.role === 'owner' &&
            data.kind === 'executive' &&
            ![
              'offered',
              'accepted',
              'enrolled',
              'declined',
              'withdrawn',
            ].includes(data.status) && (
              <details className="portal-card p-6">
                <summary className="font-semibold cursor-pointer">
                  {data.sponsorBrief
                    ? 'Update or renew sponsorship request'
                    : 'Request employer sponsorship'}
                </summary>
                <p className="text-sm text-gray-600 mt-4">
                  Review exactly what you want to share. The sponsor will see
                  your name, employer and these two descriptions. Private intake
                  answers and admissions notes stay private. A new request
                  replaces the previous link and clears prior sponsor
                  verification.
                </p>
                <form onSubmit={sponsor} className="eai-form space-y-5 mt-5">
                  <div className="eai-grid">
                    <Field
                      name="name"
                      label="Sponsor name"
                      value={
                        data.sponsorBrief?.name || data.intake?.sponsorName
                      }
                    />
                    <Field
                      name="email"
                      label="Sponsor email"
                      type="email"
                      value={
                        data.sponsorBrief?.email || data.intake?.sponsorEmail
                      }
                    />
                  </div>
                  <TextArea
                    name="summary"
                    label="Project description to share"
                  />
                  <TextArea name="outcome" label="Desired outcome to share" />
                  <label className="eai-check">
                    <input type="checkbox" name="permission" required />
                    <span>
                      I have permission to provide this sponsor’s details and
                      deliberately share the descriptions above with them for
                      sponsorship and employer funding preparation.
                    </span>
                  </label>
                  <button className="portal-button" disabled={busy}>
                    Create private sponsorship request
                  </button>
                </form>
                {sponsorLink && (
                  <label className="eai-field mt-5">
                    <span>
                      Share this link with your sponsor (expires in 30 days)
                    </span>
                    <input
                      readOnly
                      value={sponsorLink}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                  </label>
                )}
              </details>
            )}
          {data.offers.length > 0 && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">Documented offers</h2>
              {data.offers.map((o) => (
                <article key={o.id} className="border-t mt-5 pt-5 space-y-4">
                  <p className="font-semibold">
                    {stageLabel(o.state)} · expires{' '}
                    {new Date(o.expires_at).toLocaleString()}
                  </p>
                  <p>
                    C$10,000 plus applicable tax · Course version{' '}
                    {o.snapshot.courseVersion} · {o.snapshot.cohort.name}
                  </p>
                  <p className="whitespace-pre-wrap">
                    {o.snapshot.projectScope}
                  </p>
                  <p>
                    <strong>Acceptance criteria:</strong>{' '}
                    {o.snapshot.acceptanceCriteria}
                  </p>
                  <p>
                    <strong>Training entity:</strong>{' '}
                    {o.snapshot.course.legalEntity}
                  </p>
                  <p>
                    <strong>Build allowance:</strong>{' '}
                    {o.snapshot.course.buildAllowance}
                  </p>
                  <p>
                    <strong>Software and integrations:</strong>{' '}
                    {o.snapshot.course.softwareAndIntegrations}
                  </p>
                  <p>
                    <strong>Schedule:</strong> {o.snapshot.cohort.schedule}
                  </p>
                  <p className="whitespace-pre-wrap">
                    <strong>Commercial terms:</strong> {o.snapshot.course.terms}
                  </p>
                  {data.role === 'owner' &&
                    o.state === 'issued' &&
                    data.status === 'offered' &&
                    new Date(o.expires_at) > new Date() && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const d = new FormData(e.currentTarget)
                          act({
                            action: 'offer_decision',
                            offerId: o.id,
                            decision: d.get('decision'),
                            acknowledged: d.has('acknowledged'),
                          })
                        }}
                        className="space-y-4"
                      >
                        <label className="eai-check">
                          <input name="acknowledged" type="checkbox" required />
                          <span>
                            I have reviewed this exact project scope, schedule,
                            tuition, build allowance and commercial terms.
                          </span>
                        </label>
                        <label className="eai-field">
                          <span>Your decision</span>
                          <select name="decision">
                            <option value="accepted">Accept this offer</option>
                            <option value="declined">Decline this offer</option>
                          </select>
                        </label>
                        <button className="portal-button" disabled={busy}>
                          Save offer decision
                        </button>
                      </form>
                    )}
                  {o.state === 'issued' &&
                    new Date(o.expires_at) <= new Date() && (
                      <p className="text-sm">
                        This offer has expired and no longer holds a seat.
                        Contact admissions for a new offer.
                      </p>
                    )}
                </article>
              ))}
            </section>
          )}
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">
              Employer grant-support package
            </h2>
            <p className="text-sm text-gray-600 mt-4">
              Generate a dated package with the course version, shared brief,
              schedule, fee allocation, evidence checklist and unresolved items.
              It is preparation material, not an eligibility determination or a
              government submission.
            </p>
            <button
              className="portal-button mt-5"
              disabled={busy}
              onClick={() => act({ action: 'prepare_package' })}
            >
              Prepare downloadable package
            </button>
            {packageLink && (
              <a href={packageLink} className="ml-4 underline">
                Download PDF
              </a>
            )}
            <PackageHistory packages={data.packages} />
            <p className="mt-5 text-sm">
              <a
                href="https://capg.alberta.ca/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Open the official CAPG portal
              </a>{' '}
              ·{' '}
              <a
                href={practicum.grantSource}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Current requirements
              </a>
            </p>
            {data.grant && (
              <p className="mt-4 text-sm">
                Recorded status: {stageLabel(data.grant.status)}. Evidence:{' '}
                {data.grant.evidence_reference || 'not recorded'}. This is an
                attributed report, not a live government verification.
              </p>
            )}
            {(data.role === 'sponsor' || data.kind === 'employer') && (
              <form
                className="eai-form mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  act({
                    action: 'grant_report',
                    input: Object.fromEntries(new FormData(e.currentTarget)),
                  })
                }}
              >
                <label className="eai-field">
                  <span>Report a government update</span>
                  <select name="status">
                    <option value="employer_reported_submitted">
                      I submitted through the government portal
                    </option>
                    <option value="employer_reported_approved">
                      I received an approval
                    </option>
                    <option value="employer_reported_declined">
                      I received a decline
                    </option>
                  </select>
                </label>
                <Field
                  name="evidenceReference"
                  label="Dated receipt or decision reference"
                />
                <TextArea
                  name="notes"
                  label="Report details"
                  required={false}
                />
                <button className="portal-button" disabled={busy}>
                  Record employer report
                </button>
              </form>
            )}
          </section>
          {data.role === 'owner' && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">
                Admissions correspondence
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                Updates and requests for information are recorded here.
              </p>
              <div className="mt-5 space-y-4">
                {data.messages.map((m) => (
                  <div key={m.id} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-gray-500">
                      {m.from_staff ? 'Admissions' : 'You'} ·{' '}
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                    <p className="whitespace-pre-wrap mt-2">{m.body}</p>
                  </div>
                ))}
              </div>
              <form
                className="eai-form space-y-4 mt-5"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const d = new FormData(form)
                  if (await act({ action: 'message', text: d.get('text') }))
                    form.reset()
                }}
              >
                <TextArea label="Reply or ask a question" name="text" />
                <button className="portal-button" disabled={busy}>
                  Save message to admissions
                </button>
              </form>
            </section>
          )}
          {data.role === 'owner' && data.status !== 'withdrawn' && (
            <details className="portal-card p-6">
              <summary className="cursor-pointer text-sm">
                Withdraw this application
              </summary>
              <form
                className="space-y-4 mt-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  act({ action: 'withdraw', confirmed: true })
                }}
              >
                <label className="eai-check">
                  <input type="checkbox" required />
                  <span>
                    I want to withdraw this request and release any held cohort
                    place. Contractual obligations, if any, are governed by the
                    agreed terms.
                  </span>
                </label>
                <button disabled={busy} className="portal-button">
                  Withdraw application
                </button>
              </form>
            </details>
          )}
        </>
      )}
    </div>
  )
}
