import { Fragment, type ReactNode } from "react"
import type { AdvisoryPageData, Chapter } from "./types"
import { Blocks, InlineCta } from "./Blocks"
import { accentTitle, plain, rich } from "../Rich"
import { ChapterBar, Accordion } from "../Interactive"
import { CtaBand, InBrief, NextSteps, PageHero } from "../Primitives"
import { brandCase } from "../brand"

function ChapterSection({ chapter, index }: { chapter: Chapter; index: number }) {
  const feature = chapter.tone === "feature"
  return (
    <section id={chapter.id} className="s-anchor relative s-section-tight" aria-labelledby={`${chapter.id}-title`}>
      {feature && (
        <div className="pointer-events-none absolute inset-x-0 inset-y-6 md:inset-x-6" aria-hidden>
          <div className="absolute inset-0 rounded-[28px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(25,94,142,0.16),rgba(7,17,27,0)_70%)]" />
          <div className="s-glow right-[8%] top-[-60px] h-[260px] w-[420px] bg-[rgba(25,94,142,0.45)]" />
        </div>
      )}
      <div className={`s-container relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 ${feature ? "py-6 md:py-10" : ""}`}>
        <header className="self-start lg:sticky lg:top-[152px]" data-reveal>
          <p className="s-eyebrow">
            <span className="text-fog">{String(index + 1).padStart(2, "0")}</span>
            <span className="h-px w-5 bg-white/20" aria-hidden />
            {brandCase(chapter.eyebrow ?? chapter.nav)}
          </p>
          <h2 id={`${chapter.id}-title`} className="s-h2 mt-5">
            {accentTitle(chapter.title)}
          </h2>
          <p className="s-lede mt-5 max-w-[46ch]">{rich(chapter.summary)}</p>
        </header>
        <div className="min-w-0" data-reveal style={{ ["--d" as string]: "80ms" }}>
          <Blocks blocks={chapter.blocks} idPrefix={chapter.id} />
        </div>
      </div>
    </section>
  )
}

export function AdvisoryPage({ data, heroAside }: { data: AdvisoryPageData; heroAside?: ReactNode }) {
  const faqChapter = data.faq?.length
    ? { id: "faq", nav: "FAQ" }
    : null
  const nav = [...data.chapters.map((c) => ({ id: c.id, nav: c.nav })), ...(faqChapter ? [faqChapter] : [])]

  const faqJsonLd = data.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a.map(plain).join(" ") },
        })),
      }
    : null

  return (
    <>
      <PageHero
        href={data.href}
        crumb={data.crumb}
        eyebrow={data.hero.eyebrow}
        title={data.hero.title}
        lede={data.hero.lede}
        primary={data.hero.primary}
        secondary={data.hero.secondary}
        aside={heroAside ?? (data.hero.takeaways?.length ? <InBrief points={data.hero.takeaways} /> : undefined)}
      />

      <ChapterBar chapters={nav} label={data.crumb} />

      <div className="relative">
        {data.chapters.map((c, i) => (
          <Fragment key={c.id}>
            {i > 0 && c.tone !== "feature" && data.chapters[i - 1].tone !== "feature" && (
              <div className="s-container" aria-hidden>
                <div className="s-divider" />
              </div>
            )}
            <ChapterSection chapter={c} index={i} />
            {data.midCta && data.midCta.after === c.id && (
              <div className="py-6">
                <InlineCta {...data.midCta} />
              </div>
            )}
          </Fragment>
        ))}

        {data.faq && data.faq.length > 0 && (
          <>
            <div className="s-container" aria-hidden>
              <div className="s-divider" />
            </div>
            <section id="faq" className="s-anchor s-section-tight" aria-labelledby="faq-title">
              <div className="s-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                <header className="self-start lg:sticky lg:top-[152px]" data-reveal>
                  <p className="s-eyebrow">
                    <span className="text-fog">{String(data.chapters.length + 1).padStart(2, "0")}</span>
                    <span className="h-px w-5 bg-white/20" aria-hidden />
                    FAQ
                  </p>
                  <h2 id="faq-title" className="s-h2 mt-5">
                    Questions founders ask
                  </h2>
                  <p className="s-lede mt-5 max-w-[46ch]">Short answers. Open any question for the detail.</p>
                </header>
                <div className="min-w-0" data-reveal>
                  <Accordion
                    items={data.faq.map((f) => ({
                      title: f.q,
                      content: (
                        <>
                          {f.a.map((p, k) => (
                            <p key={k}>{rich(p, `f${k}`)}</p>
                          ))}
                        </>
                      ),
                    }))}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <CtaBand id="assessment" {...data.closing} />
      <NextSteps from={data.href} hrefs={data.related} />

      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
    </>
  )
}
