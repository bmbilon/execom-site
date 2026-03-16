import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TODO: Implement full federal SR&ED calculation logic
// This stub queries relevant data and returns a placeholder response.

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

    const { data: splits } = await supabase
      .from('cost_line_project_splits')
      .select('*')
      .eq('claim_year_id', yearId)

    const { data: classifications } = await supabase
      .from('cost_line_classifications')
      .select('*')
      .eq('claim_year_id', yearId)

    const lineCount = (splits?.length ?? 0) + (classifications?.length ?? 0)

    return NextResponse.json({
      ok: true,
      data: { message: 'Federal calculation stub', lineCount },
    })
  } catch (e) {
    console.error('Federal calculation error:', e)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
