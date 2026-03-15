'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'

interface FileRecord {
  id: string
  file_name: string
  category: string
  mime_type: string | null
  file_size: number | null
  uploaded_at: string
  storage_key: string
}

const CATEGORIES = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'technical', label: 'Technical' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
]

function formatSize(bytes: number | null): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileGrid({
  files,
  onUpdate,
}: {
  files: FileRecord[]
  onUpdate: () => void
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function handleCategoryChange(fileId: string, category: string) {
    setUpdatingId(fileId)
    const supabase = createClient()
    await supabase.from('files').update({ category }).eq('id', fileId)
    setUpdatingId(null)
    onUpdate()
  }

  async function handleDelete(fileId: string, storageKey: string) {
    const supabase = createClient()
    await supabase.storage.from('sred-files').remove([storageKey])
    await supabase.from('files').delete().eq('id', fileId)
    onUpdate()
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white border border-[#E5E5E5] rounded-[6px] px-5 py-4 flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-[#1A1A1A] font-medium truncate">
              {file.file_name}
            </p>
            <p className="text-[12px] text-[#5A5A5A]">
              {formatSize(file.file_size)} — {new Date(file.uploaded_at).toLocaleDateString()}
            </p>
          </div>

          <select
            value={file.category}
            onChange={(e) => handleCategoryChange(file.id, e.target.value)}
            disabled={updatingId === file.id}
            className="border border-[#E5E5E5] rounded px-3 py-1.5 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleDelete(file.id, file.storage_key)}
            className="text-[12px] text-[#5A5A5A] hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}
