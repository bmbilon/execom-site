// POST /api/sred/leads/[id]/transition
//
// Staff-only. Moves a lead through the reviewer state machine with an audited
// note and an optimistic version check, so two reviewers working the same
// queue cannot silently overwrite each other.
//
// Authorization is checked twice on purpose: `auth.getUser()` here revalidates
// the token with the auth server rather than trusting a cookie's claims, and
// the SECURITY DEFINER function checks `profiles.is_execom_staff` again before
// it writes. An applicant can never set a staff flag and can never reach this
// route with a client-side edit.

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { staffTransitionSchema } from '@/lib/sred/schema'
import { readJsonBody, checkOrigin } from '@/lib/sred/guard'
import { transitionLead } from '@/lib/sred/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const origin = checkOrigin(request)
  if (origin) return origin.response

  const supabase = createServerSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_execom_staff')
    .eq('id', user.id)
    .single()

  if (!profile?.is_execom_staff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await readJsonBody(request)
  if (body.failure) return body.failure.response

  const parsed = staffTransitionSchema.safeParse({
    ...(body.data as Record<string, unknown>),
    lead_id: params.id,
  })
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid transition',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const result = await transitionLead({
    leadId: parsed.data.lead_id,
    expectedVersion: parsed.data.expected_version,
    toStatus: parsed.data.to_status,
    actorId: user.id,
    note: parsed.data.note,
  })

  if (!result.ok) {
    const status = result.reason.includes('STALE_RECORD')
      ? 409
      : result.reason.includes('STAFF_REQUIRED')
        ? 403
        : result.reason.includes('INVALID_TRANSITION') || result.reason.includes('LANE_MISMATCH')
          ? 422
          : 400
    return NextResponse.json({ error: result.reason }, { status })
  }

  return NextResponse.json({ ok: true, version: result.version })
}
