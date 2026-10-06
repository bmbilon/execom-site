import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import type { CaseStudyVisual } from "@/lib/site/caseStudies"

export function CaseStudyImage({ visual, preview = false }: { visual: CaseStudyVisual; preview?: boolean }) {
  if (preview) {
    return (
      <div className="relative aspect-[16/11] overflow-hidden border-b border-white/[0.07]" style={{ background: visual.background ?? "#122132" }}>
        {visual.presentation === "screen" ? (
          <Image
            src={visual.src}
            alt={visual.alt}
            width={visual.width}
            height={visual.height}
            sizes="(min-width: 1024px) 280px, (min-width: 768px) 240px, 75vw"
            className="absolute left-1/2 h-auto w-[76%] max-w-[280px] -translate-x-1/2 rounded-t-xl border border-white/[0.15] shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
            style={{ top: visual.previewOffset ?? 24 }}
          />
        ) : (
          <Image
            src={visual.src}
            alt={visual.alt}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className={visual.fit === "contain" ? "object-contain p-4" : "object-cover"}
            style={{ objectPosition: visual.position ?? "center" }}
          />
        )}
      </div>
    )
  }

  return (
    <figure className="s-edge overflow-hidden">
      <a href={visual.src} target="_blank" rel="noreferrer" className="block transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300" aria-label={`View full image: ${visual.alt}`} style={{ background: visual.background ?? "#122132" }}>
        <Image src={visual.src} alt={visual.alt} width={visual.width} height={visual.height} sizes="(min-width: 1024px) 480px, 100vw" className="h-auto w-full" />
      </a>
      <figcaption className="flex items-start justify-between gap-4 border-t border-white/[0.07] px-5 py-4 text-[12px] leading-relaxed text-haze">
        <span>{visual.caption}</span>
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
      </figcaption>
    </figure>
  )
}
