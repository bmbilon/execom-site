import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TODO: Expand to parse and validate rows, insert individual cost records,
// and handle duplicate detection.

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
    const body = await request.json()
    const { sourceType, sourceName, rows } = body as {
      sourceType: string
      sourceName: string
      rows: unknown[]
    }

    if (!sourceType || !sourceName || !Array.isArray(rows)) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: sourceType, sourceName, rows' },
        { status: 400 }
      )
    }

    const { data: importRecord, error } = await supabase
      .from('cost_imports')
      .insert({
        claim_year_id: yearId,
        source_type: sourceType,
        source_name: sourceName,
        row_count: rows.length,
        status: 'pending',
        uploaded_by: session.user.id,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      data: { importId: importRecord.id },
    })
  } catch (e) {
    console.error('Import error:', e)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
