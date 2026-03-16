import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  runClaimRecalculation,
  RecalcLockError,
} from '@/lib/services/recalcService'

export async function POST(
  request: Request,
  { params }: { params: { yearId: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Called from route handler
            }
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const yearId = params.yearId

    // Parse optional body params
    let force = false
    let triggerSource = 'manual'
    try {
      const body = await request.json()
      force = body?.force === true
      triggerSource = body?.triggerSource ?? 'manual'
    } catch {
      // No body or invalid JSON — use defaults
    }

    const result = await runClaimRecalculation(supabase, yearId, {
      triggerSource,
      initiatedBy: session.user.id,
      force,
    })

    return NextResponse.json({ ok: true, data: result })
  } catch (e) {
    if (e instanceof RecalcLockError) {
      return NextResponse.json(
        {
          ok: false,
          error: e.message,
          code: 'RECALC_LOCK_CONFLICT',
        },
        { status: 409 }
      )
    }

    console.error('Recalculation error:', e)
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : 'Internal error',
      },
      { status: 500 }
    )
  }
}
