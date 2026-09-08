'use client'

// The /sred assessor.
//
// Mobile-first: five short steps, a conditional underwriting screen, then a
// preliminary result that appears BEFORE any contact details are asked for.
// Contact capture happens only when the applicant asks for a review.
//
// The browser computes nothing that matters. It collects answers, posts them,
// and renders what the server sends back. Draft state stays tab-scoped in
// sessionStorage so a dropped connection on a train does not lose the work,
// and nothing identifying is stored until consent is given.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { PublicResult } from '@/lib/sred/engine'
import type { Attribution } from '@/lib/sred/schema'
import { emitSredEvent, resolveAttribution } from '@/lib/sred/attribution'
import { ASSESSOR_INTRO, CONTACT, LANE_COPY, RESULT_INTRO } from './copy'
import { SRED_START_EVENT } from './StartAssessorLink'
import {
  ChoiceGroup,
  ConsentCheckbox,
  MonthYearInput,
  MoneyInput,
  MultiChoice,
  SelectInput,
  TextArea,
  TextInput,
} from './fields'

// ─── Option catalogues ─────────────────────────────────────────────────────

const CORPORATIONS = [
  { value: 'ccpc', label: 'Canadian-controlled private corporation', note: 'The usual case for a founder-owned Canadian company' },
  { value: 'other', label: 'Another corporation type', note: 'Public, foreign-controlled, or a partnership' },
  { value: 'unsure', label: 'Not sure' },
] as const

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
] as const

const CLAIM_STAGES = [
  { value: 'not_filed', label: 'Not filed yet' },
  { value: 'filed', label: 'Filed, waiting on the CRA' },
  { value: 'assessed', label: 'Filed and assessed' },
  { value: 'unsure', label: 'Not sure' },
] as const

const WORK_CATEGORIES = [
  { value: 'software', label: 'Software or data systems' },
  { value: 'hardware_electronics', label: 'Hardware or electronics' },
  { value: 'manufacturing_process', label: 'Manufacturing or process engineering' },
  { value: 'materials_chemistry', label: 'Materials or chemistry' },
  { value: 'life_sciences', label: 'Life sciences' },
  { value: 'other', label: 'Something else technical' },
] as const

const SHARES = [
  { value: '25-50', label: '25% to 50%' },
  { value: '50-75', label: '50% to 75%' },
  { value: '75-100', label: '75% to 100%' },
] as const

const EVIDENCE = [
  { value: 'payroll_records', label: 'Payroll records for the technical staff' },
  { value: 'project_records', label: 'Project or engineering records of the work' },
  { value: 'time_tracking', label: 'Time allocation across projects' },
  { value: 'contracts_invoices', label: 'Contractor agreements and invoices' },
] as const

const HISTORY = [
  { value: 'two_clean', label: 'Two or more accepted claims, no unresolved issues' },
  { value: 'one', label: 'One accepted claim' },
  { value: 'none', label: 'Never claimed SR&ED before' },
  { value: 'issues', label: 'Prior claims with unresolved issues' },
  { value: 'unsure', label: 'Not sure' },
] as const

const PREFERENCE = [
  { value: 'cash', label: 'Cash now, if execom buys the claim' },
  { value: 'service', label: 'Keep the claim, pay 5% after the refund arrives' },
  { value: 'unsure', label: 'Show me both' },
] as const

const TIMING = [
  { value: '30', label: 'Within about 30 days' },
  { value: '60', label: 'Within about 60 days' },
  { value: '120', label: 'Three to four months' },
  { value: 'unsure', label: 'Not sure' },
] as const

const DEBT_OPTIONS = [
  { value: 'no', label: 'No, the account is clear' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'yes', label: 'Yes' },
] as const

const SECURITY_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'yes', label: 'Yes' },
] as const

// ─── Form state ────────────────────────────────────────────────────────────

