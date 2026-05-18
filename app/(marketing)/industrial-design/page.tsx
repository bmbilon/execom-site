import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Industrial Design | execom",
  description:
    "Industrial design that survives the supplier shortlist, the BOM, and the freight quote. Selected work: wearable medical device patent figures, mechanical CAD packages, and production drawings.",
}

// Two example projects shown editorially — one hero shot each, not full
// archives. Figure-2 is the most visually rich (isometric with shading),
// so it leads NEAT. HEX-100 is shown as a styled CAD-sheet card. The
// full PDF + remaining figures live in /public/showcase/* for future
// reference but are intentionally not exposed on the page.

export default function IndustrialDesignPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative dark-atmosphere hero-pattern overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#195E8E]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-teal/40 via-teal/10 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-8 py-28 md:py-36">
          <div className="max-w-[720px]">
            <p className="text-teal text-nav uppercase tracking-widest mb-6">
              Product Development · Industrial Design
            </p>

            <h1 className="text-[2.5rem] md:text-[3.25rem] leading-[1.15] font-serif text-white mb-8">
              Designed for manufacture, not just designed.
            </h1>

            <p className="text-lg text-white/55 leading-relaxed max-w-[620px] mb-4">
              Industrial design that survives the supplier shortlist, the BOM,
              and the freight quote. We pair form with the constraints of real
              manufacturing so the product you launch matches the product you
              drew.
            </p>

            <p className="text-body text-white/35 leading-relaxed max-w-[620px]">
              From early-stage wearables and consumer products through to
              precision mechanical assemblies, our deliverables read as
              production-ready: dimensioned, toleranced, vendor-aware, and
              ready to quote.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/engage" className="btn-premium">
                Talk With execom
              </Link>
              <Link href="#selected-work" className="btn-ghost-premium">
                See Selected Work
              </Link>
            </div>

            <div className="mt-10 w-16 h-0.5 bg-teal" />
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section id="selected-work" className="light-section">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-28">
          <div className="max-w-[760px] mb-14">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              Selected work
            </p>
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.2] font-serif text-fg mb-6">
              A wearable medical device and a precision mechanical assembly.
            </h2>
            <p className="text-body text-muted leading-relaxed">
              Two examples that show the range, an FDA-track wearable with full
              patent figures and a 25-page mechanical CAD package destined for
              tooling and production.
            </p>
          </div>

          {/* NEAT — single hero spread */}
          <div className="mb-20">
            <div className="flex items-baseline justify-between gap-6 mb-8 flex-wrap">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-blue mb-2">
                  Project 01 · Wearable medical device
                </p>
                <h3 className="text-[1.5rem] md:text-[1.75rem] font-serif text-fg">
                  NEAT &mdash; wearable haptic system
                </h3>
              </div>
              <p className="text-[13px] text-muted max-w-[420px]">
                Industrial design and patent figure drafting for a wearable
                haptic stimulation system. Provisional patent application,
                November 2025.
              </p>
            </div>

            <figure className="bg-white border border-border rounded-sm overflow-hidden">
              <div className="relative aspect-[1600/872] bg-[#f4f1e8]">
                <Image
                  src="/showcase/neat/figure-2.webp"
                  alt="NEAT wearable haptic device — enclosure isometric"
                  fill
                  sizes="(min-width: 1024px) 1100px, 100vw"
                  className="object-contain"
                  priority
                />
              </div>
              <figcaption className="px-6 py-4 text-[12px] text-muted border-t border-border flex items-center justify-between gap-4 flex-wrap">
                <span>Enclosure isometric · provisional patent figure</span>
                <span className="text-[11px] uppercase tracking-[0.10em]">
                  execom · industrial design
                </span>
              </figcaption>
            </figure>
          </div>

          {/* HEX-100 — mechanical CAD package */}
          <div>
            <div className="flex items-baseline justify-between gap-6 mb-8 flex-wrap">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-blue mb-2">
                  Project 02 · Precision mechanical assembly
                </p>
                <h3 className="text-[1.5rem] md:text-[1.75rem] font-serif text-fg">
                  Self-Cleaning HEX-100 &mdash; CAD package
                </h3>
              </div>
              <p className="text-[13px] text-muted max-w-[420px]">
                25-page production-ready drawing set for a precision hex-driver
                assembly. Multi-part BOM with vendor specifications, weld
                callouts, and dimensioned isometric views.
              </p>
            </div>

            <figure className="bg-white border border-border rounded-sm overflow-hidden">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#0d1c2a] via-[#142a3e] to-[#06111c] flex items-center justify-center overflow-hidden">
                  {/* Stylized CAD-drawing-stack visual using inline SVG. No
                      raster preview because the PDF is vector CAD and we
                      don't ship poppler in the build pipeline. */}
                  <svg
                    viewBox="0 0 800 450"
                    className="w-full h-full"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f8f5ec" />
                        <stop offset="1" stopColor="#ece6d5" />
                      </linearGradient>
                      <pattern
                        id="grid"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 24 0 L 0 0 0 24"
                          fill="none"
                          stroke="rgba(20,42,62,0.10)"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    {/* Three stacked drawing sheets, offset */}
                    {[2, 1, 0].map((i) => (
                      <g
                        key={i}
                        transform={`translate(${160 + i * 18} ${60 + i * 14})`}
                      >
                        <rect
                          width="480"
                          height="330"
                          rx="3"
                          fill="url(#paper)"
                          stroke="rgba(20,42,62,0.22)"
                          strokeWidth="1"
                        />
                        {i === 0 && (
                          <>
                            <rect
                              width="480"
                              height="330"
                              fill="url(#grid)"
                            />
                            {/* faux orthographic views */}
                            <circle
                              cx="140"
                              cy="120"
                              r="56"
                              fill="none"
                              stroke="#0d1c2a"
                              strokeWidth="1.3"
                            />
                            <polygon
                              points="140,80 175,100 175,140 140,160 105,140 105,100"
                              fill="none"
                              stroke="#0d1c2a"
                              strokeWidth="1.3"
                            />
                            <rect
                              x="240"
                              y="80"
                              width="200"
                              height="80"
                              fill="none"
                              stroke="#0d1c2a"
                              strokeWidth="1.3"
                            />
                            <line
                              x1="240"
                              y1="100"
                              x2="440"
                              y2="100"
                              stroke="#0d1c2a"
                              strokeWidth="0.7"
                              strokeDasharray="4 3"
                            />
                            <line
                              x1="240"
                              y1="140"
                              x2="440"
                              y2="140"
                              stroke="#0d1c2a"
                              strokeWidth="0.7"
                              strokeDasharray="4 3"
                            />
                            {/* dimension lines */}
                            <line
                              x1="60"
                              y1="220"
                              x2="420"
                              y2="220"
                              stroke="#195E8E"
                              strokeWidth="0.9"
                            />
                            <line
                              x1="60"
                              y1="215"
                              x2="60"
                              y2="225"
                              stroke="#195E8E"
                              strokeWidth="0.9"
                            />
                            <line
                              x1="420"
                              y1="215"
                              x2="420"
                              y2="225"
                              stroke="#195E8E"
                              strokeWidth="0.9"
                            />
                            <text
                              x="240"
                              y="214"
                              textAnchor="middle"
                              fontFamily="ui-monospace, monospace"
                              fontSize="11"
                              fill="#195E8E"
                            >
                              112.50
                            </text>
                            {/* title block */}
                            <rect
                              x="280"
                              y="260"
                              width="180"
                              height="58"
                              fill="none"
                              stroke="#0d1c2a"
                              strokeWidth="1"
                            />
                            <line
                              x1="280"
                              y1="278"
                              x2="460"
                              y2="278"
                              stroke="#0d1c2a"
                              strokeWidth="0.7"
                            />
                            <line
                              x1="280"
                              y1="298"
                              x2="460"
                              y2="298"
                              stroke="#0d1c2a"
                              strokeWidth="0.7"
                            />
                            <text
                              x="288"
                              y="273"
                              fontFamily="ui-monospace, monospace"
                              fontSize="8"
                              fill="#0d1c2a"
                              letterSpacing="0.05em"
                            >
                              SC-HEX-100
                            </text>
                            <text
                              x="288"
                              y="293"
                              fontFamily="ui-monospace, monospace"
                              fontSize="8"
                              fill="#0d1c2a"
                              opacity="0.7"
                            >
                              SHEET 01 / 25
                            </text>
                            <text
                              x="288"
                              y="313"
                              fontFamily="ui-monospace, monospace"
                              fontSize="8"
                              fill="#0d1c2a"
                              opacity="0.7"
                            >
                              SCALE 1:1
                            </text>
                          </>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              <figcaption className="px-6 py-4 text-[12px] text-muted border-t border-border flex items-center justify-between gap-4 flex-wrap">
                <span>Drawing sheet 01 / 25 · production-ready CAD package</span>
                <span className="text-[11px] uppercase tracking-[0.10em]">
                  execom · industrial design
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* CLOSE */}
      <section className="light-section border-t border-border">
        <div className="max-w-[1200px] mx-auto px-8 py-20 md:py-24">
          <div className="max-w-[760px]">
            <p className="text-blue text-nav uppercase tracking-widest mb-6">
              How to engage
            </p>
            <h2 className="text-[1.75rem] md:text-[2.25rem] leading-[1.2] font-serif text-fg mb-6">
              Start with a short call. We&rsquo;ll tell you what the right
              first deliverable is.
            </h2>
            <p className="text-body text-muted leading-relaxed mb-8">
              Industrial design rarely fails on the rendering, it fails on the
              jump from concept to manufacturable assembly. We&rsquo;ll look at
              where your project is, what&rsquo;s already drawn, and what
              needs to land before tooling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/engage" className="btn-premium">
                Talk With execom
              </Link>
              <Link href="/prototyping" className="btn-ghost-premium">
                See Prototyping Workflow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
