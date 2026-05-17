'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const EVIDENCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'commit_log', label: 'Commit Log' },
  { value: 'photo', label: 'Photo' },
  { value: 'test_result', label: 'Test Result' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
]

interface EvidencePanelProps {
  projectId: string
  claimYearId: string
  evidence: {
    id: string
    title: string
    evidence_type: string
    description: string | null
    file_id: string | null
    files: { file_name: string } | null
    sort_order: number
  }[]
  availableFiles: {
    id: string
    file_name: string
    category: string
  }[]
}

export default function EvidencePanel({
  projectId,
  claimYearId,
  evidence,
  availableFiles,
}: EvidencePanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    evidence_type: 'document',
    description: '',
    file_id: '',
  })
  const router = useRouter()

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('evidence').insert({
      project_id: projectId,
      claim_year_id: claimYearId,
      title: form.title.trim(),
      evidence_type: form.evidence_type,
      description: form.description.trim() || null,
      file_id: form.file_id || null,
      sort_order: evidence.length,
    })

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    setForm({ title: '', evidence_type: 'document', description: '', file_id: '' })
    setShowForm(false)
    setSaving(false)
    toast.success('Evidence added')
    router.refresh()
  }

  async function handleRemove(id: string) {
    const supabase = createClient()
    await supabase.from('evidence').delete().eq('id', id)
    toast.success('Evidence removed')
    router.refresh()
  }

  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'

  return (
    <div>
      {/* Existing evidence */}
      {evidence.length > 0 && (
        <div className="space-y-2 mb-6">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="border border-[#E5E5E5] rounded px-4 py-3 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#1A1A1A] font-medium">{item.title}</p>
                <p className="text-[12px] text-[#5A5A5A]">
                  {item.evidence_type}
                  {item.files && `, ${item.files.file_name}`}
                </p>
                {item.description && (
                  <p className="text-[13px] text-[#5A5A5A] mt-1">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-[12px] text-[#5A5A5A] hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link from uploaded files */}
      {availableFiles.length > 0 && !showForm && (
        <div className="mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A] mb-2">
            Link from uploaded files
          </p>
          <div className="flex flex-wrap gap-2">
            {availableFiles.map((file) => {
              const alreadyLinked = evidence.some((e) => e.file_id === file.id)
              return (
                <button
                  key={file.id}
                  disabled={alreadyLinked}
                  onClick={() => {
                    setForm({
                      title: file.file_name,
                      evidence_type: 'document',
                      description: '',
                      file_id: file.id,
                    })
                    setShowForm(true)
                  }}
                  className={`text-[12px] px-3 py-1.5 border rounded transition-colors ${
                    alreadyLinked
                      ? 'border-[#E5E5E5] text-[#5A5A5A] opacity-50 cursor-not-allowed'
                      : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-blue hover:text-blue cursor-pointer'
                  }`}
                >
                  {file.file_name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Add evidence form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-[#E5E5E5] pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.evidence_type}
                onChange={(e) => update('evidence_type', e.target.value)}
                className={inputClass}
              >
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {form.file_id && (
            <p className="text-[12px] text-[#5A5A5A]">
              Linked to: {availableFiles.find((f) => f.id === form.file_id)?.file_name}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding...' : 'Add Evidence'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[14px] text-[#5A5A5A] py-2.5 px-4 hover:text-[#1A1A1A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-[14px] text-blue border border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
        >
          Add Evidence Manually
        </button>
      )}
    </div>
  )
}