interface FormState {
  company_name: string
  corporation: string
  province: string
  claim_stage: string
  fiscal_year_end: string
  reported_refund_cad: string
  work_category: string
  salary_cad: string
  contractor_cad: string
  materials_cad: string
  assistance_cad: string
  experimental_share: string
  evidence: string[]
  claim_history: string
  preference: string
  debt: string
  security: string
  timing: string
}

const EMPTY: FormState = {
  company_name: '', corporation: '', province: '', claim_stage: '',
  fiscal_year_end: '', reported_refund_cad: '', work_category: '',
  salary_cad: '', contractor_cad: '', materials_cad: '', assistance_cad: '',
  experimental_share: '', evidence: [], claim_history: '',
  preference: '', debt: '', security: '', timing: '',
}

const DRAFT_KEY = 'sred.draft.v1'
const STEP_IDS = ['company', 'claim', 'money', 'records'] as const
type Phase = number | 'underwriting' | 'result' | 'contact' | 'done'

function money(raw: string): number {
  const n = Number(raw.replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function cad(n: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
  }).format(n)
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // Fallback for a non-secure context. Shape matters; entropy is best effort.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const REQUESTED_FOR: Record<string, string> = {
  purchase_review: 'purchase_review',
  preparation_offer: 'preparation',
  technical_review: 'technical_review',
  already_filed_review: 'existing_claim_review',
  not_ready: 'next_steps',
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function SredAssessor() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [phase, setPhase] = useState<Phase>(-1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<PublicResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [attribution, setAttribution] = useState<Attribution>({})
  const [started, setStarted] = useState(false)

  const [contact, setContact] = useState({ full_name: '', email: '', phone: '', role: '' })
  const [serviceConsent, setServiceConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [companyWebsite, setCompanyWebsite] = useState('') // honeypot
  const [persisted, setPersisted] = useState<boolean | null>(null)

  const requestIdRef = useRef<string>('')
  const draftIdRef = useRef<string>('')
  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const filed = form.claim_stage === 'filed' || form.claim_stage === 'assessed'

  const phaseRef = useRef<Phase>(-1)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // ── Boot: attribution, draft restore, deep link ──
  useEffect(() => {
    const attr = resolveAttribution(window.location.search, document.referrer)
    setAttribution(attr)
    emitSredEvent('sred_landing_view', { attribution: attr })

    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<FormState>
        setForm((f) => ({ ...f, ...saved }))
      }
      const savedDraftId = window.sessionStorage.getItem('sred.draft_id')
      draftIdRef.current = savedDraftId ?? uuid()
      window.sessionStorage.setItem('sred.draft_id', draftIdRef.current)
    } catch {
      draftIdRef.current = uuid()
    }

    // ?start=1 lands a sponsored-post visitor straight on the first question.
    if (new URLSearchParams(window.location.search).get('start') === '1') {
      setPhase(0)
      setStarted(true)
      window.requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [])

  // ── Every "estimate my claim" button on the page routes through here ──
  useEffect(() => {
    function onStart() {
      // Opening question one is only right from the intro screen. Someone who
      // is already mid-flow, or looking at their result, must not be thrown
      // back to the start by tapping a call to action further down the page.
      if (phaseRef.current === -1) {
        setPhase(0)
        setStarted(true)
        emitSredEvent('sred_assessment_started', { attribution })
      }
      // Scroll regardless: on desktop the card is beside the hero and already
      // on screen, and a click that visibly does nothing reads as broken.
      window.requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        headingRef.current?.focus({ preventScroll: true })
      })
    }
    window.addEventListener(SRED_START_EVENT, onStart)
    return () => window.removeEventListener(SRED_START_EVENT, onStart)
  }, [attribution])

  // ── Draft persistence, tab-scoped, nothing identifying ──
  useEffect(() => {
    if (!started) return
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    } catch {
      // Storage disabled. The flow works, it just will not survive a reload.
    }
  }, [form, started])

  // ── Follow the flow: scroll the card into view and move focus to its
  //     heading, so both sighted and screen-reader users land on the new step
  //     rather than wherever the last button happened to be. ──
  useEffect(() => {
    if (phase === -1) return
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    headingRef.current?.focus({ preventScroll: true })
  }, [phase])

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: '' } : e))
  }, [])

  const toggleEvidence = useCallback((value: string) => {
    setForm((f) => ({
      ...f,
      evidence: f.evidence.includes(value)
        ? f.evidence.filter((v) => v !== value)
        : [...f.evidence, value],
    }))
  }, [])

  // ── Per-step validation. Mirrors the server, never replaces it. ──
  function validate(step: number | 'underwriting'): boolean {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (form.company_name.trim().length < 2) e.company_name = 'Company name is required'
      if (!form.corporation) e.corporation = 'Choose one'
      if (!form.province) e.province = 'Choose your province'
    }
    if (step === 1) {
      if (!form.claim_stage) e.claim_stage = 'Choose one'
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fiscal_year_end)) {
        e.fiscal_year_end = 'Enter the fiscal year end'
      }
      if (filed && !form.reported_refund_cad.trim()) {
        e.reported_refund_cad = 'Enter the cash you expect, or 0 if you do not know'
      }
      if (!form.work_category) e.work_category = 'Choose one'
    }
    if (step === 2) {
      const total = money(form.salary_cad) + money(form.contractor_cad) + money(form.materials_cad)
      if (total <= 0) e.salary_cad = 'Enter at least one spend figure'
      if (!form.experimental_share) e.experimental_share = 'Choose one'
    }
    if (step === 3) {
      if (!form.claim_history) e.claim_history = 'Choose one'
      if (!form.preference) e.preference = 'Choose one'
    }
    if (step === 'underwriting') {
      if (!form.debt) e.debt = 'Choose one'
      if (!form.security) e.security = 'Choose one'
      if (!form.timing) e.timing = 'Choose one'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const answersPayload = useMemo(() => {
    const base: Record<string, unknown> = {
      company_name: form.company_name.trim(),
      corporation: form.corporation,
      province: form.province,
      claim_stage: form.claim_stage,
      fiscal_year_end: form.fiscal_year_end,
      work_category: form.work_category,
      salary_cad: money(form.salary_cad),
      contractor_cad: money(form.contractor_cad),
      materials_cad: money(form.materials_cad),
      assistance_cad: money(form.assistance_cad),
      experimental_share: form.experimental_share,
      evidence: form.evidence,
      claim_history: form.claim_history,
      preference: form.preference,
    }
    if (filed) base.reported_refund_cad = money(form.reported_refund_cad)
    if (form.debt) base.debt = form.debt
    if (form.security) base.security = form.security
    if (form.timing) base.timing = form.timing
    return base
  }, [form, filed])

  async function runAssessment(): Promise<void> {
    setBusy(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/sred/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersPayload,
          attribution,
          draft_id: draftIdRef.current,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'We could not calculate that. Try again.')
      }
      const data = (await res.json()) as { result: PublicResult }
      setResult(data.result)

      // The underwriting screen only ever appears for a file that otherwise
      // clears, and only once.
      if (data.result.needsUnderwritingScreen && !form.debt) {
        setPhase('underwriting')
        return
      }

      setPhase('result')
      emitSredEvent('sred_preliminary_result_viewed', {
        attribution,
        lane: data.result.lane,
      })
      if (data.result.lane === 'purchase_review') {
        emitSredEvent('sred_purchase_review_candidate', {
          attribution,
          lane: data.result.lane,
        })
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  function advance() {
    if (typeof phase !== 'number') return
    if (!validate(phase)) return

    if (!started) {
      setStarted(true)
      emitSredEvent('sred_assessment_started', { attribution })
    }
    emitSredEvent('sred_assessment_step_completed', {
      attribution,
      step: phase + 1,
      stepId: STEP_IDS[phase],
    })

    if (phase < STEP_IDS.length - 1) {
      setPhase(phase + 1)
      return
    }
    void runAssessment()
  }

  function advanceUnderwriting() {
    if (!validate('underwriting')) return
    emitSredEvent('sred_assessment_step_completed', {
      attribution,
      step: 5,
      stepId: 'underwriting',
    })
    void runAssessment()
  }

  function goBack() {
    setSubmitError(null)
    if (phase === 'contact') return setPhase('result')
    if (phase === 'result') return setPhase(form.debt ? 'underwriting' : STEP_IDS.length - 1)
    if (phase === 'underwriting') return setPhase(STEP_IDS.length - 1)
    if (typeof phase === 'number' && phase > 0) return setPhase(phase - 1)
  }

  function openContact() {
    if (!requestIdRef.current) requestIdRef.current = uuid()
    if (result?.lane === 'preparation_offer') {
      emitSredEvent('sred_preparation_interest', { attribution, lane: result.lane })
    }
    setPhase('contact')
  }

  async function submitLead() {
    const e: Record<string, string> = {}
    if (contact.full_name.trim().length < 2) e.full_name = 'Your name is required'
    if (!/^\S+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      e.email = 'Enter a valid business email'
    }
    if (!serviceConsent) e.service_consent = 'Confirm we may contact you about this assessment'
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/sred/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersPayload,
          contact: {
            full_name: contact.full_name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
            role: contact.role.trim(),
          },
          requested: REQUESTED_FOR[result?.lane ?? 'not_ready'],
          service_consent: true,
          marketing_consent: marketingConsent,
          attribution,
          draft_id: draftIdRef.current,
          request_id: requestIdRef.current,
          ...(companyWebsite ? { company_website: companyWebsite } : {}),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'We could not send that. Try again.')
      }
      const data = (await res.json()) as { persisted?: boolean }
      setPersisted(data.persisted ?? false)
      emitSredEvent('sred_review_requested', {
        attribution,
        lane: result?.lane,
        eventId: requestIdRef.current,
      })
      try {
        window.sessionStorage.removeItem(DRAFT_KEY)
      } catch {
        /* nothing to clean up */
      }
      setPhase('done')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const totalSteps = result?.needsUnderwritingScreen || form.debt ? 5 : 4
  const stepNumber =
    typeof phase === 'number' ? phase + 1 : phase === 'underwriting' ? 5 : totalSteps
  const showContinue = (typeof phase === 'number' && phase >= 0) || phase === 'underwriting'

  return (
    <div ref={rootRef} id="assessor" className="scroll-mt-24">
      <div className="rounded-[6px] border border-border bg-white shadow-[0_16px_50px_rgba(4,20,30,0.28)] p-5 sm:p-8">
        {/* ── Intro ── */}
        {phase === -1 && (
          <div>
            <h2 className="text-[1.4rem] sm:text-[1.75rem] font-serif text-fg leading-snug">
              {ASSESSOR_INTRO.heading}
            </h2>
            <p className="mt-4 text-body text-fg/75">{ASSESSOR_INTRO.body}</p>
            <p className="mt-3 text-body text-fg/75">{ASSESSOR_INTRO.body2}</p>
            <p className="mt-4 mb-6 text-[14px] font-medium text-blue">{ASSESSOR_INTRO.note}</p>

            <TextInput
              label="Company name"
              value={form.company_name}
              onChange={(v) => set('company_name', v)}
              placeholder="Your company's legal or operating name"
              error={errors.company_name}
            />

            <button
              type="button"
              className="btn-premium w-full justify-center"
              onClick={() => {
                setPhase(0)
                setStarted(true)
                emitSredEvent('sred_assessment_started', { attribution })
              }}
            >
              {ASSESSOR_INTRO.cta}
            </button>
          </div>
        )}

        {/* ── Progress ── */}
        {phase !== -1 && phase !== 'done' && (
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
                {phase === 'result'
                  ? 'Preliminary result'
                  : phase === 'contact'
                    ? 'Where to send it'
                    : `Step ${stepNumber} of ${totalSteps}`}
              </p>
              {phase !== 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-[13px] text-muted hover:text-blue underline underline-offset-4 py-3 px-2 -mr-2"
                >
                  Back
                </button>
              )}
            </div>
            <div className="h-1 w-full rounded-full bg-border overflow-hidden" aria-hidden>
              <div
                className="h-full bg-teal transition-all duration-300"
                style={{
                  width:
                    phase === 'result' || phase === 'contact'
                      ? '100%'
                      : `${(stepNumber / totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: company ── */}
        {phase === 0 && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-6 outline-none">
              Your company
            </h2>
            <TextInput
              label="Company name"
              value={form.company_name}
              onChange={(v) => set('company_name', v)}
              error={errors.company_name}
            />
            <ChoiceGroup
              label="Corporation type"
              helper="Only a Canadian-controlled private corporation gets the enhanced, refundable federal credit."
              value={form.corporation}
              options={CORPORATIONS}
              onChange={(v) => set('corporation', v)}
              error={errors.corporation}
            />
            <SelectInput
              label="Province where the work was done"
              value={form.province}
              options={PROVINCES}
              onChange={(v) => set('province', v)}
              error={errors.province}
              placeholder="Choose a province"
            />
          </div>
        )}

        {/* ── Step 2: the claim ── */}
        {phase === 1 && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-6 outline-none">
              The claim
            </h2>
            <ChoiceGroup
              label="Where is this claim today?"
              value={form.claim_stage}
              options={CLAIM_STAGES}
              onChange={(v) => set('claim_stage', v)}
              error={errors.claim_stage}
            />
            <MonthYearInput
              label="Fiscal year end for the claim period"
              helper="The SR&ED reporting deadline is normally 18 months after this date."
              value={form.fiscal_year_end}
              onChange={(v) => set('fiscal_year_end', v)}
              error={errors.fiscal_year_end}
            />
            {filed && (
              <MoneyInput
                label="Expected net SR&ED cash from this claim"
                helper="What you expect to actually receive, after any tax owing. Enter 0 if you do not know."
                value={form.reported_refund_cad}
                onChange={(v) => set('reported_refund_cad', v)}
                error={errors.reported_refund_cad}
              />
            )}
            <ChoiceGroup
              label="What field is the work in?"
              value={form.work_category}
              options={WORK_CATEGORIES}
              onChange={(v) => set('work_category', v)}
              error={errors.work_category}
            />
          </div>
        )}

        {/* ── Step 3: money ── */}
        {phase === 2 && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-2 outline-none">
              The money
            </h2>
            <p className="text-[14px] text-muted mb-6">
              Canadian spend for the claim period. Round numbers are fine.
            </p>
            <MoneyInput
              label="Technical salaries and wages"
              value={form.salary_cad}
              onChange={(v) => set('salary_cad', v)}
              error={errors.salary_cad}
            />
            <MoneyInput
              label="Canadian contractors"
              value={form.contractor_cad}
              onChange={(v) => set('contractor_cad', v)}
            />
            <MoneyInput
              label="Materials consumed or transformed"
              value={form.materials_cad}
              onChange={(v) => set('materials_cad', v)}
            />
            <MoneyInput
              label="Government grants or other assistance received"
              helper="Assistance reduces the expenditures a claim can be built on. Enter 0 if none."
              value={form.assistance_cad}
              onChange={(v) => set('assistance_cad', v)}
            />
            <ChoiceGroup
              label="Roughly what share of that work was experimental?"
              helper="The part aimed at resolving the uncertainty, not routine build or maintenance."
              value={form.experimental_share}
              options={SHARES}
              onChange={(v) => set('experimental_share', v)}
              error={errors.experimental_share}
            />
          </div>
        )}

        {/* ── Step 4: records and history ── */}
        {phase === 3 && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-6 outline-none">
              Records and history
            </h2>
            <MultiChoice
              label="Which of these do you have on hand?"
              helper="Tick everything you could produce without a scramble."
              values={form.evidence}
              options={EVIDENCE}
              onToggle={toggleEvidence}
            />
            <ChoiceGroup
              label="Have you claimed SR&ED before?"
              value={form.claim_history}
              options={HISTORY}
              onChange={(v) => set('claim_history', v)}
              error={errors.claim_history}
            />
            <ChoiceGroup
              label="If both were available, which would you prefer?"
              value={form.preference}
              options={PREFERENCE}
              onChange={(v) => set('preference', v)}
              error={errors.preference}
            />
          </div>
        )}

        {/* ── Conditional underwriting screen ── */}
        {phase === 'underwriting' && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-3 outline-none">
              Three questions about collectability
            </h2>
            <p className="text-[14px] leading-relaxed text-muted mb-6">
              Your answers so far fit our purchase screen. These three decide whether the refund can
              actually be collected. Nothing here is an offer.
            </p>
            <ChoiceGroup
              label="Any unresolved CRA balances, set-offs or collection issues?"
              value={form.debt}
              options={DEBT_OPTIONS}
              onChange={(v) => set('debt', v)}
              error={errors.debt}
            />
            <ChoiceGroup
              label="Is the refund already assigned, pledged or financed?"
              value={form.security}
              options={SECURITY_OPTIONS}
              onChange={(v) => set('security', v)}
              error={errors.security}
            />
            <ChoiceGroup
              label="When do you expect the refund to arrive?"
              value={form.timing}
              options={TIMING}
              onChange={(v) => set('timing', v)}
              error={errors.timing}
            />
          </div>
        )}

        {/* ── Result. Shown before any contact details are asked for. ── */}
        {phase === 'result' && result && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-3 outline-none">
              {RESULT_INTRO.heading}
            </h2>
            <p className="text-[13px] leading-relaxed text-muted mb-6">{RESULT_INTRO.disclaimer}</p>

            {result.estimate && result.estimate.high > 0 && (
              <div className="rounded-[6px] border border-teal/40 bg-teal/[0.07] p-5 mb-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                  {result.estimate.kind === 'applicant_reported'
                    ? 'Cash you reported'
                    : 'Illustrative credit range'}
                </p>
                <p className="text-[1.6rem] sm:text-[2rem] font-serif text-fg leading-tight break-words">
                  {result.estimate.low === result.estimate.high
                    ? cad(result.estimate.high)
                    : `${cad(result.estimate.low)} – ${cad(result.estimate.high)}`}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {result.estimate.kind === 'applicant_reported'
                    ? 'Your figure, not an independent verification.'
                    : `Federal and ${result.provinceName} refundable credits, before verification.`}
                </p>
              </div>
            )}

            <h3 className="text-[1.1rem] font-serif text-fg mb-2 leading-snug">
              {LANE_COPY[result.lane].title}
            </h3>
            <p className="text-body text-fg/75 mb-5">{LANE_COPY[result.lane].body}</p>

            {result.reasons.length > 0 && (
              <ul className="mb-6 space-y-2">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-fg/70">
                    <span aria-hidden className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-teal" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}

            {result.lane === 'not_ready' && result.missingDocuments.length > 0 && (
              <div className="mb-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
                  What would make this reviewable
                </p>
                <ul className="space-y-2">
                  {result.missingDocuments.map((d, i) => (
                    <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-fg/70">
                      <span aria-hidden className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-subtle" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.assumptions.length > 0 && (
              <details className="mb-6 rounded-[5px] border border-border bg-bg/60 px-4">
                <summary className="cursor-pointer text-[13px] font-semibold uppercase tracking-[0.08em] text-blue py-4">
                  What this estimate assumes
                </summary>
                <ul className="pb-4 space-y-2">
                  {result.assumptions.map((a, i) => (
                    <li key={i} className="text-[13px] leading-relaxed text-muted">
                      {a}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <p className="text-[13px] leading-relaxed text-muted mb-6">
              Indicative SR&amp;ED reporting deadline for this year end:{' '}
              <span className="text-fg/80 font-medium">{result.deadline.iso}</span>
              {result.deadline.passed ? ' (passed)' : ''}. Calendar arithmetic only; weekends,
              holidays and short tax years need checking.
            </p>

            <button
              type="button"
              className="btn-premium w-full justify-center"
              onClick={openContact}
            >
              {LANE_COPY[result.lane].cta}
            </button>

            {result.lane === 'purchase_review' && (
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                A purchase review is not an approval and not an offer. Any purchase depends on
                documentation verification, underwriting, available funding and a final agreement.
              </p>
            )}
          </div>
        )}

        {/* ── Contact capture ── */}
        {phase === 'contact' && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.3rem] font-serif text-fg mb-6 outline-none">
              {CONTACT.heading}
            </h2>
            <TextInput
              label="Your name"
              value={contact.full_name}
              onChange={(v) => setContact((c) => ({ ...c, full_name: v }))}
              error={errors.full_name}
              autoComplete="name"
            />
            <TextInput
              label="Business email"
              type="email"
              value={contact.email}
              onChange={(v) => setContact((c) => ({ ...c, email: v }))}
              error={errors.email}
              autoComplete="email"
            />
            <TextInput
              label="Phone (optional)"
              type="tel"
              value={contact.phone}
              onChange={(v) => setContact((c) => ({ ...c, phone: v }))}
              autoComplete="tel"
            />
            <TextInput
              label="Your role (optional)"
              value={contact.role}
              onChange={(v) => setContact((c) => ({ ...c, role: v }))}
            />

            {/* Honeypot. Positioned off-screen rather than hidden, so bots fill it. */}
            <div aria-hidden className="absolute left-[-9999px] top-0 w-px h-px overflow-hidden">
              <label htmlFor="company_website">Company website</label>
              <input
                id="company_website"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
              />
            </div>

            <ConsentCheckbox
              checked={serviceConsent}
              onChange={setServiceConsent}
              error={errors.service_consent}
            >
              {CONTACT.serviceConsent}
            </ConsentCheckbox>
            <ConsentCheckbox checked={marketingConsent} onChange={setMarketingConsent}>
              {CONTACT.marketingConsent}
            </ConsentCheckbox>

            <p className="text-[13px] leading-relaxed text-muted mb-6">{CONTACT.privacy}</p>

            <button
              type="button"
              disabled={busy}
              className="btn-premium w-full justify-center disabled:opacity-60"
              onClick={submitLead}
            >
              {busy ? 'Sending…' : CONTACT.submit}
            </button>
          </div>
        )}

        {/* ── Done ── */}
        {phase === 'done' && (
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.4rem] font-serif text-fg mb-4 outline-none">
              Request received.
            </h2>
            <p className="text-body text-fg/75 mb-4">
              An execom reviewer will look at what you sent and come back to you. Nothing is
              committed, no agreement exists, and no offer has been made.
            </p>
            {persisted === false && (
              <p className="text-[13px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-[5px] p-4 mb-4">
                Your request reached us but could not be filed automatically. It has been logged for
                staff to pick up manually.
              </p>
            )}
            <Link
              href="/portal/login"
              className="inline-flex items-center text-[14px] font-medium text-blue underline underline-offset-4 py-3"
            >
              Existing client? Sign in
            </Link>
          </div>
        )}

        {/* ── Error and retry ── */}
        {submitError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-[5px] border border-red-300 bg-red-50 p-4 text-[14px] leading-relaxed text-red-700"
          >
            <p>{submitError}</p>
            <button
              type="button"
              className="mt-2 underline underline-offset-4 font-medium py-2"
              onClick={() => (phase === 'contact' ? void submitLead() : void runAssessment())}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Primary action ── */}
        {showContinue && (
          <button
            type="button"
            disabled={busy}
            className="btn-premium w-full justify-center mt-2 disabled:opacity-60"
            onClick={phase === 'underwriting' ? advanceUnderwriting : advance}
          >
            {busy
              ? 'Working…'
              : phase === 'underwriting' || phase === STEP_IDS.length - 1
                ? 'See my estimate'
                : 'Continue'}
          </button>
        )}
      </div>
    </div>
  )
}
