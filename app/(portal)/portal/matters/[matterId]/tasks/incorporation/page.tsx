'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import IncorporationWizard from '@/components/portal/corp-setup/IncorporationWizard'

export default function MatterNewIncorporationPage() {
  const params = useParams()
  const matterId = params.matterId as string

  return (
    <div>
      <nav className="text-[12px] text-[#b8b8b0] mb-6">
        <Link href="/portal/matters" className="hover:text-[#195E8E] transition-colors">
          Matters
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/portal/matters/${matterId}`} className="hover:text-[#195E8E] transition-colors">
          Matter
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/portal/matters/${matterId}/tasks`} className="hover:text-[#195E8E] transition-colors">
          Tasks
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Incorporation</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
          Alberta Incorporation
        </h1>
        <p className="text-[14px] text-[#5A5A5A] mt-1">
          Complete the three steps below. Your progress is saved automatically.
        </p>
      </div>

      <IncorporationWizard matterId={matterId} />
    </div>
  )
}
