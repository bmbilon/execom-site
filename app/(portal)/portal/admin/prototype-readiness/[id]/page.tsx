import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  SECTIONS,
  PATH_LABELS,
  PATH_PRICE_RANGES,
  TIER_LABELS,
  scoreAssessment,
  type AnswerMap,
  type QuestionDef,
} from '@/lib/portal/prototype-readiness'
import AdminControls from './AdminControls'

export const dynamic = 'force-dynamic'

const TIER_BADGE: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-blue/10 text-blue',
  risky: 'bg-amber-100 text-amber-700',
  not_ready: 'bg-gray-100 text-[#5A5A5A]',
}

export default async function AdminPrototypeReadinessDetail({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: row } = await supabase
    .from('prototype_assessments')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!row) notFound()

  const answers = (row.answers as AnswerMap) ?? {}
  // Live-recompute for the staff view so they always see fresh signals
  const live = scoreAssessment(answers)

  return (
    <div className="max-w-[960px] mx-auto">
      <Link
        href="/portal/admin/prototype-readiness"
        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to queue
      </Link>

      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Prototype Readiness · Submission
        </p>
        <h1 className="text-[1.75rem] font-serif text-[#1A1A1A]">
          {row.product_name || 'Untitled product'}
        </h1>
        <p className="mt-2 text-[14px] text-[#5A5A5A]">
          {row.founder_name || '—'} · {row.founder_email || '—'}
          {row.company_name ? ` · ${row.company_name}` : ''}
        </p>
        <p className="mt-1 text-[12px] text-[#b8b8b0]">
          Submitted{' '}
          {row.submitted_at
            ? new Date(row.submitted_at).toLocaleString('en-CA')
            : '— (still a draft)'}{' '}
          · Status:{' '}
          <span className="font-semibold">
            {String(row.status).replace('_', ' ')}
          </span>
        </p>
      </div>

      {/* Scoring summary */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue">
            Internal score
          </p>
          <p className="mt-3 text-[2rem] font-serif text-[#1A1A1A]">
            {live.score}
            <span className="text-[14px] text-[#b8b8b0]"> / 100</span>
          </p>
          {row.internal_score !== null && row.internal_score !== live.score ? (
            <p className="mt-1 text-[11px] text-[#b8b8b0]">
              Stored: {row.internal_score} · live recalc differs
            </p>
          ) : null}
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue">
            Tier
          </p>
          <p className="mt-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] font-semibold ${TIER_BADGE[live.tier]}`}
            >
              {TIER_LABELS[live.tier]}
            </span>
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue">
            Recommended path
          </p>
          <p className="mt-3 text-[15px] font-medium text-[#1A1A1A]">
            {PATH_LABELS[live.recommendedPath]}
          </p>
          <p className="mt-1 text-[12px] text-[#5A5A5A]">
            {PATH_PRICE_RANGES[live.recommendedPath]}
          </p>
        </div>
      </div>

      {/* Signals */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Positive signals
          </p>
          {live.signals.positive.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#b8b8b0]">None detected.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-[13px] text-[#1A1A1A]">
              {live.signals.positive.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">
            Risks
          </p>
          {live.signals.risks.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#b8b8b0]">None detected.</p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-[13px] text-[#1A1A1A]">
              {live.signals.risks.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Admin controls (status / notes / rescore) */}
      <div className="mb-10">
        <AdminControls
          assessmentId={row.id}
          initialStatus={row.status}
          initialNotes={row.internal_notes ?? ''}
        />
      </div>

      {/* Full answers */}
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className="bg-white border border-[#E5E5E5] rounded-[6px] p-8"
          >
            <h2 className="text-[1rem] font-serif text-[#1A1A1A] mb-1">
              {section.label}
            </h2>
            <p className="text-[13px] text-[#5A5A5A] mb-6">{section.blurb}</p>

            <dl className="space-y-5">
              {section.questions.map((q) => (
                <AnswerRow key={q.id} question={q} value={answers[q.id]} />
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnswerRow({
  question,
  value,
}: {
  question: QuestionDef
  value: unknown
}) {
  let display: React.ReactNode

  if (value === undefined || value === null || value === '') {
    display = <span className="text-[#b8b8b0] italic">No answer</span>
  } else if (
    question.type === 'select' ||
    question.type === 'yes_no' ||
    question.type === 'yes_no_unsure'
  ) {
    const opt = question.options?.find((o) => o.value === value)
    display = opt ? opt.label : String(value)
  } else if (question.type === 'multi_select' && Array.isArray(value)) {
    display = (value as string[])
      .map((v) => question.options?.find((o) => o.value === v)?.label ?? v)
      .join(', ')
  } else if (question.type === 'currency' && typeof value === 'number') {
    display = `$${value.toLocaleString()}`
  } else {
    display = (
      <span className="whitespace-pre-wrap">{String(value)}</span>
    )
  }

  return (
    <div className="border-b border-[#E5E5E5] pb-4 last:border-0 last:pb-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-1.5">
        {question.label}
      </dt>
      <dd className="text-[14px] text-[#1A1A1A] leading-relaxed">{display}</dd>
    </div>
  )
}
