'use client'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' },
  in_progress: { bg: 'bg-blue/10', text: 'text-blue', label: 'In Progress' },
  ready_for_review: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready for Review' },
  under_review: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Under Review' },
  changes_requested: { bg: 'bg-red-100', text: 'text-red-700', label: 'Changes Requested' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
  filed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Filed' },
  complete: { bg: 'bg-green-100', text: 'text-green-700', label: 'Complete' },
  flagged: { bg: 'bg-red-100', text: 'text-red-700', label: 'Flagged' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
  in_review: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Review' },
}

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded ${style.bg} ${style.text} text-[11px] font-semibold uppercase tracking-wide`}
    >
      {style.label}
    </span>
  )
}
