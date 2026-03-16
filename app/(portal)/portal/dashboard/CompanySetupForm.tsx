'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'

export default function CompanySetupForm({
  userId,
  email,
  fullName,
}: {
  userId: string
  email: string
  fullName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: '',
    legal_name: '',
    bn: '',
    fiscal_ye_month: 12,
    industry: '',
    street: '',
    city: '',
    province: '',
    postal: '',
  })

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/portal/setup-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.refresh()
  }

  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Company Name *</label>
        <input
          type="text"
          value={form.company_name}
          onChange={(e) => update('company_name', e.target.value)}
          required
          className={inputClass}
          placeholder="Your company name"
        />
      </div>

      <div>
        <label className={labelClass}>Legal Name</label>
        <input
          type="text"
          value={form.legal_name}
          onChange={(e) => update('legal_name', e.target.value)}
          className={inputClass}
          placeholder="As registered with CRA"
        />
      </div>

      <div>
        <label className={labelClass}>CRA Business Number</label>
        <input
          type="text"
          value={form.bn}
          onChange={(e) => update('bn', e.target.value)}
          className={inputClass}
          placeholder="123456789RC0001"
        />
        <p className="text-[12px] text-[#5A5A5A] mt-1">9 digits + 2 letters + 4 digits</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fiscal Year End Month</label>
          <select
            value={form.fiscal_ye_month}
            onChange={(e) => update('fiscal_ye_month', parseInt(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Industry</label>
          <input
            type="text"
            value={form.industry}
            onChange={(e) => update('industry', e.target.value)}
            className={inputClass}
            placeholder="e.g. Software"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => update('street', e.target.value)}
          className={inputClass}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className={inputClass}
            placeholder="City"
          />
        </div>
        <div>
          <input
            type="text"
            value={form.province}
            onChange={(e) => update('province', e.target.value)}
            className={inputClass}
            placeholder="Province"
          />
        </div>
        <div>
          <input
            type="text"
            value={form.postal}
            onChange={(e) => update('postal', e.target.value)}
            className={inputClass}
            placeholder="Postal code"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !form.company_name.trim()}
        className="bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
      >
        {loading ? 'Setting up...' : 'Continue'}
      </button>
    </form>
  )
}
