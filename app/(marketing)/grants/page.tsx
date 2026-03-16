import type { Metadata } from "next"
import Link from "next/link"
import { GrantsContent } from "./grants-content"

export const metadata: Metadata = {
  title: "Grants — execom",
  description:
    "Most founders should not build their funding strategy around grants. execom helps founders separate useful non-dilutive funding from slow, distracting grant-chasing — and prioritize SR&ED first.",
}

export default function Grants() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Grants
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Most founders should not build their funding strategy around grants.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px] mb-4">
              execom helps founders separate useful non-dilutive funding from slow, distracting
              grant-chasing.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[540px]">
              Grants can be valuable. They can also consume time, add compliance drag, and create
              false hope. In most cases, founders should focus first on SR&amp;ED and other
              lower-friction capital that supports work they already need to do.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Assess Non-Dilutive Strategy
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
      <GrantsContent />
    </>
  )
}
