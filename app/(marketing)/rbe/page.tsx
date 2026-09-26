import type { Metadata } from "next"
import RbePricing from "@/components/rbe/RbePricing"
import { GST_HST_DISPLAY } from "@/lib/rbe/business"
import { CtaBand, PageHero, SectionHeader } from "@/components/site/Primitives"
import { Accordion, ChapterBar } from "@/components/site/Interactive"
import { keepRanges } from "@/components/site/Rich"
import { brandCase } from "@/components/site/brand"

export const metadata: Metadata = {
  title: "execom RBE | Rapid Business Enterprise",
  description:
    "The company behind your AI business, set up in days: incorporation, contracts, banking, books, payments and Fystro, our mini-ERP. Canada and the US, from $750 upfront plus $27 a month.",
}

const HANDOVER = [
  "A registered company with a clean minute book and its tax numbers",
  "Contracts that match how you actually sell",
  "A business account and payment rails wired into your books",
  "Fystro running your customers, orders and suppliers",
  "A monthly plan that keeps the filings and the books current",
]

const SPECS = [
  { label: "Upfront", value: "$750–$4,450" },
  { label: "Monthly", value: "$27–$119" },
  { label: "Where", value: "Canada and the US" },
  { label: "How", value: "Self-serve portal, human-approved" },
]

const WITH_AI = [
  "Build and ship the product",
  "Name it, brand it, write every page of the site",
  "Model pricing and the first year of numbers",
  "Draft a first pass of almost any document",
]

const WITH_RBE = [
  {
    title: "The right entity, filed properly.",
    body: "Numbered or named, provincial or federal, LLC or C-corp, chosen for where the money and the partners are going.",
  },
  {
    title: "Your IP in the company's name.",
    body: "Until it is assigned, the code, the brand and the content belong to you personally. Customers, investors and acquirers check this first.",
  },
  {
    title: "Contracts for your model and your industry.",
    body: "Including the clauses an AI business needs: what your output does and does not promise, acceptable use, and how customer data is handled.",
  },
  {
    title: "Money rails that reconcile.",
    body: "Bank, Stripe and sales tax wired into your books, so tax season is a file handoff instead of a shoebox.",
  },
  {
    title: "Operations that run without you in the middle.",
    body: "Orders, inventory, suppliers and fulfillment in Fystro, set up around what you sell.",
  },
]

const SYSTEMS = [
  {
    n: "01",
    title: "Entity",
    body: "Numbered or named, provincial or federal in Canada. LLC or Delaware C-corp in the US. Articles, bylaws or operating agreement, organizing resolutions, minute book, tax numbers.",
  },
  {
    n: "02",
    title: "Contracts",
    body: "A clean template pack at entry. An industry-specific set reviewed by a person from the Brand tier up, with AI-business clauses, supplier terms and intercompany agreements as you climb.",
  },
  {
    n: "03",
    title: "Banking",
    body: "A step-by-step opening guide at entry. Operating, tax reserve and profit accounts in the middle. Two currencies and two entities at the top.",
  },
  {
    n: "04",
    title: "Books",
    body: "Chart of accounts, bank and Stripe feeds, sales tax registration, then a monthly close by a bookkeeper on the plans that include it.",
  },
  {
    n: "05",
    title: "Commerce and logistics",
    body: "Stripe payment links, then checkout on your site, then full cart wiring with shipping rates, carrier or 3PL accounts, suppliers and purchase orders.",
  },
  {
    n: "06",
    title: "Fystro",
    body: "execom's mini-ERP: customers, products, orders, inventory, suppliers and fulfillment in one place. It grew out of the operations portal that runs a Canadian DTC beauty brand.",
  },
]

const PIECEMEAL = [
  {
    label: "Lawyer-led incorporation, Alberta",
    value: "$1,200–$1,800",
    body: "For the incorporation alone. Contracts, banking and books are separate bills.",
    source: 1,
  },
  {
    label: "Human bookkeeping, small business",
    value: "$250–$1,000/mo",
    body: "Typical Canadian monthly range, before anyone sets up your accounts or sales tax.",
    source: 2,
  },
  {
    label: "execom RBE, Brand tier",
    value: "$2,250 + $67/mo",
    body: "Named company, trademark clearance, industry contracts, three accounts, checkout, sales tax, Fystro and a monthly close.",
    ours: true,
  },
]

