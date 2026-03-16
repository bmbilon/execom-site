import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get the user's session via the anon client
    const cookieStore = cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    )

    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Use the service role key to bypass RLS for onboarding
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: body.company_name,
        legal_name: body.legal_name || null,
        bn: body.bn || null,
        fiscal_ye_month: body.fiscal_ye_month || 12,
        industry: body.industry || null,
        address: body.street
          ? { street: body.street, city: body.city, province: body.province, postal: body.postal }
          : null,
      })
      .select()
      .single()

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 400 })
    }

    // Link profile to company
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ company_id: company.id })
      .eq('id', session.user.id)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, company_id: company.id })
  } catch (e) {
    console.error('Setup company error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
