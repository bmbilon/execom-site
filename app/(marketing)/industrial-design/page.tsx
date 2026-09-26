import type { Metadata } from "next"
import Image from "next/image"
import { CtaBand, NextSteps, PageHero, SectionHeader } from "@/components/site/Primitives"
import { HexCadVisual } from "@/components/site/design/HexCadVisual"

export const metadata: Metadata = {
  title: "Industrial Design | execom",
  description:
    "Industrial design that survives the supplier shortlist, the BOM, and the freight quote. Selected work: wearable medical device patent figures, mechanical CAD packages, and production drawings.",
}

// Two example projects shown editorially, one hero figure each. The full PDF
// and remaining figures live in /public/showcase/* but are intentionally not
// exposed on the page.

function Deliverables() {
  const items = ["Dimensioned", "Toleranced", "Vendor-aware", "Ready to quote"]
  return (
    <div className="s-edge relative overflow-hidden p-7 md:p-8">
      <div className="s-glow right-[-60px] top-[-80px] h-[200px] w-[300px] bg-[rgba(25,94,142,0.45)]" aria-hidden />
      <div className="relative">
        <p className="s-eyebrow">Deliverables read as production-ready</p>
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {items.map((t, i) => (
            <li key={t} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <span className="s-mono text-[10.5px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 text-[15px] font-semibold text-snow">{t}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[14px] leading-relaxed text-haze">
          From early-stage wearables and consumer products through to precision mechanical assemblies.
        </p>
      </div>
    </div>
  )
}

function Project({
  index,
  kind,
  title,
  text,
  specs,
  figure,
  caption,
  flip = false,
}: {
  index: string
  kind: string
  title: string
  text: string
  specs: string[]
  figure: React.ReactNode
  caption: string
  flip?: boolean
}) {
  return (
    <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12" data-reveal>
      <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
        <p className="s-eyebrow">
          <span className="text-fog">{index}</span>
          <span className="h-px w-5 bg-white/20" aria-hidden />
          {kind}
        </p>
        <h3 className="mt-5 font-display text-[2rem] leading-[1.08] tracking-[-0.018em] text-snow md:text-[2.4rem]">{title}</h3>
        <p className="mt-4 text-[15.5px] leading-relaxed text-haze">{text}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {specs.map((s) => (
            <li key={s} className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1 text-[12.5px] text-snow/85">
              {s}
            </li>
          ))}
        </ul>
      </div>
      <figure className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
        <div className="s-edge overflow-hidden p-2">
          <div className="overflow-hidden rounded-[12px]">{figure}</div>
        </div>
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[12.5px] text-fog">
          <span>{caption}</span>
          <span className="s-mono text-[10.5px] uppercase tracking-[0.14em]">
            <span className="normal-case">execom</span> · industrial design
          </span>
        </figcaption>
      </figure>
    </article>
  )
}

export default function IndustrialDesignPage() {
  return (
    <>
      <PageHero
        href="/industrial-design"
        crumb="Industrial Design"
        eyebrow="Industrial design"
        title="Designed for *manufacture*."
        lede="Industrial design that survives the supplier shortlist, the BOM, and the freight quote. Form paired with the constraints of real manufacturing, so the product you launch matches the product you drew."
        primary={{ label: "Talk with execom", href: "/engage" }}
        secondary={{ label: "See selected work", href: "#selected-work" }}
        aside={<Deliverables />}
      />

      <section id="selected-work" className="s-section s-anchor">
        <div className="s-container">
          <SectionHeader
            eyebrow="Selected work"
            title="A wearable medical device and a precision mechanical assembly."
            lede="Two examples that show the range: an FDA-track wearable with full patent figures, and a 25-page mechanical CAD package destined for tooling and production."
            className="mb-16"
          />

          <div className="grid gap-24">
            <Project
              index="01"
              kind="Wearable medical device"
              title="NEAT, wearable haptic system"
              text="Industrial design and patent figure drafting for a wearable haptic stimulation system. Provisional patent application, November 2025."
              specs={["Industrial design", "Patent figures", "Provisional application"]}
              caption="Enclosure isometric · provisional patent figure"
              figure={
                <div className="relative aspect-[1600/872] bg-[#f4f1e8]">
                  <Image
                    src="/showcase/neat/figure-2.webp"
                    alt="NEAT wearable haptic device, enclosure isometric"
                    fill
                    sizes="(min-width: 1024px) 700px, 100vw"
                    className="object-contain"
                  />
                </div>
              }
            />
            <Project
              index="02"
              kind="Precision mechanical assembly"
              title="Self-Cleaning HEX-100, CAD package"
              text="A 25-page production-ready drawing set for a precision hex-driver assembly. Multi-part BOM with vendor specifications, weld callouts, and dimensioned isometric views."
              specs={["25 drawing sheets", "Multi-part BOM", "Vendor specifications", "Weld callouts"]}
              caption="Drawing sheet 01 / 25 · production-ready CAD package"
              flip
              figure={
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d1c2a] via-[#142a3e] to-[#06111c]">
                  <HexCadVisual />
                </div>
              }
            />
          </div>
        </div>
      </section>

      <CtaBand
        title="Start with a short call. We'll name the *right first deliverable*."
        body="Industrial design rarely fails on the rendering. It fails on the jump from concept to manufacturable assembly. We look at where your project is, what's already drawn, and what needs to land before tooling."
        primary={{ label: "Talk with execom", href: "/engage" }}
        secondary={{ label: "See the prototyping workflow", href: "/prototyping" }}
      />
      <NextSteps from="/industrial-design" />
    </>
  )
}
