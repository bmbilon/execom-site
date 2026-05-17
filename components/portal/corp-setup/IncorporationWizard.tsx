'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type IncorporationIntake,
  type Director,
  type WizardStepKey,
  type IncorporationStatus,
  WIZARD_STEPS,
  STATUS_LABELS,
  CLIENT_EDITABLE,
  blankIntake,
  validateStep,
  validateAll,
  type ValidationError,
} from '@/lib/corp-setup/schema'
import { clientSubmit } from '@/lib/services/incorporationService'

// ─── Style tokens ────────────────────────────────────────────

const input =
  'w-full rounded border border-[#E5E5E5] bg-white px-3 py-2.5 text-[14px] text-[#1A1A1A] placeholder:text-[#b8b8b0] focus:outline-none focus:ring-1 focus:ring-[#195E8E] focus:border-[#195E8E] transition-colors'
const inputDisabled =
  'w-full rounded border border-[#E5E5E5] bg-[#F7F6EE] px-3 py-2.5 text-[14px] text-[#5A5A5A] cursor-not-allowed'
const labelCls = 'block text-[13px] font-medium text-[#1A1A1A] mb-1.5'
const sectionH =
  'text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] pt-6 pb-2'
const hint = 'text-[12px] text-[#b8b8b0] mt-1'

function Req() {
  return <span className="text-red-500 ml-0.5">*</span>
}

// ─── Component ───────────────────────────────────────────────

