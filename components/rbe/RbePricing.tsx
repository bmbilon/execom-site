"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Disclosure } from "@/components/site/Interactive"
import {
  MONTHLY_DELAY_DAYS,
  RBE_PRICES,
  type Market,
  type TierId,
} from "@/lib/rbe/pricing"

/* ────────────────────────────────────────────────────────────────────
   execom RBE pricing: market toggle, five tier cards, full matrix.

   Prices are the same numbers in both markets and are charged in the
   market's currency (CAD for Canadian formations, USD for US).
   `?market=us` preselects the US view so each ad group can land on
   its own country. The toggle writes the choice back to the URL.
   ──────────────────────────────────────────────────────────────────── */

type ByMarket = { ca: string | boolean; us: string | boolean }
type Cell = string | boolean | ByMarket

type Tier = {
  id: TierId
  n: string
  name: string
  tagline: string
  upfront: number
  monthly: number
  pick?: boolean
  highlights: { ca: string[]; us: string[] }
}

const TIERS: Tier[] = [
  {
    id: "launch",
    n: "01",
    name: "Launch",
    tagline: "A real company and the basics, done properly.",
    upfront: RBE_PRICES.launch.upfront,
    monthly: RBE_PRICES.launch.monthly,
    highlights: {
      ca: [
        "Provincial numbered corporation, government fee included",
        "Minute book, CRA business number and GST/HST account",
        "Founder IP assignment, NDA and contractor templates",
        "Step-by-step guide to opening an EQ Bank or RBC business account",
        "Fystro Core and a chart of accounts, ready on day one",
      ],
      us: [
        "LLC in your home state, state fee included up to $300",
        "Operating agreement, EIN and company record book",
        "Founder IP assignment, NDA and contractor templates",
        "Step-by-step guide to opening a Mercury account",
        "Fystro Core and a chart of accounts, ready on day one",
      ],
    },
  },
  {
    id: "named",
    n: "02",
    name: "Named",
    tagline: "Your name on the company, money coming in.",
    upfront: RBE_PRICES.named.upfront,
    monthly: RBE_PRICES.named.monthly,
    highlights: {
      ca: [
        "Named corporation, provincial or federal, NUANS report included",
        "Trademark knockout search on your name",
        "Terms of service, privacy policy and client agreement configured to how you sell",
        "Guided EQ Bank or RBC opening, Stripe payment links and invoicing",
        "Bank and Stripe feeds wired into your books",
        "One onboarding call",
      ],
      us: [
        "LLC or Delaware C-corp, registered agent for year one",
        "Trademark knockout search on your name",
        "Terms of service, privacy policy and client agreement configured to how you sell",
        "Guided Mercury opening, Stripe payment links and invoicing",
        "Bank and Stripe feeds wired into your books",
        "One onboarding call",
      ],
    },
  },
  {
    id: "brand",
    n: "03",
    name: "Brand",
    tagline: "Protect the name. Paper the business for your industry.",
    upfront: RBE_PRICES.brand.upfront,
    monthly: RBE_PRICES.brand.monthly,
    pick: true,
    highlights: {
      ca: [
        "Full trademark clearance search with a written risk readout",
        "Industry-specific contract set, reviewed by a person, with AI-business clauses",
        "Operating, tax reserve and profit accounts, plus Stripe checkout on your site",
        "GST/HST registration and Stripe Tax configured",
        "Fystro loaded with your products, pricing and customers",
        "Monthly bookkeeping close on the plan",
      ],
      us: [
        "Full trademark clearance search with a written risk readout",
        "Industry-specific contract set, reviewed by a person, with AI-business clauses",
        "Mercury operating, tax reserve and profit accounts, plus Stripe checkout on your site",
        "Sales tax nexus check and Stripe Tax configured",
        "Fystro loaded with your products, pricing and customers",
        "Monthly bookkeeping close on the plan",
      ],
    },
  },
  {
    id: "commerce",
    n: "04",
    name: "Commerce",
    tagline: "Products sold, shipped and reconciled without you in the middle.",
    upfront: RBE_PRICES.commerce.upfront,
    monthly: RBE_PRICES.commerce.monthly,
    highlights: {
      ca: [
        "Guided trademark application in one class",
        "Supplier, manufacturer and reseller agreements, returns and shipping policies",
        "Cart wiring: checkout, tax, shipping rates and orders syncing to Fystro",
        "Fystro Commerce: inventory, suppliers, purchase orders, fulfillment",
        "Carrier or 3PL account and shipping labels set up",
        "Dedicated setup lead and 30 days of hypercare",
      ],
      us: [
        "Guided trademark application in one class",
        "Supplier, manufacturer and reseller agreements, returns and shipping policies",
        "Cart wiring: checkout, tax, shipping rates and orders syncing to Fystro",
        "Fystro Commerce: inventory, suppliers, purchase orders, fulfillment",
        "Carrier or 3PL account and shipping labels set up",
        "Dedicated setup lead and 30 days of hypercare",
      ],
    },
  },
  {
    id: "scale",
    n: "05",
    name: "Scale",
    tagline: "Two entities, two currencies, one operating system.",
    upfront: RBE_PRICES.scale.upfront,
    monthly: RBE_PRICES.scale.monthly,
    highlights: {
      ca: [
        "Two entities: holdco and opco, or a Canada and US pair",
        "Intercompany services agreement and IP licence between them",
        "CAD and USD banking for both, including Mercury for a US entity",
        "Guided trademark applications in Canada and the US",
        "Books for both entities with a consolidated view",
        "Dedicated setup lead and 60 days of hypercare",
      ],
      us: [
        "Two entities: holding and operating, or a US and Canada pair",
        "Intercompany services agreement and IP licence between them",
        "Accounts for both entities, USD and CAD where you need it",
        "Guided trademark applications in the US and Canada",
        "Books for both entities with a consolidated view",
        "Dedicated setup lead and 60 days of hypercare",
      ],
    },
  },
]

