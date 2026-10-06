"use client"

import { useEffect, useRef } from "react"
import { startCorridor } from "@/lib/site/corridor"

const STAGES = ["Validate", "Structure", "Build", "Launch", "Sell"]

/**
 * Home hero visual: a concept accelerating through the five stage gates to
 * cash flow. Fills its parent. Decorative; the stages are also in the copy.
 */
export function LaunchCorridor({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const kickerRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const mono = getComputedStyle(canvas).getPropertyValue("--font-jbmono").trim()
    return startCorridor(canvas, {
      stages: STAGES,
      still,
      fontFamily: mono ? `${mono}, ui-monospace, monospace` : undefined,
      focus: (w, h) =>
        w >= 1024 ? { x: 0.715, y: 0.5, r1: Math.min(h * 0.52, w * 0.3) } : { x: 0.5, y: 0.46, r1: Math.min(h * 0.6, w * 0.56) },
      onStage: (i) => {
        const done = i >= STAGES.length
        if (kickerRef.current) kickerRef.current.textContent = done ? "Breakout" : `Stage ${String(i + 1).padStart(2, "0")} / 05`
        if (nameRef.current) nameRef.current.textContent = done ? "Cash flow" : STAGES[i]
        barRef.current?.querySelectorAll("i").forEach((seg, k) => {
          seg.setAttribute("data-on", done || k <= i ? "true" : "false")
        })
      },
    })
  }, [])

  return (
    <div
      className={`lc ${className}`}
      role="img"
      aria-label="Animation of a concept accelerating through five stage gates, validate, structure, build, launch and sell, to cash flow"
    >
      <canvas ref={canvasRef} className="lc-canvas" aria-hidden />
      <div className="lc-hud" aria-hidden>
        <span ref={kickerRef} className="s-mono text-[10.5px] uppercase tracking-[0.16em] text-cyan-200">
          Stage 01 / 05
        </span>
        <span ref={nameRef} className="text-[15px] font-semibold tracking-[-0.01em] text-snow">
          Validate
        </span>
        <div ref={barRef} className="lc-bar">
          {STAGES.map((s, k) => (
            <i key={s} data-on={k === 0 ? "true" : "false"} />
          ))}
        </div>
      </div>
    </div>
  )
}
