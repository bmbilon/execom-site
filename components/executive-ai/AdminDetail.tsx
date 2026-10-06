'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import PackageHistory, { type SavedPackage } from './PackageHistory'
import { TextArea } from './IntakeForm'
import {
  stages,
  stageLabel,
  transitions,
  type Stage,
} from '@/lib/executive-ai/config'
import type { Cohort } from '@/lib/executive-ai/service'
type Detail = {
  packages: SavedPackage[]
  id: string
  reference: string
  name: string
  email: string
  employer: string
  kind: string
  status: Stage
  version: number
  cohort_id: string | null
  sponsor_verified: boolean
  data_approval: string
  intake: Record<string, string | number | boolean>
  sponsor_response: Record<string, string> | null
  sponsor_brief: Record<string, string> | null
  triage: { status: string; unresolved: string[] }
  audit: {
    actor_id: string
    action: string
    detail: Record<string, unknown>
    created_at: string
  }[]
  messages: {
    id: string
    body: string
    from_staff: boolean
    created_at: string
  }[]
  offers: { id: string; state: string; expires_at: string }[]
  grant: { status: string; evidence_reference: string } | null
}
export default function AdminDetail({ id }: { id: string }) {
  const [data, setData] = useState<Detail | null>(null),
    [cohorts, setCohorts] = useState<Cohort[]>([]),
    [versions, setVersions] = useState<
      { id: string; version: number; approved: boolean }[]
    >([]),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [packageLink, setPackageLink] = useState('')
  const load = useCallback(async () => {
    const results = await Promise.all(
      [
        '/api/executive-ai/admin/' + id,
        '/api/executive-ai/admin',
        '/api/executive-ai/admin/config',
      ].map(async (p) => {
        const r = await fetch(p, { cache: 'no-store' })
        const d = await r.json()
        if (!r.ok) throw new Error(d.error)
        return d
      }),
    )
    setData(results[0])
    setCohorts(results[1].cohorts)
    setVersions(results[2].versions)
  }, [id])
  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [load])
  async function save(payload: unknown, workflow = true) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const r = await fetch(
        '/api/executive-ai/admin/' + id + (workflow ? '/workflow' : ''),
        {
          method: workflow ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      if (result.packageId)
        setPackageLink(
          '/api/executive-ai/documents/grant?packageId=' + result.packageId,
        )
      setNotice('Saved with an audit record.')
      await load()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-7">
      <Link href="/portal/admin/executive-ai" className="underline text-sm">
        ← Admissions queue
      </Link>
      {error && (
        <p role="alert" className="eai-alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-green-800">
          {notice}
        </p>
      )}
      {!data && !error && <p>Loading application…</p>}
      {data && (
        <>
          <header>
            <p className="text-sm text-gray-500">
              {data.reference} · {stageLabel(data.status)} · Revision{' '}
              {data.version}
            </p>
            <h1 className="portal-title text-3xl mt-3">{data.name}</h1>
            <p className="portal-body mt-3">
              {data.employer} · {data.email} ·{' '}
              {data.kind === 'employer'
                ? 'Employer enquiry'
                : 'Executive application'}
            </p>
          </header>
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">Private intake</h2>
            <dl className="grid gap-5 mt-5">
              {Object.entries(data.intake)
                .filter(
                  ([key]) => !['requestId', 'website', 'consent'].includes(key),
                )
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap break-words">
                      {String(value ?? 'Not supplied')}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">Employer sponsorship</h2>
            {data.sponsor_response ? (
              <dl className="mt-4 space-y-3">
                {Object.entries(data.sponsor_response).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-gray-500">{key}</dt>
                    <dd className="whitespace-pre-wrap break-words">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                No sponsorship response has been recorded.
              </p>
            )}
            <p className="text-sm mt-5">
              A response is an attestation. Verify representative authority and
              actual funding/data permissions before checking the confirmation
              below.
            </p>
          </section>
          <form
            key={data.version}
            className="eai-form portal-card p-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              const d = new FormData(e.currentTarget)
              save(
                {
                  version: data.version,
                  status: d.get('status'),
                  cohortId: d.get('cohortId') || null,
                  note: d.get('note'),
                  dataApproval: d.get('dataApproval'),
                  sponsorVerified: d.has('sponsorVerified'),
                },
                false,
              )
            }}
          >
            <h2 className="text-xl font-semibold">
              Review and record a decision
            </h2>
            <div className="eai-grid">
              <label className="eai-field">
                <span>Status</span>
                <select name="status" defaultValue={data.status}>
                  {stages
                    .filter(
                      (s) =>
                        s === data.status ||
                        transitions[data.status].includes(s),
                    )
                    .map((s) => (
                      <option key={s} value={s}>
                        {stageLabel(s)}
                      </option>
                    ))}
                </select>
              </label>
              <label className="eai-field">
                <span>Proposed cohort</span>
                <select name="cohortId" defaultValue={data.cohort_id || ''}>
                  <option value="">Not assigned</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.available} available · {c.state}
                    </option>
                  ))}
                </select>
              </label>
              <label className="eai-field">
                <span>Employer tools / data permission</span>
                <select name="dataApproval" defaultValue={data.data_approval}>
                  <option value="not_started">Not started</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved and verified</option>
                </select>
              </label>
            </div>
            <label className="eai-check">
              <input
                name="sponsorVerified"
                type="checkbox"
                defaultChecked={data.sponsor_verified}
              />
              <span>
                I have verified employer sponsorship, representative authority
                and the funding arrangement. Record the evidence in the private
                note.
              </span>
            </label>
            <TextArea name="note" label="Private review note and evidence" />
            <button disabled={busy} className="portal-button">
              Save review
            </button>
            <p className="text-xs text-gray-500">
              This note stays private. Use the correspondence form below for
              information the applicant should see.
            </p>
          </form>
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">
              Correspondence with applicant
            </h2>
            <div className="space-y-3 mt-5">
              {data.messages.map((m) => (
                <div className="rounded bg-slate-50 p-4" key={m.id}>
                  <p className="text-xs text-gray-500">
                    {m.from_staff ? 'Admissions' : 'Applicant'} ·{' '}
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>
            <form
              className="eai-form space-y-4 mt-5"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                if (
                  await save({
                    action: 'message',
                    text: new FormData(form).get('text'),
                  })
                )
                  form.reset()
              }}
            >
              <TextArea
                name="text"
                label="Request information or provide an update"
              />
              <button disabled={busy} className="portal-button">
                Save update to applicant portal
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              The update appears in the applicant’s private workspace. No email
              is sent.
            </p>
          </section>
          {data.kind === 'executive' && (
            <section className="portal-card p-6">
              <h2 className="text-xl font-semibold">
                Issue a documented offer
              </h2>
              <p className="text-sm text-gray-600 mt-3">
                Requires qualified/waitlisted status, verified sponsorship,
                approved tools/data, an approved course version and a real
                available cohort.
              </p>
              <form
                className="eai-form space-y-5 mt-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  const d = new FormData(e.currentTarget)
                  save({
                    action: 'offer',
                    input: {
                      version: data.version,
                      courseVersionId: d.get('courseVersionId'),
                      cohortId: d.get('cohortId'),
                      expiresAt: new Date(
                        String(d.get('expiresAt')),
                      ).toISOString(),
                      projectScope: d.get('projectScope'),
                      acceptanceCriteria: d.get('acceptanceCriteria'),
                    },
                  })
                }}
              >
                <div className="eai-grid">
                  <label className="eai-field">
                    <span>Approved course / terms version</span>
                    <select name="courseVersionId" required defaultValue="">
                      <option value="" disabled>
                        Select a version
                      </option>
                      {versions
                        .filter((v) => v.approved)
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            Version {v.version}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="eai-field">
                    <span>Cohort</span>
                    <select name="cohortId" required defaultValue="">
                      <option value="" disabled>
                        Select a cohort
                      </option>
                      {cohorts
                        .filter((c) => c.state === 'open')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} · {c.available} available
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="eai-field">
                    <span>Offer expiry (your local time)</span>
                    <input type="datetime-local" name="expiresAt" required />
                  </label>
                </div>
                <TextArea
                  name="projectScope"
                  label="Agreed project scope and boundaries"
                />
                <TextArea
                  name="acceptanceCriteria"
                  label="Measurable employer acceptance criteria"
                />
                <button className="portal-button" disabled={busy}>
                  Issue offer and hold one place
                </button>
              </form>
              <ul className="mt-5 text-sm space-y-2">
                {data.offers.map((o) => (
                  <li key={o.id}>
                    {stageLabel(o.state)} · expires{' '}
                    {new Date(o.expires_at).toLocaleString()}
                    {o.state === 'issued' &&
                    new Date(o.expires_at) <= new Date()
                      ? ' · expired, seat released'
                      : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">Grant preparation</h2>
            <p className="text-sm mt-3">
              Triage: {stageLabel(data.triage.status)}. This is not a government
              eligibility decision.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-sm">
              {data.triage.unresolved.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <button
              className="portal-button mt-5"
              disabled={busy}
              onClick={() => save({ action: 'prepare_package' })}
            >
              Create versioned employer package
            </button>
            {packageLink && (
              <a className="underline ml-4" href={packageLink}>
                Download PDF
              </a>
            )}
            <PackageHistory packages={data.packages} />
            <form
              className="eai-form mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                save({
                  action: 'grant_report',
                  input: Object.fromEntries(new FormData(e.currentTarget)),
                })
              }}
            >
              <label className="eai-field">
                <span>Attributed funding status</span>
                <select name="status">
                  <option value="preparing">Preparing</option>
                  <option value="employer_reported_submitted">
                    Employer reports submitted
                  </option>
                  <option value="employer_reported_approved">
                    Employer reports approved
                  </option>
                  <option value="employer_reported_declined">
                    Employer reports declined
                  </option>
                  <option value="staff_evidence_reviewed">
                    Staff reviewed supporting evidence
                  </option>
                </select>
              </label>
              <label className="eai-field">
                <span>Dated receipt / decision / evidence reference</span>
                <input name="evidenceReference" maxLength={1500} />
              </label>
              <TextArea
                name="notes"
                label="Evidence review details"
                required={false}
              />
              <button disabled={busy} className="portal-button">
                Record funding update
              </button>
            </form>
          </section>
          <details className="portal-card p-6">
            <summary className="font-semibold cursor-pointer">
              Private audit history ({data.audit.length})
            </summary>
            <ol className="mt-5 space-y-5">
              {data.audit.map((a, i) => (
                <li key={i} className="border-b pb-4">
                  <p className="text-sm font-semibold">
                    {stageLabel(a.action)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(a.created_at).toLocaleString()} · {a.actor_id}
                  </p>
                  <dl className="text-sm mt-3 space-y-2">
                    {Object.entries(a.detail).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-medium">{stageLabel(key)}</dt>
                        <dd className="whitespace-pre-wrap break-words">
                          {typeof value === 'string'
                            ? value
                            : JSON.stringify(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </div>
  )
}
