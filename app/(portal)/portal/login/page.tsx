'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/portal/dashboard')
    router.refresh()
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
          <h1 className="text-[1.5rem] font-serif text-[#1A1A1A]">Sign in to your portal</h1>
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
              className="w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[13px]">
          <Link href="/portal/forgot-password" className="text-blue hover:text-blue-dark transition-colors">
            Forgot password
          </Link>
          <Link href="/portal/signup" className="text-blue hover:text-blue-dark transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
