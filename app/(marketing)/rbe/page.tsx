import type { Metadata } from "next"
import Link from "next/link"
import RbePricing from "@/components/rbe/RbePricing"
import { GST_HST_DISPLAY } from "@/lib/rbe/business"

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

const STEPS = [
  {
    n: "01",
    title: "Pick a tier and check out",
    body: "Pay the setup fee through Stripe, then open your portal account. Your tier and country ride along into the setup.",
  },
  {
    n: "02",
    title: "One structured intake",
    body: "Owners, business model, what you sell and where. Launch needs no calls at all.",
  },
  {
    n: "03",
    title: "We file, draft and wire",
    body: "The portal generates the documents and the setup plan. A person reviews and approves every filing before it goes to a government office.",
  },
  {
    n: "04",
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

export default function RbePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#195E8E]/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-6 md:px-8 py-16 md:py-24 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-[660px]">
            <p className="section-label-light">
              <span>
                <span className="normal-case">execom</span> RBE &middot; Rapid Business Enterprise
              </span>
            </p>
            <h1 className="text-[2.1rem] md:text-[3rem] leading-[1.1] font-serif text-white mb-6">
              Incorporated, banked, papered and running. In days.
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-4">
              RBE sets up the company behind your AI business: incorporation,
              contracts, banking, books, payments and Fystro, our ops backbone.
              One upfront fee. One monthly plan. Real people approving
              everything that carries consequences.
            </p>
            <p className="text-sm text-white/45">
              Canada and the US &middot; From $750 upfront + $27/month
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-4">
              <Link href="#tiers" className="btn-premium justify-center">
                See the five tiers
              </Link>
              <Link href="#included" className="btn-ghost-premium justify-center">
                What&apos;s in the box
              </Link>
            </div>
          </div>

          <div className="light-card cd-static p-6 w-full lg:w-[360px] flex-shrink-0">
            <p className="light-card-index mb-3">What you hold at handover</p>
            <h3 className="text-[1rem] font-serif mb-4">
              A company that holds up the first time someone checks
            </h3>
            <ul className="cd-hero-list">
              {HANDOVER.map((h, i) => (
                <li key={h}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SPEC STRIP */}
      <section className="bg-white border-y border-border py-8 md:py-10">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          <div>
            <p className="label-micro mb-1">Upfront</p>
            <p className="text-[1.05rem] font-serif text-fg">$750&ndash;$4,450</p>
          </div>
          <div>
            <p className="label-micro mb-1">Monthly</p>
            <p className="text-[1.05rem] font-serif text-fg">$27&ndash;$119</p>
          </div>
          <div>
            <p className="label-micro mb-1">Where</p>
            <p className="text-[1.05rem] font-serif text-fg">Canada and the US</p>
          </div>
          <div>
            <p className="label-micro mb-1">How</p>
            <p className="text-[1.05rem] font-serif text-fg">
              Self-serve portal, human-approved
            </p>
          </div>
        </div>
      </section>

      {/* THE GAP */}
      <section className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">Where the chat ends</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-4 max-w-[30ch]">
            The product took a weekend. The company takes filings, accounts and
            signatures.
          </h2>
          <p className="text-body text-fg/70 max-w-content mb-12">
            Solo founders now ship software, brands and funnels with AI in a
            weekend. Then the first customer
            wants an invoice from a registered company, Stripe asks for a
            business number, and a supplier sends a contract nobody has read.
            RBE is everything after the build, set up once and kept current.
          </p>

          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12">
            <div>
              <p className="label-micro mb-4">Do it with AI</p>
              <ul className="rbe-plain">
                {WITH_AI.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label-micro mb-4">RBE sets it up so it holds</p>
              <div className="grid gap-3">
                {WITH_RBE.map((w) => (
                  <div className="case-card" key={w.title}>
                    <p className="text-[15px] font-semibold text-fg mb-1">{w.title}</p>
                    <p className="text-sm text-fg/60 leading-relaxed">{w.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S IN THE BOX */}
      <section id="included" className="dark-atmosphere py-20 md:py-28 scroll-mt-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label-light">What&apos;s in the box</p>
          <h2 className="text-[1.5rem] md:text-[1.9rem] font-serif text-white leading-snug mb-3 max-w-[28ch]">
            Six systems, set up as one.
          </h2>
          <p className="text-white/60 leading-relaxed max-w-content mb-10">
            The tier decides how far each one goes: templates or tailored, a
            how-to sheet or a wired checkout, self-serve books or a bookkeeper
            closing your month.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEMS.map((s) => (
              <div className="stage-card p-6" key={s.n}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal/60 mb-2">
                  {s.n}
                </p>
                <p className="text-[1.1rem] font-serif font-medium text-white mb-2">
                  {s.title}
                </p>
                <p className="text-sm text-white/55 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <RbePricing />

      {/* AGAINST THE PIECEMEAL ROUTE */}
      <section className="bg-white border-t border-border py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">Against the piecemeal route</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-10 max-w-[30ch]">
            Priced as one system, because it is one.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rbe-stat">
              <p className="label-micro mb-3">Lawyer-led incorporation, Alberta</p>
              <p className="rbe-stat-num">$1,200&ndash;$1,800</p>
              <p className="text-sm text-fg/60 leading-relaxed">
                For the incorporation alone. Contracts, banking and books are
                separate bills.<sup>1</sup>
              </p>
            </div>
            <div className="rbe-stat">
              <p className="label-micro mb-3">Human bookkeeping, small business</p>
              <p className="rbe-stat-num">$250&ndash;$1,000/mo</p>
              <p className="text-sm text-fg/60 leading-relaxed">
                Typical Canadian monthly range, before anyone sets up your
                accounts or sales tax.<sup>2</sup>
              </p>
            </div>
            <div className="rbe-stat rbe-stat-us">
              <p className="label-micro mb-3">
                <span className="normal-case">execom</span> RBE, Brand tier
              </p>
              <p className="rbe-stat-num">$2,250 + $67/mo</p>
              <p className="text-sm text-fg/60 leading-relaxed">
                Named company, trademark clearance, industry contracts, three
                accounts, checkout, sales tax, Fystro and a monthly close.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="light-section py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="section-label">How it works</p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-10 max-w-[28ch]">
            One intake. Then we do the plumbing.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div className="light-card cd-static p-6" key={s.n}>
                <p className="light-card-index mb-3">Step {s.n}</p>
                <h3 className="text-[1.05rem] font-serif mb-2">{s.title}</h3>
                <p className="text-sm">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-fg/55 mt-6 max-w-content">
            Most Launch and Named setups are filed within days of a complete
            intake. Government offices, banks and payment processors run on
            their own clocks, and their approvals are theirs to give.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-border py-20 md:py-28">
        <div className="max-w-[900px] mx-auto px-6 md:px-8">
          <p className="section-label">Questions founders ask first</p>
          <div className="rbe-faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="dark-atmosphere hero-pattern py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-[640px]">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-serif text-white leading-tight mb-3">
              Step zero is done. Now the company.
            </h2>
            <p className="text-white/60 leading-relaxed">
              Pick a tier, finish one intake, and let people who answer for the
              filings handle the rest.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link href="#tiers" className="btn-premium justify-center">
              Pick a tier
            </Link>
            <Link href="/contact" className="btn-ghost-premium justify-center">
              Ask a question
            </Link>
          </div>
        </div>
      </section>

      {/* DISCLOSURES */}
      <section className="bg-[#FAFAF8] border-t border-neutral-200 py-12">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid gap-2 text-[12px] leading-relaxed text-muted max-w-[95ch]">
          <p>
            <span className="text-fg/70">execom Inc.</span> is not a law firm, a
            public accounting firm or a bank, and it does not provide legal, tax
            or accounting advice. Documents are generated from your intake and,
            where a tier says so, reviewed by a person before delivery.
            Trademark searches are research, not an opinion on registrability.
            Guided trademark applications are prepared in the portal and filed
            in your name.
          </p>
          <p>
            <span className="text-fg/70">Prices and fees.</span> Prices are in
            Canadian dollars for Canadian formations and US dollars for US
            formations, before tax. Canadian buyers pay GST or HST at their
            province&apos;s rate; execom Inc. GST/HST No. {GST_HST_DISPLAY}.
            Government, trademark office and yearly filing fees are
            covered only where this page says so; otherwise they are billed at
            cost. Bookkeeping volumes above a plan&apos;s transaction cap are
            quoted before they are billed.
          </p>
          <p>
            <span className="text-fg/70">Third parties.</span> Banks, payment
            processors and carriers named here are independent companies with
            their own eligibility rules and timelines. Payments are processed
            by Stripe; execom never sees or stores your card number.
          </p>
          <p>
            <span className="text-fg/70">Sources.</span> 1. MD Legals,
            &ldquo;Alberta Incorporation Cost: DIY vs. Full-Service (2026)&rdquo;.
            2. LedgerLogic, &ldquo;How Much Does Bookkeeping Cost in
            Canada?&rdquo;
          </p>
        </div>
      </section>
    </>
  )
}
