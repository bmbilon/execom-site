import type { Metadata } from "next"
import Link from "next/link"
import { NonDilutiveContent } from "./non-dilutive-content"

export const metadata: Metadata = {
  title: "Non-Dilutive Capital — execom",
  description:
    "Non-dilutive capital is not a niche alternative. For many founders it is the smarter first layer of the capital stack. execom helps founders build capital strategies that preserve ownership, control, and leverage.",
}

export default function NonDilutiveCapital() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Non-Dilutive Capital
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Grow without giving up unnecessary equity.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px] mb-4">
              execom helps founders build smarter capital stacks using SR&ED,
              revenue-based financing, venture debt, partnerships, customer
              financing, and other non-dilutive tools — before defaulting to equity.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[540px]">
              The cost of capital is not just interest. It is ownership, control,
              timing, and leverage. The best founders do not ask only how to raise
              money. They ask which capital belongs at which stage.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Assess Capital Stack
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With Execom
              </Link>
            </div>

            <p className="mt-6 text-[13px] text-white/25 tracking-wide">
              Non-dilutive capital for founders who want more runway and less dilution.
            </p>

            <div className="mt-8 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* CLIENT-SIDE CONTENT WITH TOC */}
      <NonDilutiveContent />
    </>
  )
}
