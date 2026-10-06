'use client'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Field, TextArea } from './IntakeForm'
import { stages, stageLabel } from '@/lib/executive-ai/config'
import type { Cohort } from '@/lib/executive-ai/service'
import type { CourseContent } from '@/lib/executive-ai/workflows'
type Row = {
  id: string
  reference: string
  kind: string
  name: string
  email: string
  employer: string
  status: string
  grant_interest: string
  requested_seats: string
  sponsor_decision: string
}
type Config = {
  versions: {
    id: string
    version: number
    approved: boolean
    content: CourseContent
  }[]
  defaults: CourseContent
  settings: { max_active_cohorts: number }
}
export default function AdminHome() {
  const [data, setData] = useState<{
      applications: Row[]
      cohorts: Cohort[]
    } | null>(null),
    [config, setConfig] = useState<Config | null>(null)
  const [tab, setTab] = useState('queue'),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState({ q: '', status: '' }),
    [editing, setEditing] = useState<Cohort | null>(null)
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch('/api/executive-ai/admin?' + new URLSearchParams(filter), {
        cache: 'no-store',
      }),
      fetch('/api/executive-ai/admin/config', { cache: 'no-store' }),
    ])
    const [queue, c] = await Promise.all([a.json(), b.json()])
    if (!a.ok || !b.ok) throw new Error(queue.error || c.error)
    setData(queue)
    setConfig(c)
  }, [filter])
  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [load])
  async function post(path: string, payload: unknown) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const r = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      setNotice('Saved to admissions records.')
      await load()
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setBusy(false)
    }
  }
  async function saveCohort(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d = new FormData(e.currentTarget),
      dt = (name: string) =>
        d.get(name) ? new Date(String(d.get(name))).toISOString() : null
    const input = {
      ...(editing ? { id: editing.id, version: editing.version } : {}),
      name: d.get('name'),
      location: d.get('location'),
      startsAt: dt('startsAt'),
      endsAt: dt('endsAt'),
      deadline: dt('deadline'),
      capacity: Number(d.get('capacity')),
      state: d.get('state'),
      schedule: d.get('schedule'),
      instructionalHours: d.get('instructionalHours')
        ? Number(d.get('instructionalHours'))
        : null,
    }
    if (await post('/api/executive-ai/admin/cohorts', input)) setEditing(null)
  }
  const local = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  }
  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs tracking-widest uppercase text-gray-500">
          Private admissions
        </p>
        <h1 className="portal-title text-3xl mt-3">Executive AI Practicum</h1>
        <p className="portal-body mt-3">
          Applications, sponsorship, documented decisions and real cohort
          capacity.
        </p>
      </header>
      <nav className="flex flex-wrap gap-2" aria-label="Admissions views">
        {[
          ['queue', 'Applications'],
          ['cohorts', 'Cohorts'],
          ['program', 'Course & terms'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={
              tab === key ? 'portal-button' : 'border rounded px-4 py-2 text-sm'
            }
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
        <Link
          href="/portal/admin/executive-ai/prospects"
          className="border rounded px-4 py-2 text-sm"
        >
          Research prospects
        </Link>
        <Link
          href="/executive-ai"
          className="underline self-center ml-2 text-sm"
        >
          View public page
        </Link>
      </nav>
      {error && (
        <p role="alert" className="eai-alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-green-800 text-sm">
          {notice}
        </p>
      )}
      {!data && !error && <p role="status">Loading admissions…</p>}
      {data && tab === 'queue' && (
        <section className="portal-card p-6">
          <form
            className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const d = new FormData(e.currentTarget)
              setFilter({
                q: String(d.get('q')),
                status: String(d.get('status')),
              })
            }}
          >
            <label className="eai-field flex-1">
              <span>Search name, employer or reference</span>
              <input name="q" maxLength={120} />
            </label>
            <label className="eai-field">
              <span>Status</span>
              <select name="status">
                <option value="">All statuses</option>
                {stages.map((s) => (
                  <option value={s} key={s}>
                    {stageLabel(s)}
                  </option>
                ))}
              </select>
            </label>
            <button className="portal-button">Filter</button>
          </form>
          <p className="text-sm text-gray-500 mt-5">
            {data.applications.length} results (most recent 200). Employer
            enquiries and research prospects do not consume seats.
          </p>
          <div className="mt-5 space-y-3">
            {data.applications.map((a) => (
              <Link
                key={a.id}
                href={'/portal/admin/executive-ai/' + a.id}
                className="block border rounded-lg p-5 hover:bg-slate-50"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {a.name} · {a.employer}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {a.reference} · {a.email}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {stageLabel(a.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {a.kind === 'employer'
                    ? `HR / employer · ${a.requested_seats} potential participants`
                    : 'Individual executive'}{' '}
                  · Grant support{' '}
                  {a.grant_interest === 'true' ? 'requested' : 'not requested'}{' '}
                  · Sponsor {a.sponsor_decision || 'pending'}
                </p>
              </Link>
            ))}
            {!data.applications.length && (
              <p className="py-8 text-gray-500">
                No applications match this view.
              </p>
            )}
          </div>
        </section>
      )}
      {data && tab === 'cohorts' && (
        <>
          <section className="portal-card p-6">
            <h2 className="text-xl font-semibold">Planning and capacity</h2>
            <p className="text-sm text-gray-600 mt-3">
              Maximum six places per cohort. Accepted, enrolled and unexpired
              offered places count against capacity. Draft cohorts and
              unconfirmed dates are private.
            </p>
            <form
              className="mt-5 flex flex-wrap gap-3 items-end"
              onSubmit={(e) => {
                e.preventDefault()
                post('/api/executive-ai/admin/config', {
                  action: 'settings',
                  maxActiveCohorts: Number(
                    new FormData(e.currentTarget).get('max'),
                  ),
                })
              }}
            >
              <label className="eai-field">
                <span>Concurrent active cohorts</span>
                <input
                  type="number"
                  name="max"
                  min={1}
                  max={5}
                  required
                  defaultValue={config?.settings.max_active_cohorts}
                />
              </label>
              <button className="portal-button" disabled={busy}>
                Update planning limit
              </button>
            </form>
            <div className="mt-6 space-y-4">
              {data.cohorts.map((c) => (
                <div
                  className="border rounded-lg p-4 flex flex-wrap justify-between gap-4"
                  key={c.id}
                >
                  <div>
                    <p className="font-semibold">
                      {c.name} · {stageLabel(c.state)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {c.starts_at
                        ? new Date(c.starts_at).toLocaleString()
                        : 'Dates pending'}{' '}
                      · {c.occupied}/{c.capacity} allocated
                    </p>
                  </div>
                  <button
                    className="underline text-sm"
                    onClick={() => setEditing(c)}
                  >
                    Edit cohort
                  </button>
                </div>
              ))}
            </div>
          </section>
          <form
            key={editing?.id || 'new'}
            className="portal-card p-6 eai-form space-y-5"
            onSubmit={saveCohort}
          >
            <h2 className="text-xl font-semibold">
              {editing ? 'Edit cohort' : 'Create cohort'}
            </h2>
            <div className="eai-grid">
              <Field name="name" label="Cohort name" value={editing?.name} />
              <Field
                name="location"
                label="Delivery location / format"
                value={editing?.location || 'Calgary, Alberta'}
              />
              {[
                ['startsAt', 'Start', editing?.starts_at],
                ['endsAt', 'End', editing?.ends_at],
                ['deadline', 'Application deadline', editing?.deadline],
              ].map(([name, label, date]) => (
                <label className="eai-field" key={name}>
                  <span>{label} (your local time)</span>
                  <input
                    type="datetime-local"
                    name={name!}
                    defaultValue={local(date || null)}
                  />
                </label>
              ))}
              <label className="eai-field">
                <span>Capacity</span>
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  max={6}
                  defaultValue={editing?.capacity || 6}
                  required
                />
              </label>
              <label className="eai-field">
                <span>Confirmed instructional hours</span>
                <input
                  name="instructionalHours"
                  type="number"
                  min={1}
                  max={500}
                  step="0.25"
                  defaultValue={editing?.instructional_hours || 10}
                />
              </label>
              <label className="eai-field">
                <span>Cohort state</span>
                <select name="state" defaultValue={editing?.state || 'draft'}>
                  {['draft', 'open', 'closed', 'completed', 'cancelled'].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
            </div>
            <label className="eai-field">
              <span>Confirmed schedule, timezone and attendance format</span>
              <textarea
                name="schedule"
                rows={4}
                maxLength={4000}
                defaultValue={editing?.schedule || ''}
              />
            </label>
            <button className="portal-button" disabled={busy}>
              {busy ? 'Saving…' : 'Save cohort'}
            </button>
            {editing && (
              <button
                type="button"
                className="underline ml-4"
                onClick={() => setEditing(null)}
              >
                Cancel edit
              </button>
            )}
          </form>
        </>
      )}
      {config && tab === 'program' && (
        <section className="portal-card p-6">
          <h2 className="text-xl font-semibold">
            Versioned course and commercial terms
          </h2>
          <p className="text-sm text-gray-600 mt-3">
            Each save creates an immutable version. Existing offers and
            downloaded grant packages retain the version used when issued. An
            offer cannot be issued until the contracting entity, build allowance
            and commercial terms are set.
          </p>
          <CourseForm
            key={config.versions[0]?.id || 'initial'}
            content={
              config.versions[0]
                ? {
                    ...config.versions[0].content,
                    approved: config.versions[0].approved,
                  }
                : config.defaults
            }
            busy={busy}
            onSave={(input) =>
              post('/api/executive-ai/admin/config', {
                action: 'course',
                input,
              })
            }
          />
          <div className="mt-7 space-y-2">
            {config.versions.map((v) => (
              <p className="text-sm" key={v.id}>
                Version {v.version} ·{' '}
                {v.approved ? 'Approved for offers' : 'Draft'} ·{' '}
                {v.content.legalEntity || 'Training entity unresolved'}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
function CourseForm({
  content,
  busy,
  onSave,
}: {
  content: CourseContent
  busy: boolean
  onSave: (value: unknown) => Promise<boolean>
}) {
  return (
    <form
      className="eai-form mt-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        const d = new FormData(e.currentTarget)
        onSave({
          ...Object.fromEntries(d),
          trainingCostCAD:
            d.get('trainingCostCAD') === ''
              ? null
              : Number(d.get('trainingCostCAD')),
          buildCostCAD:
            d.get('buildCostCAD') === '' ? null : Number(d.get('buildCostCAD')),
          approved: d.has('approved'),
        })
      }}
    >
      <div className="eai-grid">
        <Field
          label="Contracting / training legal entity"
          name="legalEntity"
          required={false}
          value={content.legalEntity}
        />
        <Field
          label="Provider address"
          name="providerAddress"
          required={false}
          value={content.providerAddress}
        />
      </div>
      {[
        ['curriculum', 'Learning plan and curriculum'],
        ['assessment', 'Assessment and completion evidence'],
        [
          'buildAllowance',
          'Provider build allowance and internal staff responsibilities',
        ],
        [
          'softwareAndIntegrations',
          'Software, integrations and ongoing support responsibilities',
        ],
        [
          'terms',
          'Commercial terms (payment, cancellation, refunds, IP and acceptance)',
        ],
        ['eligibilityEvidence', 'Dated provider/course eligibility evidence'],
      ].map(([key, label]) => (
        <label className="eai-field" key={key}>
          <span>{label}</span>
          <textarea
            name={key}
            defaultValue={String(content[key as keyof CourseContent] || '')}
            rows={4}
            maxLength={6000}
          />
        </label>
      ))}
      <div className="eai-grid">
        {[
          ['trainingCostCAD', 'Instructional training allocation (C$)'],
          ['buildCostCAD', 'Build / implementation allocation (C$)'],
        ].map(([key, label]) => (
          <label className="eai-field" key={key}>
            <span>{label}</span>
            <input
              name={key}
              type="number"
              min={0}
              max={10000}
              step="0.01"
              defaultValue={
                (content[key as keyof CourseContent] as number) ?? ''
              }
            />
          </label>
        ))}
        {[
          ['providerEligibility', 'Provider eligibility'],
          ['courseEligibility', 'Course eligibility'],
        ].map(([key, label]) => (
          <label className="eai-field" key={key}>
            <span>{label}</span>
            <select
              name={key}
              defaultValue={String(content[key as keyof CourseContent])}
            >
              <option value="unresolved">Unresolved</option>
              <option value="evidence_reviewed">Dated evidence reviewed</option>
            </select>
          </label>
        ))}
      </div>
      <label className="eai-check">
        <input
          type="checkbox"
          name="approved"
          defaultChecked={content.approved}
        />
        <span>
          Approve this course and commercial version for offers. This is an
          internal approval and does not certify grant eligibility.
        </span>
      </label>
      <button className="portal-button" disabled={busy}>
        Save a new version
      </button>
    </form>
  )
}
