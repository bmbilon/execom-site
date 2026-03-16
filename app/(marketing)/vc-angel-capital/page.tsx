import type { Metadata } from "next"
import Link from "next/link"
import { VCAngelContent } from "./vc-angel-content"

export const metadata: Metadata = {
  title: "VC / Angel Capital — execom",
  description:
    "Before you raise venture capital or take angel financing, understand the math, the terms, and the structural realities. execom helps founders evaluate capital strategy before decisions become irreversible.",
}

export default function VCAngelCapital() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              VC / Angel Capital
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Not every founder should raise venture capital.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px] mb-4">
              execom helps founders evaluate venture capital and angel financing before
              dilution, control loss, and bad capital decisions become irreversible.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[540px]">
              Most founders do not need more opinions. They need clearer frameworks,
              better timing, and a realistic understanding of what venture capital
              actually requires.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Assess Your Capital Strategy
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With Execom
              </Link>
            </div>

            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* CLIENT-SIDE CONTENT WITH TOC */}
      <VCAngelContent />
    </>
  )
}
