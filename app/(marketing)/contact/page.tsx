import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { PageHero } from "@/components/site/Primitives"
import { DecisionForm } from "@/components/site/engage/DecisionForm"

export const metadata: Metadata = {
  title: "Contact | execom",
  description: "Contact execom about a specific structural decision. Describe it in plain language; we respond to specifics.",
}

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Most inquiries are *not a fit*."
        lede="That reflects how narrow this work is. If you are facing a specific structural decision with real consequences, describe it below."
      />
      <section className="pb-24 md:pb-32">
        <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="grid content-start gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-[14px] font-semibold text-snow">Probably not the right channel</p>
              <p className="mt-1 text-[14px] leading-relaxed text-haze">
                Exploring options, gathering information, or looking for someone to think out loud with.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.05] p-5">
              <p className="text-[14px] font-semibold text-snow">The right channel</p>
              <p className="mt-1 text-[14px] leading-relaxed text-haze">
                A specific structural decision with real consequences, described in two or three clear sentences.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-[14px] font-semibold text-snow">Need help with an order or account?</p>
              <Link href="/support" className="s-link mt-2 text-[14px]">
                Customer support
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          <DecisionForm />
        </div>
      </section>
    </>
  )
}
