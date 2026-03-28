'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import Link from 'next/link'
import IncorporationWizard from '@/components/portal/corp-setup/IncorporationWizard'

/**
 * Legacy route — resolves the intake's matter_id and redirects to
 * the canonical matter-first route. Falls back to rendering the wizard
 * inline if matter_id lookup fails (graceful degradation).
 */
export default function LegacyEditIncorporationPage() {
  const params = useParams()
  const router = useRouter()
  const intakeId = params.intakeId as string
  const [resolving, setResolving] = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('incorporation_intakes')
        .select('matter_id')
        .eq('id', intakeId)
        .single()

      if (data?.matter_id) {
        router.replace(`/portal/matters/${data.matter_id}/tasks/incorporation/${intakeId}`)
      } else {
        // Graceful fallback — render wizard inline
        setResolving(false)
      }
    })()
  }, [intakeId, router])

  if (resolving) {
    return (
      <div className="py-12 text-center">
        <p className="text-[13px] text-[#b8b8b0]">Redirecting…</p>
      </div>
    )
  }

  // Fallback: render the wizard directly (should rarely happen)
  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-6">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">
          Matters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Edit Incorporation</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
          Alberta Incorporation
        </h1>
        <p className="text-[14px] text-[#5A5A5A] mt-1">
          Continue editing. Your progress is saved automatically.
        </p>
      </div>

      <IncorporationWizard intakeId={intakeId} />
    </div>
  )
}