const STEPS = [
  {
    title: "Pick a tier and check out",
    body: "Pay the setup fee through Stripe, then open your portal account. Your tier and country ride along into the setup.",
  },
  {
    title: "One structured intake",
    body: "Owners, business model, what you sell and where. Launch needs no calls at all.",
  },
  {
    title: "We file, draft and wire",
    body: "The portal generates the documents and the setup plan. A person reviews and approves every filing before it goes to a government office.",
  },
  {
    title: "Handover",
    body: "Minute book, documents ready to sign, accounts open, Fystro logins, a compliance calendar. The first monthly charge lands 30 days after checkout.",
  },
]

const FAQ = [
  {
    q: "Numbered or named: which do I need?",
    a: "A numbered company (2412345 Alberta Ltd., for example) costs less and skips the name search, and you can still trade under a brand name. A named corporation puts the brand on the legal entity and needs a NUANS report. If you plan to trademark the name, start named.",
  },
  {
    q: "Provincial or federal?",
    a: "Provincial is cheaper and fine if you mostly operate in one province. Federal protects the name across Canada and still needs a provincial registration where you operate. From the Named tier up you choose, and both fees are covered.",
  },
  {
    q: "Are government fees included?",
    a: "The incorporation filing fee is, in every tier. In the US we cover state formation fees up to $300 per entity; a few high-fee states go above that, and the excess is billed at cost. Trademark office fees and yearly government filing fees are billed at cost, with no markup.",
  },
  {
    q: "I live in Canada. Should I form a US company?",
    a: "Usually not on day one. A Canadian resident who owns a US LLC can end up taxed twice, because CRA treats the LLC as a corporation while the IRS looks through it. If you need US banking or US customers want a US vendor, the Scale tier sets up a Canada and US pair, with a structure memo listing the questions to settle with a cross-border accountant before money moves.",
  },
  {
    q: "Which bank will you set me up with?",
    a: "In Canada, EQ Bank or RBC. Both open for a brand-new corporation. EQ Bank charges no monthly fee and pays interest on the whole balance, but has no debit card, no USD and no Quebec service. RBC's Digital Choice account runs $6 a month, opens online, and comes with a debit card, branches and USD accounts on the side. From the Brand tier our default is operating at RBC, with the tax reserve and profit accounts at EQ Bank. In the US, Mercury, which needs a US entity. Banks make their own approval decisions.",
  },
  {
    q: "Do you file my taxes?",
    a: "The monthly plan keeps the books and, from the Brand tier, prepares your GST/HST or sales tax returns. Corporate income tax returns are filed by an accountant. From Brand up you get a year-end file built so that accountant finishes fast.",
  },
  {
    q: "Is execom a law firm?",
    a: "No. execom is not a law firm or a public accounting firm and does not give legal or tax advice. Documents are generated from your intake and, from the Brand tier, reviewed by a person. When a situation needs a lawyer's or an accountant's opinion, we say so and point you to one.",
  },
  {
    q: "What is Fystro?",
    a: "execom's mini-ERP. Customers, products, orders, inventory, suppliers and fulfillment live in one place, and payments and your store feed into it. Every tier includes Fystro Core; the Commerce tier adds inventory, purchasing and fulfillment.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. Pay the difference between upfront fees and move to the higher monthly plan. Nothing already done is redone or charged twice.",
  },
  {
    q: "What if I cancel the monthly plan?",
    a: "Your company, minute book and documents stay yours. We hand over your records, Fystro access ends, and annual filings and bookkeeping go back to you.",
  },
]

const CHAPTERS = [
  { id: "gap", nav: "Where the chat ends" },
  { id: "included", nav: "What's in the box" },
  { id: "tiers", nav: "Tiers and pricing" },
  { id: "piecemeal", nav: "Against piecemeal" },
  { id: "how", nav: "How it works" },
  { id: "faq", nav: "Questions" },
]

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

