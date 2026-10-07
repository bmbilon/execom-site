export const T_RUN = 7.4
export const T_BURST = 1.3
export const T_CYCLE = T_RUN + T_BURST
const REVEAL_START = T_CYCLE - 0.1
const REVEAL_END = T_CYCLE + 1
const COLLAPSE_START = REVEAL_END + 1.3
export const T_END = COLLAPSE_START + 2.6

const ease = (start: number, end: number, time: number) => {
  const t = Math.min(1, Math.max(0, (time - start) / (end - start)))
  return t * t * (3 - 2 * t)
}

/** Canvas light and SVG faces share one clock, including after a hidden tab resumes. */
export function corridorFinale(time: number) {
  const collapse = ease(COLLAPSE_START, T_END, time)
  const backlit = ease(0.28, 0.92, collapse)
  return {
    phase: time >= T_END ? "settled"
      : time >= COLLAPSE_START ? "collapse"
      : time >= REVEAL_END ? "hold"
      : time >= REVEAL_START ? "reveal"
      : time >= T_RUN ? "burst" : "run",
    collapse,
    backlit,
    flat: ease(REVEAL_START, REVEAL_END, time) * (1 - backlit),
    nova: ease(T_CYCLE - 0.35, T_CYCLE + 0.25, time) * (1 - ease(0.75, 1, collapse)),
  }
}

export type CorridorFinale = ReturnType<typeof corridorFinale>
