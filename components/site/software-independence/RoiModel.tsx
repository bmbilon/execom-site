"use client"

import { useId, useMemo, useState } from "react"
import { ArrowRight, RotateCcw } from "lucide-react"
import {
  PAYBACK_BAR_MONTHS,
  RATIO_BAR,
  RATIO_STRONG,
  ROI_DEFAULTS,
  STRESS_FACTOR,
  computeRoi,
  type RoiInputs,
} from "@/lib/site/softwareIndependence"
import { PUBLIC_EMAIL as EMAIL } from "@/lib/site/contact"

const usd = (n: number) => {
  const s = Math.abs(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
  return n < 0 ? `−${s}` : s
}
const pct = (n: number) => `${Math.round(n * 100)}%`

function payback(months: number) {
  if (!Number.isFinite(months)) return "Never"
  if (months > 120) return "10+ years"
  return `${months < 10 ? months.toFixed(1) : Math.round(months)} months`
}

function ratioText(r: number) {
  return Number.isFinite(r) ? `${r.toFixed(2)}×` : "n/a"
}

type SliderProps = {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  step: number
  format: (n: number) => string
  onChange: (n: number) => void
}

function Slider({ label, hint, value, min, max, step, format, onChange }: SliderProps) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13.5px] text-haze">
          {label}
        </label>
        <span className="s-num text-[15px] font-semibold text-snow">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="s-range mt-3 w-full"
        style={{ ["--pct" as string]: `${fill}%` }}
        aria-valuetext={format(value)}
      />
      <div className="mt-1.5 flex justify-between gap-3 s-mono text-[10.5px] text-fog">
        <span>{format(min)}</span>
        {hint && <span className="hidden truncate text-center sm:inline">{hint}</span>}
        <span>{format(max)}</span>
      </div>
      {hint && <p className="mt-1 text-[11.5px] leading-snug text-fog sm:hidden">{hint}</p>}
    </div>
  )
}

const VERDICT = {
  replace: {
    tag: "Clears the bar",
    title: "A replacement case worth proving.",
    text: `Benefit-to-cost above ${RATIO_BAR.toFixed(1)} and payback inside ${PAYBACK_BAR_MONTHS} months. The Blueprint tests it against real usage and invoices.`,
  },
  marginal: {
    tag: "Marginal",
    title: "Renegotiate or consolidate first.",
    text: `Below execom's bar of ${RATIO_BAR.toFixed(1)} and ${PAYBACK_BAR_MONTHS} months. Usage evidence and a priced alternative still strengthen the renewal.`,
  },
  keep: {
    tag: "Keep renting",
    title: "Owning costs more at these numbers.",
    text: "The answer here is the renewal, not a rebuild. A Blueprint would aim at seats, add-ons and terms.",
  },
} as const

/**
 * Three-year rent-versus-own model. Uses the decision rule from the offer
 * brief: proceed when the conservative ratio is above 2.0 and payback is under
 * 18 months. Opens on the brief's illustrative case.
 */
