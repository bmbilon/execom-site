'use server'

import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { revalidatePath } from 'next/cache'
import {
  scoreAssessment,
  SECTIONS,
  PATH_LABELS,
  TIER_LABELS,
  LEAD_TYPE_LABELS,
  type AnswerMap,
  type ScoreResult,
} from '@/lib/portal/prototype-readiness'

const NOTIFY_TO = 'action@execom.ca'
const NOTIFY_FROM = 'execom Portal <notifications@execom.ca>'
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://execom.ca'

// ─── Email notification (fire-and-forget) ──────────────────────────────────

async function sendSubmissionEmail(params: {
  assessmentId: string
  scored: ScoreResult
  founderName: string | null
  founderEmail: string | null
  companyName: string | null
  productName: string | null
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.warn(
      '[prototype-readiness] RESEND_API_KEY unset, skipping email notification.'
    )
    return
  }

  const { assessmentId, scored, founderName, founderEmail, companyName, productName } = params

  const adminUrl = `${SITE_ORIGIN}/portal/admin/prototype-readiness/${assessmentId}`
  const subject = `New Prototype Readiness submission: ${productName || 'Untitled product'}${
    founderName ? ` (${founderName})` : ''
  }`

  const lines = [
    `New Prototype Readiness submission`,
    `═══════════════════════════════════`,
    ``,
    `Founder: ${founderName || '(not provided)'}`,
    `Email:   ${founderEmail || '(not provided)'}`,
    `Company: ${companyName || '(none)'}`,
    `Product: ${productName || '(untitled)'}`,
    ``,
    `─── Internal scoring ───`,
    `Score:            ${scored.score} / 100`,
    `Tier:             ${TIER_LABELS[scored.tier]}`,
    `Lead type:        ${LEAD_TYPE_LABELS[scored.leadType]}`,
    `Recommended path: ${PATH_LABELS[scored.recommendedPath]}`,
    ``,
    `Open in admin queue:`,
    adminUrl,
  ]
  const textBody = lines.join('\n')

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const htmlBody = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0d1b2a;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;font-size:16px;font-weight:600;margin:0">
          New Prototype Readiness submission
        </h1>
      </div>
      <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500;width:30%">Founder</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(founderName || '-')}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Email</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(founderEmail || '-')}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Company</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(companyName || '-')}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Product</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(productName || '(untitled)')}</td></tr>
        </table>
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#195E8E;margin:0 0 10px">
          Internal scoring
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500;width:30%">Score</td><td style="padding:6px 12px;border:1px solid #e5e5e5;font-family:Georgia,serif;font-size:16px">${scored.score} / 100</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Tier</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(TIER_LABELS[scored.tier])}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Lead type</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(LEAD_TYPE_LABELS[scored.leadType])}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:500">Recommended path</td><td style="padding:6px 12px;border:1px solid #e5e5e5">${escape(PATH_LABELS[scored.recommendedPath])}</td></tr>
        </table>
        <a href="${escape(adminUrl)}" style="display:inline-block;padding:10px 18px;background:#195E8E;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:600">
          Open in admin queue
        </a>
      </div>
    </div>
  `.trim()

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_TO,
        // Intentionally NOT setting reply_to to the founder's email.
        // A reply from execom staff must go to the execom team, never
        // echo a "Reply-To: <founder>" header that could leak back to
        // the founder if someone hits Reply All from action@execom.ca.
        subject,
        text: textBody,
        html: htmlBody,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '<unreadable>')
      console.error('[prototype-readiness] Resend send failed:', res.status, errText)
    }
  } catch (err) {
    console.error('[prototype-readiness] Resend send threw:', err)
  }
}

// ─── Client notification: submission moved into review ─────────────────────

// Sent to the founder when staff flip an assessment into `reviewing`.
// Deliberately carries no internal data: no score, tier, lead type, or
// internal notes. Those are staff-only and must never reach the founder.
async function sendClientReviewingEmail(params: {
  founderName: string | null
  founderEmail: string | null
  productName: string | null
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.warn(
      '[prototype-readiness] RESEND_API_KEY unset, skipping client review notification.'
    )
    return
  }

  const { founderName, founderEmail, productName } = params
  if (!founderEmail) {
    console.warn(
      '[prototype-readiness] No founder_email on assessment, skipping client review notification.'
    )
    return
  }

  const product = productName || 'your submission'
  const portalUrl = `${SITE_ORIGIN}/portal/prototype-readiness`
  const subject = `execom is reviewing ${product}`
  const greeting = founderName ? `Hi ${founderName.split(' ')[0]},` : 'Hi,'

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const textBody = [
    greeting,
    '',
    `Your Prototype Readiness submission for ${product} is now under review by the execom team.`,
    '',
    'We will follow up with next steps once the review is done. Nothing is needed from you in the meantime.',
    '',
    'You can check the status any time here:',
    portalUrl,
    '',
    'execom',
  ].join('\n')

  const htmlBody = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto;color:#1a1a1a">
      <div style="background:#0d1b2a;padding:20px 24px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;font-size:16px;font-weight:600;margin:0">
          Your submission is under review
        </h1>
      </div>
      <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;font-size:14px;line-height:1.6">
        <p style="margin:0 0 16px">${escape(greeting)}</p>
        <p style="margin:0 0 16px">
          Your Prototype Readiness submission for
          <strong>${escape(product)}</strong> is now under review by the execom team.
        </p>
        <p style="margin:0 0 24px">
          We will follow up with next steps once the review is done. Nothing is
          needed from you in the meantime.
        </p>
        <a href="${escape(portalUrl)}" style="display:inline-block;padding:10px 18px;background:#195E8E;color:#fff;text-decoration:none;border-radius:4px;font-size:13px;font-weight:600">
          View status in your portal
        </a>
      </div>
    </div>
  `.trim()

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: founderEmail,
        // Replies from the founder land with the execom team, not in an
        // unmonitored notifications@ inbox.
        reply_to: NOTIFY_TO,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '<unreadable>')
      console.error(
        '[prototype-readiness] Client review email failed:',
        res.status,
        errText
      )
    }
  } catch (err) {
    console.error('[prototype-readiness] Client review email threw:', err)
  }
}

