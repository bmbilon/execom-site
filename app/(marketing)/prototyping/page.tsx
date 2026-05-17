import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Prototyping — execom",
  description:
    "Most products fail before they're tooled — not after. execom pressure-tests your concept before you spend money on prototyping, manufacturing, and packaging, so you build the right thing once.",
}

export default function PrototypingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-[#0d1b2a] hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[720px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Prototyping
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Most physical products fail before they&rsquo;re tooled, not after.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-[560px] mb-4">
              execom helps founders pressure-test the product, the buyer, the
              manufacturing path, and the launch plan before spending money on
              tooling and prototypes.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[560px]">
              The most expensive prototype is the one you build before you know
              who buys it, what they&rsquo;ll pay, what it costs to make, and
              what shelf it actually fits on. We start there.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/portal/prototype-readiness"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Start Readiness Assessment
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With execom
              </Link>
            </div>

            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="bg-bg">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-28">
          <div className="max-w-[760px]">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              Who this is for
            </p>
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-serif text-fg mb-6">
              Founders with a physical product idea and real intent to commercialize.
            </h2>
            <p className="text-body text-muted leading-relaxed mb-4">
              You have sketches, maybe a rough prototype, possibly some friends
              and family who say it&rsquo;s a great idea. The next step feels
              obvious: hire a designer, get a real prototype, tool it up.
            </p>
            <p className="text-body text-muted leading-relaxed">
              It almost never is. The next step is figuring out whether anyone
              outside your immediate circle would pay for it, what they&rsquo;d
              pay, where they&rsquo;d buy it, and whether the unit economics
              hold up when the freight bills arrive. That&rsquo;s what we do
              before anything gets built.
            </p>
          </div>
        </div>
      </section>

      {/* THE THREE PATHS */}
      <section className="bg-surface-raised border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-28">
          <div className="max-w-[760px] mb-12">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              How we engage
            </p>
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-serif text-fg mb-6">
              One assessment. Three honest paths forward.
            </h2>
            <p className="text-body text-muted leading-relaxed">
              You complete a short readiness assessment. We review it and
              recommend one of three engagements based on where the concept
              actually is &mdash; not where you wish it were.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <PathCard
              tag="Step 1"
              title="Validation Sprint"
              priceRange="$3,500 – $7,500"
              blurb="Customer interviews, willingness-to-pay tests, competitor teardowns, and a go / no-go memo. Use this when the buyer and price are still hypotheses."
              eta="2–4 weeks"
            />
            <PathCard
              tag="Step 2"
              title="Prototype Blueprint"
              priceRange="$8,000 – $15,000"
              blurb="Industrial design, material selection, supplier shortlist, BOM, and a packaging / freight strategy. Use this once demand is real."
              eta="4–8 weeks"
            />
            <PathCard
              tag="Step 3"
              title="Build &amp; Launch Plan"
              priceRange="$15,000 – $50,000+"
              blurb="Tooling, first production run, brand and content for launch, retail and DTC channel strategy. Use this once the blueprint is locked."
              eta="3–6 months"
            />
          </div>

          <p className="mt-8 text-sm text-muted max-w-[760px]">
            Some founders aren&rsquo;t ready for any of the three yet &mdash;
            and that&rsquo;s the most useful thing we can tell you. In those
            cases we recommend a short Product Reality Review instead of
            selling you work you shouldn&rsquo;t do.
          </p>
        </div>
      </section>

      {/* WHAT THE ASSESSMENT COVERS */}
      <section className="bg-bg">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-28">
          <div className="max-w-[760px] mb-12">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              What the assessment covers
            </p>
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-serif text-fg mb-6">
              Six short sections. Plain language, honest answers.
            </h2>
            <p className="text-body text-muted leading-relaxed">
              It takes most people 20&ndash;30 minutes. Drafts auto-save, so
              you can step away and come back. We use your answers to
              recommend the right next step, not to grade you.
            </p>
          </div>

          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2 max-w-[920px]">
            <AssessmentSection
              n="1"
              label="The product"
              detail="What it is, why someone would want it, and what makes your version different."
            />
            <AssessmentSection
              n="2"
              label="The buyer"
              detail="Who is most likely to pay for it, what they have already told you, and what you think they would pay."
            />
            <AssessmentSection
              n="3"
              label="How it works"
              detail="The parts, materials, size, weight, and how someone would store it."
            />
            <AssessmentSection
              n="4"
              label="Packaging &amp; shipping"
              detail="How the finished product moves through the box, the truck, and onto a shelf or doorstep."
            />
            <AssessmentSection
              n="5"
              label="Where people buy"
              detail="The channels you imagine selling through, and why those channels would actually work."
            />
            <AssessmentSection
              n="6"
              label="Working with execom"
              detail="The kind of help you are looking for, what is realistic for budget right now, and how to reach you."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1b2a]">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-28">
          <div className="max-w-[680px]">
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-serif text-white mb-6">
              Find out where you actually stand &mdash; before you spend.
            </h2>
            <p className="text-body text-white/50 leading-relaxed mb-10">
              Take the Prototype Readiness Assessment. We&rsquo;ll review your
              answers and respond within two business days with the
              recommended next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/portal/prototype-readiness"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
              >
                Start Readiness Assessment
              </Link>
              <Link
                href="/engage"
                className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border border-white/20 text-white/70 hover:border-teal hover:text-teal transition-colors duration-200 rounded-sm"
              >
                Talk With execom
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function PathCard({
  tag,
  title,
  priceRange,
  blurb,
  eta,
}: {
  tag: string
  title: string
  priceRange: string
  blurb: string
  eta: string
}) {
  return (
    <div className="bg-white border border-border rounded-sm p-7 flex flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        {tag}
      </p>
      <h3
        className="text-[1.25rem] font-serif text-fg mb-2"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-[15px] font-semibold text-fg mb-4">{priceRange}</p>
      <p className="text-body text-muted leading-relaxed mb-6 flex-1">{blurb}</p>
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">
        Typical timeline: <span className="text-fg font-semibold">{eta}</span>
      </p>
    </div>
  )
}

function AssessmentSection({
  n,
  label,
  detail,
}: {
  n: string
  label: string
  detail: string
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue/10 text-blue flex items-center justify-center font-serif text-[15px]">
        {n}
      </div>
      <div>
        <p
          className="text-[15px] font-semibold text-fg mb-1"
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <p
          className="text-sm text-muted leading-relaxed"
          dangerouslySetInnerHTML={{ __html: detail }}
        />
      </div>
    </div>
  )
}
