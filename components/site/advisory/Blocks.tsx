import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Block } from "./types"
import { Paras, rich, wordCount } from "../Rich"
import { Accordion, Disclosure, Matrix, Tabs } from "../Interactive"

function blockWords(blocks: Block[]): number {
  let n = 0
  for (const b of blocks) {
    switch (b.kind) {
      case "prose":
        n += wordCount(b.paras)
        break
      case "lead":
      case "quote":
        n += wordCount([b.text])
        break
      case "callout":
        n += wordCount([b.title ?? "", b.text])
        break
      case "points":
        n += wordCount(b.items.map((i) => `${i.label} ${i.text}`))
        break
      case "matrix":
        n += wordCount(b.rows.flatMap((r) => [r.label, ...r.values]))
        break
      case "accordion":
        n += wordCount(b.items.flatMap((i) => [i.title, ...i.body]))
        break
      case "list":
        n += wordCount(b.items)
        break
      case "steps":
      case "cards":
        n += wordCount(b.items.map((i) => `${i.title} ${i.text}`))
        break
      case "detail":
        n += blockWords(b.blocks)
        break
      case "node":
        n += b.words ?? 0
        break
    }
  }
  return n
}

export function readingTime(blocks: Block[]) {
  return `${Math.max(1, Math.round(blockWords(blocks) / 220))} min read`
}

export function Blocks({ blocks, idPrefix }: { blocks: Block[]; idPrefix: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} id={`${idPrefix}-${i}`} />
      ))}
    </div>
  )
}

function BlockView({ block, id }: { block: Block; id: string }) {
  switch (block.kind) {
    case "prose":
      return <Paras paras={block.paras} />

    case "lead":
      return (
        <p className="font-display text-[1.45rem] leading-[1.35] tracking-[-0.01em] text-snow/95 md:text-[1.6rem]">
          {rich(block.text)}
        </p>
      )

    case "points":
      if (block.style === "grid") {
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            {block.items.map((p, i) => (
              <div key={i} className="s-glass p-5">
                <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">
                  {String(i + 1).padStart(2, "0")} / {p.label}
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-haze">{rich(p.text)}</p>
              </div>
            ))}
          </div>
        )
      }
      return (
        <Tabs
          items={block.items.map((p, i) => ({
            label: p.label,
            content: (
              <div className="s-glass mt-4 p-6 md:p-7">
                <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">
                  {String(i + 1).padStart(2, "0")} / {String(block.items.length).padStart(2, "0")}
                </p>
                <p className="mt-3 text-[1.08rem] leading-relaxed text-snow/90">{rich(p.text)}</p>
              </div>
            ),
          }))}
        />
      )

    case "matrix":
      return (
        <div>
          <Matrix
            rowHeader={block.rowHeader}
            columns={block.columns}
            rows={block.rows.map((r) => ({ label: r.label, values: r.values.map((v, j) => <span key={j}>{rich(v)}</span>) }))}
          />
          {block.note && <p className="mt-4 text-[13.5px] leading-relaxed text-fog">{rich(block.note)}</p>}
        </div>
      )

    case "accordion":
      return (
        <Accordion
          numbered={block.numbered}
          items={block.items.map((it) => ({
            title: it.title,
            content: (
              <>
                {it.body.map((p, k) => (
                  <p key={k}>{rich(p, `a${k}`)}</p>
                ))}
              </>
            ),
          }))}
        />
      )

    case "quote":
      return <blockquote className="s-quote">{rich(block.text)}</blockquote>

    case "callout":
      return (
        <div className="s-callout">
          {block.title && <p className="s-h4 mb-2">{block.title}</p>}
          <p className="s-body">{rich(block.text)}</p>
        </div>
      )

    case "list":
      if (block.numbered) {
        return (
          <ol className="grid border-t border-white/[0.07]">
            {block.items.map((t, i) => (
              <li key={i} className="grid grid-cols-[40px_1fr] gap-2 border-b border-white/[0.07] py-4 text-[15.5px] leading-relaxed text-snow/90">
                <span className="s-mono pt-[3px] text-[11px] text-cyan-300">{String(i + 1).padStart(2, "0")}</span>
                <span>{rich(t)}</span>
              </li>
            ))}
          </ol>
        )
      }
      return (
        <ul className="s-list s-body">
          {block.items.map((t, i) => (
            <li key={i}>{rich(t)}</li>
          ))}
        </ul>
      )

    case "steps":
      return (
        <ol className="relative grid gap-0">
          {block.items.map((s, i) => (
            <li key={i} className="relative grid grid-cols-[40px_1fr] gap-4 pb-8 last:pb-0">
              <span className="relative flex flex-col items-center">
                <span className="z-[1] flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-ink-850 s-mono text-[11px] text-cyan-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < block.items.length - 1 && <span className="absolute top-8 bottom-0 w-px bg-gradient-to-b from-white/15 to-white/[0.03]" aria-hidden />}
              </span>
              <div className="pt-1">
                <p className="s-h4 text-[1.02rem]">{s.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-haze">{rich(s.text)}</p>
                {s.meta && <p className="mt-2 s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">{s.meta}</p>}
              </div>
            </li>
          ))}
        </ol>
      )

    case "cards":
      return (
        <div className={`grid gap-3 ${block.columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
          {block.items.map((c, i) => (
            <div key={i} className="s-glass s-spot p-5">
              <p className="s-h4">{c.title}</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-haze">{rich(c.text)}</p>
            </div>
          ))}
        </div>
      )

    case "node":
      return <>{block.node}</>

    case "detail":
      return (
        <Disclosure label={block.label} meta={readingTime(block.blocks)} id={id}>
          <div className="border-l border-white/[0.08] pl-5 md:pl-7">
            <Blocks blocks={block.blocks} idPrefix={id} />
          </div>
        </Disclosure>
      )
  }
}

export function InlineCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body?: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <div className="s-container">
      <div className="s-glass s-spot flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-9" data-reveal>
        <div className="max-w-[60ch]">
          <p className="text-[1.15rem] font-semibold tracking-[-0.01em] text-snow">{title}</p>
          {body && <p className="mt-1.5 text-[14.5px] leading-relaxed text-haze">{rich(body)}</p>}
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href={primary.href} className="s-btn s-btn-primary">
            {primary.label}
            <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
          </Link>
          {secondary && (
            <Link href={secondary.href} className="s-btn s-btn-glass">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
