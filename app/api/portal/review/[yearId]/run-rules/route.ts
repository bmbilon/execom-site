import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TODO: Implement full review rules engine that evaluates each enabled rule
// against claim data and returns actionable issues.

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
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const yearId = params.yearId

    const { data: rules } = await supabase
      .from('review_rules')
      .select('*')
      .eq('enabled', true)

    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('claim_year_id', yearId)

    const { count: contactCount } = await supabase
      .from('claim_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('claim_year_id', yearId)

    return NextResponse.json({
      ok: true,
      data: {
        rulesChecked: rules?.length ?? 0,
        issues: [],
        meta: { projectCount: projectCount ?? 0, contactCount: contactCount ?? 0 },
      },
    })
  } catch (e) {
    console.error('Run rules error:', e)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