type Row = { label: string; cells: Cell[]; only?: Market }
type Group = { title: string; rows: Row[] }

const NO = false
const YES = true

const MATRIX: Group[] = [
  {
    title: "Entity and filings",
    rows: [
      {
        label: "Entity",
        cells: [
          { ca: "Provincial numbered corporation", us: "LLC in your home state" },
          { ca: "Named corporation, provincial or federal", us: "LLC or Delaware C-corp" },
          { ca: "Named corporation, provincial or federal", us: "LLC or Delaware C-corp" },
          { ca: "Named corporation, provincial or federal", us: "LLC or Delaware C-corp" },
          { ca: "Two: holdco and opco, or Canada and US", us: "Two: holding and operating, or US and Canada" },
        ],
      },
      {
        label: "Name search",
        cells: [
          { ca: "Not needed", us: "State availability check" },
          { ca: "NUANS report", us: "State availability check" },
          { ca: "NUANS report", us: "State availability check" },
          { ca: "NUANS report", us: "State availability check" },
          { ca: "Both entities", us: "Both entities" },
        ],
      },
      {
        label: "Government incorporation fee",
        cells: [
          { ca: "Included", us: "Included up to $300" },
          { ca: "Included", us: "Included up to $300" },
          { ca: "Included", us: "Included up to $300" },
          { ca: "Included", us: "Included up to $300" },
          { ca: "Included, both", us: "Included up to $300 each" },
        ],
      },
      {
        label: "Articles, bylaws or operating agreement, organizing resolutions",
        cells: [YES, YES, YES, YES, YES],
      },
      {
        label: "Digital minute book and registers",
        cells: [YES, YES, YES, YES, YES],
      },
      {
        label: "Tax numbers",
        cells: [
          { ca: "Business number, GST/HST", us: "EIN" },
          { ca: "Business number, GST/HST", us: "EIN" },
          { ca: "Business number, GST/HST", us: "EIN" },
          { ca: "Business number, GST/HST", us: "EIN" },
          { ca: "Both entities", us: "Both entities" },
        ],
      },
      {
        label: "Registered agent, year one",
        only: "us",
        cells: ["You act as agent", YES, YES, YES, YES],
      },
    ],
  },
  {
    title: "Name and trademark",
    rows: [
      {
        label: "Trademark search",
        cells: [
          NO,
          "Knockout search, one mark",
          "Full clearance search, written readout",
          "Full clearance search, written readout",
          "Full clearance search, two countries",
        ],
      },
      {
        label: "Trademark application",
        cells: [NO, NO, NO, "Guided, one class", "Guided, one class in each country"],
      },
    ],
  },
  {
    title: "Contracts and policies",
    rows: [
      {
        label: "Customization",
        cells: [
          "Template pack",
          "Configured to your business model",
          "Industry-specific, reviewed by a person",
          "Industry-specific plus commerce and supply",
          "Full set for both entities",
        ],
      },
      {
        label: "Founder IP assignment, NDA, contractor agreement",
        cells: [YES, YES, YES, YES, YES],
      },
      {
        label: "Terms of service, privacy policy, client agreement",
        cells: ["Client agreement template", YES, YES, YES, YES],
      },
      {
        label: "AI-business clauses: output disclaimers, acceptable use, data processing",
        cells: [NO, NO, YES, YES, YES],
      },
      {
        label: "Shareholder agreement with vesting, if you have partners",
        cells: [NO, NO, YES, YES, YES],
      },
      {
        label: "Supplier, manufacturer and reseller agreements; returns and shipping policies",
        cells: [NO, NO, NO, YES, YES],
      },
      {
        label: "Intercompany services agreement and IP licence",
        cells: [NO, NO, NO, NO, YES],
      },
    ],
  },
  {
    title: "Banking and payments",
    rows: [
      {
        label: "Business account",
        cells: [
          { ca: "EQ Bank or RBC guide", us: "Step-by-step Mercury guide" },
          { ca: "Guided EQ Bank or RBC opening", us: "Guided Mercury opening" },
          { ca: "Operating, tax reserve, profit", us: "Operating, tax reserve, profit" },
          { ca: "Operating, tax reserve, profit", us: "Operating, tax reserve, profit" },
          { ca: "CAD and USD, both entities", us: "Both entities, USD and CAD" },
        ],
      },
      {
        label: "Payments",
        cells: [
          NO,
          "Stripe payment links and invoices",
          "Stripe checkout on your site",
          "Full cart wiring, orders into Fystro",
          "Full cart wiring, two currencies",
        ],
      },
      {
        label: "Sales tax",
        cells: [
          { ca: "GST/HST account opened", us: false },
          { ca: "GST/HST account opened", us: "Nexus check" },
          { ca: "Registration and Stripe Tax", us: "Nexus check and Stripe Tax" },
          { ca: "Registration and Stripe Tax", us: "Nexus check and Stripe Tax" },
          { ca: "Both entities, cross-border mapped", us: "Both entities, cross-border mapped" },
        ],
      },
    ],
  },
  {
    title: "Books and accounting setup",
    rows: [
      {
        label: "Chart of accounts",
        cells: [
          "Template",
          "Configured to your model",
          "Configured to your model",
          "Configured, with inventory",
          "Both entities, consolidated",
        ],
      },
      {
        label: "Bank and Stripe feeds connected",
        cells: [NO, YES, YES, YES, YES],
      },
    ],
  },
  {
    title: "Operations and logistics",
    rows: [
      {
        label: "Fystro",
        cells: [
          "Core",
          "Core",
          "Core, loaded with your data",
          "Commerce",
          "Commerce, both entities",
        ],
      },
      {
        label: "Suppliers, purchase orders, carrier or 3PL, shipping labels",
        cells: [NO, NO, NO, YES, YES],
      },
    ],
  },
  {
    title: "People",
    rows: [
      {
        label: "Human approval on every filing",
        cells: [YES, YES, YES, YES, YES],
      },
      {
        label: "Hands-on time",
        cells: [
          "Async in the portal",
          "One onboarding call",
          "Two working sessions",
          "Setup lead, 30 days hypercare",
          "Setup lead, 60 days hypercare",
        ],
      },
    ],
  },
  {
    title: "Monthly plan",
    rows: [
      {
        label: "Annual government filings prepared and filed",
        cells: [YES, YES, YES, YES, "Both entities"],
      },
      {
        label: "Minute book kept current, compliance calendar",
        cells: [YES, YES, YES, YES, YES],
      },
      {
        label: "Bookkeeping",
        cells: [
          "Self-serve, auto-categorized",
          "Quarterly review by a bookkeeper",
          "Monthly close, up to 60 transactions",
          "Monthly close, up to 150 transactions",
          "Monthly close, both entities, up to 200",
        ],
      },
      {
        label: "Sales tax returns",
        cells: [NO, "Filing reminders", "Prepared for you", "Prepared for you", "Prepared, both entities"],
      },
      {
        label: "Year-end file for your accountant",
        cells: [NO, NO, YES, YES, YES],
      },
      {
        label: "Support",
        cells: [
          "Portal, 2 business days",
          "Portal, 1 business day",
          "1 business day, quarterly call",
          "Priority, monthly call",
          "Priority, monthly call",
        ],
      },
    ],
  },
]

