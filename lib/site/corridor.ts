// Launch corridor: the home hero animation.
// A concept accelerates down a conduit of light through five stage gates and
// breaks out at cash flow. Plain canvas 2D, no dependencies, so it can run
// outside React as well.

export type CorridorOptions = {
  stages: string[]
  /** Vanishing point as a fraction of the canvas, per layout. */
  focus: (width: number, height: number) => { x: number; y: number; r1: number }
  /** Called when the stage ahead changes. `stages.length` means the breakout. */
  onStage?: (index: number) => void
  /** Draw one still frame and stop (prefers-reduced-motion). */
  still?: boolean
  fontFamily?: string
}

const T_RUN = 7.4 // seconds spent accelerating through the gates
const T_BURST = 1.3 // breakout flash
const T_CYCLE = T_RUN + T_BURST
const TAIL = 1.2 // flash decay over the next run
const FAR = 9

/** Camera position in gate units. Accelerates the whole way. */
const progress = (t: number) => 0.25 * t + 0.1786 * (Math.exp(0.42 * t) - 1)
const velocity = (t: number) => 0.25 + 0.075 * Math.exp(0.42 * t)

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}

type Streak = { a: number; rr: number; z: number; w: number }
type Shock = { t0: number; power: number }

export function startCorridor(canvas: HTMLCanvasElement, opts: CorridorOptions): () => void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return () => {}
  const g = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
  const font = opts.fontFamily ?? "ui-monospace, Menlo, monospace"
  const N = opts.stages.length

  let W = 0
  let H = 0
  let dpr = 1
  let raf = 0
  let running = false
  let visible = true
  let disposed = false
  let lastCycle = 0
  let lastStage = -1
  let px = 0 // pointer parallax, eased
  let py = 0
  let tx = 0
  let ty = 0
  const t0 = performance.now() / 1000
  const shocks: Shock[] = []
  const passed = new Array<boolean>(N).fill(false)

  const streaks: Streak[] = []
  const seed = (count: number) => {
    streaks.length = 0
    for (let i = 0; i < count; i++) {
      streaks.push({
        a: Math.random() * Math.PI * 2,
        rr: 0.16 + Math.sqrt(Math.random()) * 3.3,
        z: Math.random() * FAR,
        w: 0.35 + Math.random() * 0.65,
      })
    }
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(1, Math.round(rect.width))
    H = Math.max(1, Math.round(rect.height))
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const target = W < 700 ? 240 : 460
    if (streaks.length !== target) seed(target)
    if (!running) frame()
  }

  function ring(cx: number, cy: number, r: number, alpha: number, spin: number, near: number) {
    // soft halo
    g.strokeStyle = `rgba(80,196,210,${alpha * 0.1})`
    g.lineWidth = 10 + near * 22
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    g.strokeStyle = `rgba(80,196,210,${alpha * 0.22})`
    g.lineWidth = 3.5 + near * 6
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    // core line
    g.strokeStyle = `rgba(189,239,244,${alpha * 0.95})`
    g.lineWidth = 1.1 + near * 1.6
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    // segmented outer band, counter-rotating
    g.strokeStyle = `rgba(139,220,230,${alpha * 0.55})`
    g.lineWidth = 1 + near * 1.2
    for (let k = 0; k < 3; k++) {
      const a0 = spin + (k * Math.PI * 2) / 3
      g.beginPath()
      g.arc(cx, cy, r * 1.085, a0, a0 + 1.15)
      g.stroke()
    }
    g.strokeStyle = `rgba(79,155,208,${alpha * 0.5})`
    for (let k = 0; k < 4; k++) {
      const a0 = -spin * 1.6 + (k * Math.PI) / 2
      g.beginPath()
      g.arc(cx, cy, r * 0.93, a0, a0 + 0.5)
      g.stroke()
    }
    // tick marks on the nearer gates
    if (r > 70) {
      g.strokeStyle = `rgba(189,239,244,${alpha * 0.45})`
      g.lineWidth = 1
      g.beginPath()
      for (let k = 0; k < 48; k++) {
        const a = spin * 0.4 + (k * Math.PI * 2) / 48
        const r0 = r * (k % 4 === 0 ? 1.03 : 1.015)
        g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
        g.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
      }
      g.stroke()
    }
  }

  function glow(cx: number, cy: number, r: number, stops: [number, string][], sx = 1, sy = 1) {
    g.save()
    g.translate(cx, cy)
    g.scale(sx, sy)
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, r)
    for (const [o, c] of stops) grad.addColorStop(o, c)
    g.fillStyle = grad
    g.beginPath()
    g.arc(0, 0, r, 0, Math.PI * 2)
    g.fill()
    g.restore()
  }

  function frame() {
    if (disposed || W === 0) return
    const now = opts.still ? 3.1 : performance.now() / 1000 - t0
    const cycle = Math.floor(now / T_CYCLE)
    const tt = now - cycle * T_CYCLE
    if (cycle !== lastCycle) {
      const span = progress(T_CYCLE) * (cycle - lastCycle)
      for (const s of streaks) s.z -= span
      lastCycle = cycle
      passed.fill(false)
    }
    const cz = progress(tt)
    const v = velocity(tt)
    const bursting = tt > T_RUN
    const burst = bursting ? Math.pow((tt - T_RUN) / T_BURST, 2) : 0
    const tail = opts.still ? 0 : Math.pow(Math.max(0, 1 - tt / TAIL), 2)
    const bloom = Math.max(burst, tail)

    px += (tx - px) * 0.06
    py += (ty - py) * 0.06
    const f = opts.focus(W, H)
    const vx = f.x * W + px * 14
    const vy = f.y * H + py * 10
    const F = f.r1
    const diag = Math.hypot(W, H)
    // nearer things slide further with the pointer
    const par = (d: number) => clamp(1 / d, 0, 6)

    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.globalCompositeOperation = "source-over"
    g.clearRect(0, 0, W, H)
    g.globalCompositeOperation = "lighter"
    g.lineCap = "round"

    const energy = clamp(0.35 + v * 0.3 + bloom * 0.6, 0, 1.6)

    // destination halo
    glow(vx, vy, F * 1.5, [
      [0, `rgba(43,125,184,${0.34 * energy})`],
      [0.35, `rgba(25,94,142,${0.16 * energy})`],
      [1, "rgba(25,94,142,0)"],
    ])

    // conduit rails
    const RAILS = 8
    for (let k = 0; k < RAILS; k++) {
      const a = (k + 0.5) * ((Math.PI * 2) / RAILS) + 0.12
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      const dn = 0.13
      const x0 = vx + (F * cos) / FAR
      const y0 = vy + (F * sin) / FAR
      const x1 = vx + (F * cos) / dn - px * 26 * par(dn)
      const y1 = vy + (F * sin) / dn - py * 18 * par(dn)
      const grad = g.createLinearGradient(x0, y0, x1, y1)
      grad.addColorStop(0, "rgba(80,196,210,0)")
      grad.addColorStop(0.06, `rgba(80,196,210,${0.3 * energy})`)
      grad.addColorStop(0.45, `rgba(79,155,208,${0.1 * energy})`)
      grad.addColorStop(1, "rgba(79,155,208,0)")
      g.strokeStyle = grad
      g.lineWidth = 1.2
      g.beginPath()
      g.moveTo(x0, y0)
      g.lineTo(x1, y1)
      g.stroke()
    }

    // velocity streaks
    const len = 0.02 + v * 0.075 + burst * 0.5
    for (const s of streaks) {
      let d = s.z - cz
      if (d < 0.035) {
        s.z = cz + FAR * (0.62 + Math.random() * 0.38)
        s.a = Math.random() * Math.PI * 2
        s.rr = 0.16 + Math.sqrt(Math.random()) * 3.3
        d = s.z - cz
      }
      if (d > FAR) continue
      const cos = Math.cos(s.a) * s.rr * F
      const sin = Math.sin(s.a) * s.rr * F
      const d2 = d + len
      const ox = px * 26
      const oy = py * 18
      const x1 = vx + cos / d - ox * par(d)
      const y1 = vy + sin / d - oy * par(d)
      if (x1 < -200 || x1 > W + 200 || y1 < -200 || y1 > H + 200) continue
      const x2 = vx + cos / d2 - ox * par(d2)
      const y2 = vy + sin / d2 - oy * par(d2)
      const alpha = smooth(FAR, FAR - 3.5, d) * smooth(0.03, 0.3, d) * s.w * clamp(0.42 + v * 0.32 + burst, 0, 1)
      g.strokeStyle = s.w > 0.82 ? `rgba(237,242,247,${alpha})` : `rgba(139,220,230,${alpha * 0.85})`
      g.lineWidth = clamp(0.5 + 0.75 / d, 0.5, 2.6)
      g.beginPath()
      g.moveTo(x2, y2)
      g.lineTo(x1, y1)
      g.stroke()
    }

    // stage gates, far to near
    let ahead = N
    for (let i = N - 1; i >= 0; i--) {
      const d = i + 1 - cz
      if (d <= 0) {
        if (!passed[i]) {
          passed[i] = true
          if (!opts.still) shocks.push({ t0: now, power: 0.55 + i * 0.12 })
        }
        continue
      }
      ahead = i
      if (d > FAR) continue
      const r = F / d
      const near = clamp(1 - d / 2.4)
      const alpha = smooth(FAR, 5.5, d) * smooth(0.05, 0.3, d) * (0.3 + 0.7 * near)
      const cx = vx - px * 26 * par(d)
      const cy = vy - py * 18 * par(d)
      if (r < diag * 1.3) ring(cx, cy, r, alpha, tt * 0.35 + i * 1.3, near)

      // label
      const la = smooth(3.1, 2.3, d) * smooth(0.42, 0.8, d)
      if (la > 0.01) {
        const size = clamp(10 + 3.2 / d, 10.5, 15)
        g.font = `500 ${size}px ${font}`
        g.letterSpacing = "0.16em"
        const text = `${String(i + 1).padStart(2, "0")}  ${opts.stages[i].toUpperCase()}`
        const tw = g.measureText(text).width
        const ang = -0.6
        let lx = cx + Math.cos(ang) * r * 1.1 + 12
        const ly = cy + Math.sin(ang) * r * 1.1
        lx = Math.min(lx, W - tw - 18)
        g.globalCompositeOperation = "source-over"
        g.fillStyle = `rgba(189,239,244,${la})`
        g.textBaseline = "middle"
        g.fillText(text, lx, ly)
        g.globalCompositeOperation = "lighter"
        g.letterSpacing = "0px"
      }
    }

    // impact rings from each gate crossing
    for (let i = shocks.length - 1; i >= 0; i--) {
      const age = now - shocks[i].t0
      const life = 0.85
      if (age > life) {
        shocks.splice(i, 1)
        continue
      }
      const k = age / life
      const a = Math.pow(1 - k, 2) * shocks[i].power
      g.strokeStyle = `rgba(189,239,244,${a * 0.55})`
      g.lineWidth = 1.5 + (1 - k) * 5
      g.beginPath()
      g.arc(vx, vy, F * 0.35 + k * diag * 0.75, 0, Math.PI * 2)
      g.stroke()
      glow(vx, vy, F * 2.2, [
        [0, `rgba(139,220,230,${a * 0.22 * (1 - k)})`],
        [1, "rgba(139,220,230,0)"],
      ])
    }

    // destination core and cross flare
    const core = 0.55 + v * 0.22 + bloom * 1.2
    glow(vx, vy, F * 0.22 * (1 + bloom * 1.6), [
      [0, `rgba(255,255,255,${clamp(0.95 * core)})`],
      [0.18, `rgba(189,239,244,${clamp(0.6 * core)})`],
      [0.5, `rgba(80,196,210,${clamp(0.2 * core)})`],
      [1, "rgba(80,196,210,0)"],
    ])
    glow(vx, vy, F * (0.9 + bloom * 1.6), [
      [0, `rgba(189,239,244,${clamp(0.5 * core)})`],
      [0.3, `rgba(80,196,210,${clamp(0.14 * core)})`],
      [1, "rgba(80,196,210,0)"],
    ], 1, 0.022)
    glow(vx, vy, F * (0.5 + bloom * 2.4), [
      [0, `rgba(237,242,247,${clamp(0.32 * core)})`],
      [0.3, `rgba(139,220,230,${clamp(0.1 * core)})`],
      [1, "rgba(139,220,230,0)"],
    ], 0.016, 1)

    // breakout
    if (bloom > 0.004) {
      glow(vx, vy, diag * (0.35 + bloom * 0.75), [
        [0, `rgba(255,255,255,${clamp(bloom * 0.95)})`],
        [0.22, `rgba(189,239,244,${clamp(bloom * 0.46)})`],
        [0.6, `rgba(43,125,184,${clamp(bloom * 0.15)})`],
        [1, "rgba(25,94,142,0)"],
      ])
    }

    const stage = bursting ? N : Math.min(ahead, N)
    if (stage !== lastStage) {
      lastStage = stage
      opts.onStage?.(stage)
    }

    if (running) raf = requestAnimationFrame(frame)
  }

  const sync = () => {
    const should = !opts.still && visible && !document.hidden && !disposed
    if (should && !running) {
      running = true
      raf = requestAnimationFrame(frame)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(raf)
    }
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return
    tx = (e.clientX / window.innerWidth) * 2 - 1
    ty = (e.clientY / window.innerHeight) * 2 - 1
  }

  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting)
      sync()
    },
    { threshold: 0.01 },
  )
  io.observe(canvas)
  document.addEventListener("visibilitychange", sync)
  window.addEventListener("pointermove", onMove, { passive: true })
  resize()
  sync()

  return () => {
    disposed = true
    running = false
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    document.removeEventListener("visibilitychange", sync)
    window.removeEventListener("pointermove", onMove)
  }
}
