'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, RefreshCw, Save } from 'lucide-react'
import { staffUpdateAssessment } from '../../../prototype-readiness/actions'

type StatusValue =
  | 'submitted'
  | 'reviewing'
  | 'contacted'
  | 'closed_won'
  | 'closed_lost'
  | 'archived'

const STATUS_OPTIONS: { value: StatusValue; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed_won', label: 'Closed — Won' },
  { value: 'closed_lost', label: 'Closed — Lost' },
  { value: 'archived', label: 'Archived' },
]

export default function AdminControls({
  assessmentId,
  initialStatus,
  initialNotes,
}: {
  assessmentId: string
  initialStatus: string
  initialNotes: string
}) {
  const [status, setStatus] = useState<string>(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const [isPending, setIsPending] = useState(false)

  async function save(rescore: boolean) {
    setIsPending(true)
    try {
      const res = await staffUpdateAssessment({
        assessmentId,
        status:
          status !== 'in_progress' ? (status as StatusValue) : undefined,
        internalNotes: notes,
        rescore,
      })
      if (!res.ok) {
        toast.error(res.error || 'Could not save.')
      } else {
        toast.success(rescore ? 'Saved and rescored.' : 'Saved.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
      <h2 className="text-[1rem] font-serif text-[#1A1A1A] mb-1">
        Staff workspace
      </h2>
      <p className="text-[13px] text-[#5A5A5A] mb-6">
        Update status, leave internal notes, or re-run the scoring after edits.
      </p>

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            Status
          </label>
          <select
            value={status === 'in_progress' ? 'submitted' : status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border-[1.5px] border-[#E5E5E5] rounded-[4px] px-4 py-2.5 text-[14px] text-[#1A1A1A] bg-white focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
            Internal notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for the execom team only. Not visible to the founder."
            className="w-full border-[1.5px] border-[#E5E5E5] rounded-[4px] px-4 py-3 text-[14px] text-[#1A1A1A] bg-white focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none resize-y"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={isPending}
          className="inline-flex items-center gap-2 text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-blue text-white text-[14px] font-semibold py-2.5 px-5 rounded-[5px] hover:bg-blue-dark transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Save &amp; rescore
        </button>
      </div>
    </div>
  )
}
