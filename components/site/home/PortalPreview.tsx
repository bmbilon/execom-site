import { Check } from "lucide-react"

type Row = { label: string; status: string; state: "done" | "active" | "queued" }

const ROWS: Row[] = [
  { label: "Concept and buyer validation", status: "Validated", state: "done" },
  { label: "Company, IP and trademarks", status: "Filed", state: "done" },
  { label: "SR&ED and non-dilutive funding", status: "In place", state: "done" },
  { label: "Design, CAD and prototype", status: "Complete", state: "done" },
  { label: "Market entry and channel plan", status: "In progress", state: "active" },
  { label: "First revenue", status: "Next", state: "queued" },
]

function StatusDot({ state }: { state: Row["state"] }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 ring-1 ring-cyan-400/40">
        <Check className="h-3 w-3 text-cyan-300" strokeWidth={2.5} />
      </span>
    )
  }
  if (state === "active") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-[#FFC342]/40">
        <span className="pp-pulse h-2 w-2 rounded-full bg-[#FFC342]" />
      </span>
    )
  }
  return <span className="h-5 w-5 rounded-full border border-dashed border-white/20" />
}

/** Illustrative engagement window for the home hero: one concept moving through the path to revenue. Decorative, not live data. */
export function PortalPreview() {
  return (
    <div className="pp-stage relative mx-auto w-full max-w-[560px]" role="img" aria-label="Illustration of an execom engagement tracking a concept from validation to first revenue">
      <div className="s-glow -inset-x-10 top-6 h-[70%] bg-[rgba(25,94,142,0.55)]" aria-hidden />
      <div className="s-glow -left-8 bottom-0 h-40 w-64 bg-[rgba(80,196,210,0.16)]" aria-hidden />

      <div className="pp-window s-edge relative overflow-hidden" aria-hidden>
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="mx-auto flex h-6 items-center rounded-md bg-white/[0.04] px-3 s-mono text-[10.5px] text-fog">
            portal.execom.ca/matters
          </div>
          <span className="s-tag">Example</span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="s-mono text-[10px] uppercase tracking-[0.16em] text-fog">Engagement 0142</p>
              <p className="mt-1.5 text-[1.05rem] font-semibold tracking-[-0.01em] text-snow">Concept to market</p>
              <p className="text-[12.5px] text-fog">Example Product Co.</p>
            </div>
            <div className="text-right">
              <p className="s-mono text-[1.35rem] leading-none text-snow">4/6</p>
              <p className="mt-1 text-[11px] text-fog">stages complete</p>
            </div>
          </div>

          <div className="pp-bar mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <i />
          </div>

          <ul className="mt-5 grid gap-1.5">
            {ROWS.map((r, i) => (
              <li
                key={r.label}
                className="pp-row flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                style={{ ["--i" as string]: i }}
              >
                <StatusDot state={r.state} />
                <span className={`text-[13px] ${r.state === "queued" ? "text-fog" : "text-snow/90"}`}>{r.label}</span>
                <span
                  className={`ml-auto shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 s-mono text-[10px] uppercase tracking-[0.1em] ${
                    r.state === "done"
                      ? "bg-cyan-500/10 text-cyan-300"
                      : r.state === "active"
                        ? "bg-[#FFC342]/10 text-[#FFD98A]"
                        : "bg-white/[0.05] text-fog"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] pt-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-navy-400 to-cyan-600 text-[11px] font-semibold text-white">
              ex
            </span>
            <p className="text-[12.5px] leading-snug text-haze">
              <span className="text-snow">One accountable team</span> from first sketch to first revenue
            </p>
          </div>
        </div>
      </div>

      {/* Floating chip */}
      <div className="pp-row absolute -bottom-16 left-6 hidden sm:block lg:-left-8" style={{ ["--i" as string]: 8 }} aria-hidden>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850/90 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_2px_rgba(80,196,210,0.6)]" />
          <span className="text-[12.5px] leading-snug text-snow/90">
            One engagement, one record system
            <br />
            <span className="text-fog">instead of 4–7 separate firms</span>
          </span>
        </div>
      </div>
    </div>
  )
}
