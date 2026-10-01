import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/neon/server-compat'
import { cookies } from 'next/headers'
import { runAllRules } from '@/lib/services/reviewService'

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
    const result = await runAllRules(supabase, yearId)

    return NextResponse.json({
      ok: true,
      data: {
        issuesCreated: result.issues.length,
        issues: result.issues.map((i) => ({
          ruleKey: i.rule_key ?? 'unknown',
          severity: i.severity,
          message: i.message,
        })),
        summary: {
          blockers: result.blockerCount,
          warnings: result.warningCount,
          info: result.infoCount,
        },
      },
    })
  } catch (e) {
    console.error('Run rules error:', e)
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
