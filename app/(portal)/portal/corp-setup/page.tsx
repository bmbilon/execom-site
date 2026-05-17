'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Legacy route, redirects to the canonical /portal/matters page.
 * Kept so old bookmarks and links don't break.
 */
export default function LegacyCorpSetupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/portal/matters')
  }, [router])

  return (
    <div className="py-12 text-center">
      <p className="text-[13px] text-[#b8b8b0]">Redirecting…</p>
    </div>
  )
}
