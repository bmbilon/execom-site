'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { toast } from 'sonner'

const COST_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'wages', label: 'Wages' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'materials', label: 'Materials' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'other', label: 'Other' },
]

interface CostEntryFormProps {
  projectId: string
  claimYearId: string
  onSaved: () => void
}

export default function CostEntryForm({ projectId, claimYearId, onSaved }: CostEntryFormProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    cost_type: 'salary',
    description: '',
    amount: '',
    hours: '',
    rate: '',
    employee_name: '',
    vendor_name: '',
    external_reference: '',
    period_start: '',
    period_end: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('costs').insert({
      project_id: projectId,
      claim_year_id: claimYearId,
      cost_type: form.cost_type,
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      hours: form.hours ? parseFloat(form.hours) : null,
      rate: form.rate ? parseFloat(form.rate) : null,
      employee_name: form.employee_name.trim() || null,
      vendor_name: form.vendor_name.trim() || null,
      external_reference: form.external_reference.trim() || null,
      period_start: form.period_start || null,
      period_end: form.period_end || null,
    })

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    setForm({
      cost_type: 'salary',
      description: '',
      amount: '',
      hours: '',
      rate: '',
      employee_name: '',
      vendor_name: '',
      external_reference: '',
      period_start: '',
      period_end: '',
    })
    setSaving(false)
    toast.success('Cost added')
    onSaved()
  }

  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'
  const showEmployeeField = form.cost_type === 'salary' || form.cost_type === 'wages'
  const showVendorField = form.cost_type === 'subcontractor' || form.cost_type === 'materials'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Cost Type</label>
          <select
            value={form.cost_type}
            onChange={(e) => update('cost_type', e.target.value)}
            className={inputClass}
          >
            {COST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            required
            className={inputClass}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          required
          className={inputClass}
          placeholder="Brief description of this cost"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hours</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.hours}
            onChange={(e) => update('hours', e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className={labelClass}>Rate ($/hr)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.rate}
            onChange={(e) => update('rate', e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>

      {showEmployeeField && (
        <div>
          <label className={labelClass}>Employee Name</label>
          <input
            type="text"
            value={form.employee_name}
            onChange={(e) => update('employee_name', e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {showVendorField && (
        <div>
          <label className={labelClass}>Vendor Name</label>
          <input
            type="text"
            value={form.vendor_name}
            onChange={(e) => update('vendor_name', e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass}>External Reference</label>
        <input
          type="text"
          value={form.external_reference}
          onChange={(e) => update('external_reference', e.target.value)}
          className={inputClass}
          placeholder="PO number, invoice ref, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Period Start</label>
          <input
            type="date"
            value={form.period_start}
            onChange={(e) => update('period_start', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Period End</label>
          <input
            type="date"
            value={form.period_end}
            onChange={(e) => update('period_end', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !form.description.trim() || !form.amount}
        className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
      >
        {saving ? 'Adding...' : 'Add Cost'}
      </button>
    </form>
  )
}
