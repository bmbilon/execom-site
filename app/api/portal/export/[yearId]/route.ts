import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { buildClaimJson } from '@/lib/portal/claim-builder'
import { generateXlsx } from '@/lib/portal/xlsx-export'

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

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()
    const yearId = params.yearId

    // Build claim JSON from live data
    const claimJson = await buildClaimJson(yearId)

    // Store claim_json in claim_years
    await supabase
      .from('claim_years')
      .update({ claim_json: claimJson, updated_at: new Date().toISOString() })
      .eq('id', yearId)

    if (type === 'json') {
      // Store JSON output record
      const { data: existing } = await supabase
        .from('claim_outputs')
        .select('version')
        .eq('claim_year_id', yearId)
        .eq('output_type', 'json')
        .order('version', { ascending: false })
        .limit(1)

      const nextVersion = (existing?.[0]?.version || 0) + 1

      await supabase.from('claim_outputs').insert({
        claim_year_id: yearId,
        output_type: 'json',
        version: nextVersion,
        payload: claimJson,
        generated_by: session.user.id,
      })

      return NextResponse.json({ ok: true })
    }

    if (type === 'xlsx') {
      const buffer = await generateXlsx(claimJson)

      // Upload to storage
      const storageKey = `exports/${yearId}/claim-${claimJson.company.fiscal_year}.xlsx`
      await supabase.storage.from('sred-files').upload(storageKey, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
      })

      // Get version
      const { data: existing } = await supabase
        .from('claim_outputs')
        .select('version')
        .eq('claim_year_id', yearId)
        .eq('output_type', 'xlsx')
        .order('version', { ascending: false })
        .limit(1)

      const nextVersion = (existing?.[0]?.version || 0) + 1

      await supabase.from('claim_outputs').insert({
        claim_year_id: yearId,
        output_type: 'xlsx',
        version: nextVersion,
        storage_key: storageKey,
        generated_by: session.user.id,
      })

      // Get download URL
      const { data: urlData } = await supabase.storage
        .from('sred-files')
        .createSignedUrl(storageKey, 300)

      return NextResponse.json({
        ok: true,
        downloadUrl: urlData?.signedUrl,
        fileName: `claim-${claimJson.company.fiscal_year}-v${nextVersion}.xlsx`,
      })
    }

    if (type === 'pdf') {
      // Dynamic import to avoid loading @react-pdf/renderer at startup
      const { generatePdf } = await import('@/lib/portal/pdf-export')
      const buffer = await generatePdf(claimJson)

      const storageKey = `exports/${yearId}/claim-${claimJson.company.fiscal_year}.pdf`
      await supabase.storage.from('sred-files').upload(storageKey, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

      const { data: existing } = await supabase
        .from('claim_outputs')
        .select('version')
        .eq('claim_year_id', yearId)
        .eq('output_type', 'pdf')
        .order('version', { ascending: false })
        .limit(1)

      const nextVersion = (existing?.[0]?.version || 0) + 1

      await supabase.from('claim_outputs').insert({
        claim_year_id: yearId,
        output_type: 'pdf',
        version: nextVersion,
        storage_key: storageKey,
        generated_by: session.user.id,
      })

      const { data: urlData } = await supabase.storage
        .from('sred-files')
        .createSignedUrl(storageKey, 300)

      return NextResponse.json({
        ok: true,
        downloadUrl: urlData?.signedUrl,
        fileName: `claim-${claimJson.company.fiscal_year}-v${nextVersion}.pdf`,
      })
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
  } catch (e) {
    console.error('Export error:', e)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
