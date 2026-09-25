import type { Metadata } from "next"
import Link from "next/link"
import type Stripe from "stripe"
import { RBE_PRICES, intakeHref, isMarket, isTier } from "@/lib/rbe/pricing"
import { getStripe } from "@/lib/rbe/stripe"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Welcome to RBE | execom",
  robots: { index: false, follow: false },
}

type Confirmed = {
  tierName: string
  country: string
  email: string | null
  paid: string
  firstMonthly: string | null
  href: string
}

async function confirm(sessionId: string | undefined): Promise<Confirmed | null> {
  const stripe = getStripe()
  if (!stripe || !sessionId || !sessionId.startsWith("cs_")) return null
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] })
    const tier = s.metadata?.tier
    const market = s.metadata?.market
    const settled = s.payment_status === "paid" || s.payment_status === "no_payment_required"
    if (s.status !== "complete" || !settled || !isTier(tier) || !isMarket(market)) return null

    const sub = typeof s.subscription === "object" ? (s.subscription as Stripe.Subscription | null) : null
    const firstMonthly = sub?.trial_end
      ? new Date(sub.trial_end * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "America/Edmonton",
        })
      : null

    return {
      tierName: RBE_PRICES[tier].name,
      country: market === "ca" ? "Canada" : "United States",
      email: s.customer_details?.email ?? null,
      paid: `$${((s.amount_total ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${String(s.currency ?? "").toUpperCase()}`,
      firstMonthly,
      href: intakeHref(tier, market, s.id),
    }
  } catch (err) {
    console.error("[rbe] welcome lookup failed", err)
    return null
  }
}

export default async function RbeWelcome({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const c = await confirm(searchParams.session_id)

  return (
    <section className="relative dark-atmosphere hero-pattern overflow-hidden min-h-[70vh]">
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />
      <div className="relative max-w-[1100px] mx-auto px-6 md:px-8 py-16 md:py-24 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
        {c ? (
          <>
            <div>
              <p className="section-label-light">
                <span>
                  <span className="normal-case">execom</span> RBE &middot; {c.tierName}
                </span>
              </p>
              <h1 className="text-[2rem] md:text-[2.75rem] leading-[1.12] font-serif text-white mb-5">
                Payment received. Now the intake.
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                Create your portal account{c.email ? ` with ${c.email}` : ""} and
                answer one structured intake. Nothing gets filed until a person
                has reviewed it.
              </p>
              <Link href={c.href} className="btn-premium justify-center">
                Create my portal account
              </Link>
            </div>

            <div className="light-card cd-static p-6">
              <p className="light-card-index mb-4">Your order</p>
              <dl className="rbe-receipt">
                <div>
                  <dt>Tier</dt>
                  <dd>{c.tierName}</dd>
                </div>
                <div>
                  <dt>Forming in</dt>
                  <dd>{c.country}</dd>
                </div>
                <div>
                  <dt>Paid today</dt>
                  <dd>{c.paid}</dd>
                </div>
                {c.firstMonthly && (
                  <div>
                    <dt>First monthly charge</dt>
                    <dd>{c.firstMonthly}</dd>
                  </div>
                )}
              </dl>
              <p className="text-[13px] mt-5">
                Your receipt is on its way from Stripe. Questions go to{" "}
                <a href="mailto:action@execom.ca" className="underline">
                  action@execom.ca
                </a>
                .
              </p>
            </div>
          </>
        ) : (
          <div className="max-w-[640px]">
            <p className="section-label-light">
              <span>
                <span className="normal-case">execom</span> RBE
              </span>
            </p>
            <h1 className="text-[2rem] md:text-[2.5rem] leading-[1.15] font-serif text-white mb-5">
              We couldn&apos;t confirm that checkout.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              If you paid, your Stripe receipt has the details and we have the
              order. Email{" "}
              <a href="mailto:action@execom.ca" className="text-teal underline">
                action@execom.ca
              </a>{" "}
              and we&apos;ll send your intake link. If you didn&apos;t finish,
              pick up where you left off.
            </p>
            <Link href="/rbe#tiers" className="btn-premium justify-center">
              Back to the tiers
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
