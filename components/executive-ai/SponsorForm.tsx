'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Field, TextArea, DataApproval } from './IntakeForm'
import { priceLabel } from '@/lib/executive-ai/config'
export default function SponsorForm() {
  const [token, setToken] = useState(''),
    [request, setRequest] = useState<{
      reference: string
      name: string
      employer: string
      responded: boolean
      sponsor_brief: { summary: string; outcome: string }
    } | null>(null)
  const [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false)
  useEffect(() => {
    const key = window.location.hash.slice(1)
    setToken(key)
    if (!/^[a-f0-9]{64}$/.test(key)) {
      setError('Open the complete private link supplied by the applicant.')
      return
    }
    fetch('/api/executive-ai/sponsorship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lookup', token: key }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error)
        setRequest(data)
      })
      .catch((e) => setError(e.message))
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      const r = await fetch('/api/executive-ai/sponsorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(data),
          token,
          authorized: data.has('authorized'),
          consent: data.has('consent'),
        }),
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      setSaved(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  if (saved || request?.responded)
    return (
      <section className="s-edge p-8" role="status">
        <h2 className="s-h2">Sponsorship response saved.</h2>
        <p className="s-body mt-5">
          Admissions will review the response and verify the sponsor’s
          authority. This response does not purchase tuition or reserve a seat.
        </p>
        <p className="s-body mt-5">
          Once admissions verifies your authority, sign in with the nominated
          sponsor email to access the shared brief and employer funding package.
        </p>
        <Link href="/portal/executive-ai" className="s-btn s-btn-primary mt-6">
          Open employer workspace
        </Link>
        <Link href="/executive-ai" className="s-link block mt-6">
          Back to the practicum →
        </Link>
      </section>
    )
  return (
    <form className="eai-form s-edge p-7 md:p-10" onSubmit={submit}>
      <p className="s-eyebrow">Employer sponsorship</p>
      {request && (
        <>
          <h2 className="s-h2 mt-5">Support {request.name}’s application.</h2>
          <p className="s-body mt-4">
            {request.employer} · {request.reference}. Starting tuition is{' '}
            {priceLabel} plus applicable tax. Dates, project scope, build
            allowance and commercial terms are agreed separately before
            enrolment.
          </p>
          <div className="mt-6 space-y-4 rounded-lg border border-white/10 p-5">
            <h3 className="s-h3">Project brief shared by the applicant</h3>
            <p className="s-body whitespace-pre-wrap">
              {request.sponsor_brief.summary}
            </p>
            <p className="s-body whitespace-pre-wrap">
              {request.sponsor_brief.outcome}
            </p>
          </div>
          <fieldset disabled={busy} className="mt-8 space-y-6">
            <legend className="sr-only">Sponsor response</legend>
            <div className="eai-grid">
              <Field label="Your full name" name="name" />
              <Field label="Your work email" name="email" type="email" />
              <Field label="Your role / title" name="title" />
              <Field
                label="Employer"
                name="employer"
                value={request.employer}
              />
            </div>
            <label className="eai-field">
              <span>Sponsorship decision</span>
              <select name="decision">
                <option value="confirmed">
                  Support this application, subject to the agreed offer
                </option>
                <option value="declined">
                  Unable to support this application
                </option>
              </select>
            </label>
            <div className="eai-grid">
              <label className="eai-field">
                <span>Tuition funding</span>
                <select name="funding">
                  <option value="not_confirmed">Not yet confirmed</option>
                  <option value="employer">Employer budget available</option>
                  <option value="conditional_grant">
                    Dependent on grant review
                  </option>
                </select>
              </label>
              <DataApproval />
            </div>
            <TextArea
              name="notes"
              label="Constraints or approval conditions"
              required={false}
            />
            <label className="eai-check">
              <input required type="checkbox" name="authorized" />
              <span>
                I am authorized to represent this employer for this sponsorship
                discussion. I understand admissions will verify my authority
                before issuing an offer.
              </span>
            </label>
            <label className="eai-check">
              <input required type="checkbox" name="consent" />
              <span>
                I agree to the use of this response for admissions and employer
                coordination under the{' '}
                <Link href="/executive-ai/privacy" className="underline">
                  admissions privacy notice
                </Link>
                .
              </span>
            </label>
            <button className="s-btn s-btn-primary" type="submit">
              {busy ? 'Saving…' : 'Save sponsorship response'}
            </button>
          </fieldset>
        </>
      )}
      {!request && !error && (
        <p className="s-body mt-5" role="status">
          Loading the sponsorship request…
        </p>
      )}
      {error && (
        <p role="alert" className="eai-alert mt-5">
          {error}
        </p>
      )}
    </form>
  )
}