export function RoiModel() {
  const [v, setV] = useState<RoiInputs>(ROI_DEFAULTS)
  const r = useMemo(() => computeRoi(v), [v])
  const set = <K extends keyof RoiInputs>(key: K) => (value: RoiInputs[K]) => setV((prev) => ({ ...prev, [key]: value }))
  const verdict = VERDICT[r.verdict]
  const barMax = Math.max(r.rentThreeYears, r.ownThreeYears, 1)
  const isDefault = JSON.stringify(v) === JSON.stringify(ROI_DEFAULTS)

  const mail = useMemo(() => {
    const lines = [
      "Our renewal, as modelled on execom.ca:",
      "",
      `Platform licences and add-ons: ${usd(v.platform)} a year`,
      `Admin, integrator and consultant spend: ${usd(v.admin)} a year`,
      `Share the replacement retires: ${pct(v.retired)}`,
      `Build and migration: ${usd(v.build)}`,
      `Cost to own: ${usd(v.own)} a year`,
      `Stress test: ${v.stress ? "on (+30%)" : "off"}`,
      "",
      `Three-year net: ${usd(r.threeYearNet)}`,
      `Payback: ${payback(r.paybackMonths)}`,
      `Benefit-to-cost: ${ratioText(r.ratio)}`,
      "",
      "Platform:",
      "Renewal date:",
    ]
    return `mailto:${EMAIL}?subject=${encodeURIComponent("Software independence: renewal model")}&body=${encodeURIComponent(lines.join("\n"))}`
  }, [v, r])

  return (
    <div className="s-edge relative overflow-hidden" data-reveal>
      <div className="s-glow right-[-80px] top-[-100px] h-[260px] w-[420px] bg-[rgba(25,94,142,0.4)]" aria-hidden />
      <div className="relative grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Inputs */}
        <div className="p-6 md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="s-eyebrow">Your platform</p>
            <div className="s-seg" role="group" aria-label="Scenario">
              <button type="button" aria-pressed={!v.stress} onClick={() => set("stress")(false)}>
                Base case
              </button>
              <button type="button" aria-pressed={v.stress} onClick={() => set("stress")(true)}>
                Stress test
                <span className="s-mono ml-2 text-[10.5px] tracking-[0.08em] text-fog">+{Math.round((STRESS_FACTOR - 1) * 100)}%</span>
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-7">
            <Slider
              label="Licences and add-ons, per year"
              value={v.platform}
              min={50_000}
              max={2_000_000}
              step={10_000}
              format={usd}
              onChange={set("platform")}
            />
            <Slider
              label="Admin, integrator and consultant spend, per year"
              value={v.admin}
              min={0}
              max={500_000}
              step={5_000}
              format={usd}
              onChange={set("admin")}
            />
            <Slider
              label="Share of that spend the replacement retires"
              value={v.retired}
              min={0.25}
              max={1}
              step={0.05}
              format={pct}
              onChange={set("retired")}
            />
            <Slider
              label="Build and migration, one time"
              hint="Co-Build $85k–$175k · Managed $200k–$500k"
              value={v.build}
              min={25_000}
              max={1_500_000}
              step={5_000}
              format={usd}
              onChange={set("build")}
            />
            <Slider
              label="Cost to own: hosting, AI usage, support, maintenance, per year"
              hint="Managed operation $180k–$480k a year"
              value={v.own}
              min={0}
              max={800_000}
              step={5_000}
              format={usd}
              onChange={set("own")}
            />
          </div>

          <button
            type="button"
            onClick={() => setV(ROI_DEFAULTS)}
            disabled={isDefault}
            className="s-link mt-8 text-[13px] disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset to the illustrative case
          </button>
        </div>

        {/* Results */}
        <div className="border-t border-white/[0.07] bg-[linear-gradient(180deg,rgba(25,94,142,0.14),rgba(7,17,27,0)_80%)] p-6 md:p-9 lg:border-l lg:border-t-0">
          <div aria-live="polite">
            <span className={`s-tag ${r.verdict === "replace" ? "s-tag-cyan" : ""}`}>{verdict.tag}</span>
            <p className="mt-4 text-[1.15rem] font-semibold tracking-[-0.01em] text-snow">{verdict.title}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-haze">{verdict.text}</p>
          </div>

          <div className="mt-7 border-t border-white/[0.07] pt-6">
            <p className="text-[13px] text-haze">Three-year net</p>
            <p
              className={`s-num mt-1 font-display text-[2.6rem] leading-none tracking-[-0.02em] ${r.threeYearNet >= 0 ? "text-snow" : "text-haze"}`}
            >
              {usd(r.threeYearNet)}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5">
            <div>
              <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Year one</dt>
              <dd className="s-num mt-1.5 text-[15px] font-semibold text-snow">{usd(r.yearOneNet)}</dd>
            </div>
            <div>
              <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Each year after</dt>
              <dd className="s-num mt-1.5 text-[15px] font-semibold text-snow">{usd(r.ongoingNet)}</dd>
            </div>
            <div>
              <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Payback</dt>
              <dd className="s-num mt-1.5 text-[15px] font-semibold text-snow">{payback(r.paybackMonths)}</dd>
            </div>
            <div>
              <dt className="s-mono text-[10.5px] uppercase tracking-[0.14em] text-fog">Benefit to cost</dt>
              <dd className="s-num mt-1.5 text-[15px] font-semibold text-snow">
                {ratioText(r.ratio)}
                {r.ratio >= RATIO_STRONG && <span className="ml-2 text-[11.5px] font-normal text-cyan-200">mission-critical bar</span>}
              </dd>
            </div>
          </dl>

          <div className="mt-7 grid gap-4">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-haze">Keep renting, 3 years</span>
                <span className="s-num text-[13.5px] font-semibold text-snow">{usd(r.rentThreeYears)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-white/25 to-white/45 transition-[width] duration-300"
                  style={{ width: `${(r.rentThreeYears / barMax) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] text-haze">Own it, 3 years</span>
                <span className="s-num text-[13.5px] font-semibold text-cyan-200">{usd(r.ownThreeYears)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-navy-400 to-cyan-400 shadow-[0_0_10px_rgba(80,196,210,0.5)] transition-[width] duration-300"
                  style={{ width: `${(r.ownThreeYears / barMax) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <a href={mail} className="s-btn s-btn-glass mt-8 w-full">
            Send these numbers to execom
            <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
          </a>
          <p className="mt-4 text-[12px] leading-relaxed text-fog">
            Illustrative, before tax, in USD. Counts only savings that trace to cancelled or reduced invoices and excludes
            productivity gains. Owning includes any spend left on the incumbent. A real decision also needs the security and
            operational-risk review.
          </p>
        </div>
      </div>
    </div>
  )
}
