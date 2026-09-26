import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { NAV_GROUPS } from "@/lib/site/nav"
import { PageHero } from "@/components/site/Primitives"

// Shared placeholder for offerings without a dedicated page yet. The nav now
// shows these as "Soon" without a link, but old links and search results
// can still land here with ?topic=<slug>.

interface TopicCopy {
  label: string
  kicker: string
  headline: string
  blurb: string
}

const TOPICS: Record<string, TopicCopy> = {
  "industrial-design": {
    label: "Industrial Design",
    kicker: "Product Development · Industrial Design",
    headline: "Designed for manufacture, not just designed.",
    blurb:
      "Industrial design that survives the supplier shortlist, the BOM, and the freight quote. We pair form with the constraints of real manufacturing so the product you launch matches the product you drew.",
  },
  "software-development": {
    label: "Software Development",
    kicker: "Product Development · Software",
    headline: "Software built around the workflow, not the framework.",
    blurb:
      "From internal tooling to customer-facing applications, we build software that fits the way your business actually operates, with a bias toward shipping and a structure that survives the next hire.",
  },
  "web-development": {
    label: "Web Development",
    kicker: "Product Development · Web",
    headline: "Marketing sites and web apps that convert.",
    blurb:
      "Fast, accessible, search-friendly. We build sites that read as premium and operate as infrastructure, not as a redesign waiting to happen.",
  },
  "manufacturer-sourcing": {
    label: "Manufacturer Sourcing",
    kicker: "Product Development · Sourcing",
    headline: "The right manufacturer, the right MOQ, the right tooling.",
    blurb:
      "Sourcing a manufacturer is half the build cost and most of the risk. We shortlist, sample, negotiate, and structure the relationship so your first production run doesn't double as your last.",
  },
  "business-planning": {
    label: "Business Planning",
    kicker: "Market Entry · Business Planning",
    headline: "Defensible business plans, not deck theatre.",
    blurb:
      "A business plan that survives diligence: financial model, go-to-market roadmap, unit economics, and the risks an investor will actually ask about, written so the numbers tie.",
  },
  "go-to-market-strategy": {
    label: "Go To Market Strategy",
    kicker: "Market Entry · Strategy",
    headline: "Where you sell, how you sell, and what you say.",
    blurb:
      "Channel, positioning, pricing, and the first 90 days of execution. We help founders pick the wedge that actually moves a real buyer, then build the plan to get there.",
  },
  "branding-identity": {
    label: "Branding & Identity",
    kicker: "Market Entry · Brand",
    headline: "Brand systems built to scale beyond the launch.",
    blurb:
      "Identity, voice, and visual system designed to hold up on a retail shelf, on a pitch slide, and on a phone screen. The brand work that doesn't get rebuilt in year two.",
  },
  trademarks: {
    label: "Trademarks",
    kicker: "Market Entry · IP",
    headline: "Trademark filings that close, not get refused.",
    blurb:
      "Canadian and US trademark applications, prepared and prosecuted by a registered agent. Searches, filings, office-action responses, and the ongoing maintenance most founders forget until renewal.",
  },
  "customer-acquisition": {
    label: "Customer Acquisition",
    kicker: "Distribution · Acquisition",
    headline: "Acquisition that pays back, not just spends.",
    blurb:
      "Paid, organic, partnerships, and lifecycle, structured around unit economics that work. We help founders find the channels that fit the product before they scale the ones that don't.",
  },
  "b2b-selling": {
    label: "B2B Selling",
    kicker: "Distribution · B2B",
    headline: "B2B sales motions built around the buyer.",
    blurb:
      "Pipeline strategy, account planning, and sales-cycle design for founders selling into businesses. We help structure outreach, demos, and close motion so deals advance for the right reasons.",
  },
}

const FALLBACK: TopicCopy = {
  label: "Coming soon",
  kicker: "execom",
  headline: "This page is on the way.",
  blurb:
    "The dedicated page for this offering is in production. In the meantime, the fastest way to learn whether it's a fit is a direct conversation.",
}

interface PageProps {
  searchParams: { topic?: string }
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const topic = searchParams?.topic
  const copy = (topic && TOPICS[topic]) || FALLBACK
  return {
    title: `${copy.label} | execom`,
    description: copy.blurb,
  }
}

export default function ComingSoonPage({ searchParams }: PageProps) {
  const topic = searchParams?.topic
  const copy = (topic && TOPICS[topic]) || FALLBACK
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.label === copy.label))
  const live = (group ? group.items : NAV_GROUPS.flatMap((g) => g.items)).filter((i) => i.href && !i.soon).slice(0, 4)

  return (
    <>
      <PageHero
        eyebrow={copy.kicker}
        title={copy.headline}
        lede={copy.blurb}
        primary={{ label: "Talk with execom", href: "/engage" }}
        secondary={{ label: "Back to execom", href: "/" }}
      />

      <section className="pb-24 md:pb-32">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div data-reveal>
            <p className="s-eyebrow">Why a conversation first</p>
            <div className="s-body mt-5">
              <p>
                The dedicated page for this offering is on the roadmap, but the work is already shipping for clients. The fastest way to
                find out whether it&rsquo;s the right next step for your business is to talk through what you&rsquo;re trying to
                accomplish.
              </p>
              <p>
                We&rsquo;ll tell you honestly whether this is where your time and money should go right now, or whether there&rsquo;s a
                more useful next step first.
              </p>
            </div>
          </div>
          <div data-reveal>
            <p className="s-eyebrow s-eyebrow-muted">{group ? `Available now in ${group.label}` : "Available now"}</p>
            <ul className="mt-5 grid gap-3">
              {live.map((i) => (
                <li key={i.href}>
                  <Link href={i.href!} className="s-edge s-spot s-card-link flex items-center justify-between gap-6 p-5">
                    <span>
                      <span className="block text-[16px] font-semibold text-snow">{i.label}</span>
                      <span className="mt-1 block text-[14px] leading-relaxed text-haze">{i.description}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
