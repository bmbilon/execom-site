'use client'

import { useState, useMemo, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import {
  SECTIONS,
  type AnswerMap,
  type AnswerValue,
  type QuestionDef,
  type QuestionOption,
} from '@/lib/portal/prototype-readiness'
import { saveAssessmentProgress, submitAssessment } from './actions'

interface Props {
  assessmentId: string
  initialStep: number
  initialAnswers: AnswerMap
}

const INPUT_CLASS =
  'w-full border-[1.5px] border-[#E5E5E5] rounded-[4px] px-4 py-3 text-[15px] font-sans text-[#1A1A1A] bg-white focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
const LABEL_CLASS =
  'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'
const HELPER_CLASS = 'text-[13px] text-[#5A5A5A] mb-3 leading-relaxed'

export default function Wizard({
  assessmentId,
  initialStep,
  initialAnswers,
}: Props) {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(() =>
    Math.max(0, Math.min(SECTIONS.length - 1, initialStep - 1))
  )
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers || {})
  const [isPending, setIsPending] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const currentSection = SECTIONS[stepIdx]
  const isLast = stepIdx === SECTIONS.length - 1
  const isFirst = stepIdx === 0
  const progressPct = Math.round(((stepIdx + 1) / SECTIONS.length) * 100)

  function updateAnswer(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  // Validate required questions in the current section
  const sectionRequiredMissing = useMemo(() => {
    return currentSection.questions
      .filter((q) => q.required)
      .filter((q) => {
        const v = answers[q.id]
        if (v === undefined || v === null || v === '') return true
        if (Array.isArray(v) && v.length === 0) return true
        return false
      })
  }, [answers, currentSection])

  async function saveAndAdvance(direction: 1 | -1) {
    if (direction === 1 && sectionRequiredMissing.length > 0) {
      toast.error(
        `Please answer: ${sectionRequiredMissing.map((q) => q.label).join('; ')}`
      )
      return
    }
    const nextIdx = Math.max(
      0,
      Math.min(SECTIONS.length - 1, stepIdx + direction)
    )
    setIsPending(true)
    try {
      const res = await saveAssessmentProgress({
        assessmentId,
        answers,
        currentStep: nextIdx + 1,
      })
      if (!res.ok) {
        toast.error(res.error || 'Could not save progress.')
        return
      }
      setLastSavedAt(new Date())
      setStepIdx(nextIdx)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
    } finally {
      setIsPending(false)
    }
  }

  async function handleSubmit() {
    // Final-step required check, plus full check
    if (sectionRequiredMissing.length > 0) {
      toast.error(
        `Please answer: ${sectionRequiredMissing.map((q) => q.label).join('; ')}`
      )
      return
    }
    setIsPending(true)
    try {
      const res = await submitAssessment({ assessmentId, answers })
      if (!res || !res.ok) {
        toast.error(res?.error || 'Submission failed. Please try again.')
        return
      }
      // Client-side navigate so we don't rely on the server action's
      // redirect() propagating through the framework — more reliable.
      router.push('/portal/prototype-readiness/thank-you')
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Something went wrong submitting your assessment.'
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-[860px] mx-auto">
      <Toaster richColors position="top-right" closeButton />
      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Prototype Readiness Assessment
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">
          Before we build anything, let’s pressure-test the product.
        </h1>
        <p className="mt-3 text-[15px] text-[#5A5A5A] leading-relaxed">
          Seven short sections about the product, the buyer, the manufacturing
          path, and the launch plan. Your answers stay private to execom and
          are used to recommend the right next step — not to grade you.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
            Step {stepIdx + 1} of {SECTIONS.length} — {currentSection.label}
          </p>
          <p className="text-[12px] text-[#b8b8b0]">
            {lastSavedAt ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Saved {lastSavedAt.toLocaleTimeString()}
              </span>
            ) : (
              'Auto-saves when you click Continue'
            )}
          </p>
        </div>
        <div className="w-full h-[6px] bg-[#E5E5E5] rounded-[3px]">
          <div
            className="h-full bg-blue rounded-[3px] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#b8b8b0]">
          {SECTIONS.map((s, i) => (
            <li
              key={s.id}
              className={
                i === stepIdx
                  ? 'text-blue font-semibold'
                  : i < stepIdx
                    ? 'text-[#5A5A5A]'
                    : ''
              }
            >
              {i + 1}. {s.label}
            </li>
          ))}
        </ol>
      </div>

      {/* Section card */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <h2 className="text-[1.25rem] font-serif text-[#1A1A1A]">
          {currentSection.label}
        </h2>
        <p className="mt-2 text-[14px] text-[#5A5A5A] leading-relaxed">
          {currentSection.blurb}
        </p>

        <div className="mt-8 space-y-7">
          {currentSection.questions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={answers[q.id]}
              onChange={(v) => updateAnswer(q.id, v)}
            />
          ))}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => saveAndAdvance(-1)}
          disabled={isFirst || isPending}
          className="inline-flex items-center gap-2 text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Submit assessment
          </button>
        ) : (
          <button
            type="button"
            onClick={() => saveAndAdvance(1)}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Single-question renderer ──────────────────────────────────────────────

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: QuestionDef
  value: AnswerValue
  onChange: (v: AnswerValue) => void
}) {
  const id = `q-${question.id}`

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {question.label}
        {question.required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      {question.helper ? <p className={HELPER_CLASS}>{question.helper}</p> : null}

      {question.type === 'short_text' && (
        <input
          id={id}
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className={INPUT_CLASS}
        />
      )}

      {question.type === 'long_text' && (
        <textarea
          id={id}
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className={`${INPUT_CLASS} resize-y`}
        />
      )}

      {question.type === 'currency' && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#5A5A5A]">
            $
          </span>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={(value as number | string) ?? ''}
            onChange={(e) =>
              onChange(e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder={question.placeholder ?? '0'}
            className={`${INPUT_CLASS} pl-8`}
          />
        </div>
      )}

      {question.type === 'number' && (
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={(value as number | string) ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          placeholder={question.placeholder}
          className={INPUT_CLASS}
        />
      )}

      {question.type === 'select' && (
        <select
          id={id}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className={INPUT_CLASS}
        >
          <option value="">Select…</option>
          {renderSelectOptions(question.options)}
        </select>
      )}

      {question.type === 'multi_select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options?.map((o) => {
            const arr = Array.isArray(value) ? (value as string[]) : []
            const checked = arr.includes(o.value)
            return (
              <label
                key={o.value}
                className={`flex items-center gap-3 border rounded-[6px] px-4 py-3 cursor-pointer text-[14px] transition-colors ${
                  checked
                    ? 'border-blue bg-blue/5 text-[#1A1A1A]'
                    : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-[#b8b8b0]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...arr, o.value]
                      : arr.filter((v) => v !== o.value)
                    onChange(next)
                  }}
                  className="w-4 h-4 rounded border-[#E5E5E5] text-blue focus:ring-blue/20"
                />
                <span>{o.label}</span>
              </label>
            )
          })}
        </div>
      )}

      {(question.type === 'yes_no' || question.type === 'yes_no_unsure') && (
        <div className="flex gap-2">
          {(['yes', 'no', ...(question.type === 'yes_no_unsure' ? ['unsure'] : [])] as const).map(
            (v) => {
              const active = value === v
              const labelMap: Record<string, string> = {
                yes: 'Yes',
                no: 'No',
                unsure: 'Not sure',
              }
              return (
                <button
                  type="button"
                  key={v}
                  onClick={() => onChange(v)}
                  className={`px-5 py-2.5 rounded-[5px] text-[14px] font-medium border-[1.5px] transition-colors ${
                    active
                      ? 'bg-blue border-blue text-white'
                      : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-blue/60'
                  }`}
                >
                  {labelMap[v]}
                </button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}

// Renders <option> elements, grouping contiguous options that share a
// `group` label under an <optgroup>. Options without a `group` are emitted
// at the top level (interleaved with optgroups as they appear in the list).
function renderSelectOptions(options?: QuestionOption[]) {
  if (!options || options.length === 0) return null
  const chunks: { group: string | null; items: QuestionOption[] }[] = []
  for (const opt of options) {
    const g = opt.group ?? null
    const last = chunks[chunks.length - 1]
    if (last && last.group === g) {
      last.items.push(opt)
    } else {
      chunks.push({ group: g, items: [opt] })
    }
  }
  return chunks.map((c, i) =>
    c.group ? (
      <optgroup key={`g-${i}`} label={c.group}>
        {c.items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </optgroup>
    ) : (
      <Fragment key={`u-${i}`}>
        {c.items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Fragment>
    )
  )
}
