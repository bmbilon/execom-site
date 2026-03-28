'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/portal/supabase-client'

const TYPE_LABELS: Record<string, string> = {
  incorporation: 'New Incorporation',
  ip_transfer: 'New IP Transfer',
  trademark: 'New Trademark Filing',
  licensing: 'New Licensing Package',
}

const TASK_ROUTES: Record<string, string> = {
  incorporation: 'incorporation',
  ip_transfer: 'ip-transfer',
  trademark: 'trademark',
  licensing: 'licensing',
}

const ENABLED_TYPES = ['incorporation', 'ip_transfer']

export default function NewMatterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'incorporation'

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Auto-create for enabled types
    if (ENABLED_TYPES.includes(type)) {
      createMatter()
    }
  }, [type])

  async function createMatter() {
    if (creating) return
    setCreating(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/portal/login'); return }

      const { data: matter, error: err } = await supabase
        .from('commercialization_matters')
        .insert({
          user_id: session.user.id,
          matter_type: type,
          display_name: TYPE_LABELS[type] || 'New Matter',
          status: 'draft',
        })
        .select('id')
        .single()

      if (err) {
        setError(err.message)
        setCreating(false)
        return
      }

      if (matter) {
        const taskRoute = TASK_ROUTES[type] || type
        router.replace(`/portal/matters/${matter.id}/tasks/${taskRoute}`)
      }
    } catch {
      setError('Failed to create matter.')
      setCreating(false)
    }
  }

  // Placeholder for coming-soon types
  if (!ENABLED_TYPES.includes(type)) {
    return (
      <div className="max-w-[520px] mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#195E8E]/5 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#195E8E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold text-[#1A1A1A] mb-2">
          {TYPE_LABELS[type] || 'New Matter'}
        </h1>
        <p className="text-[14px] text-[#5A5A5A] mb-6">
          This module is coming soon. We're building it now.
        </p>
        <button
          onClick={() => router.push('/portal/dashboard')}
          className="text-[14px] text-[#195E8E] hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[520px] mx-auto py-16 text-center">
      {error ? (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg px-6 py-4 text-[13px] text-red-700 mb-6">
            {error}
          </div>
          <button
            onClick={createMatter}
            className="px-5 py-2.5 bg-[#195E8E] text-white text-[14px] font-medium rounded hover:bg-[#144D75] transition-colors"
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <div className="w-8 h-8 border-2 border-[#195E8E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[#5A5A5A]">Creating {TYPE_LABELS[type]?.toLowerCase() || 'matter'}...</p>
        </>
      )}
    </div>
  )
}
