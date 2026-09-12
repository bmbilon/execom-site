import type { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"

const CapitalDesk = dynamic(
  () => import("@/components/capital-desk/CapitalDesk"),
  { ssr: false }
)

export const metadata: Metadata = {
  title: "Capital Desk | execom",
  description:
    "Matching owner-operated businesses that are exiting or raising with the buyers, backers and operator successors who can carry them. Run the screen and get the number you would have to clear.",
}

const MODELS = [
  {
    index: "Model 01",
    title: "Research to Ownership",
    who: "Owner exiting inside 3 years",
    body: "A technical successor is hired into your business, runs a pre-approved research project against your hardest constraint, and holds a written option to buy at a price fixed the day they start. SR&ED and the Alberta IEG carry about a third of the cost of proving it.",
  },
  {
    index: "Model 02",
    title: "Evidence First Growth",
    who: "Owner staying, needs capital",
    body: "Minority capital and project funding released against the same verified milestones: technical demonstration, recurring commercial benefit, and a claim CRA has already determined on. You keep control, the backer gets evidence instead of a forecast.",
  },
  {
    index: "Model 03",
    title: "Pilot Bridge",
    who: "Cash timing, not cash shortage",
    body: "Credits arrive 15 to 20 months after the work starts. A real repayable loan carries the proving period in between, at 12% plus a 2% fee, structured so it never becomes government assistance and never reduces the claim.",
  },
  {
    index: "Model 04",
    title: "Matched Exit",
    who: "Above the residency band",
    body: "Businesses too large for the residency get matched straight to buyers and backers on the bench, with the assessment, the quality of earnings work and the capital stack drawn before anyone signs a letter of intent.",
  },
]

const CASES = [
  {
    label: "Case A",
    text: "You are exiting inside three years and there is no buyer in sight.",
  },
  {
    label: "Case B",
    text: "A technical constraint is capping your capacity, yield, quality or the markets you can sell into.",
  },
  {
    label: "Case C",
    text: "You need capital before there is a signed deal for a lender to look at.",
  },
  {
    label: "Case D",
    text: "Your successor is already in the building and cannot fund the purchase.",
  },
]

const STAGES = [
  {
    n: "01",
    title: "Assessment",
    when: "Month 0",
    body: "Feasibility, the research project defined the way CRA reads it, a pre-claim application filed, baseline EBITDA normalized, and the denial case affordability check. $15,000, and it can end here with a no.",
  },
  {
    n: "02",
    title: "Determination and match",
    when: "Inside 8 weeks",
    body: "CRA pre-claim determination comes back and is valid three years. Only then is a successor matched, and only then do the four documents get signed: program, option, employment, capital stack term sheet.",
  },
  {
    n: "03",
    title: "First gate",
    when: "Month 3",
    body: "Is the systematic investigation actually running, do timesheets support the claimed research time, is the successor holding the technical role. The cheapest place to stop.",
  },
  {
    n: "04",
    title: "Second gate",
    when: "Month 9",
    body: "Technical progress against the protocol, plus early operator readiness: quoting, crews, collections, retention, cash control. A residency that ends here has its bridge amortized over 24 months, not called.",
  },
  {
    n: "05",
    title: "Release and close",
    when: "Month 15 onward",
    body: "Three independent conditions: technical demonstration against the pre-agreed protocol, recurring commercial benefit measured over at least three months net of ongoing cost, and operator readiness assessed apart from the research. Then the stack funds.",
  },
]

const FEES = [
  ["Assessment and pre-claim package", "$15,000", "Seller, at signing"],
  ["Program fee", "$3,000 / mo", "Seller, monthly"],
  ["Deferred program fee", "$1,500 / mo", "Seller, on completion only"],
  ["Success fee", "5% of price", "Seller, at close"],
  ["Transaction coordination", "2% of price", "Buyer entity, at close"],
  ["Common equity promote", "10% of common", "Optional, non cash until exit"],
  ["Post close services", "$24,000 / yr", "Buyer entity, 3 years"],
]

const ROUTED_AWAY = [
  {
    title: "Improvement that is software, pricing or scheduling",
    body: "Adopting an existing solution is not experimental development, whatever the invoice says.",
  },
  {
    title:
      "Home and property services, retail, distribution without processing, franchises, professional services",
    body: "Real businesses, wrong mechanism. Their growth comes from equipment and route density, not research.",
  },
  {
    title: "Under the EBITDA floor",
    body: "The residency costs what it costs. Below the floor the owner is funding an experiment the business cannot carry if the claim is denied.",
  },
  {
    title: "A technical problem we have already solved elsewhere",
    body: "Deploying a known answer is not fresh experimental work, and claiming it invites a reassessment.",
  },
  {
    title: "Cash only sellers",
    body: "With no paper in the structure the transfer does not finance, and pretending otherwise wastes a year.",
  },
]

export default function CapitalDeskPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#195E8E]/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-[680px]">
            <p className="section-label-light">Capital Desk</p>
            <h1 className="text-[2rem] md:text-[2.75rem] leading-[1.15] font-serif text-white mb-5">
              Capital that moves after the evidence, not before it.
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-4">
              A price set on day one. A successor who proves the improvement
              while you keep control. A research project the Crown pre-approves
              before anyone signs. And a bridge the business can carry even if
              the claim is denied.
            </p>
            <p className="text-sm text-white/40 italic">
              Owner-operated businesses, $3M to $15M of revenue, Alberta first.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="#screen" className="btn-premium">
                Run the 90 second screen
              </Link>
              <Link href="#bench" className="btn-ghost-premium">
                See who is on the bench
              </Link>
            </div>
          </div>

          <div className="light-card cd-static p-6 w-full lg:w-[350px] flex-shrink-0">
            <p className="light-card-index mb-3">What the screen returns</p>
            <h3 className="text-[1rem] font-serif mb-4">
              In ninety seconds, not a sales call
            </h3>
            <ul className="cd-hero-list">
              <li>
                <span>01</span>
                <span>
                  The exact EBITDA your business would need to carry this,
                  computed on your own numbers
                </span>
              </li>
              <li>
                <span>02</span>
                <span>
                  Year one credits, your net cost, and what that is as a share of
                  earnings
                </span>
              </li>
              <li>
                <span>03</span>
                <span>
                  The capital stack at close, with debt service coverage and any
                  gap
                </span>
              </li>
              <li>
                <span>04</span>
                <span>
                  Whether the business survives a denied claim, and by what
                  multiple
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SPEC STRIP */}
      <section className="bg-white border-y border-border py-8 md:py-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          <div>
            <p className="label-micro mb-1">Revenue band</p>
            <p className="text-[1.05rem] font-serif text-fg">$3M to $15M</p>
          </div>
          <div>
            <p className="label-micro mb-1">Headcount</p>
            <p className="text-[1.05rem] font-serif text-fg">10 to 80</p>
          </div>
          <div>
            <p className="label-micro mb-1">Sectors</p>
            <p className="text-[1.05rem] font-serif text-fg">
              Six technical archetypes
            </p>
          </div>
          <div>
            <p className="label-micro mb-1">Screen output</p>
            <p className="text-[1.05rem] font-serif text-fg">
              A verdict, with the number behind it
            </p>
          </div>
        </div>
      </section>

      {/* FOUR MODELS */}
      <section id="models" className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">Four ways capital arrives</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-3 max-w-[24ch]">
            The right structure, not a pitch deck.
          </h2>
          <p className="text-body text-fg/70 max-w-content mb-10">
            Each model exists because a different thing is missing: a buyer,
            capital, timing, or scale. The screen routes you to one of them and
            tells you why.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {MODELS.map((m) => (
              <div className="light-card cd-static p-6" key={m.index}>
                <p className="light-card-index mb-3">{m.index}</p>
                <h3 className="text-[1rem] font-serif font-medium mb-1">
                  {m.title}
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-blue mb-3">
                  {m.who}
                </p>
                <p className="text-sm leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 mt-12">
            {CASES.map((c) => (
              <div
                className="flex gap-4 py-4 border-t border-border"
                key={c.label}
              >
                <span className="label-micro pt-1 whitespace-nowrap">
                  {c.label}
                </span>
                <p className="text-[15px] text-fg/80">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW MATCHING WORKS */}
      <section id="sequence" className="dark-atmosphere py-20 md:py-28 relative">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label-light">How matching works</p>
          <h2 className="text-[1.5rem] md:text-[1.75rem] font-serif text-white leading-snug mb-3 max-w-[28ch]">
            Five checkpoints, each with a defined exit for everyone.
          </h2>
          <p className="text-white/60 leading-relaxed max-w-content mb-10">
            Nobody signs anything until CRA has determined the project is
            eligible. Nobody buys anything until the improvement is measured.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {STAGES.map((s) => (
              <div className="stage-card p-5 md:p-6" key={s.n}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal/60 mb-2">
                  {s.n}
                </p>
                <p className="text-[1.05rem] font-serif font-medium text-white mb-1">
                  {s.title}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-teal mb-3">
                  {s.when}
                </p>
                <p className="text-sm text-white/50 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mt-14">
            <div>
              <h3 className="text-[1.25rem] font-serif text-white mb-4">
                What it costs, stated once
              </h3>
              <div className="cd-scroll stage-card">
                <table className="cd-table cd-table-dark">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Amount</th>
                      <th>Paid by, when</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEES.map(([component, amount, who]) => (
                      <tr key={component}>
                        <td className="cd-g">{component}</td>
                        <td className="cd-v">{amount}</td>
                        <td className="cd-v">{who}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mt-3">
                All in, about 15% of a $2.275M price, against an 8% broker fee
                that buys you a listing and a maybe. Roughly half of our number
                is a salaried technical hire doing real work inside your
                business.
              </p>
            </div>
            <div>
              <h3 className="text-[1.25rem] font-serif text-white mb-4">
                What makes this different from a listing
              </h3>
              <p className="text-white/60 leading-relaxed mb-4">
                A broker sells access to a market. This desk sells the thing the
                market is missing: a buyer who can already run the business, and
                a file with two years of verified data in it. Sell through rates
                for listed small businesses are poor. Pepperdine 2025 survey
                found 31% of broker engagements ended without a transaction, and
                the Canadian Federation of Independent Business puts 54% of
                exiting owners as unable to find a buyer at all.
              </p>
              <p className="text-white/60 leading-relaxed">
                The trade is real and we say it plainly: you carry a salaried
                hire for 18 to 24 months, you take about 35% of the price in
                paper, and your price is fixed on day one so the upside from the
                improvement belongs to the person who created it. In exchange you
                get a buyer, a credit that covers about a third of the proving
                cost, and a business worth more whether or not you sell it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE ROUTE AWAY */}
      <section
        id="routed"
        className="border-t border-neutral-200 bg-white py-20 md:py-28"
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <p className="section-label">What we route away</p>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-3 max-w-[24ch]">
              Half the value of a screen is the no.
            </h2>
            <p className="text-body text-fg/70">
              These are not bad businesses. They are businesses where this
              structure would take money and hand back a worse outcome than a
              conventional succession or a straight raise. When your screen lands
              here you get the reason, the number you would need, and an
              introduction to the right lane instead.
            </p>
          </div>
          <div className="grid gap-3">
            {ROUTED_AWAY.map((r) => (
              <div className="case-card flex gap-4" key={r.title}>
                <span className="label-micro cd-out">Out</span>
                <div>
                  <p className="text-[15px] font-semibold text-fg mb-1">
                    {r.title}
                  </p>
                  <p className="text-sm text-fg/60 leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE SCREEN, THE BENCH, THE INTAKE */}
      <CapitalDesk />

      {/* DISCLOSURES */}
      <section className="bg-[#FAFAF8] border-t border-neutral-200 py-12">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid gap-2 text-[12px] leading-relaxed text-muted max-w-[95ch]">
          <p>
            <span className="text-fg/70">execom Inc.</span> is a
            commercialization advisory firm. It is not a business broker, a
            securities dealer, a lender, or a law firm, and it does not provide
            legal, tax or investment advice.
          </p>
          <p>
            <span className="text-fg/70">Screen output is indicative.</span>{" "}
            Credit figures are estimates computed on the inputs entered, under
            current federal SR&amp;ED and Alberta Innovation Employment Grant
            rules. Eligibility is determined by the Canada Revenue Agency, and
            the paid assessment exists to get that determination in writing
            before anyone signs.
          </p>
          <p>
            <span className="text-fg/70">No financing commitment.</span> Bench
            appetite is a written indication only. No lender commits to a
            transaction before a signed deal, an agreed price and a completed
            review.
          </p>
          <p>
            <span className="text-fg/70">Confidentiality.</span> Businesses are
            shown to the bench anonymously, after assessment, under a non
            disclosure agreement.
          </p>
        </div>
      </section>
    </>
  )
}
