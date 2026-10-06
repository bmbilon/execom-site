'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import type { Cohort } from '@/lib/executive-ai/service'
import { practicum, priceLabel } from '@/lib/executive-ai/config'

export function Field({
  label,
  name,
  required = true,
  type = 'text',
  hint,
  value,
  readOnly,
}: {
  label: string
  name: string
  required?: boolean
  type?: string
  hint?: string
  value?: string
  readOnly?: boolean
}) {
  return (
    <label className="eai-field">
      <span>
        {label}
        {!required && <small> (optional)</small>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={value}
        readOnly={readOnly}
        maxLength={type === 'email' ? 254 : 160}
        autoComplete={
          name === 'email'
            ? 'email'
            : name === 'name'
              ? 'name'
              : name === 'employer'
                ? 'organization'
                : 'off'
        }
      />
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function TextArea({
  label,
  name,
  required = true,
  hint,
}: {
  label: string
  name: string
  required?: boolean
  hint?: string
}) {
  return (
    <label className="eai-field">
      <span>
        {label}
        {!required && <small> (optional)</small>}
      </span>
      <textarea
        name={name}
        rows={4}
        required={required}
        minLength={required ? 20 : undefined}
        maxLength={required ? 4000 : 1500}
      />
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function DataApproval() {
  return (
    <label className="eai-field">
      <span>Employer approval for tools and data</span>
      <select name="dataApproval" defaultValue="not_started">
        <option value="not_started">Not yet discussed</option>
        <option value="pending">Approval in progress</option>
        <option value="approved">Approved for the proposed work</option>
      </select>
    </label>
  )
}
export default function IntakeForm({
  kind,
}: {
  kind: 'executive' | 'employer'
}) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]),
    [cohortError, setCohortError] = useState(false)
  const [cohortLoaded, setCohortLoaded] = useState(false)
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const [receipt, setReceipt] = useState<{
    reference: string
    applicationId: string
  } | null>(null)

  const [user, setUser] = useState<{ name: string; email: string } | null>(
      null,
    ),
    [access, setAccess] = useState('loading')
  const [saved, setSaved] = useState('Your draft will save as you work.')
  const [restore, setRestore] = useState<Record<string, unknown> | null>(null)
  const formRef = useRef<HTMLFormElement>(null),
    timer = useRef<ReturnType<typeof setTimeout>>()
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const requestId = useRef(''),
    frozenPayload = useRef<Record<string, unknown> | null>(null)
  const employer = kind === 'employer'
  useEffect(() => {
    requestId.current = crypto.randomUUID()
    fetch('/api/executive-ai/me', { cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 401) {
          setAccess('guest')
          return
        }
        if (!r.ok) throw new Error()
        const data = await r.json()
        setUser(data.user)
        const selected = new URLSearchParams(window.location.search).get(
          'draft',
        )
        const draft = data.drafts.find(
          (d: { id: string; kind: string }) =>
            d.kind === kind && (!selected || d.id === selected),
        )
        if (draft) {
          requestId.current = draft.id
          setRestore(draft.answers)
          setSaved('Your saved draft has been restored.')
        }
        setAccess('ready')
      })
      .catch(() => setAccess('error'))
    fetch('/api/executive-ai/cohorts', {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error()
        setCohorts((await r.json()).cohorts)
      })
      .catch(() => setCohortError(true))
      .finally(() => setCohortLoaded(true))
    return () => clearTimeout(timer.current)
  }, [kind])
  useEffect(() => {
    if (!restore || !formRef.current) return
    for (const [key, value] of Object.entries(restore)) {
      if (key === 'email' || key === 'consent') continue
      const el = formRef.current.elements.namedItem(key)
      if (el instanceof HTMLInputElement && el.type === 'checkbox')
        el.checked = !!value
      else if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement
      )
        el.value = String(value ?? '')
    }
  }, [restore, access, cohortLoaded])
  function saveDraft() {
    if (!formRef.current || busy || receipt) return
    const data = new FormData(formRef.current)
    const answers = {
      ...Object.fromEntries(data),
      grantInterest: data.has('grantInterest'),
      consent: data.has('consent'),
    }
    setSaved('Saving draft…')
    saveQueue.current = saveQueue.current
      .then(async () => {
        const response = await fetch('/api/executive-ai/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: requestId.current, kind, answers }),
        })
        if (!response.ok) throw new Error()
        setSaved('Draft saved to your account.')
      })
      .catch(() =>
        setSaved('Draft could not be saved. Keep this page open and retry.'),
      )
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearTimeout(timer.current)
    setBusy(true)
    setError('')
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(data)
    const payload = {
      ...values,
      requestId: requestId.current,
      kind,
      grantInterest: data.has('grantInterest'),
      consent: data.has('consent'),
      seats: employer ? Number(data.get('seats')) : 1,
      cohortId: data.get('cohortId') || null,
    }
    // Retry the exact request after network uncertainty. Edited answers get a new key only after a definitive validation failure.
    const sending = frozenPayload.current ?? payload
    frozenPayload.current = sending
    try {
      await saveQueue.current
      const response = await fetch('/api/executive-ai/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sending),
      })
      const result = await response.json()
      if (!response.ok) {
        if ([400, 403, 409, 413, 415, 422, 429].includes(response.status))
          frozenPayload.current = null
        throw new Error(result.error || 'Unable to submit.')
      }
      setReceipt(result)
    } catch (e) {
      setError(
        (e as Error).message ||
          'Connection interrupted. Retry to confirm your saved submission.',
      )
    } finally {
      setBusy(false)
    }
  }
  if (access === 'loading' || (access === 'ready' && !cohortLoaded))
    return (
      <p className="s-body" role="status">
        Opening your private application…
      </p>
    )
  if (access === 'error')
    return (
      <div className="s-edge p-8">
        <p className="s-body" role="alert">
          Your account could not be loaded. Refresh to retry; saved drafts
          remain in your account.
        </p>
      </div>
    )
  if (access === 'guest')
    return (
      <div className="s-edge p-8 md:p-10">
        <p className="s-eyebrow">Private, resumable application</p>
        <h2 className="s-h2 mt-5">Begin with a verified account.</h2>
        <p className="s-body mt-5">
          Use your work email to create an execom portal account or sign in.
          Your draft saves securely as you work, and you can return to it from
          any device.
        </p>
        <div className="mt-7 flex flex-wrap gap-4">
          <Link
            className="s-btn s-btn-primary"
            href={`/portal/signup?next=/portal/executive-ai?start=${kind}`}
          >
            Create an account
          </Link>
          <Link
            className="s-btn s-btn-glass"
            href={`/portal/login?next=${encodeURIComponent('/portal/executive-ai?start=' + kind)}`}
          >
            Sign in and continue
          </Link>
        </div>
      </div>
    )
  if (receipt) {
    return (
      <section className="s-edge p-7 md:p-10" role="status" aria-live="polite">
        <p className="s-eyebrow">Saved securely</p>
        <h2 className="s-h2 mt-4">
          {employer
            ? 'Your enquiry is with admissions.'
            : 'Your application is with admissions.'}
        </h2>
        <p className="s-lede mt-5">
          Your reference is{' '}
          <strong className="text-snow">{receipt.reference}</strong>. Save this
          reference for follow-up. An application does not reserve a seat.
        </p>
        <div className="mt-8 border-t border-white/10 pt-7">
          <h3 className="s-h3">
            {employer
              ? 'Nominate your participants when ready.'
              : 'Bring your employer into the conversation.'}
          </h3>
          <p className="s-body mt-3">
            {employer
              ? 'Your private workspace lets you create individual nominee invitations.'
              : 'Review the project description you want to share, then deliberately create a private sponsorship request. Admissions verifies the sponsor’s authority before making an offer.'}
          </p>
          <Link
            href={
              employer
                ? '/portal/executive-ai'
                : '/portal/executive-ai/' + receipt.applicationId
            }
            className="s-btn s-btn-glass mt-5"
          >
            {employer
              ? 'Open employer workspace'
              : 'Review and request sponsorship'}
          </Link>
        </div>
        <p className="s-body mt-6">
          No payment has been taken.{' '}
          {employer
            ? 'Each nominated participant will need their own application before a seat can be confirmed.'
            : 'Your proposed process and fit will be reviewed before an offer is made.'}
        </p>
        <Link className="s-link mt-6 inline-flex" href="/executive-ai">
          Back to the practicum →
        </Link>
      </section>
    )
  }
  return (
    <form
      ref={formRef}
      className="eai-form s-edge p-6 md:p-10"
      onSubmit={submit}
      onChange={() => {
        if (frozenPayload.current && !busy)
          setError(
            'A previous submission is awaiting confirmation. Retry sends those saved answers; contact admissions to amend them afterward.',
          )
        setSaved('Changes not yet saved…')
        clearTimeout(timer.current)
        timer.current = setTimeout(saveDraft, 1200)
      }}
    >
      <p className="s-eyebrow">
        {employer
          ? 'For HR and employer sponsors'
          : 'For prospective participants'}
      </p>
      <h2 className="s-h2 mt-4">
        {employer
          ? 'Start with the business need.'
          : 'Tell us what needs to work better.'}
      </h2>
      <p className="s-body mt-4">
        {priceLabel} starting tuition per participant, plus applicable tax.
        Scope, dates and terms are confirmed before enrolment. Describe the
        process without sharing confidential business records or personal data.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-haze">
        <span role="status" aria-live="polite">
          {saved}
        </span>
        <button type="button" onClick={saveDraft} className="underline">
          Save draft now
        </button>
        <Link href="/portal/executive-ai" className="underline">
          My applications
        </Link>
      </div>
      <fieldset disabled={busy} className="mt-9 space-y-9">
        <legend className="sr-only">
          {employer ? 'Employer enquiry' : 'Executive application'}
        </legend>
        <div className="eai-grid">
          <Field label="Full name" name="name" value={user?.name} />
          <Field
            label="Verified email"
            name="email"
            type="email"
            value={user?.email}
            readOnly
          />
          <Field label="Role / title" name="title" />
          <Field label="Employer" name="employer" />
          <Field label="Phone" name="phone" required={false} type="tel" />
          <label className="eai-field">
            <span>Province of work</span>
            <select name="province" defaultValue="AB">
              {[
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
              ].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="space-y-6">
          <TextArea
            name="process"
            label="Which recurring process would you improve?"
            hint="For example: the weekly project briefing, a portfolio operating report, or a management-review pack. Describe who uses it and how it works today."
          />
          <TextArea
            name="outcome"
            label="What would a useful improvement look like?"
            hint="Explain the present friction and how you would judge the result. Estimates are welcome; evidence can follow during scoping."
          />
          <TextArea
            name="tools"
            label="Tools, source systems and constraints"
            required={false}
            hint="Name the tools and data types only. Do not paste credentials, customer records or sensitive company information."
          />
        </div>
        <div className="eai-grid">
          <DataApproval />
          <label className="eai-field">
            <span>
              {employer
                ? 'Expected participant employment status'
                : 'Your relationship to the employer'}
            </span>
            <select name="employment" defaultValue="unknown">
              <option value="unknown">To confirm</option>
              <option value="employee">
                Employee, not an owner / shareholder / board member
              </option>
              <option value="owner_shareholder_board">
                Owner, shareholder or board member
              </option>
              <option value="other">Other</option>
            </select>
          </label>
          {employer ? (
            <label className="eai-field">
              <span>Potential participants</span>
              <input
                name="seats"
                type="number"
                min={1}
                max={30}
                defaultValue={1}
                required
              />
            </label>
          ) : (
            <>
              <Field
                label="Employer sponsor name"
                name="sponsorName"
                required={false}
              />
              <Field
                label="Employer sponsor email"
                name="sponsorEmail"
                type="email"
                required={false}
              />
            </>
          )}
        </div>
        <label className="eai-field">
          <span>Preferred cohort</span>
          <select name="cohortId" defaultValue="">
            <option value="">Future cohort interest / dates to discuss</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ·{' '}
                {c.available
                  ? `${c.available} places available`
                  : 'Waitlist only'}
              </option>
            ))}
          </select>
          <small>
            {cohortError
              ? 'Live availability could not be loaded. You can still express interest in a future cohort.'
              : cohorts.length
                ? 'Availability is live. Places are reserved only after an admissions decision.'
                : 'No confirmed cohort is currently open. We can review your interest while the schedule is being arranged.'}
          </small>
        </label>
        <TextArea
          name="notes"
          label="Anything else admissions should know?"
          required={false}
        />
        <div className="space-y-5">
          <label className="eai-check">
            <input name="grantInterest" type="checkbox" />
            <span>
              I would like an employer grant-support package. Funding and
              provider/course eligibility are unconfirmed. Owners, shareholders
              and employer board members are ineligible trainees under CAPG.
            </span>
          </label>
          <label className="eai-check">
            <input name="consent" type="checkbox" required />
            <span>
              I agree that execom may store and use these answers to assess this
              request and coordinate admissions and employer sponsorship. I have
              permission to provide the contact information entered.{' '}
              <Link href="/executive-ai/privacy" className="underline">
                How admissions information is used
              </Link>
              .
            </span>
          </label>
        </div>
        <div className="eai-honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {error && (
          <p role="alert" className="eai-alert">
            {error}
          </p>
        )}
        <button className="s-btn s-btn-primary s-btn-lg" type="submit">
          {busy
            ? 'Saving…'
            : frozenPayload.current
              ? 'Confirm previous submission'
              : employer
                ? 'Submit employer enquiry'
                : 'Submit application'}
        </button>
        <p className="text-sm text-haze">
          Confirmation appears here after your answers are saved. Submission is
          free and does not commit you to enrolment.
        </p>
      </fieldset>
    </form>
  )
}