const MARKETS: { id: Market; label: string; currency: string }[] = [
  { id: "ca", label: "Canada", currency: "CAD" },
  { id: "us", label: "United States", currency: "USD" },
]

function money(n: number) {
  return "$" + n.toLocaleString("en-US")
}

function resolve(cell: Cell, market: Market): string | boolean {
  if (typeof cell === "object") return cell[market]
  return cell
}

function Check() {
  return (
    <svg className="rbe-check" viewBox="0 0 16 16" aria-label="Included" role="img">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CellView({ value }: { value: string | boolean }) {
  if (value === true) return <Check />
  if (value === false)
    return (
      <span className="rbe-none" aria-label="Not included">
        &ndash;
      </span>
    )
  return <>{value}</>
}

export default function RbePricing() {
  const [market, setMarket] = useState<Market>("ca")
  const [checkoutError, setCheckoutError] = useState(false)
  const [slide, setSlide] = useState(0)
  const rail = useRef<HTMLDivElement>(null)

  // Read ?market= once on mount so each ad group can land on its country.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const m = q.get("market")
      if (m === "us" || m === "ca") setMarket(m)
      if (q.get("checkout") === "error") setCheckoutError(true)
    } catch {
      /* ignore */
    }
  }, [])

  const choose = (m: Market) => {
    setMarket(m)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("market", m)
      window.history.replaceState(null, "", url.toString())
    } catch {
      /* ignore */
    }
  }

  // Mobile: tiers sit in a swipe rail; track which card is in view for the dots.
  const onRailScroll = () => {
    const el = rail.current
    if (!el) return
    const cards = Array.from(el.children) as HTMLElement[]
    const mid = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setSlide(best)
  }

  const goTo = (i: number) => {
    const el = rail.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card) return
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" })
  }

  const currency = MARKETS.find((m) => m.id === market)?.currency ?? "CAD"
  const rowCount = MATRIX.reduce((n, g) => n + g.rows.filter((r) => !r.only || r.only === market).length, 0)

  return (
    <section id="tiers" className="s-anchor s-section relative overflow-hidden overflow-clip">
      <div
        className="s-glow left-1/2 top-48 h-[420px] w-[900px] -translate-x-1/2 bg-[rgba(25,94,142,0.2)]"
        aria-hidden
      />
      <div className="s-container relative max-w-[1320px]">
        <div className="mx-auto flex max-w-[1136px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[760px]" data-reveal>
            <p className="s-eyebrow mb-5">Pricing</p>
            <h2 className="s-h2 max-w-[24ch]">
              Five tiers. Pick by how much you <span className="s-accent">want done for you</span>.
            </h2>
            <p className="s-lede mt-5 max-w-[60ch]">
              Every tier includes the incorporation, the government filing fee, a person approving every filing, and
              Fystro. Higher tiers add name protection, deeper customization, more money rails and more hands-on time.
            </p>
          </div>
          <div className="shrink-0" data-reveal>
            <p className="s-mono mb-2.5 text-[10.5px] uppercase tracking-[0.14em] text-fog">Where you are forming</p>
            <div className="s-seg" role="group" aria-label="Country of formation">
              {MARKETS.map((m) => (
                <button key={m.id} type="button" aria-pressed={market === m.id} onClick={() => choose(m.id)}>
                  {m.label}
                  <span className="s-mono ml-2 text-[10.5px] tracking-[0.08em] text-fog">{m.currency}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {checkoutError && (
          <p role="alert" className="s-callout mx-auto mt-8 max-w-[1136px] text-[14.5px] leading-relaxed text-snow/90">
            Checkout didn&apos;t open. Try the button again, or email{" "}
            <a href="mailto:action@execom.ca" className="text-cyan-200 underline underline-offset-[3px]">
              action@execom.ca
            </a>{" "}
            and we&apos;ll send you a payment link.
          </p>
        )}

        {/* Tier cards: swipe rail on phones, grid from md */}
        <div data-reveal>
        <div
          ref={rail}
          onScroll={onRailScroll}
          className="rbe-rail relative -mx-5 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-5"
        >
          {TIERS.map((t) => (
            <article
              key={t.id}
              className={`s-edge s-spot flex w-[84%] shrink-0 snap-center flex-col p-6 md:w-auto${t.pick ? " rbe-pick" : ""}`}
              aria-labelledby={`rbe-${t.id}`}
            >
              <div className="flex h-[22px] items-center justify-between gap-2">
                <span className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Tier {t.n}</span>
                {t.pick && <span className="s-tag s-tag-cyan">Recommended</span>}
              </div>
              <h3 id={`rbe-${t.id}`} className="mt-4 font-display text-[1.75rem] leading-none tracking-[-0.015em] text-snow">
                {t.name}
              </h3>
              <p className="mt-3 text-[13.5px] leading-snug text-haze xl:min-h-[4.2em]">{t.tagline}</p>

              <div className="mt-6 border-t border-white/[0.07] pt-5">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="s-num font-display text-[2.3rem] leading-none tracking-[-0.025em] text-snow xl:text-[2rem] 2xl:text-[2.3rem]">
                    {money(t.upfront)}
                  </span>
                  <span className="s-mono text-[10.5px] uppercase tracking-[0.12em] text-fog">upfront</span>
                </p>
                <p className="s-num mt-2.5 text-[13.5px] text-haze">
                  + {money(t.monthly)}/month <span className="s-mono ml-1 text-[10.5px] text-fog">{currency}</span>
                </p>
              </div>

              <ul className="rbe-list mt-5">
                {t.highlights[market].map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>

              <form method="post" action="/api/rbe/checkout" className="mt-auto pt-7">
                <input type="hidden" name="tier" value={t.id} />
                <input type="hidden" name="market" value={market} />
                <button type="submit" className={`s-btn w-full xl:px-4 ${t.pick ? "s-btn-primary" : "s-btn-glass"}`}>
                  Start with {t.name}
                  <ArrowRight className="s-arrow h-4 w-4 xl:hidden" aria-hidden />
                </button>
              </form>
            </article>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 md:hidden">
          <span className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Swipe for all five tiers</span>
          <div className="flex items-center gap-1.5">
            {TIERS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${t.name}`}
                aria-current={slide === i ? "true" : undefined}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    slide === i ? "w-5 bg-cyan-400 shadow-[0_0_8px_rgba(80,196,210,0.7)]" : "w-1.5 bg-white/25"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        </div>

        <div className="mx-auto mt-6 max-w-[1136px]">
          <p className="max-w-[92ch] text-[13px] leading-relaxed text-fog">
            Prices in {currency} for {market === "ca" ? "Canadian" : "US"} formations, plus applicable taxes. Secure checkout
            by Stripe: the setup fee is charged at checkout and the first monthly charge comes {MONTHLY_DELAY_DAYS} days
            later. Upgrade any time by paying the difference; work already done carries over.
          </p>
        </div>

        {/* Full comparison, one click deeper */}
        <div className="mx-auto mt-16 max-w-[1136px] border-t border-white/[0.07] pt-12" data-reveal>
          <h3 className="font-display text-[1.7rem] leading-tight tracking-[-0.015em] text-snow">Everything, side by side</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-haze">
            Showing {market === "ca" ? "Canada" : "United States"}. Switch the country above to see the other set.
            <span className="lg:hidden"> Swipe the table sideways to compare tiers.</span>
          </p>
          <Disclosure
            id="compare-tiers"
            label="Show the full comparison"
            openLabel="Hide the comparison"
            meta={`${rowCount} rows`}
            className="mt-6"
          >
            <div className="rbe-matrix-wrap">
              <table className="rbe-matrix">
                <thead>
                  <tr>
                    <th scope="col" className="rbe-rowhead">
                      <span className="sr-only">Feature</span>
                    </th>
                    {TIERS.map((t) => (
                      <th scope="col" key={t.id} className={t.pick ? "rbe-col-pick" : undefined}>
                        <span className="rbe-th-name">{t.name}</span>
                        <span className="rbe-th-price">
                          {money(t.upfront)} + {money(t.monthly)}/mo
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                {MATRIX.map((g) => (
                  <tbody key={g.title}>
                    <tr className="rbe-group">
                      <th scope="colgroup" colSpan={TIERS.length + 1}>
                        <span>{g.title}</span>
                      </th>
                    </tr>
                    {g.rows
                      .filter((r) => !r.only || r.only === market)
                      .map((r) => (
                        <tr key={r.label}>
                          <th scope="row" className="rbe-rowhead">
                            {r.label}
                          </th>
                          {r.cells.map((c, i) => (
                            <td key={i} className={TIERS[i].pick ? "rbe-col-pick" : undefined}>
                              <CellView value={resolve(c, market)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                ))}
              </table>
            </div>
          </Disclosure>
        </div>
      </div>
    </section>
  )
}
