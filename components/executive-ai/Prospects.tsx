'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
type Prospect = {
  id: string
  record_type: string
  name: string
  region: string
  contact_name: string
  contact_role: string
  contact_route: string
  source_url: string
  process_hypothesis: string
  research_notes: string
  introduction_notes: string
  stage: string
  evidence: { url: string; note: string }[]
}
export default function Prospects() {
  const [items, setItems] = useState<Prospect[]>([]),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    const r = await fetch('/api/executive-ai/admin/prospects', {
      cache: 'no-store',
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    setItems(data.prospects)
  }, [])
  useEffect(() => {
    load().catch((e) => setError(e.message))
  }, [load])
  async function save(payload: unknown) {
    setError('')
    setBusy(true)
    try {
      const r = await fetch('/api/executive-ai/admin/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setNotice(
        data.imported
          ? `${data.imported} research records imported. No applications or marketing consent were created.`
          : 'Introduction notes saved.',
      )
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-6">
      <Link href="/portal/admin/executive-ai" className="underline text-sm">
        ← Admissions
      </Link>
      <h1 className="portal-title text-3xl">Private research prospects</h1>
      <p className="portal-body">
        Research hypotheses and public contact routes. These records are not
        applications, bookings or marketing consent. No outreach is sent from
        this view.
      </p>
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
      <section className="portal-card p-6">
        <h2 className="font-semibold text-lg">
          Import employer or channel research
        </h2>
        <p className="text-sm text-gray-600 mt-3">
          Upload a private JSON array using the documented import format. Import
          small batches up to 50 records and 32 KB. A stable sourceKey makes
          repeat imports update research while preserving introduction notes.
        </p>
        <label className="eai-field mt-5">
          <span>Private research JSON file</span>
          <input
            disabled={busy}
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              try {
                if (file.size > 30_000)
                  throw new Error(
                    'Split the research into batches below 30 KB.',
                  )
                await save({
                  action: 'import',
                  rows: JSON.parse(await file.text()),
                })
              } catch (err) {
                setError((err as Error).message)
              }
              e.target.value = ''
            }}
          />
        </label>
      </section>
      <p className="text-sm">
        {items.filter((p) => p.record_type === 'employer').length} employers ·{' '}
        {items.filter((p) => p.record_type === 'channel').length} referral
        channels
      </p>
      {!items.length && (
        <p className="text-gray-500">
          No research records imported. Import the private source data when it
          is available.
        </p>
      )}
      {items.map((p) => (
        <details key={p.id} className="portal-card p-6">
          <summary className="cursor-pointer font-semibold">
            {p.name} · {p.region} · {p.stage.replaceAll('_', ' ')}
          </summary>
          <div className="mt-5 space-y-4 text-sm">
            <p>
              {p.contact_name} · {p.contact_role}
            </p>
            <p>{p.contact_route}</p>
            <p>
              <strong>Process hypothesis:</strong>{' '}
              {p.process_hypothesis || 'Not yet defined'}
            </p>
            <p className="whitespace-pre-wrap">{p.research_notes}</p>
            <a
              href={p.source_url}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Primary evidence source
            </a>
            <ul className="space-y-2">
              {p.evidence.map((e, i) => (
                <li key={i}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Evidence {i + 1}
                  </a>{' '}
                  · {e.note}
                </li>
              ))}
            </ul>
            <form
              className="eai-form space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const d = new FormData(e.currentTarget)
                save({
                  action: 'update',
                  id: p.id,
                  stage: d.get('stage'),
                  introductionNotes: d.get('introductionNotes'),
                })
              }}
            >
              <label className="eai-field">
                <span>Research stage</span>
                <select name="stage" defaultValue={p.stage}>
                  {[
                    'researched',
                    'introduction_mapped',
                    'conversation',
                    'not_fit',
                  ].map((s) => (
                    <option value={s} key={s}>
                      {s.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="eai-field">
                <span>Network introduction and discovery notes</span>
                <textarea
                  name="introductionNotes"
                  rows={3}
                  maxLength={3000}
                  defaultValue={p.introduction_notes}
                />
              </label>
              <button className="portal-button" disabled={busy}>
                Save notes
              </button>
            </form>
          </div>
        </details>
      ))}
    </div>
  )
}
