"use client"

import { useId, useState } from "react"

const fmt = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })

const MIN = 25_000
const MAX = 1_000_000
const STEP = 5_000

/**
 * Fee comparison on a credit the visitor chooses. Uses only the published
 * rates: typical consultant contingency fees of 15–30% and execom's 5%.
 */
export function SredFeeEstimator() {
  const [credit, setCredit] = useState(150_000)
  const id = useId()
  const lo = credit * 0.15
  const hi = credit * 0.3
  const ours = credit * 0.05
  const pct = ((credit - MIN) / (MAX - MIN)) * 100

  return (
    <div className="s-edge relative overflow-hidden p-7 md:p-8">
      <div className="s-glow right-[-60px] top-[-80px] h-[200px] w-[300px] bg-[rgba(25,94,142,0.45)]" aria-hidden />
      <div className="relative">
        <p className="s-eyebrow">Fee on your credit</p>

        <label htmlFor={id} className="mt-6 block text-[13.5px] text-haze">
          Expected SR&amp;ED credit
        </label>
        <p className="mt-1 font-display text-[2.6rem] leading-none tracking-[-0.02em] text-snow s-num" aria-live="polite">
          {fmt(credit)}
        </p>
        <input
          id={id}
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={credit}
          onChange={(e) => setCredit(Number(e.target.value))}
          className="s-range mt-5 w-full"
          style={{ ["--pct" as string]: `${pct}%` }}
          aria-valuetext={fmt(credit)}
        />
        <div className="mt-1.5 flex justify-between s-mono text-[10.5px] text-fog">
          <span>{fmt(MIN)}</span>
          <span>{fmt(MAX)}</span>
        </div>

        <dl className="mt-7 grid gap-4">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13.5px] text-haze">Typical consultant, 15–30%</dt>
              <dd className="s-num text-[15px] font-semibold text-snow">
                {fmt(lo)}–{fmt(hi)}
              </dd>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
              <div className="relative h-full" style={{ marginLeft: "50%", width: "50%" }}>
                <div className="h-full rounded-full bg-gradient-to-r from-[#F87171]/50 to-[#F87171]/80" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13.5px] text-haze">execom, 5%</dt>
              <dd className="s-num text-[15px] font-semibold text-cyan-200">{fmt(ours)}</dd>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-navy-400 to-cyan-400 shadow-[0_0_10px_rgba(80,196,210,0.5)]" style={{ width: "16.6%" }} />
            </div>
          </div>
        </dl>

        <div className="mt-7 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.07] px-4 py-3.5">
          <p className="text-[13px] text-haze">You keep</p>
          <p className="s-num text-[1.35rem] font-semibold tracking-[-0.01em] text-snow">
            {fmt(lo - ours)}–{fmt(hi - ours)} more
          </p>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-fog">
          Illustrative. Consultant range reflects typical contingency fees of 15–30% of the credit recovered.
        </p>
      </div>
    </div>
  )
}
