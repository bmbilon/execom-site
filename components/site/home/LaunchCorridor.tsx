"use client"

import { useEffect, useRef } from "react"
import { startCorridor } from "@/lib/site/corridor"
import { BacklitLogo, NovaLogo } from "./BacklitLogo"

const STAGES = ["Validate", "Structure", "Build", "Launch", "Sell"]
const END = "Cash flow"

/**
 * Home hero visual: a concept accelerating through the five stage gates to
 * cash flow. Each gate it crosses flies down and lands in the row along the
 * bottom. It plays once: the flat cyan logo appears on the expanded nova,
 * then the light contracts into the final backlit logo. Fills its parent.
 */
export function LaunchCorridor({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rowRef = useRef<HTMLOListElement>(null)
  const finaleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const mono = getComputedStyle(canvas).getPropertyValue("--font-jbmono").trim()
    return startCorridor(canvas, {
      stages: STAGES,
      still,
      once: true,
      veilLeft: true,
      fontFamily: mono ? `${mono}, ui-monospace, monospace` : undefined,
      focus: (w, h) =>
        w >= 1024
          ? { x: 0.715, y: 0.38, r1: Math.min(h * 0.62, w * 0.36) }
          : { x: 0.5, y: 0.33, r1: Math.min(h * 0.68, w * 0.64) },
      slots: () => {
        const box = canvas.getBoundingClientRect()
        return Array.from(rowRef.current?.querySelectorAll<HTMLElement>(".lc-dot") ?? []).map((dot) => {
          const r = dot.getBoundingClientRect()
          return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
        })
      },
      onLand: (i) => rowRef.current?.children[i]?.setAttribute("data-on", "true"),
      onFinaleFrame: ({ phase, collapse, flat, backlit }) => {
        const finale = finaleRef.current
        if (!finale) return
        if (finale.dataset.phase !== phase) finale.dataset.phase = phase
        finale.style.setProperty("--lc-flat", String(flat))
        finale.style.setProperty("--lc-backlit", String(backlit))
        finale.style.setProperty("--lc-scale", String(0.5 + collapse * 0.5))
        // Start centered on the whole logo, then align the star with the focus.
        finale.style.setProperty("--lc-anchor-x", `${50 + 5.41 * collapse}%`)
        finale.style.setProperty("--lc-anchor-y", `${50 - 14.01 * collapse}%`)
      },
    })
  }, [])

  return (
    <div
      className={`lc ${className}`}
      role="img"
      aria-label="Animation of a concept accelerating through five stage gates, validate, structure, build, launch and sell, to cash flow, ending on the execom logo"
    >
      <canvas ref={canvasRef} className="lc-canvas" aria-hidden />
      <div ref={finaleRef} className="lc-finale" data-phase="run" aria-hidden>
        <NovaLogo className="lc-logo lc-logo-flat" />
        <BacklitLogo className="lc-logo lc-logo-backlit" />
      </div>
      <ol ref={rowRef} className="lc-row" aria-hidden>
        {STAGES.map((s, k) => (
          <li key={s} data-on="false">
            <span className="lc-dot" />
            <span className="lc-item">
              <span className="lc-num">{String(k + 1).padStart(2, "0")}</span>
              <span className="lc-name">{s}</span>
            </span>
          </li>
        ))}
        <li className="lc-end" data-on="false">
          <span className="lc-dot" />
          <span className="lc-item">
            <span className="lc-num">Result</span>
            <span className="lc-name">{END}</span>
          </span>
        </li>
      </ol>
    </div>
  )
}