export default function IncorporationWizard({ intakeId, matterId: matterIdProp }: { intakeId?: string; matterId?: string }) {
  const supabase = createClient()
  const [data, setData] = useState<IncorporationIntake>(blankIntake())
  const [step, setStep] = useState<WizardStepKey>('company')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | undefined>(intakeId)
  const [matterId, setMatterId] = useState<string | undefined>(matterIdProp)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [submitting, setSubmitting] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const editable = CLIENT_EDITABLE.includes(data.status)

  // ── Load existing record ───────────────────────────────────
  useEffect(() => {
    if (!intakeId) return
    ;(async () => {
      const { data: row } = await supabase
        .from('incorporation_intakes')
        .select('*')
        .eq('id', intakeId)
        .single()
      if (row) {
        setData({
          ...blankIntake(),
          ...row,
          agent: { ...blankIntake().agent, ...(row.agent as any || {}) },
          directors: Array.isArray(row.directors) && row.directors.length
            ? row.directors as any
            : blankIntake().directors,
          declarant: { ...blankIntake().declarant, ...(row.declarant as any || {}) },
          custom_articles: (row.custom_articles as any) || undefined,
        })
        setMatterId(row.matter_id)
      }
    })()
  }, [intakeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Autosave ───────────────────────────────────────────────
  const autosave = useCallback(
    async (record: IncorporationIntake) => {
      if (!CLIENT_EDITABLE.includes(record.status)) return
      setSaving(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const userId = session.user.id

        const payload = {
          proposed_name: record.proposed_name,
          legal_element: record.legal_element,
          alt_name_1: record.alt_name_1,
          alt_name_2: record.alt_name_2,
          reserved_name: record.reserved_name,
          fiscal_year_end: record.fiscal_year_end,
          reg_street: record.reg_street,
          reg_city: record.reg_city,
          reg_province: record.reg_province,
          reg_postal_code: record.reg_postal_code,
          mailing_same_as_reg: record.mailing_same_as_reg,
          mail_po_box: record.mail_po_box,
          mail_city: record.mail_city,
          mail_province: record.mail_province,
          mail_postal_code: record.mail_postal_code,
          agent: record.agent,
          director_structure: record.director_structure,
          director_fixed_number: record.director_fixed_number,
          director_min: record.director_min,
          director_max: record.director_max,
          directors: record.directors,
          declarant: record.declarant,
          articles_choice: record.articles_choice,
          custom_articles: record.custom_articles || null,
        }

        if (recordId) {
          await supabase.from('incorporation_intakes').update(payload).eq('id', recordId)
        } else {
          // Resolve or create the parent matter
          let resolvedMatterId = matterId
          if (!resolvedMatterId) {
            const { data: matter } = await supabase
              .from('commercialization_matters')
              .insert({
                user_id: userId,
                matter_type: 'incorporation',
                display_name: record.proposed_name
                  ? `${record.proposed_name} ${record.legal_element}`
                  : 'New Incorporation',
                status: 'draft',
              })
              .select('id')
              .single()

            if (!matter) throw new Error('Failed to create matter')
            resolvedMatterId = matter.id
            setMatterId(matter.id)
          }

          const { data: inserted } = await supabase
            .from('incorporation_intakes')
            .insert({ ...payload, user_id: userId, matter_id: resolvedMatterId, status: 'draft' })
            .select('id')
            .single()

          if (inserted) {
            setRecordId(inserted.id)
            // Update URL to match the route context (matter-first or legacy)
            if (matterIdProp) {
              window.history.replaceState(null, '', `/portal/matters/${resolvedMatterId}/tasks/incorporation/${inserted.id}`)
            } else {
              window.history.replaceState(null, '', `/portal/corp-setup/incorporation/${inserted.id}`)
            }
          }
        }
        // Keep display_name synced
        if (matterId && record.proposed_name) {
          await supabase
            .from('commercialization_matters')
            .update({ display_name: `${record.proposed_name} ${record.legal_element}` })
            .eq('id', matterId)
        }
        setLastSaved(new Date().toLocaleTimeString('en-CA'))
      } catch (err) {
        console.error('Autosave failed:', err)
      } finally {
        setSaving(false)
      }
    },
    [recordId, matterId, supabase]
  )

  function update(patch: Partial<IncorporationIntake>) {
    if (!editable) return
    setData((prev) => {
      const next = { ...prev, ...patch }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => autosave(next), 1500)
      return next
    })
  }

  // ── Director helpers ───────────────────────────────────────
  function updateDirector(i: number, patch: Partial<Director>) {
    const dirs = [...data.directors]
    dirs[i] = { ...dirs[i], ...patch }
    update({ directors: dirs })
  }
  function addDirector() {
    update({
      directors: [...data.directors, { first_name: '', last_name: '', street: '', city: '', province: 'Alberta', postal_code: '' }],
    })
  }
  function removeDirector(i: number) {
    if (data.directors.length <= 1) return
    update({ directors: data.directors.filter((_, idx) => idx !== i) })
  }

  // ── Navigation ─────────────────────────────────────────────
  function goNext() {
    const errs = validateStep(step, data)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    const idx = WIZARD_STEPS.findIndex((s) => s.key === step)
    if (idx < WIZARD_STEPS.length - 1) setStep(WIZARD_STEPS[idx + 1].key)
  }
  function goBack() {
    setErrors([])
    const idx = WIZARD_STEPS.findIndex((s) => s.key === step)
    if (idx > 0) setStep(WIZARD_STEPS[idx - 1].key)
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validateAll(data)
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setSubmitting(true)
    try {
      // Save latest data first
      await autosave(data)

      // Transition via service layer, enforces status rules + creates audit trail
      if (recordId && matterId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')
        await clientSubmit(supabase, recordId, matterId, session.user.id)
      }
      setData((prev) => ({ ...prev, status: 'submitted', change_request_message: undefined }))

      // Optional email notification, not the database
      fetch('/api/portal/corp-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: 'incorporation',
          formTitle: `${data.proposed_name} ${data.legal_element}`,
          formNumber: 1,
          phase: 'Corporate Formation',
          fields: [
            { label: 'Corporate Name', value: `${data.proposed_name} ${data.legal_element}` },
            { label: 'Declarant', value: data.declarant.full_name },
          ],
        }),
      }).catch(() => {}) // fire-and-forget
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render helpers ─────────────────────────────────────────
  const currentIdx = WIZARD_STEPS.findIndex((s) => s.key === step)
  const inputCls = editable ? input : inputDisabled

  const ReviewRow = ({ label, value }: { label: string; value: string | undefined | null }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E5E5E5] last:border-0">
      <dt className="text-[13px] font-medium text-[#5A5A5A]">{label}</dt>
      <dd className="col-span-2 text-[14px] text-[#1A1A1A]">{value || '-'}</dd>
    </div>
  )

  return (
    <div className="max-w-2xl">
      {/* Changes requested banner */}
      {data.status === 'changes_requested' && data.change_request_message && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-[13px] font-semibold text-orange-800 mb-1">Changes Requested</p>
          <p className="text-[13px] text-orange-700">{data.change_request_message}</p>
          <p className="text-[12px] text-orange-600 mt-2">Please update the relevant fields and re-submit.</p>
        </div>
      )}

      {/* Non-editable status banner */}
      {!editable && data.status !== 'draft' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[13px] font-medium text-blue-800">
            Status: {STATUS_LABELS[data.status]}
          </p>
          <p className="text-[12px] text-blue-700 mt-0.5">
            {data.status === 'submitted' && 'Your information has been submitted and is awaiting review.'}
            {data.status === 'in_review' && 'Your submission is being reviewed by our team.'}
            {data.status === 'approved_for_generation' && 'Your incorporation has been approved. Documents are being prepared.'}
            {data.status === 'generated' && 'Your filing documents have been generated.'}
            {data.status === 'filed' && 'Your incorporation has been filed with the Alberta registry.'}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8">
        {WIZARD_STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => { setErrors([]); setStep(s.key) }}
            className="flex-1"
          >
            <div className={`h-1.5 rounded-full transition-colors ${i <= currentIdx ? 'bg-[#195E8E]' : 'bg-[#E5E5E5]'}`} />
            <p className={`text-[11px] mt-1.5 font-medium ${i === currentIdx ? 'text-[#195E8E]' : i < currentIdx ? 'text-[#1A1A1A]' : 'text-[#b8b8b0]'}`}>
              {s.title}
            </p>
          </button>
        ))}
      </div>

      {/* Autosave indicator */}
      {editable && (
        <div className="flex items-center gap-2 mb-6 h-5">
          {saving && (
            <span className="text-[11px] text-[#b8b8b0] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFC342] animate-pulse" />Saving…
            </span>
          )}
          {!saving && lastSaved && (
            <span className="text-[11px] text-[#b8b8b0]">Saved at {lastSaved}</span>
          )}
        </div>
      )}

      {/* ─── STEP 1: Company Basics ─── */}
      {step === 'company' && (
        <div className="space-y-1">
          <h3 className={sectionH}>Corporate Name</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <div className="py-2">
            <label className={labelCls}>Proposed Corporate Name <Req /></label>
            <div className="flex gap-2">
              <input className={`${inputCls.replace('w-full', '')} min-w-0 flex-[3_1_0%]`} value={data.proposed_name} onChange={(e) => update({ proposed_name: e.target.value })} placeholder="e.g., Acme Innovations" disabled={!editable} />
              <select className={`${inputCls.replace('w-full', '')} w-24 flex-shrink-0`} value={data.legal_element} onChange={(e) => update({ legal_element: e.target.value as any })} disabled={!editable}>
                <option value="Ltd.">Ltd.</option><option value="Inc.">Inc.</option><option value="Corp.">Corp.</option>
                <option value="Limited">Limited</option><option value="Incorporated">Incorporated</option><option value="Corporation">Corporation</option>
              </select>
            </div>
            <p className={hint}>Must include a legal suffix (Ltd., Inc., Corp., etc.)</p>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><label className={labelCls}>Alternate Name 1</label><input className={inputCls} value={data.alt_name_1 || ''} onChange={(e) => update({ alt_name_1: e.target.value })} placeholder="Backup option" disabled={!editable} /></div>
            <div><label className={labelCls}>Alternate Name 2</label><input className={inputCls} value={data.alt_name_2 || ''} onChange={(e) => update({ alt_name_2: e.target.value })} placeholder="Second backup" disabled={!editable} /></div>
          </div>
          <div className="py-2"><label className={labelCls}>Reserved Name (if already approved)</label><input className={inputCls} value={data.reserved_name || ''} onChange={(e) => update({ reserved_name: e.target.value })} placeholder="Leave blank if not yet reserved" disabled={!editable} /></div>
          <div className="py-2"><label className={labelCls}>Fiscal Year End</label><input className={inputCls} value={data.fiscal_year_end} onChange={(e) => update({ fiscal_year_end: e.target.value })} disabled={!editable} /></div>

          <h3 className={sectionH}>Registered Office Address</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <p className="text-[12px] text-[#7a7a72] py-1">Must be a physical location in Alberta, not a P.O. box.</p>
          <div className="py-2"><label className={labelCls}>Street Address <Req /></label><input className={inputCls} value={data.reg_street} onChange={(e) => update({ reg_street: e.target.value })} placeholder="123 Innovation Drive" disabled={!editable} /></div>
          <div className="grid grid-cols-3 gap-3 py-2">
            <div><label className={labelCls}>City <Req /></label><input className={inputCls} value={data.reg_city} onChange={(e) => update({ reg_city: e.target.value })} placeholder="Calgary" disabled={!editable} /></div>
            <div><label className={labelCls}>Province</label><input className={inputCls} value={data.reg_province} onChange={(e) => update({ reg_province: e.target.value })} disabled={!editable} /></div>
            <div><label className={labelCls}>Postal Code <Req /></label><input className={inputCls} value={data.reg_postal_code} onChange={(e) => update({ reg_postal_code: e.target.value })} placeholder="T2E 2T9" disabled={!editable} /></div>
          </div>

          <h3 className={sectionH}>Mailing Address</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <div className="py-2">
            <label className="flex items-center gap-2 text-[13px] text-[#1A1A1A] cursor-pointer">
              <input type="checkbox" checked={data.mailing_same_as_reg} onChange={(e) => update({ mailing_same_as_reg: e.target.checked })} disabled={!editable} className="w-4 h-4 rounded border-[#E5E5E5] text-[#195E8E] focus:ring-[#195E8E]" />
              Same as registered office
            </label>
          </div>
          {!data.mailing_same_as_reg && (
            <>
              <div className="py-2"><label className={labelCls}>P.O. Box or Street</label><input className={inputCls} value={data.mail_po_box || ''} onChange={(e) => update({ mail_po_box: e.target.value })} disabled={!editable} /></div>
              <div className="grid grid-cols-3 gap-3 py-2">
                <div><label className={labelCls}>City</label><input className={inputCls} value={data.mail_city || ''} onChange={(e) => update({ mail_city: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Province</label><input className={inputCls} value={data.mail_province || ''} onChange={(e) => update({ mail_province: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Postal Code</label><input className={inputCls} value={data.mail_postal_code || ''} onChange={(e) => update({ mail_postal_code: e.target.value })} disabled={!editable} /></div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── STEP 2: People ─── */}
      {step === 'people' && (
        <div className="space-y-1">
          <h3 className={sectionH}>Agent for Service</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <p className="text-[12px] text-[#7a7a72] py-1">An Alberta resident who can accept legal documents on behalf of the corporation. This is often the founder or their lawyer.</p>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><label className={labelCls}>First Name <Req /></label><input className={inputCls} value={data.agent.first_name} onChange={(e) => update({ agent: { ...data.agent, first_name: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>Last Name <Req /></label><input className={inputCls} value={data.agent.last_name} onChange={(e) => update({ agent: { ...data.agent, last_name: e.target.value } })} disabled={!editable} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><label className={labelCls}>Firm (optional)</label><input className={inputCls} value={data.agent.firm || ''} onChange={(e) => update({ agent: { ...data.agent, firm: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>Email <Req /></label><input type="email" className={inputCls} value={data.agent.email} onChange={(e) => update({ agent: { ...data.agent, email: e.target.value } })} disabled={!editable} /></div>
          </div>
          <p className="text-[12px] text-[#7a7a72] py-1">Agent address, must be a physical Alberta location.</p>
          <div className="py-2"><label className={labelCls}>Street <Req /></label><input className={inputCls} value={data.agent.street} onChange={(e) => update({ agent: { ...data.agent, street: e.target.value } })} disabled={!editable} /></div>
          <div className="grid grid-cols-3 gap-3 py-2">
            <div><label className={labelCls}>City</label><input className={inputCls} value={data.agent.city} onChange={(e) => update({ agent: { ...data.agent, city: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>Province</label><input className={inputCls} value={data.agent.province} onChange={(e) => update({ agent: { ...data.agent, province: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>Postal Code</label><input className={inputCls} value={data.agent.postal_code} onChange={(e) => update({ agent: { ...data.agent, postal_code: e.target.value } })} disabled={!editable} /></div>
          </div>

          <h3 className={sectionH}>Directors</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <p className="text-[12px] text-[#7a7a72] py-1">Directors are individuals (not other corporations) who govern your company. Most founders start with themselves as the sole director.</p>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <label className={labelCls}>How many directors?</label>
              <select className={inputCls} value={data.director_structure} onChange={(e) => update({ director_structure: e.target.value as any })} disabled={!editable}>
                <option value="fixed">A fixed number</option><option value="range">A range (minimum to maximum)</option>
              </select>
            </div>
            {data.director_structure === 'fixed' ? (
              <div><label className={labelCls}>Fixed number</label><input type="number" min={1} className={inputCls} value={data.director_fixed_number ?? 1} onChange={(e) => update({ director_fixed_number: parseInt(e.target.value) || 1 })} disabled={!editable} /></div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelCls}>Min</label><input type="number" min={1} className={inputCls} value={data.director_min ?? 1} onChange={(e) => update({ director_min: parseInt(e.target.value) || 1 })} disabled={!editable} /></div>
                <div><label className={labelCls}>Max</label><input type="number" min={1} className={inputCls} value={data.director_max ?? 15} onChange={(e) => update({ director_max: parseInt(e.target.value) || 15 })} disabled={!editable} /></div>
              </div>
            )}
          </div>

          {data.directors.map((dir, i) => (
            <div key={i} className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg p-4 mt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-semibold text-[#195E8E]">Director {i + 1}</span>
                {editable && data.directors.length > 1 && (<button type="button" onClick={() => removeDirector(i)} className="text-[12px] text-red-500 hover:text-red-700">Remove</button>)}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className={labelCls}>First Name <Req /></label><input className={inputCls} value={dir.first_name} onChange={(e) => updateDirector(i, { first_name: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Middle Name</label><input className={inputCls} value={dir.middle_name || ''} onChange={(e) => updateDirector(i, { middle_name: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Last Name <Req /></label><input className={inputCls} value={dir.last_name} onChange={(e) => updateDirector(i, { last_name: e.target.value })} disabled={!editable} /></div>
              </div>
              <div className="mb-3"><label className={labelCls}>Street</label><input className={inputCls} value={dir.street} onChange={(e) => updateDirector(i, { street: e.target.value })} disabled={!editable} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={labelCls}>City</label><input className={inputCls} value={dir.city} onChange={(e) => updateDirector(i, { city: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Province</label><input className={inputCls} value={dir.province} onChange={(e) => updateDirector(i, { province: e.target.value })} disabled={!editable} /></div>
                <div><label className={labelCls}>Postal Code</label><input className={inputCls} value={dir.postal_code} onChange={(e) => updateDirector(i, { postal_code: e.target.value })} disabled={!editable} /></div>
              </div>
            </div>
          ))}
          {editable && (<button type="button" onClick={addDirector} className="mt-3 text-[13px] font-medium text-[#195E8E] hover:underline">+ Add another director</button>)}

          <h3 className={sectionH}>Contact Person</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <p className="text-[12px] text-[#7a7a72] py-1">The person we should contact about this incorporation, usually the founder.</p>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><label className={labelCls}>Full Legal Name <Req /></label><input className={inputCls} value={data.declarant.full_name} onChange={(e) => update({ declarant: { ...data.declarant, full_name: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>Phone <Req /></label><input type="tel" className={inputCls} value={data.declarant.phone} onChange={(e) => update({ declarant: { ...data.declarant, phone: e.target.value } })} placeholder="403-555-0100" disabled={!editable} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div><label className={labelCls}>Email <Req /></label><input type="email" className={inputCls} value={data.declarant.email} onChange={(e) => update({ declarant: { ...data.declarant, email: e.target.value } })} disabled={!editable} /></div>
            <div><label className={labelCls}>ID Type</label><select className={inputCls} value={data.declarant.id_type} onChange={(e) => update({ declarant: { ...data.declarant, id_type: e.target.value } })} disabled={!editable}>
              <option value="Driver's Licence">Driver&apos;s Licence</option><option value="Passport">Passport</option><option value="Provincial ID">Provincial ID</option>
            </select></div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Articles ─── */}
      {step === 'articles' && (
        <div className="space-y-1">
          <h3 className={sectionH}>Articles of Incorporation</h3>
          <div className="h-px bg-[#E5E5E5] mb-3" />
          <p className="text-[12px] text-[#7a7a72] py-1 mb-2">Choose how your corporation&apos;s governing rules are set up. Most single-founder companies start with default articles, they can be amended later.</p>
          <div className="space-y-3 py-2">
            {([
              { value: 'default' as const, title: 'Use standard default articles', desc: 'The simplest option. Suitable for most single-founder startups. Can be amended later if needed.' },
              { value: 'provided_own' as const, title: 'I have my own articles prepared', desc: 'You or your lawyer have drafted custom articles that you will supply separately.' },
              { value: 'custom' as const, title: 'I want to specify custom articles', desc: 'Define your share classes, transfer restrictions, and other provisions below.' },
            ] as const).map((opt) => (
              <label key={opt.value} className={`block border rounded-lg p-4 cursor-pointer transition-colors ${data.articles_choice === opt.value ? 'border-[#195E8E] bg-[#195E8E]/[0.03]' : 'border-[#E5E5E5] hover:border-[#195E8E]/30'} ${!editable ? 'pointer-events-none opacity-75' : ''}`}>
                <div className="flex items-start gap-3">
                  <input type="radio" name="articles" value={opt.value} checked={data.articles_choice === opt.value} onChange={() => update({ articles_choice: opt.value, custom_articles: opt.value === 'custom' ? data.custom_articles || { share_classes: 'Unlimited Class A Common Shares' } : undefined })} disabled={!editable} className="mt-0.5" />
                  <div>
                    <span className="text-[14px] font-medium text-[#1A1A1A]">{opt.title}</span>
                    <p className="text-[12px] text-[#7a7a72] mt-0.5">{opt.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {data.articles_choice === 'custom' && (
            <div className="space-y-3 mt-4 pt-4 border-t border-[#E5E5E5]">
              <div><label className={labelCls}>Share Classes & Authorized Shares <Req /></label><textarea className={`${inputCls} resize-y min-h-[80px]`} value={data.custom_articles?.share_classes || ''} onChange={(e) => update({ custom_articles: { ...data.custom_articles!, share_classes: e.target.value } })} placeholder="e.g., Unlimited Class A Common Shares" disabled={!editable} /></div>
              <div><label className={labelCls}>Transfer Restrictions (if any)</label><textarea className={`${inputCls} resize-y min-h-[60px]`} value={data.custom_articles?.transfer_restrictions || ''} onChange={(e) => update({ custom_articles: { ...data.custom_articles!, transfer_restrictions: e.target.value } })} placeholder="Leave blank for none" disabled={!editable} /></div>
              <div><label className={labelCls}>Business Restrictions (if any)</label><textarea className={`${inputCls} resize-y min-h-[60px]`} value={data.custom_articles?.business_restrictions || ''} onChange={(e) => update({ custom_articles: { ...data.custom_articles!, business_restrictions: e.target.value } })} placeholder="Leave blank for none" disabled={!editable} /></div>
              <div><label className={labelCls}>Other Provisions (if any)</label><textarea className={`${inputCls} resize-y min-h-[60px]`} value={data.custom_articles?.other_provisions || ''} onChange={(e) => update({ custom_articles: { ...data.custom_articles!, other_provisions: e.target.value } })} placeholder="Pre-emptive rights, borrowing powers, etc." disabled={!editable} /></div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 4: Review & Submit ─── */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">Company Basics</h3>
            <dl>
              <ReviewRow label="Corporate Name" value={`${data.proposed_name} ${data.legal_element}`} />
              {data.alt_name_1 && <ReviewRow label="Alt Name 1" value={data.alt_name_1} />}
              {data.alt_name_2 && <ReviewRow label="Alt Name 2" value={data.alt_name_2} />}
              {data.reserved_name && <ReviewRow label="Reserved Name" value={data.reserved_name} />}
              <ReviewRow label="Fiscal Year End" value={data.fiscal_year_end} />
              <ReviewRow label="Registered Office" value={`${data.reg_street}, ${data.reg_city}, ${data.reg_province} ${data.reg_postal_code}`} />
              <ReviewRow label="Mailing Address" value={data.mailing_same_as_reg ? 'Same as registered office' : `${data.mail_po_box || ''}, ${data.mail_city || ''} ${data.mail_postal_code || ''}`} />
            </dl>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">People</h3>
            <dl>
              <ReviewRow label="Agent for Service" value={`${data.agent.first_name} ${data.agent.last_name}${data.agent.firm ? ` (${data.agent.firm})` : ''}`} />
              <ReviewRow label="Agent Email" value={data.agent.email} />
              <ReviewRow label="Agent Address" value={`${data.agent.street}, ${data.agent.city}, ${data.agent.province} ${data.agent.postal_code}`} />
              <ReviewRow label="Directors" value={data.director_structure === 'fixed' ? `Fixed: ${data.director_fixed_number}` : `Range: ${data.director_min} – ${data.director_max}`} />
              {data.directors.map((d, i) => (
                <ReviewRow key={i} label={`Director ${i + 1}`} value={`${d.first_name} ${d.middle_name || ''} ${d.last_name}, ${d.street}, ${d.city}, ${d.province} ${d.postal_code}`} />
              ))}
              <ReviewRow label="Contact Person" value={data.declarant.full_name} />
              <ReviewRow label="Contact Phone" value={data.declarant.phone} />
              <ReviewRow label="Contact Email" value={data.declarant.email} />
            </dl>
          </div>
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#195E8E] mb-3">Articles</h3>
            <dl>
              <ReviewRow label="Articles Choice" value={data.articles_choice === 'default' ? 'Standard default articles' : data.articles_choice === 'provided_own' ? 'Client providing own' : 'Custom (specified)'} />
              {data.articles_choice === 'custom' && data.custom_articles && (
                <>
                  <ReviewRow label="Share Classes" value={data.custom_articles.share_classes} />
                  {data.custom_articles.transfer_restrictions && <ReviewRow label="Transfer Restrictions" value={data.custom_articles.transfer_restrictions} />}
                  {data.custom_articles.business_restrictions && <ReviewRow label="Business Restrictions" value={data.custom_articles.business_restrictions} />}
                  {data.custom_articles.other_provisions && <ReviewRow label="Other Provisions" value={data.custom_articles.other_provisions} />}
                </>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* ─── Errors ─── */}
      {errors.length > 0 && (
        <div className="mt-6 p-3 rounded bg-red-50 border border-red-200">
          {errors.map((e, i) => (<p key={i} className="text-[13px] text-red-700">{e.message}</p>))}
        </div>
      )}

      {/* ─── Nav buttons ─── */}
      <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex justify-between">
        {currentIdx > 0 ? (
          <button type="button" onClick={goBack} className="px-5 py-2.5 text-[14px] font-medium text-[#5A5A5A] hover:text-[#1A1A1A] transition-colors">← Back</button>
        ) : <div />}

        {step === 'review' && editable ? (
          <button type="button" onClick={handleSubmit} disabled={submitting || saving} className="px-6 py-2.5 bg-[#0d1b2a] text-white text-[14px] font-medium rounded hover:bg-[#1a2e44] transition-colors disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        ) : currentIdx < WIZARD_STEPS.length - 1 ? (
          <button type="button" onClick={goNext} className="px-6 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors">Continue →</button>
        ) : null}
      </div>
    </div>
  )
}
