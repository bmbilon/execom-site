import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "SR&ED — execom",
}

export default function SRED() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[680px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              SR&ED
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              SR&ED claims should not require consultants.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[540px]">
              For decades the only practical way to access Canada's SR&ED program has been
              through specialized consulting firms that charge a large percentage of the
              credit they help recover. execom removes that layer.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/portal/login"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Access the SR&ED Portal
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With Execom
              </Link>
            </div>

            <p className="mt-6 text-[13px] text-white/25 tracking-wide">
              5% fee. No consultants. Prepare and file your claim directly.
            </p>

            <div className="mt-8 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 space-y-6 text-body text-fg/80">

          <p>
            For decades the only practical way to access Canada's SR&ED program has been
            through specialized consulting firms that charge a large percentage of the
            credit they help recover.
          </p>

          <p>
            That structure persisted because preparing a compliant claim required translating
            technical work into the specific format the CRA expects to see: a clear description
            of technological uncertainty, evidence of systematic investigation, and properly
            classified project expenditures.
          </p>

          <p>
            Most engineering teams do not write in that format, which left consultants acting
            as translators between product development and tax policy.
          </p>

          <p className="text-fg font-semibold text-lg">
            execom removes that layer.
          </p>

        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 text-white/80 space-y-6">

          <p className="section-label-light">A simpler way to prepare SR&ED claims</p>

          <p>
            The execom platform allows founders and technical teams to construct their claims
            directly by guiding them through the information required to produce a properly
            structured filing.
          </p>

          <p>
            Projects are described in the format CRA reviewers expect, expenditures are
            organized as the claim is assembled, and supporting documentation is captured
            in a way that reduces the likelihood of review.
          </p>

          <p>
            The process that traditionally required weeks of back-and-forth with a consulting
            firm can instead be completed in a few hours by the people who actually performed
            the work.
          </p>

        </div>
      </section>

      {/* PRICING */}
      <section className="bg-bg py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 space-y-6 text-body text-fg/80">

          <p className="section-label">Why companies choose execom</p>

          <p>
            Most SR&ED consultants charge between fifteen and thirty percent of the credit
            they help recover.
          </p>

          <p className="text-fg font-semibold text-lg">
            execom charges 5%.
          </p>

          <p>
            The difference is not a temporary promotion or a different fee structure; it
            reflects the fact that the system was designed to remove the manual consulting
            layer that historically made SR&ED preparation slow and expensive.
          </p>

          <p>
            Companies still receive the same credit from the CRA, but keep far more of it.
          </p>

        </div>
      </section>

      {/* POSITIONING */}
      <section className="bg-[#0d1b2a] py-20 md:py-28">
        <div className="max-w-content mx-auto px-8 text-white/80 space-y-6">

          <p className="section-label-light">
            Built for companies capable of doing things themselves
          </p>

          <p>
            Some organizations will always prefer the traditional consulting model,
            particularly large companies that already maintain advisory relationships
            with accounting firms and external specialists.
          </p>

          <p>
            execom is designed for a different group: companies capable of doing things
            themselves, discerning enough to recognize value when they see it, and
            uninterested in wasting time or money on layers of unnecessary intermediaries.
          </p>

          <p>
            These are typically founder-led teams and technical organizations that
            understand their own work better than anyone else and prefer straightforward
            tools over elaborate consulting processes.
          </p>

          <p className="text-white font-semibold text-lg">
            Prepare SR&ED claims quickly, structure them correctly, and keep the
            overwhelming majority of the credit you earn.
          </p>

        </div>
      </section>
    </>
  )
}
