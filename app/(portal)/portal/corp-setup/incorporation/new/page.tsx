'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/portal/supabase-client'

/**
 * Legacy route, creates a new matter and redirects to the
 * canonical matter-first incorporation task route.
 * Keeps old bookmarks and "New Incorporation" links functional.
 */
export default function LegacyNewIncorporationPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/portal/login')
        return
      }

      // Create a new matter
      const { data: matter, error: mErr } = await supabase
        .from('commercialization_matters')
        .insert({
          user_id: session.user.id,
          matter_type: 'incorporation',
          display_name: 'New Incorporation',
          status: 'draft',
        })
        .select('id')
        .single()

      if (mErr || !matter) {
        setError('Failed to create matter. Please try again.')
        return
      }

      router.replace(`/portal/matters/${matter.id}/tasks/incorporation`)
    })()
  }, [router])

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-[14px] text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="py-12 text-center">
      <p className="text-[13px] text-[#b8b8b0]">Setting up your matter…</p>
    </div>
  )
}
