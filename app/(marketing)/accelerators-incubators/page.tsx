import type { Metadata } from "next"
import Link from "next/link"
import { AcceleratorsContent } from "./accelerators-content"

export const metadata: Metadata = {
  title: "Accelerators & Incubators | execom",
  description:
    "Most startups should not join an accelerator. execom helps founders understand when accelerators make sense, when they do not, and what founders usually need instead: speed, structure, execution, and capital discipline.",
  keywords:
    "startup accelerator, incubator, founder leverage, startup execution, company formation, accelerator alternatives, founder infrastructure | execom",
}

export default function AcceleratorsIncubators() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Accelerators & Incubators
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Most startups should not join an accelerator.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px] mb-4">
              For most founders, accelerators and incubators add less leverage
              than advertised and consume more time than they should. What
              companies usually need instead is speed, structure, customers, and
              capital discipline.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[540px]">
              The startup ecosystem often treats accelerators as a default
              early-stage step. In practice, most of these programs are a weak
              substitute for real execution. They optimize for cohort identity,
              signaling, and process, while founders still need to solve the
              harder problems of company formation, financing, distribution, and
              operating leverage.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Assess Founder Leverage
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With execom
              </Link>
            </div>

            <p className="mt-8 text-sm text-white/25 italic">
              Execution is usually more valuable than affiliation.
            </p>

            <div className="mt-6 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* CLIENT-SIDE CONTENT WITH TOC */}
      <AcceleratorsContent />
    </>
  )
}
