'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import {
  type IPTransferIntake,
  type IPWizardStepKey,
  type IPAssetType,
  type ConsiderationType,
  IP_WIZARD_STEPS,
  STATUS_LABELS,
  CLIENT_EDITABLE,
  blankIPTransferIntake,
  validateIPStep,
  validateAllIP,
  type ValidationError,
} from '@/lib/corp-setup/schema'
import { clientSubmit } from '@/lib/services/ipTransferService'

// ─── Style tokens (matching incorporation wizard) ────────────

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

// ─── Asset types ─────────────────────────────────────────────

const ASSET_TYPES: { value: IPAssetType; label: string }[] = [
  { value: 'invention', label: 'Invention / Patent' },
  { value: 'software', label: 'Software / Source Code' },
  { value: 'design', label: 'Industrial Design' },
  { value: 'trade_secret', label: 'Trade Secret / Know-How' },
  { value: 'other', label: 'Other' },
]

const CONSIDERATION_TYPES: { value: ConsiderationType; label: string }[] = [
  { value: 'shares', label: 'Shares' },
  { value: 'cash', label: 'Cash' },
  { value: 'mixed', label: 'Mixed (Cash + Shares)' },
  { value: 'nominal', label: 'Nominal ($1.00)' },
]

// ─── Component ───────────────────────────────────────────────

