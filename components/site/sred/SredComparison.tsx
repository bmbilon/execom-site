import { Check, Minus } from "lucide-react"

const ROWS: { label: string; theirs: string; ours: string }[] = [
  { label: "Fee", theirs: "15–30% of the credit recovered", ours: "5% of the credit" },
  { label: "Who prepares it", theirs: "Consultants translate your technical work", ours: "Your team, guided step by step in the portal" },
  { label: "Time", theirs: "Weeks of back-and-forth", ours: "A few hours, by the people who did the work" },
  { label: "What you keep", theirs: "70–85% of the credit", ours: "95% of the credit" },
]

export function SredComparison() {
  return (
    <div className="grid overflow-hidden rounded-[18px] border border-white/[0.08] md:grid-cols-2">
      <div className="bg-white/[0.015] p-6 md:p-7">
        <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Traditional consulting model</p>
        <ul className="mt-5 grid gap-4">
          {ROWS.map((r) => (
            <li key={r.label} className="grid grid-cols-[18px_1fr] gap-3">
              <Minus className="mt-[3px] h-4 w-4 text-fog" aria-hidden />
              <span>
                <span className="block text-[12px] text-fog">{r.label}</span>
                <span className="text-[14.5px] leading-snug text-haze">{r.theirs}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(80,196,210,0.09),rgba(80,196,210,0.02))] p-6 md:border-l md:border-t-0 md:p-7">
        <p className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-cyan-300">
          <span className="normal-case">execom</span> portal
        </p>
        <ul className="mt-5 grid gap-4">
          {ROWS.map((r) => (
            <li key={r.label} className="grid grid-cols-[18px_1fr] gap-3">
              <Check className="mt-[3px] h-4 w-4 text-cyan-300" strokeWidth={2.25} aria-hidden />
              <span>
                <span className="block text-[12px] text-fog">{r.label}</span>
                <span className="text-[14.5px] leading-snug text-snow">{r.ours}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
