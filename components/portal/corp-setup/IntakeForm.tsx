'use client'

import { useState } from 'react'
import type { FormDefinition, FormField } from '@/lib/corp-setup/forms'

interface IntakeFormProps {
  form: FormDefinition
}

function FieldInput({ field, value, onChange }: {
  field: FormField
  value: string
  onChange: (name: string, value: string) => void
}) {
  const base = 'w-full rounded border border-[#E5E5E5] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1A] placeholder:text-[#b8b8b0] focus:outline-none focus:ring-1 focus:ring-[#195E8E] focus:border-[#195E8E] transition-colors'

  if (field.type === 'textarea') {
    return (
      <textarea
        name={field.name}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className={`${base} resize-y min-h-[96px]`}
      />
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <select
        name={field.name}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={base}
      >
        <option value="">Select...</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
      name={field.name}
      value={value}
      onChange={(e) => onChange(field.name, e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  )
}

export default function IntakeForm({ form }: IntakeFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleChange(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Check required fields
    const missing = form.fields
      .filter(f => f.required && f.type !== 'heading' && f.type !== 'note')
      .filter(f => !values[f.name]?.trim())

    if (missing.length > 0) {
      setError(`Please complete: ${missing.map(f => f.label).join(', ')}`)
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/portal/corp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          formTitle: form.title,
          formNumber: form.number,
          phase: form.phaseName,
          fields: form.fields
            .filter(f => f.type !== 'heading' && f.type !== 'note')
            .map(f => ({
              label: f.label,
              value: values[f.name] || '',
            })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Submitted</h2>
        <p className="text-[15px] text-[#5A5A5A]">
          Your information for <span className="font-medium">{form.title}</span> has been received. We will be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="space-y-1">
        {form.fields.map((field) => {
          if (field.type === 'heading') {
            return (
              <div key={field.name} className="pt-6 pb-2 first:pt-0">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E]">
                  {field.label}
                </h3>
                <div className="mt-1 h-px bg-[#E5E5E5]" />
              </div>
            )
          }

          if (field.type === 'note') {
            return (
              <p key={field.name} className="text-[13px] text-[#7a7a72] italic py-1">
                {field.note || field.label}
              </p>
            )
          }

          return (
            <div key={field.name} className="py-2">
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.name] || ''}
                onChange={handleChange}
              />
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mt-6 p-3 rounded bg-red-50 border border-red-200">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
