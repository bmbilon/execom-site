'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/login`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

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
            If an account exists for {email}, a password reset link has been sent.
          </p>
          <Link
            href="/portal/login"
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
          <h1 className="text-[1.5rem] font-serif text-[#1A1A1A]">Reset your password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-[13px]">
          <Link href="/portal/login" className="text-blue hover:text-blue-dark transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
