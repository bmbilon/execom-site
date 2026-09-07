'use client'

// Reviewer transition control.
//
// Sends the row version the reviewer was actually looking at, so two people
// working the queue at once get a conflict instead of one silently overwriting
// the other. A note is mandatory and is written to the audit trail.

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LEAD_TRANSITIONS, type LeadStatus } from '@/lib/sred/schema'

export default function LeadControls({
  leadId,
  status,
  version,
}: {
  leadId: string
  status: LeadStatus
  version: number
}) {
  const router = useRouter()
  const [to, setTo] = useState<LeadStatus | ''>('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowed = LEAD_TRANSITIONS[status] ?? []

  async function submit() {
    setError(null)
    if (!to) return setError('Choose the next status.')
    if (note.trim().length < 5) return setError('Say why in a sentence.')

    setBusy(true)
    try {
      const res = await fetch(`/api/sred/leads/${leadId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_status: to, note: note.trim(), expected_version: version }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          setError('Someone else changed this lead while you had it open. Reload and try again.')
        } else {
          setError(data.error ?? 'Could not apply that change.')
        }
        return
      }
      setNote('')
      setTo('')
      router.refresh()
    } catch {
      setError('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (allowed.length === 0) {
    return (
      <p className="text-[14px] text-[#5A5A5A]">
        This lead is closed. No further transitions are available.
      </p>
    )
  }

  return (
    <div>
      <label
        htmlFor="sred-next-status"
        className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2"
      >
        Move to
      </label>
      <select
        id="sred-next-status"
        value={to}
        onChange={(e) => setTo(e.target.value as LeadStatus)}
        className="w-full min-h-[48px] px-3 text-[15px] border border-[#E5E5E5] rounded-[5px] bg-white mb-4"
      >
        <option value="">Choose a status</option>
        {allowed.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <label
        htmlFor="sred-note"
        className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2"
      >
        Reason (audited)
      </label>
      <textarea
        id="sred-note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full px-3 py-2 text-[15px] border border-[#E5E5E5] rounded-[5px] bg-white mb-4"
        placeholder="Why this file is moving, and what happens next."
      />

      {error && (
        <p role="alert" className="mb-3 text-[14px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
      >
        {busy ? 'Saving…' : 'Apply transition'}
      </button>

      <p className="mt-3 text-[12px] text-[#8a8a82]">
        There is no approved or funded status. Financial execution is out of scope for this build.
      </p>
    </div>
  )
}
