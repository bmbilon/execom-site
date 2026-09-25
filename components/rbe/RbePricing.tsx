"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

/* ────────────────────────────────────────────────────────────────────
   execom RBE pricing: market toggle, five tier cards, full matrix.

   Prices are the same numbers in both markets and are charged in the
   market's currency (CAD for Canadian formations, USD for US).
   `?market=us` preselects the US view so each ad group can land on
   its own country. The toggle writes the choice back to the URL.
   ──────────────────────────────────────────────────────────────────── */

export type Market = "ca" | "us"

type ByMarket = { ca: string | boolean; us: string | boolean }
type Cell = string | boolean | ByMarket

type Tier = {
  id: string
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
    upfront: 750,
    monthly: 27,
    highlights: {
      ca: [
        "Provincial numbered corporation, government fee included",
        "Minute book, CRA business number and GST/HST account",
        "Founder IP assignment, NDA and contractor templates",
        "Step-by-step guide to opening your business account",
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
    upfront: 1450,
    monthly: 47,
    highlights: {
      ca: [
        "Named corporation, provincial or federal, NUANS report included",
        "Trademark knockout search on your name",
        "Terms of service, privacy policy and client agreement configured to how you sell",
        "Guided bank opening, Stripe payment links and invoicing",
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
    upfront: 2250,
    monthly: 67,
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
    upfront: 3250,
    monthly: 89,
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
    upfront: 4450,
    monthly: 119,
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
          { ca: "Step-by-step guide", us: "Step-by-step Mercury guide" },
          { ca: "Guided opening", us: "Guided Mercury opening" },
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

/** Signup first, then straight into company setup with the choice attached. */
function startHref(tier: string, market: Market) {
  const next = `/portal/company-setup?plan=rbe-${tier}&market=${market}`
  return `/portal/signup?next=${encodeURIComponent(next)}`
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

  // Read ?market= once on mount so each ad group can land on its country.
  useEffect(() => {
    try {
      const m = new URLSearchParams(window.location.search).get("market")
      if (m === "us" || m === "ca") setMarket(m)
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

  const currency = MARKETS.find((m) => m.id === market)?.currency ?? "CAD"

  return (
    <section id="tiers" className="light-section py-20 md:py-28 scroll-mt-24">
      <div className="max-w-[1320px] mx-auto px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <p className="section-label">Pricing</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-fg mb-3 max-w-[26ch]">
                Five tiers. Pick by how much you want done for you.
              </h2>
              <p className="text-body text-fg/70 max-w-content">
                Every tier includes the incorporation, the government filing
                fee, a person approving every filing, and Fystro. Higher tiers
                add name protection, deeper customization, more money rails and
                more hands-on time.
              </p>
            </div>
            <div className="flex-shrink-0">
              <p className="label-micro mb-2">Where you are forming</p>
              <div className="rbe-toggle" role="group" aria-label="Country of formation">
                {MARKETS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={market === m.id}
                    className={market === m.id ? "on" : undefined}
                    onClick={() => choose(m.id)}
                  >
                    {m.label} <span>{m.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {TIERS.map((t) => (
            <article
              key={t.id}
              className={`light-card cd-static rbe-tier${t.pick ? " rbe-pick" : ""}`}
              aria-labelledby={`rbe-${t.id}`}
            >
              <div className="p-6 flex flex-col h-full">
                <p className="light-card-index mb-2 h-[22px] flex items-center justify-between gap-2">
                  <span>Tier {t.n}</span>
                  {t.pick && <span className="rbe-pill">Recommended</span>}
                </p>
                <h3 id={`rbe-${t.id}`} className="text-[1.35rem] font-serif mb-1">
                  {t.name}
                </h3>
                <p className="text-[13.5px] leading-snug mb-5 xl:min-h-[5.1em]">{t.tagline}</p>

                <div className="rbe-price">
                  <span className="rbe-amt">{money(t.upfront)}</span>
                  <span className="rbe-unit">upfront</span>
                </div>
                <p className="rbe-monthly">
                  + {money(t.monthly)}/month <span>{currency}</span>
                </p>

                <ul className="rbe-list">
                  {t.highlights[market].map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <Link
                    href={startHref(t.id, market)}
                    className={t.pick ? "cd-btn-dark rbe-cta" : "cd-btn-quiet rbe-cta"}
                  >
                    Start with {t.name}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="max-w-[1200px] mx-auto text-[13px] text-fg/55 mt-5">
          Prices in {currency} for{" "}
          {market === "ca" ? "Canadian" : "US"} formations. Upgrade any time by
          paying the difference; work already done carries over. The monthly
          plan starts when your company is live.
        </p>

        {/* Full comparison */}
        <div className="max-w-[1200px] mx-auto mt-16">
          <h3 className="text-[1.25rem] font-serif text-fg mb-2">
            Everything, side by side
          </h3>
          <p className="text-sm text-fg/60 mb-5">
            Showing {market === "ca" ? "Canada" : "United States"}. Switch the
            country above to see the other set.
            <span className="lg:hidden"> Swipe the table sideways to compare tiers.</span>
          </p>
          <div className="cd-scroll light-card cd-static rbe-matrix-wrap">
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
        </div>
      </div>
    </section>
  )
}
