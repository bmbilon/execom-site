'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function safeNext(raw: string | null): string {
  if (!raw) return '/portal/dashboard'
  if (!raw.startsWith('/portal/')) return '/portal/dashboard'
  if (raw.startsWith('//')) return '/portal/dashboard'
  return raw
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const callbackUrl =
      next === '/portal/dashboard'
        ? `${window.location.origin}/auth/callback`
        : `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const loginHref =
    next === '/portal/dashboard'
      ? '/portal/login'
      : `/portal/login?next=${encodeURIComponent(next)}`

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          <img
            src="/sred/images/logo-nav-white.png"
            alt="execom"
            className="h-8 w-auto brightness-0 mb-6"
          />
          <h1 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-4">Check your email</h1>
          <p className="text-[15px] text-[#5A5A5A]">
            A confirmation link has been sent to {email}. Click it to activate your account.
          </p>
          <Link
            href={loginHref}
            className="inline-block mt-6 text-[13px] text-blue hover:text-blue-dark transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <img
            src="/sred/images/logo-nav-white.png"
            alt="execom"
            className="h-8 w-auto brightness-0 mb-6"
          />
          <h1 className="text-[1.5rem] font-serif text-[#1A1A1A]">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
            />
            <p className="text-[12px] text-[#5A5A5A] mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-[13px]">
          <Link href={loginHref} className="text-blue hover:text-blue-dark transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