// ─── Save progress (without submitting) ────────────────────────────────────

export async function saveAssessmentProgress(params: {
  assessmentId: string
  answers: AnswerMap
  currentStep: number
}) {
  const { assessmentId, answers, currentStep } = params
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { ok: false as const, error: 'Not signed in.' }
  }

  // Surface a few common fields onto the row for the admin queue.
  const founder_name =
    typeof answers['founder_name'] === 'string' ? (answers['founder_name'] as string) : null
  const founder_email =
    typeof answers['founder_email'] === 'string' ? (answers['founder_email'] as string) : null
  const company_name =
    typeof answers['company_name'] === 'string' ? (answers['company_name'] as string) : null
  const product_name =
    typeof answers['product_name'] === 'string' ? (answers['product_name'] as string) : null

  const { error } = await supabase
    .from('prototype_assessments')
    .update({
      answers,
      current_step: currentStep,
      founder_name,
      founder_email,
      company_name,
      product_name,
    })
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .eq('status', 'in_progress')

  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/portal/prototype-readiness')
  return { ok: true as const }
}

// ─── Submit final ──────────────────────────────────────────────────────────

export async function submitAssessment(params: {
  assessmentId: string
  answers: AnswerMap
}) {
  const { assessmentId, answers } = params
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { ok: false as const, error: 'Not signed in.' }
  }

  // Minimum validation: every question marked required must have a value.
  const missing: string[] = []
  for (const section of SECTIONS) {
    for (const q of section.questions) {
      if (!q.required) continue
      const v = answers[q.id]
      const empty =
        v === undefined ||
        v === null ||
        v === '' ||
        (Array.isArray(v) && v.length === 0)
      if (empty) missing.push(q.label)
    }
  }
  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `Please answer the required questions before submitting: ${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '…' : ''}`,
    }
  }

  const scored = scoreAssessment(answers)

  const founder_name =
    typeof answers['founder_name'] === 'string' ? (answers['founder_name'] as string) : null
  const founder_email =
    typeof answers['founder_email'] === 'string' ? (answers['founder_email'] as string) : null
  const company_name =
    typeof answers['company_name'] === 'string' ? (answers['company_name'] as string) : null
  const product_name =
    typeof answers['product_name'] === 'string' ? (answers['product_name'] as string) : null

  // Attempt the canonical update first. If the database hasn't had
  // migration 015 applied yet, `internal_lead_type` won't exist as a
  // column; in that case retry once without it so the submission still
  // lands and a staff rescore can backfill the lead type later.
  const fullUpdate = {
    answers,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    internal_score: scored.score,
    internal_tier: scored.tier,
    recommended_path: scored.recommendedPath,
    internal_lead_type: scored.leadType,
    scored_at: new Date().toISOString(),
    founder_name,
    founder_email,
    company_name,
    product_name,
  }

  let { error } = await supabase
    .from('prototype_assessments')
    .update(fullUpdate)
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .eq('status', 'in_progress')

  if (error && /internal_lead_type/i.test(error.message)) {
    const { internal_lead_type: _omit, ...withoutLeadType } = fullUpdate
    void _omit
    const retry = await supabase
      .from('prototype_assessments')
      .update(withoutLeadType)
      .eq('id', assessmentId)
      .eq('user_id', session.user.id)
      .eq('status', 'in_progress')
    error = retry.error
  }

  if (error) {
    return { ok: false as const, error: error.message }
  }

  // Fire-and-forget email notification to action@execom.ca. We await so
  // that errors get logged synchronously, but any failure is swallowed
  // inside sendSubmissionEmail — the founder still sees a successful
  // submission even if the SMTP / Resend side has an issue.
  await sendSubmissionEmail({
    assessmentId,
    scored,
    founderName: founder_name,
    founderEmail: founder_email,
    companyName: company_name,
    productName: product_name,
  })

  revalidatePath('/portal/prototype-readiness')
  return { ok: true as const }
}

