'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

export interface AuditRow {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  old_value: unknown
  new_value: unknown
  created_at: string
  actor: { full_name: string | null; email: string | null } | null
}

function actionTone(action: string): string {
  if (action.startsWith('grant') || action === 'impersonate_start') return 'bg-amber-100 text-amber-700'
  if (action.startsWith('revoke') || action === 'impersonate_end') return 'bg-red-100 text-red-700'
  if (action === 'file_download') return 'bg-blue/10 text-blue'
  return 'bg-gray-100 text-[#5A5A5A]'
}

function summarize(v: unknown): string {
  if (v == null) return ''
  try {
    const s = JSON.stringify(v)
    return s.length > 80 ? s.slice(0, 79) + '…' : s
  } catch {
    return ''
  }
}

export default function AdminAuditClient({ rows }: { rows: AuditRow[] }) {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')

  const actions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.action))).sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (action !== 'all' && r.action !== action) return false
      if (!q) return true
      return (
        r.action.toLowerCase().includes(q) ||
        (r.entity_type?.toLowerCase().includes(q) ?? false) ||
        (r.actor?.email?.toLowerCase().includes(q) ?? false) ||
        (r.actor?.full_name?.toLowerCase().includes(q) ?? false) ||
        summarize(r.new_value).toLowerCase().includes(q)
      )
    })
  }, [rows, search, action])

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Audit Log
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">Audit Log</h1>
        <p className="portal-body mt-2 text-[14px]">
          Most recent {rows.length} logged actions: impersonations, file downloads,
          access changes, and more.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8b8b0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor, action, entity, details…"
            className="w-full border border-[#E5E5E5] rounded pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
        >
          <option value="all">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="portal-card p-8 text-center text-[14px] text-[#5A5A5A]">
          No audit entries match your filters.
        </div>
      ) : (
        <div className="portal-card overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="bg-surface-raised">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-[#E5E5E5] hover:bg-surface-raised/50 transition-colors">
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('en-CA')}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[#1A1A1A]">{r.actor?.full_name || '—'}</p>
                    <p className="text-[12px] text-[#b8b8b0]">{r.actor?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${actionTone(r.action)}`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">{r.entity_type || '—'}</td>
                  <td className="px-5 py-4 text-[12px] text-[#b8b8b0] font-mono max-w-[280px] truncate">
                    {summarize(r.new_value) || summarize(r.old_value) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
