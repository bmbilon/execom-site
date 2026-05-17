'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type TrademarkIntake,
  type TMWizardStepKey,
  type GoodsServicesItem,
  type CommercializationStatus,
  TM_WIZARD_STEPS,
  STATUS_LABELS,
  CLIENT_EDITABLE,
  blankTrademarkIntake,
  validateTMStep,
  validateAllTM,
  deriveFilingBasis,
  type ValidationError,
} from '@/lib/corp-setup/schema'
import { clientSubmitTM } from '@/lib/services/trademarkService'

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

export default function TrademarkWizard({ intakeId, matterId: matterIdProp }: { intakeId?: string; matterId?: string }) {
  const supabase = createClient()
  const [data, setData] = useState<TrademarkIntake>(blankTrademarkIntake())
  const [step, setStep] = useState<TMWizardStepKey>('brand')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | undefined>(intakeId)
  const [matterId, setMatterId] = useState<string | undefined>(matterIdProp)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [submitting, setSubmitting] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const editable = CLIENT_EDITABLE.includes(data.status)
  const inputCls = editable ? input : inputDisabled

  // ── Load existing record ───────────────────────────────────
  useEffect(() => {
    if (!intakeId) return
    ;(async () => {
      const { data: row } = await supabase
        .from('trademark_intakes')
        .select('*')
        .eq('id', intakeId)
        .single()
      if (row) {
        const blank = blankTrademarkIntake()
        let items: GoodsServicesItem[] = blank.goods_services_items
        if (typeof row.goods_services === 'string' && row.goods_services) {
          try { items = JSON.parse(row.goods_services) } catch { /* keep blank */ }
        }
        setData({
          ...blank,
          ...row,
          goods_services_items: items.length > 0 ? items : blank.goods_services_items,
        } as TrademarkIntake)
        setMatterId(row.matter_id)
      }
    })()
  }, [intakeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Autosave ───────────────────────────────────────────────
  const autosave = useCallback(
    async (record: TrademarkIntake) => {
      if (!CLIENT_EDITABLE.includes(record.status)) return
      setSaving(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const userId = session.user.id

        const basis = deriveFilingBasis(record)
        const payload: Record<string, unknown> = {
          mark_text: record.mark_text,
          mark_type: record.mark_type,
          mark_description: record.mark_description,
          mark_image_path: record.mark_image_path,
          jurisdiction: record.jurisdiction,
          owner_name: record.owner_name,
          owner_type: record.owner_type,
          owner_country: record.owner_country,
          owner_address: record.owner_address,
          owner_corp_number: record.owner_corp_number,
          goods_services: JSON.stringify(record.goods_services_items),
          nice_classes: record.goods_services_items
            .map((g) => g.nice_class).filter(Boolean).join(', ') || null,
          already_in_use: record.already_in_use,
          use_territory: record.use_territory,
          first_use_date: record.first_use_date,
          first_use_commerce: record.first_use_commerce,
          file_before_launch: record.file_before_launch,
          priority_claim: record.priority_claim,
          priority_country: record.priority_country,
          priority_date: record.priority_date,
          priority_app_number: record.priority_app_number,
          clearance_done: record.clearance_done,
          clearance_notes: record.clearance_notes,
          known_competitors: record.known_competitors,
          domain_available: record.domain_available,
          social_handles_available: record.social_handles_available,
          risk_notes: record.risk_notes,
          filing_basis_ca: basis.ca || null,
          filing_basis_us: basis.us || null,
        }

        if (recordId) {
          await supabase.from('trademark_intakes').update(payload).eq('id', recordId)
          // Sync display name
          if (matterId && record.mark_text) {
            await supabase
              .from('commercialization_matters')
              .update({ display_name: `${record.mark_text}, Trademark` })
              .eq('id', matterId)
          }
        } else {
          const { data: newRow, error } = await supabase
            .from('trademark_intakes')
            .insert({ ...payload, user_id: userId, matter_id: matterId, status: 'draft' })
            .select('id')
            .single()
          if (newRow) {
            setRecordId(newRow.id)
            // Update URL without reload
            window.history.replaceState(
              null, '',
              `/portal/matters/${matterId}/tasks/trademark/${newRow.id}`
            )
          }
        }
        setLastSaved(new Date().toLocaleTimeString())
      } finally {
        setSaving(false)
      }
    },
    [recordId, matterId, supabase]
  )

  function update(patch: Partial<TrademarkIntake>) {
    const next = { ...data, ...patch }
    setData(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => autosave(next), 800)
  }

  function updateItem(index: number, patch: Partial<GoodsServicesItem>) {
    const items = [...data.goods_services_items]
    items[index] = { ...items[index], ...patch }
    update({ goods_services_items: items })
  }

  function addItem() {
    update({ goods_services_items: [...data.goods_services_items, { description: '', category: 'goods', nice_class: '' }] })
  }

  function removeItem(index: number) {
    const items = data.goods_services_items.filter((_, i) => i !== index)
    update({ goods_services_items: items.length > 0 ? items : [{ description: '', category: 'goods', nice_class: '' }] })
  }

  // ── Step navigation ────────────────────────────────────────
  const stepIdx = TM_WIZARD_STEPS.findIndex((s) => s.key === step)
  function prevStep() { if (stepIdx > 0) setStep(TM_WIZARD_STEPS[stepIdx - 1].key) }
  function nextStep() {
    const errs = validateTMStep(step, data)
    setErrors(errs)
    if (errs.length > 0) return
    if (stepIdx < TM_WIZARD_STEPS.length - 1) setStep(TM_WIZARD_STEPS[stepIdx + 1].key)
  }

  async function handleSubmit() {
    const errs = validateAllTM(data)
    setErrors(errs)
    if (errs.length > 0) return
    if (!recordId || !matterId) return

    setSubmitting(true)
    try {
      await clientSubmitTM(supabase, recordId, matterId, (await supabase.auth.getSession()).data.session!.user.id)
      setData((d) => ({ ...d, status: 'submitted' }))
    } finally {
      setSubmitting(false)
    }
  }

  // ── Status banner ──────────────────────────────────────────
  function StatusBanner() {
    if (data.status === 'submitted' || data.status === 'in_review') {
      return (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-[13px] text-blue-800">
          Your trademark application has been submitted and is being reviewed by our team.
        </div>
      )
    }
    if (data.status === 'changes_requested') {
      return (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-[13px] text-orange-800">
          <p className="font-semibold mb-1">Changes Requested</p>
          <p>{data.change_request_message || 'Please review and update your application.'}</p>
        </div>
      )
    }
    if (data.status === 'approved_for_generation' || data.status === 'generated' || data.status === 'filed') {
      return (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-800">
          Your trademark application has been approved. {data.status === 'filed' ? 'It has been filed.' : 'Documents are being prepared.'}
        </div>
      )
    }
    return null
  }

  // ── Review Row helper ──────────────────────────────────────
  function ReviewRow({ label, value }: { label: string; value: string | undefined | null }) {
    return (
      <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E5E5E5] last:border-0">
        <dt className="text-[13px] font-medium text-[#5A5A5A]">{label}</dt>
        <dd className="col-span-2 text-[13px] text-[#1A1A1A]">{value || '-'}</dd>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  const MARK_TYPES = [
    { value: 'word', label: 'Word Mark', desc: 'Just the name/text' },
    { value: 'design', label: 'Logo/Design', desc: 'A graphic or stylized mark' },
    { value: 'slogan', label: 'Slogan/Tagline', desc: 'A short phrase' },
    { value: 'combined', label: 'Name + Logo', desc: 'Text combined with a design' },
  ]

  return (
    <div className="max-w-[680px] mx-auto">
      <StatusBanner />

      {/* Step indicators */}
      <div className="flex gap-1 mb-8">
        {TM_WIZARD_STEPS.map((s) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`flex-1 text-center py-2.5 rounded transition-colors ${
              s.key === step
                ? 'bg-[#195E8E] text-white'
                : 'bg-[#E5E5E5] text-[#5A5A5A] hover:bg-[#d5d5d5]'
            }`}
          >
            <span className="text-[11px] font-semibold">{s.number}</span>
            <span className="hidden sm:inline text-[11px] ml-1">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Step title */}
      <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-1">
        {TM_WIZARD_STEPS[stepIdx].title}
      </h2>
      <p className="text-[13px] text-[#5A5A5A] mb-6">{TM_WIZARD_STEPS[stepIdx].subtitle}</p>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((e, i) => (
            <p key={i} className="text-[12px] text-red-700">{e.message}</p>
          ))}
        </div>
      )}

      {/* ═══ Step 1, Brand Basics ═══ */}
      {step === 'brand' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Brand Name <Req /></label>
            <input className={inputCls} value={data.mark_text} onChange={(e) => update({ mark_text: e.target.value })} placeholder="e.g., NorthForge" disabled={!editable} />
            <p className={hint}>The name, word, or phrase you want to protect.</p>
          </div>

          <div>
            <label className={labelCls}>Type of Mark <Req /></label>
            <div className="grid grid-cols-2 gap-2">
              {MARK_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  type="button"
                  disabled={!editable}
                  onClick={() => update({ mark_type: mt.value as any })}
                  className={`text-left px-4 py-3 rounded border transition-colors ${
                    data.mark_type === mt.value
                      ? 'border-[#195E8E] bg-[#195E8E]/5'
                      : 'border-[#E5E5E5] hover:border-[#195E8E]/40'
                  } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <p className="text-[13px] font-medium text-[#1A1A1A]">{mt.label}</p>
                  <p className="text-[11px] text-[#b8b8b0]">{mt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {(data.mark_type === 'design' || data.mark_type === 'combined') && (
            <div>
              <label className={labelCls}>Design Description <Req /></label>
              <textarea
                className={inputCls}
                rows={3}
                value={data.mark_description || ''}
                onChange={(e) => update({ mark_description: e.target.value })}
                placeholder="Describe the logo/design elements (colours, shapes, layout)"
                disabled={!editable}
              />
              <p className={hint}>You can also upload a file later if needed.</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Where do you want to protect this brand? <Req /></label>
            <div className="flex gap-2">
              {(['Canada', 'United States', 'Both'] as const).map((j) => (
                <button
                  key={j}
                  type="button"
                  disabled={!editable}
                  onClick={() => update({ jurisdiction: j })}
                  className={`flex-1 px-4 py-3 rounded border text-center transition-colors ${
                    data.jurisdiction === j
                      ? 'border-[#195E8E] bg-[#195E8E]/5 text-[#195E8E] font-medium'
                      : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#195E8E]/40'
                  } text-[13px] ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Step 2, Owner Information ═══ */}
      {step === 'owner' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Owner Name <Req /></label>
            <input className={inputCls} value={data.owner_name} onChange={(e) => update({ owner_name: e.target.value })} placeholder="e.g., Acme Innovations Ltd." disabled={!editable} />
            <p className={hint}>The person or company that will own this trademark.</p>
          </div>

          <div>
            <label className={labelCls}>Owner Type <Req /></label>
            <select className={inputCls} value={data.owner_type} onChange={(e) => update({ owner_type: e.target.value as any })} disabled={!editable}>
              <option value="corporation">Corporation</option>
              <option value="individual">Individual</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Owner Country <Req /></label>
            <select className={inputCls} value={data.owner_country} onChange={(e) => update({ owner_country: e.target.value })} disabled={!editable}>
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Owner Address <Req /></label>
            <textarea className={inputCls} rows={2} value={data.owner_address || ''} onChange={(e) => update({ owner_address: e.target.value })} placeholder="Full street address, city, province/state, postal/zip code" disabled={!editable} />
          </div>

          {data.owner_type === 'corporation' && (
            <div>
              <label className={labelCls}>Corporation Number (if known)</label>
              <input className={inputCls} value={data.owner_corp_number || ''} onChange={(e) => update({ owner_corp_number: e.target.value })} placeholder="e.g., AB 2012345" disabled={!editable} />
              <p className={hint}>Optional, helps us link to your incorporation record.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Step 3, What You Sell ═══ */}
      {step === 'goods' && (
        <div className="space-y-5">
          <p className="text-[14px] text-[#5A5A5A]">
            Describe the products or services your brand will be used for. Use plain language, we'll handle the formal classifications.
          </p>

          {data.goods_services_items.map((item, i) => (
            <div key={i} className="portal-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#195E8E]">Item {i + 1}</span>
                {data.goods_services_items.length > 1 && editable && (
                  <button type="button" onClick={() => removeItem(i)} className="text-[11px] text-red-500 hover:underline">Remove</button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Description <Req /></label>
                  <textarea
                    className={inputCls}
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                    placeholder="e.g., Mobile app for personal fitness tracking"
                    disabled={!editable}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Category <Req /></label>
                    <select className={inputCls} value={item.category} onChange={(e) => updateItem(i, { category: e.target.value as any })} disabled={!editable}>
                      <option value="goods">Product (goods)</option>
                      <option value="services">Service</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nice Class (optional)</label>
                    <input className={inputCls} value={item.nice_class || ''} onChange={(e) => updateItem(i, { nice_class: e.target.value })} placeholder="e.g., 9, 42" disabled={!editable} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {editable && (
            <button type="button" onClick={addItem} className="text-[13px] text-[#195E8E] hover:underline font-medium">
              + Add another product or service
            </button>
          )}

          <p className={hint}>
            Don't worry about Nice classification numbers, our team will assign the correct classes during review. Just describe what you sell.
          </p>
        </div>
      )}

      {/* ═══ Step 4, Use & Timing ═══ */}
      {step === 'timing' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Are you already using this brand in market? <Req /></label>
            <div className="flex gap-2">
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
                <button
                  key={l}
                  type="button"
                  disabled={!editable}
                  onClick={() => update({ already_in_use: v })}
                  className={`flex-1 px-4 py-3 rounded border text-center text-[13px] transition-colors ${
                    data.already_in_use === v
                      ? 'border-[#195E8E] bg-[#195E8E]/5 text-[#195E8E] font-medium'
                      : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#195E8E]/40'
                  } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {data.already_in_use && (
            <>
              <div>
                <label className={labelCls}>Where are you using it? <Req /></label>
                <select className={inputCls} value={data.use_territory || ''} onChange={(e) => update({ use_territory: e.target.value })} disabled={!editable}>
                  <option value="">Select…</option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="Both">Both</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>When did you first use this brand? <Req /></label>
                <input type="date" className={inputCls} value={data.first_use_date || ''} onChange={(e) => update({ first_use_date: e.target.value })} disabled={!editable} />
              </div>

              {(data.jurisdiction === 'United States' || data.jurisdiction === 'Both') && (
                <div>
                  <label className={labelCls}>First use in US commerce <Req /></label>
                  <input type="date" className={inputCls} value={data.first_use_commerce || ''} onChange={(e) => update({ first_use_commerce: e.target.value })} disabled={!editable} />
                  <p className={hint}>The date you first sold or shipped goods/services in the US using this brand.</p>
                </div>
              )}
            </>
          )}

          {!data.already_in_use && (
            <div>
              <label className={labelCls}>Do you want to file before you launch?</label>
              <div className="flex gap-2">
                {[{ v: true, l: 'Yes, file now' }, { v: false, l: 'No, wait' }].map(({ v, l }) => (
                  <button
                    key={l}
                    type="button"
                    disabled={!editable}
                    onClick={() => update({ file_before_launch: v })}
                    className={`flex-1 px-4 py-3 rounded border text-center text-[13px] transition-colors ${
                      data.file_before_launch === v
                        ? 'border-[#195E8E] bg-[#195E8E]/5 text-[#195E8E] font-medium'
                        : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#195E8E]/40'
                    } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p className={hint}>Filing early lets you claim the date. In the US this is called an "intent to use" application.</p>
            </div>
          )}

          <div className={sectionH}>Priority Claim</div>
          <div>
            <label className={labelCls}>Do you have a foreign filing you want to claim priority from?</label>
            <div className="flex gap-2">
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
                <button
                  key={l}
                  type="button"
                  disabled={!editable}
                  onClick={() => update({ priority_claim: v })}
                  className={`flex-1 px-4 py-3 rounded border text-center text-[13px] transition-colors ${
                    data.priority_claim === v
                      ? 'border-[#195E8E] bg-[#195E8E]/5 text-[#195E8E] font-medium'
                      : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#195E8E]/40'
                  } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {data.priority_claim && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Priority Country <Req /></label>
                <input className={inputCls} value={data.priority_country || ''} onChange={(e) => update({ priority_country: e.target.value })} placeholder="e.g., Germany" disabled={!editable} />
              </div>
              <div>
                <label className={labelCls}>Filing Date <Req /></label>
                <input type="date" className={inputCls} value={data.priority_date || ''} onChange={(e) => update({ priority_date: e.target.value })} disabled={!editable} />
              </div>
              <div>
                <label className={labelCls}>Application Number <Req /></label>
                <input className={inputCls} value={data.priority_app_number || ''} onChange={(e) => update({ priority_app_number: e.target.value })} placeholder="Application or serial number" disabled={!editable} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Step 5, Clearance & Risk ═══ */}
      {step === 'clearance' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Has anyone already searched this mark?</label>
            <div className="flex gap-2">
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
                <button
                  key={l}
                  type="button"
                  disabled={!editable}
                  onClick={() => update({ clearance_done: v })}
                  className={`flex-1 px-4 py-3 rounded border text-center text-[13px] transition-colors ${
                    data.clearance_done === v
                      ? 'border-[#195E8E] bg-[#195E8E]/5 text-[#195E8E] font-medium'
                      : 'border-[#E5E5E5] text-[#5A5A5A] hover:border-[#195E8E]/40'
                  } ${!editable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {data.clearance_done && (
            <div>
              <label className={labelCls}>Search results or notes</label>
              <textarea className={inputCls} rows={3} value={data.clearance_notes || ''} onChange={(e) => update({ clearance_notes: e.target.value })} placeholder="Summary of clearance search results" disabled={!editable} />
            </div>
          )}

          <div>
            <label className={labelCls}>Known competitors or similar brands</label>
            <textarea className={inputCls} rows={2} value={data.known_competitors || ''} onChange={(e) => update({ known_competitors: e.target.value })} placeholder="List any brands you know of that look or sound similar" disabled={!editable} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Domain available?</label>
              <select className={inputCls} value={data.domain_available || 'unknown'} onChange={(e) => update({ domain_available: e.target.value })} disabled={!editable}>
                <option value="unknown">Not sure</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Social handles available?</label>
              <select className={inputCls} value={data.social_handles_available || 'unknown'} onChange={(e) => update({ social_handles_available: e.target.value })} disabled={!editable}>
                <option value="unknown">Not sure</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Any other notes or concerns?</label>
            <textarea className={inputCls} rows={3} value={data.risk_notes || ''} onChange={(e) => update({ risk_notes: e.target.value })} placeholder="Anything else we should know about this brand" disabled={!editable} />
          </div>
        </div>
      )}

      {/* ═══ Step 6, Review & Submit ═══ */}
      {step === 'review' && (
        <div className="space-y-6">
          <div>
            <h3 className={sectionH}>Brand Basics</h3>
            <div className="portal-card p-4">
              <dl>
                <ReviewRow label="Brand Name" value={data.mark_text} />
                <ReviewRow label="Mark Type" value={data.mark_type} />
                {data.mark_description && <ReviewRow label="Design Description" value={data.mark_description} />}
                <ReviewRow label="Jurisdiction" value={data.jurisdiction} />
              </dl>
            </div>
          </div>

          <div>
            <h3 className={sectionH}>Owner</h3>
            <div className="portal-card p-4">
              <dl>
                <ReviewRow label="Name" value={data.owner_name} />
                <ReviewRow label="Type" value={data.owner_type} />
                <ReviewRow label="Country" value={data.owner_country} />
                <ReviewRow label="Address" value={data.owner_address} />
                {data.owner_corp_number && <ReviewRow label="Corp Number" value={data.owner_corp_number} />}
              </dl>
            </div>
          </div>

          <div>
            <h3 className={sectionH}>Products & Services</h3>
            <div className="portal-card p-4">
              <dl>
                {data.goods_services_items.map((item, i) => (
                  <ReviewRow key={i} label={`${item.category === 'goods' ? 'Product' : 'Service'} ${i + 1}`} value={`${item.description}${item.nice_class ? ` (Class ${item.nice_class})` : ''}`} />
                ))}
              </dl>
            </div>
          </div>

          <div>
            <h3 className={sectionH}>Use & Timing</h3>
            <div className="portal-card p-4">
              <dl>
                <ReviewRow label="Already in Use" value={data.already_in_use ? 'Yes' : 'No'} />
                {data.already_in_use && (
                  <>
                    <ReviewRow label="Territory" value={data.use_territory} />
                    <ReviewRow label="First Use Date" value={data.first_use_date} />
                    {data.first_use_commerce && <ReviewRow label="First Use in Commerce" value={data.first_use_commerce} />}
                  </>
                )}
                {!data.already_in_use && <ReviewRow label="File Before Launch" value={data.file_before_launch ? 'Yes' : 'No'} />}
                <ReviewRow label="Priority Claim" value={data.priority_claim ? 'Yes' : 'No'} />
                {data.priority_claim && (
                  <>
                    <ReviewRow label="Priority Country" value={data.priority_country} />
                    <ReviewRow label="Priority Date" value={data.priority_date} />
                    <ReviewRow label="Priority App #" value={data.priority_app_number} />
                  </>
                )}
              </dl>
            </div>
          </div>

          <div>
            <h3 className={sectionH}>Clearance & Risk</h3>
            <div className="portal-card p-4">
              <dl>
                <ReviewRow label="Clearance Done" value={data.clearance_done ? 'Yes' : 'No'} />
                {data.clearance_notes && <ReviewRow label="Search Notes" value={data.clearance_notes} />}
                {data.known_competitors && <ReviewRow label="Known Competitors" value={data.known_competitors} />}
                <ReviewRow label="Domain Available" value={data.domain_available || 'Unknown'} />
                <ReviewRow label="Social Handles" value={data.social_handles_available || 'Unknown'} />
                {data.risk_notes && <ReviewRow label="Notes" value={data.risk_notes} />}
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Navigation ═══ */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
        <div>
          {stepIdx > 0 && (
            <button onClick={prevStep} className="text-[13px] text-[#5A5A5A] hover:text-[#195E8E] transition-colors">
              ← {TM_WIZARD_STEPS[stepIdx - 1].title}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-[11px] text-[#b8b8b0]">Saving…</span>}
          {!saving && lastSaved && <span className="text-[11px] text-[#b8b8b0]">Saved {lastSaved}</span>}

          {step === 'review' && editable ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          ) : stepIdx < TM_WIZARD_STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-5 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors"
            >
              Next →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