// ─── Staff: rescore + update review status / notes ─────────────────────────

export async function staffUpdateAssessment(params: {
  assessmentId: string
  status?:
    | 'submitted'
    | 'reviewing'
    | 'contacted'
    | 'closed_won'
    | 'closed_lost'
    | 'archived'
  internalNotes?: string
  rescore?: boolean
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false as const, error: 'Not signed in.' }

  // Confirm staff role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_execom_staff')
    .eq('id', session.user.id)
    .single()
  if (!profile?.is_execom_staff) {
    return { ok: false as const, error: 'Not authorized.' }
  }

  // Read the current row before writing so we can tell a real status
  // transition from a re-save. The client only gets notified on an actual
  // move into `reviewing`, never when staff just edit internal notes.
  const { data: existing } = await supabase
    .from('prototype_assessments')
    .select('status, founder_name, founder_email, product_name')
    .eq('id', params.assessmentId)
    .single()

  const update: Record<string, unknown> = {}
  if (params.status) update.status = params.status
  if (params.internalNotes !== undefined) update.internal_notes = params.internalNotes

  if (params.rescore) {
    const { data: row } = await supabase
      .from('prototype_assessments')
      .select('answers')
      .eq('id', params.assessmentId)
      .single()
    if (row?.answers) {
      const s = scoreAssessment(row.answers as AnswerMap)
      update.internal_score = s.score
      update.internal_tier = s.tier
      update.recommended_path = s.recommendedPath
      update.internal_lead_type = s.leadType
      update.scored_at = new Date().toISOString()
      update.scored_by = session.user.id
    }
  }

  const { error } = await supabase
    .from('prototype_assessments')
    .update(update)
    .eq('id', params.assessmentId)

  if (error) return { ok: false as const, error: error.message }

  // Notify the founder only on the transition into `reviewing`. Failures
  // are swallowed inside the helper: a dead Resend key must not make a
  // successful status change look like it failed.
  const movedIntoReview =
    params.status === 'reviewing' && existing?.status !== 'reviewing'
  if (movedIntoReview) {
    await sendClientReviewingEmail({
      founderName: existing?.founder_name ?? null,
      founderEmail: existing?.founder_email ?? null,
      productName: existing?.product_name ?? null,
    })
  }

  revalidatePath('/portal/admin/prototype-readiness')
  revalidatePath(`/portal/admin/prototype-readiness/${params.assessmentId}`)
  return { ok: true as const, notifiedClient: movedIntoReview }
}
