import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, CreditCard, Package, UserRound } from "lucide-react"
import { PageHero } from "@/components/site/Primitives"

export const metadata: Metadata = {
  title: "Customer support | execom",
  description:
    "Customer support for all brands, products and services operated by Execom Inc. Get help with payments, orders, bookings, subscriptions and account access.",
  alternates: { canonical: "https://execom.ca/support" },
}

const topics = [
  {
    icon: CreditCard,
    title: "Payments and receipts",
    description:
      "Ask about a charge, request a receipt or get help identifying a payment. Include the payment date, amount and any invoice or order reference.",
    subject: "Payment and receipt support",
  },
  {
    icon: Package,
    title: "Orders, bookings and subscriptions",
    description:
      "Need help with an order, rental, booking or subscription? Include the brand, your reference number and any change, cancellation or refund you are requesting. The terms of your purchase or booking apply.",
    subject: "Order, booking and subscription support",
  },
  {
    icon: UserRound,
    title: "Products, services and accounts",
    description:
      "Having trouble with a product, app, service or account? Tell us the brand or website, what you need help with and what happened. For account issues, include the email address you signed up with.",
    subject: "Product, service and account support",
  },
]

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Customer support"
        title="How can we *help*?"
        lede="Support for all brands, products and services operated by Execom Inc. Tell us which brand you used and what you need."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="mailto:support@execom.ca" className="s-btn s-btn-primary s-btn-lg">
            support@execom.ca
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <p className="text-[13.5px] text-fog">One support contact across all Execom Inc. brands.</p>
        </div>
      </PageHero>

      <section className="pb-20 md:pb-24" aria-label="Support topics">
        <div className="s-container grid gap-4 md:grid-cols-3">
          {topics.map((t) => (
            <article key={t.title} className="s-edge s-spot flex flex-col p-7" data-reveal>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <t.icon className="h-[18px] w-[18px] text-cyan-300" strokeWidth={1.6} aria-hidden />
              </span>
              <h2 className="mt-5 text-[1.2rem] font-semibold tracking-[-0.012em] text-snow">{t.title}</h2>
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-haze">{t.description}</p>
              <a
                href={`mailto:support@execom.ca?subject=${encodeURIComponent(t.subject)}`}
                aria-label={`Email support: ${t.title}`}
                className="s-link mt-6 text-[14px]"
              >
                Email support
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="s-container">
          <div className="grid overflow-hidden rounded-[18px] border border-white/[0.08] md:grid-cols-2" data-reveal>
            <div className="bg-white/[0.015] p-7 md:p-9">
              <p className="s-eyebrow">What to include in your email</p>
              <ul className="s-list s-body mt-6">
                <li>Your name and the email used for your purchase, booking or account.</li>
                <li>The brand, product, app or website your request relates to.</li>
                <li>Your invoice, order, reservation or subscription reference, if you have one.</li>
                <li>A short description of the issue or requested change.</li>
              </ul>
              <p className="mt-6 rounded-xl border border-[#FFC342]/25 bg-[#FFC342]/[0.05] px-4 py-3 text-[13.5px] leading-relaxed text-[#FFE3B3]">
                Please do not email passwords, verification codes or full card numbers.
              </p>
            </div>
            <div className="border-t border-white/[0.08] p-7 md:border-l md:border-t-0 md:p-9">
              <p className="s-eyebrow">Useful links</p>
              <div className="mt-6 grid gap-1">
                <Link href="/portal/login" className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] text-snow/90 hover:bg-white/[0.04]">
                  <span>
                    <span className="normal-case">execom</span> client portal
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-fog" aria-hidden />
                </Link>
                <a href="https://rentbot.ca/contact" className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] text-snow/90 hover:bg-white/[0.04]">
                  RentBot rental enquiries
                  <ArrowUpRight className="h-4 w-4 text-fog" aria-hidden />
                </a>
                <Link href="/contact" className="flex items-center justify-between rounded-lg px-3 py-3 text-[15px] text-snow/90 hover:bg-white/[0.04]">
                  New project enquiries
                  <ArrowUpRight className="h-4 w-4 text-fog" aria-hidden />
                </Link>
              </div>
              <p className="mt-6 text-[13.5px] leading-relaxed text-fog">
                Unsure which brand a charge relates to? If your statement mentions Execom Inc. or execom, email the payment date, amount
                and the description shown on your statement so we can help identify it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
