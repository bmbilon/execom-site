import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ModuleInfo {
  title: string
  blurb: string
  detail: string
}

const MODULES: Record<string, ModuleInfo> = {
  'concept-validation': {
    title: 'Concept Validation',
    blurb:
      'Test whether real buyers will pay for an idea before you spend on tooling, prototyping, or a brand.',
    detail:
      'execom is building a structured Validation Sprint module: customer interviews, willingness-to-pay tests, competitor teardowns, and a go / no-go memo. While we finish it, you can kick off a Validation Sprint manually.',
  },
  'business-planning': {
    title: 'Business Planning',
    blurb:
      'A defensible business plan, financial model, and go-to-market roadmap built around real assumptions.',
    detail:
      'execom is building a structured business-planning module: market sizing, revenue model, capital plan, and milestone roadmap. While we finish it, you can kick off a planning engagement manually.',
  },
}

const FALLBACK: ModuleInfo = {
  title: 'Coming soon',
  blurb: 'This module is launching shortly.',
  detail:
    'In the meantime, email action@execom.ca to get early access or to start the engagement manually.',
}

export default function ComingSoonPage({
  searchParams,
}: {
  searchParams?: { module?: string }
}) {
  const info = (searchParams?.module && MODULES[searchParams.module]) || FALLBACK
  const subject = encodeURIComponent(`Early access: ${info.title}`)

  return (
    <div className="max-w-[640px] mx-auto py-12">
      <Link
        href="/portal/dashboard"
        className="inline-flex items-center gap-1 text-[13px] text-blue hover:underline mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="inline-flex items-center gap-2 mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
        <Clock className="h-3.5 w-3.5" />
        Coming soon
      </div>

      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-3">
        {info.title}
      </h1>

      <p className="text-[15px] text-[#5A5A5A] leading-relaxed mb-4">
        {info.blurb}
      </p>

      <p className="text-[14px] text-[#5A5A5A] leading-relaxed mb-8">
        {info.detail}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`mailto:action@execom.ca?subject=${subject}`}
          className="inline-flex items-center gap-2 bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark transition-colors"
        >
          Email execom for early access
        </a>
        <Link
          href="/portal/dashboard"
          className="inline-flex items-center gap-2 text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
