'use client'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { stageLabel } from '@/lib/executive-ai/config'
type Application = {
  id: string
  reference: string
  kind: string
  name: string
  employer: string
  status: string
  sponsor_decision: string | null
}
type Home = {
  sponsorships: {
    id: string
    reference: string
    name: string
    employer: string
    status: string
  }[]
  invitations: { id: string; name: string; employer: string }[]
  drafts: { id: string; kind: string; updated_at: string }[]
  applications: Application[]
  nominations: {
    id: string
    name: string
    email: string
    claimed: boolean
    applied: boolean
    employer_application_id: string
  }[]
}
export default function ApplicantHome() {
  const [data, setData] = useState<Home | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [invite, setInvite] = useState('')
  const load = useCallback(
    () =>
      fetch('/api/executive-ai/me', { cache: 'no-store' })
        .then(async (r) => {
          const result = await r.json()
          if (!r.ok) throw new Error(result.error)
          setData(result)
        })
        .catch((e) => setError(e.message)),
    [],
  )
  useEffect(() => {
    load()
  }, [load])
  async function nominate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const r = await fetch('/api/executive-ai/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'nominate',
          ...Object.fromEntries(form),
          permission: form.has('permission'),
        }),
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      setInvite(
        window.location.origin +
          '/portal/executive-ai/invitation#' +
          result.token,
      )
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function claim(id: string) {
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/executive-ai/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim_pending', id }),
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      window.location.assign('/executive-ai/apply?draft=' + result.draftId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-8">
      {!!data?.invitations?.length && (
        <section className="portal-card p-6">
          <h2 className="text-xl font-semibold">
            Employer invitations for your verified email
          </h2>
          <div className="mt-4 space-y-3">
            {data.invitations.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap justify-between gap-3 border rounded p-4"
              >
                <span>
                  {i.employer} nominated {i.name}
                </span>
                <button
                  className="portal-button"
                  disabled={busy}
                  onClick={() => claim(i.id)}
                >
                  Claim invitation
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      <header>
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Private practicum workspace
        </p>
        <h1 className="portal-title mt-3 text-3xl">
          Your executive AI applications
        </h1>
        <p className="portal-body mt-3">
          Drafts and submitted applications are saved to your verified account.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/executive-ai/apply" className="portal-button">
            Executive application
          </Link>
          <Link href="/executive-ai/employers" className="portal-button">
            Employer enquiry
          </Link>
          <Link href="/executive-ai" className="underline self-center text-sm">
            Program details
          </Link>
        </div>
      </header>
      {error && (
        <p role="alert" className="eai-alert">
          {error}
        </p>
      )}
      {!data && !error && <p role="status">Loading your applications…</p>}
      {data && (
        <>
          {data.drafts.length > 0 && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">Saved drafts</h2>
              <ul className="mt-4 space-y-3">
                {data.drafts.map((d) => (
                  <li key={d.id}>
                    <Link
                      className="underline"
                      href={`/executive-ai/${d.kind === 'employer' ? 'employers' : 'apply'}?draft=${d.id}`}
                    >
                      Resume{' '}
                      {d.kind === 'employer'
                        ? 'employer enquiry'
                        : 'executive application'}
                    </Link>
                    <span className="ml-3 text-sm text-gray-500">
                      Saved {new Date(d.updated_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">Submitted requests</h2>
            {!data.applications.length ? (
              <p className="mt-4 text-gray-600">
                No submitted requests yet. Begin an application or resume a
                saved draft.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {data.applications.map((a) => (
                  <article key={a.id} className="border rounded-lg p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-semibold">{a.employer}</p>
                        <p className="text-sm text-gray-500">
                          {a.reference} ·{' '}
                          {a.kind === 'employer'
                            ? 'Employer enquiry'
                            : 'Executive application'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm h-fit">
                        {stageLabel(a.status)}
                      </span>
                    </div>
                    <Link
                      className="inline-block mt-4 underline text-sm"
                      href={'/portal/executive-ai/' + a.id}
                    >
                      Open application and admissions updates
                    </Link>
                    {a.kind === 'executive' && (
                      <p className="text-sm mt-3">
                        Sponsor response:{' '}
                        {a.sponsor_decision
                          ? stageLabel(a.sponsor_decision)
                          : 'Awaiting a deliberate sponsorship request'}
                        .
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          {!!data.sponsorships.length && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">
                Verified employer sponsorships
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                Access the shared project brief, offer and funding preparation
                for participants you are authorized to sponsor.
              </p>
              <ul className="mt-5 space-y-4">
                {data.sponsorships.map((a) => (
                  <li key={a.id}>
                    <Link
                      className="underline"
                      href={'/portal/executive-ai/' + a.id}
                    >
                      {a.name} · {a.employer}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {a.reference} · {stageLabel(a.status)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.applications.some((a) => a.kind === 'employer') && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">Nominate an executive</h2>
              <p className="text-sm text-gray-600 mt-3">
                Create a private invitation to share yourself. The nominee
                verifies their own email and completes a separate application.
                You see whether they have claimed and submitted, never their
                private answers.
              </p>
              <form className="eai-form mt-5 space-y-4" onSubmit={nominate}>
                <label className="eai-field">
                  <span>Employer enquiry</span>
                  <select name="applicationId">
                    {data.applications
                      .filter(
                        (a) =>
                          a.kind === 'employer' &&
                          !['withdrawn', 'declined'].includes(a.status),
                      )
                      .map((a) => (
                        <option value={a.id} key={a.id}>
                          {a.employer} · {a.reference}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="eai-grid">
                  <label className="eai-field">
                    <span>Nominee name</span>
                    <input required name="name" maxLength={160} />
                  </label>
                  <label className="eai-field">
                    <span>Nominee work email</span>
                    <input required type="email" name="email" maxLength={254} />
                  </label>
                </div>
                <label className="eai-check">
                  <input required type="checkbox" name="permission" />
                  <span>
                    I have permission to nominate this person and share their
                    contact information for this purpose.
                  </span>
                </label>
                <button disabled={busy} className="portal-button">
                  {busy ? 'Creating…' : 'Create private invitation'}
                </button>
              </form>
              {invite && (
                <label className="eai-field mt-5">
                  <span>
                    Share this link with the nominee (expires in 30 days)
                  </span>
                  <input
                    readOnly
                    value={invite}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </label>
              )}
              <ul className="mt-6 space-y-3">
                {data.nominations.map((n) => (
                  <li className="text-sm" key={n.id}>
                    <strong>{n.name}</strong> · {n.email} ·{' '}
                    {n.applied
                      ? 'Application submitted'
                      : n.claimed
                        ? 'Invitation claimed'
                        : 'Invitation not yet claimed'}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
