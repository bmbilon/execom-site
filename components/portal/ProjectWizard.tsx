'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STEPS = [
  {
    field: 'objective' as const,
    heading: 'What were you trying to achieve?',
    tooltip: 'T661 Part 2, Line 242, Objective',
    min: 100,
    max: 2000,
  },
  {
    field: 'uncertainty' as const,
    heading: "What didn't you know how to do?",
    tooltip: 'T661 Part 2, Line 244, Uncertainty',
    min: 100,
    max: 2000,
  },
  {
    field: 'work_done' as const,
    heading: 'What work did you do?',
    tooltip: 'T661 Part 2, Line 246, Work Performed',
    min: 200,
    max: 4000,
  },
  {
    field: 'advancement' as const,
    heading: 'What did you learn or discover?',
    tooltip: 'T661 Part 2, Line 248, Advancement',
    min: 100,
    max: 2000,
  },
]

type NarrativeField = 'objective' | 'uncertainty' | 'work_done' | 'advancement'

interface ProjectWizardProps {
  projectId: string
  claimYearId: string
  initial: {
    objective: string
    uncertainty: string
    work_done: string
    advancement: string
  }
}

export default function ProjectWizard({ projectId, claimYearId, initial }: ProjectWizardProps) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const router = useRouter()

  const current = STEPS[step]
  const value = values[current.field]
  const charCount = value.length

  function handleChange(text: string) {
    setValues((prev) => ({ ...prev, [current.field]: text }))
  }

  async function saveDraft() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('projects')
      .update({
        [current.field]: values[current.field],
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    // Check if all fields are filled and meet minimums for auto-complete
    const allFilled = STEPS.every((s) => {
      const v = values[s.field]
      return v.length >= s.min
    })

    if (allFilled) {
      // Check if project has at least 1 cost
      const { count } = await supabase
        .from('costs')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)

      if (count && count > 0) {
        await supabase
          .from('projects')
          .update({ status: 'complete' })
          .eq('id', projectId)
      }
    }

    setSaving(false)
    toast.success('Draft saved')
    router.refresh()
  }

  function canGoNext() {
    return charCount >= current.min
  }

  return (
    <div>
      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-sm transition-colors ${
              i === step ? 'bg-blue' : i < step ? 'bg-blue/40' : 'bg-[#E5E5E5]'
            }`}
          />
        ))}
      </div>

      {/* Heading with tooltip */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">{current.heading}</h2>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-5 h-5 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[11px] text-[#5A5A5A] hover:border-blue hover:text-blue transition-colors"
          >
            ?
          </button>
          {showTooltip && (
            <div className="absolute left-6 top-0 bg-[#0d1b2a] text-white text-[12px] px-3 py-2 rounded whitespace-nowrap z-10">
              {current.tooltip}
            </div>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={current.max}
        rows={10}
        className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all resize-none"
      />

      {/* Character count */}
      <div className="flex items-center justify-between mt-2">
        <p
          className={`text-[12px] ${
            charCount < current.min ? 'text-[#5A5A5A]' : 'text-green-600'
          }`}
        >
          {charCount} / {current.min} min, {current.max} max
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-[14px] text-blue border border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={saveDraft}
            disabled={saving}
            className="text-[14px] text-[#5A5A5A] border border-[#E5E5E5] px-5 py-2.5 rounded-[5px] hover:border-blue hover:text-blue transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext()}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={saveDraft}
            disabled={saving}
            className="bg-blue text-white text-[14px] font-semibold py-2.5 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save and Finish'}
          </button>
        )}
      </div>
    </div>
  )
}