export default function IPTransferWizard({
  intakeId,
  matterId: matterIdProp,
}: {
  intakeId?: string
  matterId?: string
}) {
  const supabase = createClient()
  const [data, setData] = useState<IPTransferIntake>(blankIPTransferIntake())
  const [step, setStep] = useState<IPWizardStepKey>('asset')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | undefined>(intakeId)
  const [matterId, setMatterId] = useState<string | undefined>(matterIdProp)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [submitting, setSubmitting] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const editable = CLIENT_EDITABLE.includes(data.status)

  // ─── Load existing record ──────────────────────────────────

  useEffect(() => {
    if (!intakeId) return
    ;(async () => {
      const { data: row } = await supabase
        .from('ip_transfer_intakes')
        .select('*')
        .eq('id', intakeId)
        .single()
      if (row) {
        setData(row as IPTransferIntake)
        setMatterId(row.matter_id)
      }
    })()
  }, [intakeId, supabase])

  // ─── Autosave ──────────────────────────────────────────────

  const save = useCallback(
    async (record: IPTransferIntake) => {
      setSaving(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) return

        const payload: Partial<IPTransferIntake> = {
          asset_title: record.asset_title,
          asset_type: record.asset_type,
          asset_description: record.asset_description,
          invention_date: record.invention_date,
          public_disclosure: record.public_disclosure,
          disclosure_details: record.disclosure_details,
          inventor_name: record.inventor_name,
          inventor_email: record.inventor_email,
          inventor_phone: record.inventor_phone,
          inventor_address: record.inventor_address,
          assignee_corp_name: record.assignee_corp_name,
          assignee_corp_number: record.assignee_corp_number,
          consideration_type: record.consideration_type,
          consideration_amount: record.consideration_amount,
          share_class: record.share_class,
          num_shares: record.num_shares,
          patent_filed: record.patent_filed,
          patent_app_number: record.patent_app_number,
          patent_jurisdiction: record.patent_jurisdiction,
          prior_art_notes: record.prior_art_notes,
          existing_agreements: record.existing_agreements,
          source_matter_id: record.source_matter_id || undefined,
        }

        if (recordId) {
          await supabase
            .from('ip_transfer_intakes')
            .update(payload)
            .eq('id', recordId)
        } else {
          // Resolve or create parent matter
          let resolvedMatterId = matterId
          if (!resolvedMatterId) {
            const { data: matter } = await supabase
              .from('commercialization_matters')
              .insert({
                user_id: userId,
                matter_type: 'ip_transfer',
                display_name: record.asset_title || 'New IP Transfer',
                status: 'draft',
              })
              .select('id')
              .single()

            if (!matter) throw new Error('Failed to create matter')
            resolvedMatterId = matter.id
            setMatterId(matter.id)
          }

          const { data: inserted } = await supabase
            .from('ip_transfer_intakes')
            .insert({
              ...payload,
              user_id: userId,
              matter_id: resolvedMatterId,
              status: 'draft',
            })
            .select('id')
            .single()

          if (inserted) {
            setRecordId(inserted.id)
            if (matterIdProp) {
              window.history.replaceState(
                null,
                '',
                `/portal/matters/${resolvedMatterId}/tasks/ip-transfer/${inserted.id}`
              )
            }
          }
        }
        // Keep display_name synced
        if (matterId && record.asset_title) {
          await supabase
            .from('commercialization_matters')
            .update({ display_name: record.asset_title })
            .eq('id', matterId)
        }
        setLastSaved(new Date().toLocaleTimeString('en-CA'))
      } catch (err) {
        console.error('Autosave failed:', err)
      } finally {
        setSaving(false)
      }
    },
    [recordId, matterId, matterIdProp, supabase]
  )

  function update(patch: Partial<IPTransferIntake>) {
    if (!editable) return
    const next = { ...data, ...patch }
    setData(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(next), 1500)
  }

  // ─── Navigation ────────────────────────────────────────────

  function goNext() {
    const stepErrs = validateIPStep(step, data)
    if (stepErrs.length > 0) {
      setErrors(stepErrs)
      return
    }
    setErrors([])
    const idx = IP_WIZARD_STEPS.findIndex((s) => s.key === step)
    if (idx < IP_WIZARD_STEPS.length - 1) {
      setStep(IP_WIZARD_STEPS[idx + 1].key)
    }
  }

  function goBack() {
    setErrors([])
    const idx = IP_WIZARD_STEPS.findIndex((s) => s.key === step)
    if (idx > 0) {
      setStep(IP_WIZARD_STEPS[idx - 1].key)
    }
  }

  // ─── Submit ────────────────────────────────────────────────

  async function handleSubmit() {
    const allErrs = validateAllIP(data)
    if (allErrs.length > 0) {
      setErrors(allErrs)
      return
    }
    setSubmitting(true)
    try {
      if (recordId && matterId) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')
        await clientSubmit(supabase, recordId, matterId, session.user.id)
      }
      setData({ ...data, status: 'submitted' })
    } catch (err) {
      console.error('Submit failed:', err)
      setErrors([{ field: 'submit', message: 'Submission failed. Please try again.' }])
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Status banners ────────────────────────────────────────

  const statusBanner = (() => {
    if (data.status === 'changes_requested')
      return (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-[14px] font-medium text-orange-800">
            Changes Requested
          </p>
          {data.change_request_message && (
            <p className="text-[13px] text-orange-700 mt-1">
              {data.change_request_message}
            </p>
          )}
        </div>
      )
    if (data.status === 'submitted')
      return (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[13px] text-blue-800">
            Your IP transfer intake has been submitted and is pending review.
          </p>
        </div>
      )
    if (
      ['in_review', 'approved_for_generation', 'generated', 'filed'].includes(
        data.status
      )
    )
      return (
        <div className="mb-6 p-4 bg-[#195E8E]/5 border border-[#195E8E]/20 rounded-lg">
          <p className="text-[13px] text-[#195E8E]">
            Status: {STATUS_LABELS[data.status]}
          </p>
        </div>
      )
    return null
  })()

  // ─── Render ────────────────────────────────────────────────

  const currentStepIdx = IP_WIZARD_STEPS.findIndex((s) => s.key === step)

  return (
    <div>
      {statusBanner}

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {IP_WIZARD_STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => {
              setErrors([])
              setStep(s.key)
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] font-medium transition-colors ${
              i === currentStepIdx
                ? 'bg-[#195E8E] text-white'
                : i < currentStepIdx
                ? 'bg-[#195E8E]/10 text-[#195E8E]'
                : 'bg-[#F7F6EE] text-[#b8b8b0]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[11px]">
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Autosave indicator */}
      {editable && (
        <div className="text-[12px] text-[#b8b8b0] mb-4">
          {saving
            ? 'Saving…'
            : lastSaved
            ? `Saved at ${lastSaved}`
            : 'Your progress is saved automatically'}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-[13px] text-red-800">
          {errors.map((e, i) => (
            <p key={i}>{e.message}</p>
          ))}
        </div>
      )}

      {/* ─── Step 1: Asset Basics ──────────────────────────── */}
      {step === 'asset' && (
        <div className="space-y-4">
          <h2 className={sectionH}>Intellectual Property Details</h2>
          <div>
            <label className={labelCls}>
              Asset Title <Req />
            </label>
            <input
              className={editable ? input : inputDisabled}
              placeholder="e.g. Automated Batch Processing Algorithm"
              value={data.asset_title}
              onChange={(e) => update({ asset_title: e.target.value })}
              disabled={!editable}
            />
            <p className={hint}>A short, descriptive name for the intellectual property</p>
          </div>
          <div>
            <label className={labelCls}>
              Asset Type <Req />
            </label>
            <select
              className={editable ? input : inputDisabled}
              value={data.asset_type}
              onChange={(e) =>
                update({ asset_type: e.target.value as IPAssetType })
              }
              disabled={!editable}
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={editable ? input : inputDisabled}
              rows={4}
              placeholder="Describe the intellectual property being transferred…"
              value={data.asset_description || ''}
              onChange={(e) => update({ asset_description: e.target.value })}
              disabled={!editable}
            />
          </div>
          <div>
            <label className={labelCls}>Invention Date</label>
            <input
              type="date"
              className={editable ? input : inputDisabled}
              value={data.invention_date || ''}
              onChange={(e) => update({ invention_date: e.target.value })}
              disabled={!editable}
            />
            <p className={hint}>Approximate date the IP was first conceived or reduced to practice</p>
          </div>

          <h2 className={sectionH}>Public Disclosure</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.public_disclosure}
              onChange={(e) =>
                update({ public_disclosure: e.target.checked })
              }
              disabled={!editable}
              className="w-4 h-4"
            />
            <label className="text-[14px] text-[#1A1A1A]">
              This IP has been publicly disclosed (publication, demo, sale, etc.)
            </label>
          </div>
          {data.public_disclosure && (
            <div>
              <label className={labelCls}>
                Disclosure Details <Req />
              </label>
              <textarea
                className={editable ? input : inputDisabled}
                rows={3}
                placeholder="Where and when was the IP publicly disclosed?"
                value={data.disclosure_details || ''}
                onChange={(e) =>
                  update({ disclosure_details: e.target.value })
                }
                disabled={!editable}
              />
              <p className={hint}>
                Public disclosure may affect patent eligibility — provide dates and details
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Step 2: Parties ──────────────────────────────── */}
      {step === 'parties' && (
        <div className="space-y-4">
          <h2 className={sectionH}>Inventor / Assignor</h2>
          <div>
            <label className={labelCls}>
              Full Name <Req />
            </label>
            <input
              className={editable ? input : inputDisabled}
              placeholder="Jane Doe"
              value={data.inventor_name}
              onChange={(e) => update({ inventor_name: e.target.value })}
              disabled={!editable}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                className={editable ? input : inputDisabled}
                type="email"
                placeholder="jane@example.com"
                value={data.inventor_email || ''}
                onChange={(e) => update({ inventor_email: e.target.value })}
                disabled={!editable}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                className={editable ? input : inputDisabled}
                placeholder="(403) 555-1234"
                value={data.inventor_phone || ''}
                onChange={(e) => update({ inventor_phone: e.target.value })}
                disabled={!editable}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={editable ? input : inputDisabled}
              placeholder="123 Innovation Blvd, Calgary, AB T2P 0A1"
              value={data.inventor_address || ''}
              onChange={(e) => update({ inventor_address: e.target.value })}
              disabled={!editable}
            />
          </div>

          <h2 className={sectionH}>Assignee Corporation</h2>
          <div>
            <label className={labelCls}>
              Corporation Name <Req />
            </label>
            <input
              className={editable ? input : inputDisabled}
              placeholder="Acme Tech Inc."
              value={data.assignee_corp_name}
              onChange={(e) =>
                update({ assignee_corp_name: e.target.value })
              }
              disabled={!editable}
            />
          </div>
          <div>
            <label className={labelCls}>Alberta Corporation Number</label>
            <input
              className={editable ? input : inputDisabled}
              placeholder="20XXXXXXX"
              value={data.assignee_corp_number || ''}
              onChange={(e) =>
                update({ assignee_corp_number: e.target.value })
              }
              disabled={!editable}
            />
            <p className={hint}>
              If the corporation was recently incorporated through execom, we can look this up for you
            </p>
          </div>
        </div>
      )}

      {/* ─── Step 3: Consideration & Filing ───────────────── */}
      {step === 'consideration' && (
        <div className="space-y-4">
          <h2 className={sectionH}>Consideration</h2>
          <div>
            <label className={labelCls}>
              Consideration Type <Req />
            </label>
            <select
              className={editable ? input : inputDisabled}
              value={data.consideration_type}
              onChange={(e) =>
                update({
                  consideration_type: e.target.value as ConsiderationType,
                })
              }
              disabled={!editable}
            >
              {CONSIDERATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className={hint}>
              How the inventor will be compensated for the IP transfer
            </p>
          </div>

          {(data.consideration_type === 'cash' ||
            data.consideration_type === 'mixed') && (
            <div>
              <label className={labelCls}>Cash Amount ($)</label>
              <input
                className={editable ? input : inputDisabled}
                placeholder="1,000.00"
                value={data.consideration_amount || ''}
                onChange={(e) =>
                  update({ consideration_amount: e.target.value })
                }
                disabled={!editable}
              />
            </div>
          )}

          {(data.consideration_type === 'shares' ||
            data.consideration_type === 'mixed') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Share Class</label>
                <input
                  className={editable ? input : inputDisabled}
                  placeholder="Common"
                  value={data.share_class || ''}
                  onChange={(e) => update({ share_class: e.target.value })}
                  disabled={!editable}
                />
              </div>
              <div>
                <label className={labelCls}>Number of Shares</label>
                <input
                  type="number"
                  className={editable ? input : inputDisabled}
                  placeholder="100"
                  value={data.num_shares ?? ''}
                  onChange={(e) =>
                    update({
                      num_shares: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  disabled={!editable}
                />
              </div>
            </div>
          )}

          <h2 className={sectionH}>Patent Status</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.patent_filed}
              onChange={(e) => update({ patent_filed: e.target.checked })}
              disabled={!editable}
              className="w-4 h-4"
            />
            <label className="text-[14px] text-[#1A1A1A]">
              A patent application has been filed for this IP
            </label>
          </div>
          {data.patent_filed && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Application Number</label>
                <input
                  className={editable ? input : inputDisabled}
                  placeholder="PCT/CA/2024/001234"
                  value={data.patent_app_number || ''}
                  onChange={(e) =>
                    update({ patent_app_number: e.target.value })
                  }
                  disabled={!editable}
                />
              </div>
              <div>
                <label className={labelCls}>Jurisdiction</label>
                <input
                  className={editable ? input : inputDisabled}
                  placeholder="Canada / PCT / US"
                  value={data.patent_jurisdiction || ''}
                  onChange={(e) =>
                    update({ patent_jurisdiction: e.target.value })
                  }
                  disabled={!editable}
                />
              </div>
            </div>
          )}

          <h2 className={sectionH}>Additional Information</h2>
          <div>
            <label className={labelCls}>Prior Art / Background Notes</label>
            <textarea
              className={editable ? input : inputDisabled}
              rows={3}
              placeholder="Any known prior art, related patents, or background context…"
              value={data.prior_art_notes || ''}
              onChange={(e) => update({ prior_art_notes: e.target.value })}
              disabled={!editable}
            />
          </div>
          <div>
            <label className={labelCls}>
              Existing Agreements / Encumbrances
            </label>
            <textarea
              className={editable ? input : inputDisabled}
              rows={3}
              placeholder="Any existing licenses, assignments, liens, or encumbrances on this IP…"
              value={data.existing_agreements || ''}
              onChange={(e) =>
                update({ existing_agreements: e.target.value })
              }
              disabled={!editable}
            />
          </div>
        </div>
      )}

      {/* ─── Step 4: Review & Submit ──────────────────────── */}
      {step === 'review' && (
        <div className="space-y-6">
          {/* Asset summary */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className={sectionH}>Asset</h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
              <dt className="text-[#b8b8b0]">Title</dt>
              <dd className="text-[#1A1A1A]">{data.asset_title || '—'}</dd>
              <dt className="text-[#b8b8b0]">Type</dt>
              <dd className="text-[#1A1A1A]">
                {ASSET_TYPES.find((t) => t.value === data.asset_type)?.label || data.asset_type}
              </dd>
              <dt className="text-[#b8b8b0]">Invention Date</dt>
              <dd className="text-[#1A1A1A]">{data.invention_date || '—'}</dd>
              <dt className="text-[#b8b8b0]">Public Disclosure</dt>
              <dd className="text-[#1A1A1A]">{data.public_disclosure ? 'Yes' : 'No'}</dd>
            </dl>
            {data.asset_description && (
              <p className="text-[13px] text-[#5A5A5A] mt-3">{data.asset_description}</p>
            )}
          </div>

          {/* Parties summary */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className={sectionH}>Parties</h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
              <dt className="text-[#b8b8b0]">Inventor</dt>
              <dd className="text-[#1A1A1A]">{data.inventor_name || '—'}</dd>
              <dt className="text-[#b8b8b0]">Inventor Email</dt>
              <dd className="text-[#1A1A1A]">{data.inventor_email || '—'}</dd>
              <dt className="text-[#b8b8b0]">Assignee</dt>
              <dd className="text-[#1A1A1A]">{data.assignee_corp_name || '—'}</dd>
              <dt className="text-[#b8b8b0]">Corp Number</dt>
              <dd className="text-[#1A1A1A]">{data.assignee_corp_number || '—'}</dd>
            </dl>
          </div>

          {/* Consideration summary */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <h3 className={sectionH}>Consideration & Filing</h3>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
              <dt className="text-[#b8b8b0]">Type</dt>
              <dd className="text-[#1A1A1A]">
                {CONSIDERATION_TYPES.find((t) => t.value === data.consideration_type)?.label || data.consideration_type}
              </dd>
              {data.consideration_amount && (
                <>
                  <dt className="text-[#b8b8b0]">Amount</dt>
                  <dd className="text-[#1A1A1A]">${data.consideration_amount}</dd>
                </>
              )}
              {data.num_shares && (
                <>
                  <dt className="text-[#b8b8b0]">Shares</dt>
                  <dd className="text-[#1A1A1A]">
                    {data.num_shares} {data.share_class || 'Common'}
                  </dd>
                </>
              )}
              <dt className="text-[#b8b8b0]">Patent Filed</dt>
              <dd className="text-[#1A1A1A]">{data.patent_filed ? 'Yes' : 'No'}</dd>
              {data.patent_filed && data.patent_app_number && (
                <>
                  <dt className="text-[#b8b8b0]">Application</dt>
                  <dd className="text-[#1A1A1A]">
                    {data.patent_app_number}{' '}
                    {data.patent_jurisdiction && `(${data.patent_jurisdiction})`}
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Submit */}
          {editable && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          )}
        </div>
      )}

      {/* ─── Navigation buttons ───────────────────────────── */}
      {step !== 'review' && (
        <div className="flex justify-between mt-8 pt-4 border-t border-[#E5E5E5]">
          <button
            onClick={goBack}
            disabled={currentStepIdx === 0}
            className="px-5 py-2.5 text-[14px] font-medium text-[#5A5A5A] bg-[#F7F6EE] rounded hover:bg-[#E5E5E5] transition-colors disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            className="px-5 py-2.5 text-[14px] font-medium text-white bg-[#195E8E] rounded hover:bg-[#144D75] transition-colors"
          >
            Continue →
          </button>
        </div>
      )}
      {step === 'review' && currentStepIdx > 0 && (
        <div className="mt-4">
          <button
            onClick={goBack}
            className="px-5 py-2.5 text-[14px] font-medium text-[#5A5A5A] bg-[#F7F6EE] rounded hover:bg-[#E5E5E5] transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
