import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require a client company (with BN, etc.) to be set up.
// Hitting any of these without `profiles.company_id` bounces the user
// to /portal/dashboard?setup=1 where the CompanySetup panel auto-opens.
// execom staff bypass this check.
const CLIENT_ONLY_PREFIXES = [
  '/portal/sred',
  '/portal/claims',
  '/portal/matters',
  '/portal/corp-setup',
]

const AUTH_ROUTES = [
  '/portal/login',
  '/portal/signup',
  '/portal/forgot-password',
]

function safeRelative(path: string | null | undefined): string | null {
  if (!path) return null
  if (!path.startsWith('/portal/')) return null
  if (path.startsWith('//')) return null
  return path
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const search = request.nextUrl.search
  const isPortalRoute = pathname.startsWith('/portal')
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  // ─── 1. Unauthenticated -> /portal/login, preserving where they wanted to go
  if (isPortalRoute && !isAuthRoute && !session) {
    const redirectUrl = new URL('/portal/login', request.url)
    const intended = `${pathname}${search}`
    const next = safeRelative(intended)
    if (next && next !== '/portal/dashboard') {
      redirectUrl.searchParams.set('next', next)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // ─── 2. Already signed in but on an auth page -> honor ?next= or dashboard
  if (isAuthRoute && session) {
    const explicitNext = safeRelative(request.nextUrl.searchParams.get('next'))
    const target = explicitNext || '/portal/dashboard'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // ─── 3. Client-only route without a company attached -> company setup
  if (isPortalRoute && !isAuthRoute && session) {
    const isClientOnly = CLIENT_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
    if (isClientOnly) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, is_execom_staff')
        .eq('id', session.user.id)
        .single()

      // Staff can navigate freely (e.g. to inspect a client's claims).
      const isStaff = !!profile?.is_execom_staff
      const hasCompany = !!profile?.company_id

      if (!isStaff && !hasCompany) {
        // Pass a reason key so /portal/company-setup can show a friendly
        // banner explaining where the user was going. Map each gated
        // prefix to a short label that survives the redirect.
        let reason = '1'
        if (pathname.startsWith('/portal/sred')) reason = 'sred'
        else if (pathname.startsWith('/portal/matters/new?type=trademark')) reason = 'trademarks'
        else if (pathname.startsWith('/portal/matters')) reason = 'matters'
        else if (pathname.startsWith('/portal/claims')) reason = 'sred'
        else if (pathname.startsWith('/portal/corp-setup')) reason = 'corp_setup'

        const redirectUrl = new URL('/portal/company-setup', request.url)
        redirectUrl.searchParams.set('required', reason)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/portal/:path*'],
}
