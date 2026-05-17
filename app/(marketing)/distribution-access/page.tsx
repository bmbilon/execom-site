import type { Metadata } from "next"
import Link from "next/link"
import { DistributionAccessContent } from "./distribution-access-content"

export const metadata: Metadata = {
  title: "Distribution Access | execom",
  description:
    "Distribution is where most companies actually fail. execom helps founders get to market through the right channels, with the right sequencing, economics, and commercial logic.",
}

export default function DistributionAccess() {
  return (
    <>
      {/* HERO */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Distribution Access
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Distribution is where most companies actually fail.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px] mb-4">
              execom helps founders get to market through the right channels, with the
              right sequencing, economics, and commercial logic.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[540px]">
              A great product is not enough. Distribution determines whether buyers ever
              see it, whether margins survive, and whether growth compounds or collapses.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/engage"
                className="btn-premium"
              >
                Assess Distribution Strategy
              </Link>
              <Link
                href="/engage"
                className="btn-ghost-premium"
              >
                Talk With Execom
              </Link>
            </div>

            <p className="mt-6 text-[13px] text-white/25 tracking-wide">
              Route-to-market strategy for founders who want access, not assumptions.
            </p>

            <div className="mt-8 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      <DistributionAccessContent />
    </>
  )
}
