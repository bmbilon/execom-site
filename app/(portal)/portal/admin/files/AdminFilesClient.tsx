'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { Toaster, toast } from 'sonner'
import { Download, Search } from 'lucide-react'

export interface AdminFileRow {
  id: string
  source: 'sred' | 'commercialization'
  fileName: string
  clientName: string
  // FY tag for SR&ED, or matter type / version for commercialization docs.
  context: string | null
  // SR&ED: payroll/accounting/etc. Commercialization: artifact status.
  category: string
  uploadedBy: string | null
  date: string
  fileSize: number | null
  bucket: string
  // Null for artifacts that were logged but never landed in storage —
  // those rows render as "Not in storage" with the action disabled.
  storageKey: string | null
}

const SOURCE_LABELS: Record<AdminFileRow['source'], string> = {
  sred: 'SR&ED',
  commercialization: 'Corporate / IP',
}

const CATEGORY_LABELS: Record<string, string> = {
  payroll: 'Payroll',
  accounting: 'Accounting',
  technical: 'Technical',
  contract: 'Contract',
  other: 'Other',
  generated: 'Generated',
  superseded: 'Superseded',
  filed_copy: 'Filed copy',
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminFilesClient({ rows }: { rows: AdminFileRow[] }) {
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | AdminFileRow['source']>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const clients = useMemo(
    () => Array.from(new Set(rows.map((r) => r.clientName))).sort((a, b) => a.localeCompare(b)),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (sourceFilter !== 'all' && r.source !== sourceFilter) return false
      if (clientFilter !== 'all' && r.clientName !== clientFilter) return false
      if (!q) return true
      return (
        r.fileName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        (r.context?.toLowerCase().includes(q) ?? false) ||
        (r.uploadedBy?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [rows, search, sourceFilter, clientFilter])

  async function handleDownload(row: AdminFileRow) {
    if (!row.storageKey) return
    setDownloadingId(row.id)
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(row.bucket)
      .createSignedUrl(row.storageKey, 300)

    if (error || !data?.signedUrl) {
      toast.error(`Couldn't open ${row.fileName}`)
      setDownloadingId(null)
      return
    }

    // Audit the access, mirroring the impersonation logging on the
    // Clients page. Fire-and-forget — a logging failure shouldn't block
    // the download.
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      void supabase.from('audit_log').insert({
        user_id: session?.user.id,
        action: 'file_download',
        entity_type: row.source === 'sred' ? 'file' : 'generated_artifact',
        entity_id: null,
        new_value: {
          file_name: row.fileName,
          client: row.clientName,
          storage_key: row.storageKey,
        },
      })
    } catch {
      // ignore — auditing is best-effort
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    setDownloadingId(null)
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Files
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">Client Files</h1>
        <p className="portal-body mt-2 text-[14px]">
          Every document across all clients — SR&amp;ED uploads and generated corporate / IP
          documents. {rows.length} file{rows.length === 1 ? '' : 's'} total.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8b8b0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, clients, uploaders…"
            className="w-full border border-[#E5E5E5] rounded pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
        >
          <option value="all">All sources</option>
          <option value="sred">SR&amp;ED</option>
          <option value="commercialization">Corporate / IP</option>
        </select>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="border border-[#E5E5E5] rounded px-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none max-w-[240px]"
        >
          <option value="all">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="portal-card p-8 text-center text-[14px] text-[#5A5A5A]">
          No files match your filters.
        </div>
      ) : (
        <div className="portal-card overflow-hidden">
          <table className="w-full text-[14px]">
            <thead className="bg-surface-raised">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
                <th className="px-5 py-3">File</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#E5E5E5] hover:bg-surface-raised/50 transition-colors"
                >
                  <td className="px-5 py-4 max-w-[280px]">
                    <p className="font-medium text-[#1A1A1A] truncate">{row.fileName}</p>
                    {row.context && (
                      <p className="text-[12px] text-[#b8b8b0] truncate">{row.context}</p>
                    )}
                    {row.uploadedBy && (
                      <p className="text-[11px] text-[#b8b8b0]">by {row.uploadedBy}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#1A1A1A]">{row.clientName}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-blue/10 text-blue">
                      {SOURCE_LABELS[row.source]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                    {formatSize(row.fileSize)}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A]">
                    {new Date(row.date).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {row.storageKey ? (
                      <button
                        onClick={() => handleDownload(row)}
                        disabled={downloadingId === row.id}
                        className="inline-flex items-center gap-1.5 text-[13px] text-blue hover:underline disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloadingId === row.id ? 'Opening…' : 'Download'}
                      </button>
                    ) : (
                      <span className="text-[12px] text-[#b8b8b0]">Not in storage</span>
                    )}
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
