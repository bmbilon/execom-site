import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import {
  scoreAssessment,
  type AnswerMap,
} from '@/lib/portal/prototype-readiness'

export const dynamic = 'force-dynamic'

// GET /api/portal/prototype-readiness/<id>/pdf?scope=client|internal
//
// Streams the submission as a PDF. Staff only, both scopes: the client
// copy is generated here for staff to forward, not fetched by founders.
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_execom_staff')
      .eq('id', session.user.id)
      .single()
    if (!profile?.is_execom_staff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: row } = await supabase
      .from('prototype_assessments')
      .select('*')
      .eq('id', params.id)
      .single()
    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Anything other than an explicit ?scope=internal is treated as the
    // client copy. A typo in the query string must never leak scoring.
    const scope = new URL(request.url).searchParams.get('scope')
    const includeInternal = scope === 'internal'

    const answers = (row.answers as AnswerMap) ?? {}

    // Dynamic import keeps @react-pdf/renderer out of the startup path.
    const { generateSubmissionPdf } = await import(
      '@/lib/portal/prototype-readiness-pdf'
    )

    const buffer = await generateSubmissionPdf(
      {
        productName: row.product_name,
        founderName: row.founder_name,
        founderEmail: row.founder_email,
        companyName: row.company_name,
        submittedAt: row.submitted_at,
        status: row.status,
        answers,
        // Recomputed live, matching what the admin screen displays.
        score: includeInternal ? scoreAssessment(answers) : undefined,
        internalNotes: includeInternal ? row.internal_notes : undefined,
      },
      { includeInternal }
    )

    const slug =
      (row.product_name || 'submission')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'submission'
    const fileName = `prototype-readiness-${slug}${
      includeInternal ? '-internal' : ''
    }.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        // Staff-only document derived from live data. Never cache it at
        // the edge or in a shared proxy.
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (e) {
    console.error('[prototype-readiness] PDF export failed:', e)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