function HandoverCard() {
  return (
    <div className="s-edge p-7 md:p-8">
      <p className="s-eyebrow">What you hold at handover</p>
      <p className="mt-4 max-w-[26ch] font-display text-[1.45rem] leading-[1.2] tracking-[-0.012em] text-snow">
        A company that holds up the first time someone checks
      </p>
      <ol className="mt-6 grid gap-4">
        {HANDOVER.map((h, i) => (
          <li key={h} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="s-mono pt-[3px] text-[11px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[15px] leading-relaxed text-snow/90">{h}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function RbePage() {
  return (
    <>
      <PageHero
        eyebrow="execom RBE · Rapid Business Enterprise"
        title="Incorporated, banked, papered and running. *In days.*"
        lede="RBE sets up the company behind your AI business: incorporation, contracts, banking, books, payments and Fystro, our ops backbone. One upfront fee. One monthly plan. Real people approving everything that carries consequences."
        primary={{ label: "See the five tiers", href: "#tiers" }}
        secondary={{ label: "What's in the box", href: "#included" }}
        aside={<HandoverCard />}
      >
        <p className="s-mono mt-7 text-[11px] uppercase tracking-[0.14em] text-fog">
          Canada and the US <span className="px-1.5 text-white/20">/</span> From $750 upfront + $27/month
        </p>
      </PageHero>

      <ChapterBar chapters={CHAPTERS} label="RBE" />

      {/* At a glance */}
      <section className="pt-10 md:pt-14" aria-label="RBE at a glance">
        <div className="s-container">
          <dl
            className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-4"
            data-reveal
          >
            {SPECS.map((s) => (
              <div key={s.label} className="bg-ink-900 p-5 md:p-7">
                <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{s.label}</dt>
                <dd className="mt-2.5 font-display text-[1.2rem] leading-snug tracking-[-0.01em] text-snow md:text-[1.45rem]">
                  {keepRanges(s.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Where the chat ends */}
      <section id="gap" className="s-anchor s-section">
        <div className="s-container">
          <SectionHeader
            eyebrow="Where the chat ends"
            title="The product took a weekend. The company takes filings, accounts and *signatures*."
            lede="Solo founders now ship software, brands and funnels with AI in a weekend. Then the first customer wants an invoice from a registered company, Stripe asks for a business number, and a supplier sends a contract nobody has read. RBE is everything after the build, set up once and kept current."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-10">
            <div className="s-glass self-start p-7 md:p-8" data-reveal>
              <p className="s-eyebrow s-eyebrow-muted">Do it with AI</p>
              <ul className="mt-6 grid gap-3.5">
                {WITH_AI.map((w) => (
                  <li key={w} className="flex gap-3 text-[15px] leading-relaxed text-haze">
                    <span className="mt-[0.8em] h-px w-3 shrink-0 bg-white/30" aria-hidden />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0" data-reveal>
              <p className="s-eyebrow mb-3">RBE sets it up so it holds</p>
              <Accordion numbered items={WITH_RBE.map((w) => ({ title: w.title, content: <p>{w.body}</p> }))} />
            </div>
          </div>
        </div>
      </section>

      {/* What's in the box */}
      <section id="included" className="s-anchor s-section relative overflow-hidden overflow-clip pb-6 md:pb-10">
        <div className="s-glow left-1/2 top-24 h-[360px] w-[760px] -translate-x-1/2 bg-[rgba(25,94,142,0.22)]" aria-hidden />
        <div className="s-container relative">
          <SectionHeader
            eyebrow="What's in the box"
            title="Six systems, set up *as one*."
            lede="The tier decides how far each one goes: templates or tailored, a how-to sheet or a wired checkout, self-serve books or a bookkeeper closing your month."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SYSTEMS.map((s, i) => (
              <div
                key={s.n}
                className="s-edge s-spot p-7"
                data-reveal
                style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}
              >
                <p className="s-mono text-[11px] text-cyan-300">{s.n}</p>
                <h3 className="mt-4 text-[1.2rem] font-semibold tracking-[-0.012em] text-snow">{s.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-haze">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RbePricing />

      {/* Against the piecemeal route */}
      <section id="piecemeal" className="s-anchor s-section-tight">
        <div className="s-container">
          <SectionHeader eyebrow="Against the piecemeal route" title="Priced as one system, *because it is one*." />
          <div
            className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-3"
            data-reveal
          >
            {PIECEMEAL.map((p) => (
              <div key={p.label} className="relative bg-ink-900 p-7 md:p-9">
                {p.ours && (
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/[0.09] to-transparent shadow-[inset_0_1px_0_rgba(80,196,210,0.55)]"
                    aria-hidden
                  />
                )}
                <div className="relative">
                  <p className={`s-mono text-[10.5px] uppercase tracking-[0.14em] ${p.ours ? "text-cyan-200" : "text-fog"}`}>
                    {brandCase(p.label)}
                  </p>
                  <p className="s-num mt-4 font-display text-[2rem] leading-none tracking-[-0.02em] text-snow md:text-[2.25rem]">
                    {keepRanges(p.value)}
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed text-haze">
                    {p.body}
                    {p.source && (
                      <sup className="ml-0.5">
                        <a href="#sources" className="text-cyan-300 hover:text-cyan-200" aria-label={`Source ${p.source}`}>
                          {p.source}
                        </a>
                      </sup>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="s-anchor s-section relative overflow-hidden overflow-clip">
        <div className="s-container relative">
          <SectionHeader eyebrow="How it works" title="One intake. Then we do *the plumbing*." />
          <div className="relative mt-14">
            <div
              className="absolute left-[12.5%] right-[12.5%] top-[27px] hidden h-px bg-gradient-to-r from-cyan-500/50 via-navy-300/40 to-cyan-500/50 lg:block"
              aria-hidden
            />
            <ol className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-4">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-x-5 lg:flex lg:flex-col lg:items-center lg:text-center"
                  data-reveal
                  style={{ ["--d" as string]: `${i * 90}ms` }}
                >
                  <span className="s-mono relative z-[1] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.12] bg-ink-850 text-[13px] text-cyan-300 shadow-[0_0_0_6px_rgba(7,17,27,1),0_0_30px_rgba(80,196,210,0.18)] lg:h-14 lg:w-14">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-2.5 lg:pt-0">
                    <p className="text-[1.1rem] font-semibold tracking-[-0.012em] text-snow lg:mt-6 lg:text-[1.15rem]">{s.title}</p>
                    <p className="mt-2 max-w-[34ch] text-[14.5px] leading-relaxed text-haze">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-14 max-w-[72ch] text-[13.5px] leading-relaxed text-fog" data-reveal>
            Most Launch and Named setups are filed within days of a complete intake. Government offices, banks and payment
            processors run on their own clocks, and their approvals are theirs to give.
          </p>
        </div>
      </section>

      <div className="s-container" aria-hidden>
        <div className="s-divider" />
      </div>

      {/* Questions */}
      <section id="faq" className="s-anchor s-section-tight" aria-labelledby="faq-title">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <header className="self-start lg:sticky lg:top-[152px]" data-reveal>
            <p className="s-eyebrow">FAQ</p>
            <h2 id="faq-title" className="s-h2 mt-5">
              Questions founders ask first
            </h2>
          </header>
          <div className="min-w-0" data-reveal>
            <Accordion items={FAQ.map((f) => ({ title: f.q, content: <p>{f.a}</p> }))} />
          </div>
        </div>
      </section>

      <CtaBand
        title="Step zero is done. Now *the company*."
        body="Pick a tier, finish one intake, and let people who answer for the filings handle the rest."
        primary={{ label: "Pick a tier", href: "#tiers" }}
        secondary={{ label: "Ask a question", href: "/contact" }}
      />

      {/* Disclosures */}
      <section className="pb-16 pt-4" aria-label="Disclosures">
        <div className="s-container">
          <div className="grid max-w-[95ch] gap-3 border-t border-white/[0.07] pt-8 text-[12.5px] leading-relaxed text-fog">
            <p>
              <span className="text-haze">execom Inc.</span> is not a law firm, a public accounting firm or a bank, and it does
              not provide legal, tax or accounting advice. Documents are generated from your intake and, where a tier says so,
              reviewed by a person before delivery. Trademark searches are research, not an opinion on registrability. Guided
              trademark applications are prepared in the portal and filed in your name.
            </p>
            <p>
              <span className="text-haze">Prices and fees.</span> Prices are in Canadian dollars for Canadian formations and US
              dollars for US formations, before tax. Canadian buyers pay GST or HST at their province&apos;s rate; execom Inc.
              GST/HST No. {GST_HST_DISPLAY}. Government, trademark office and yearly filing fees are covered only where this page
              says so; otherwise they are billed at cost. Bookkeeping volumes above a plan&apos;s transaction cap are quoted before
              they are billed.
            </p>
            <p>
              <span className="text-haze">Third parties.</span> Banks, payment processors and carriers named here are independent
              companies with their own eligibility rules and timelines. Payments are processed by Stripe; execom never sees or
              stores your card number.
            </p>
            <p id="sources" className="s-anchor">
              <span className="text-haze">Sources.</span> 1. MD Legals, &ldquo;Alberta Incorporation Cost: DIY vs. Full-Service
              (2026)&rdquo;. 2. LedgerLogic, &ldquo;How Much Does Bookkeeping Cost in Canada?&rdquo;
            </p>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  )
}
