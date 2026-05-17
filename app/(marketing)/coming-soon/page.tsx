import Link from "next/link"
import type { Metadata } from "next"

// Shared marketing placeholder. The new banner nav lists workflow areas
// that don't yet have dedicated landing pages (industrial design,
// software development, branding & identity, etc.). Rather than 404 the
// link, point it here with ?topic=<slug> and we render a topic-aware
// page that previews the offering and routes the visitor toward a real
// conversation via /engage. When each dedicated page ships, just point
// the nav link at it and this placeholder keeps serving the long tail.

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

  return (
    <>
      {/* HERO */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[720px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              {copy.kicker}
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              {copy.headline}
            </h1>

            <p className="text-lg text-white/55 leading-relaxed max-w-[620px] mb-10">
              {copy.blurb}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/engage" className="btn-premium">
                Talk With execom
              </Link>
              <Link href="/" className="btn-ghost-premium">
                Back to execom
              </Link>
            </div>

            <div className="mt-12 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* CONTEXT STRIP */}
      <section className="light-section">
        <div className="max-w-[1200px] mx-auto px-8 py-16 md:py-20">
          <div className="max-w-[760px]">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              Why a conversation first
            </p>
            <p className="text-body text-muted leading-relaxed mb-4">
              The dedicated page for this offering is on the roadmap, but the
              work is already shipping for clients. The fastest way to find out
              whether it&rsquo;s the right next step for your business is to
              talk through what you&rsquo;re trying to accomplish.
            </p>
            <p className="text-body text-muted leading-relaxed">
              We&rsquo;ll tell you honestly whether this is where your time and
              money should go right now, or whether there&rsquo;s a more useful
              next step first.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
