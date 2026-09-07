// POST /api/sred/lead
//
// Anonymous. Called only after the applicant has seen their preliminary result
// and asked for a review. Recalculates the result from the answers a second
// time — the client's copy is never trusted — records consent, and files the
// lead through the SECURITY DEFINER intake function.
//
// Persistence failures do not fail the request. The applicant has done their
// part; losing their result because a database was unreachable would be the
// wrong trade. The response says whether the lead was filed so the UI can tell
// them honestly what happened.

import { NextResponse } from 'next/server'
import { assess } from '@/lib/sred/engine'
import { getPurchasePolicy } from '@/lib/sred/config'
import { leadRequestSchema } from '@/lib/sred/schema'
import { clientKey, guardPublicPost } from '@/lib/sred/guard'
import { persistLead } from '@/lib/sred/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await guardPublicPost(request, 'lead')
  if (body.failure) return body.failure.response

  const parsed = leadRequestSchema.safeParse(body.data)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the highlighted answers.',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const payload = parsed.data

  // The honeypot is a silent success: a bot that gets a 400 learns to fix it.
  if (payload.company_website) {
    return NextResponse.json({ received: true, persisted: false }, { status: 202 })
  }

  const { publicResult, internal } = assess(payload.answers, getPurchasePolicy())

  const outcome = await persistLead({
    requestId: payload.request_id,
    answers: payload.answers,
    publicResult,
    internal,
    contact: payload.contact,
    requested: payload.requested,
    serviceConsent: true,
    marketingConsent: payload.marketing_consent,
    attribution: payload.attribution ?? {},
    clientKey: clientKey(request),
    priority: internal.priority,
    lane: publicResult.lane,
  })

  if (!outcome.persisted && outcome.reason === 'rate_limited') {
    return NextResponse.json(
      { error: 'Too many requests. Give it a moment and try again.' },
      { status: 429 }
    )
  }
  if (!outcome.persisted && outcome.reason === 'conflict') {
    return NextResponse.json(
      { error: 'That request id was already used with different answers.' },
      { status: 409 }
    )
  }
  if (!outcome.persisted && outcome.reason === 'error') {
    // Log for staff, tell the applicant the truth without the stack trace.
    console.error('[sred] lead persistence failed:', outcome.detail)
  }

  return NextResponse.json(
    {
      received: true,
      persisted: outcome.persisted,
      lead_id: outcome.persisted ? outcome.leadId : undefined,
      result: publicResult,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
