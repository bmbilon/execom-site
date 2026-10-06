// Launch corridor: the home hero animation.
// A concept accelerates down a conduit of light through five stage gates and
// breaks out at cash flow. Each gate it crosses collapses into a ring that
// flies to its slot in a list supplied by the host (`slots`, `onLand`). With
// `once`, the breakout clears to a quiet backdrop and the canvas stops, so the
// host can bring in its own finale (`onFinale`). Plain canvas 2D, no
// dependencies, so it can run outside React as well.

export type CorridorOptions = {
  stages: string[]
  /** Vanishing point as a fraction of the canvas, per layout. */
  focus: (width: number, height: number) => { x: number; y: number; r1: number }
  /** Called when the stage ahead changes. `stages.length` means the breakout. */
  onStage?: (index: number) => void
  /** Draw one still frame and stop (prefers-reduced-motion). With `once`, that frame is the finale. */
  still?: boolean
  /** Play a single run, then clear to a quiet backdrop and stop instead of looping. */
  once?: boolean
  /** Fired once as the breakout starts to settle. The cue to bring in the logo. */
  onFinale?: () => void
  /**
   * Landing points in canvas CSS pixels, one per stage, plus an optional extra
   * one for the breakout. Each crossed gate flies to its point.
   */
  slots?: () => { x: number; y: number }[]
  /** Fired when a stage (or the breakout, index `stages.length`) lands on its slot. */
  onLand?: (index: number) => void
  /** Dim the left side of wide canvases so copy laid over it stays readable. */
  veilLeft?: boolean
  fontFamily?: string
}

const T_RUN = 7.4 // seconds spent accelerating through the gates
const T_BURST = 1.3 // breakout flash
const T_CYCLE = T_RUN + T_BURST
const TAIL = 1.2 // flash decay over the next run
const T_SETTLE = 2.6 // breakout settling into the still core (once mode)
const T_END = T_CYCLE + T_SETTLE
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
type Lander = { i: number; t0: number; x: number; y: number }
type Impact = { t0: number; x: number; y: number }

const LAND = 0.85 // seconds for a gate to fly to its slot

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
  let finaleSent = false
  let stillSent = false
  let finished = false
  let px = 0 // pointer parallax, eased
  let py = 0
  let tx = 0
  let ty = 0
  const t0 = performance.now() / 1000
  const shocks: Shock[] = []
  const landers: Lander[] = []
  const impacts: Impact[] = []

  const land = (i: number, at: number) => {
    const slot = opts.slots?.()[i]
    if (!slot) {
      opts.onLand?.(i)
      return
    }
    landers.push({ i, t0: at, x: slot.x, y: slot.y })
  }
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
    g.strokeStyle = `rgba(80,196,210,${alpha * 0.13})`
    g.lineWidth = 16 + near * 38
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    g.strokeStyle = `rgba(80,196,210,${alpha * 0.3})`
    g.lineWidth = 5 + near * 11
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    // core line
    g.strokeStyle = `rgba(214,246,250,${alpha})`
    g.lineWidth = 1.6 + near * 3.2
    g.beginPath()
    g.arc(cx, cy, r, 0, Math.PI * 2)
    g.stroke()
    // segmented outer band, counter-rotating
    g.strokeStyle = `rgba(139,220,230,${alpha * 0.7})`
    g.lineWidth = 1.4 + near * 2.4
    for (let k = 0; k < 3; k++) {
      const a0 = spin + (k * Math.PI * 2) / 3
      g.beginPath()
      g.arc(cx, cy, r * 1.1, a0, a0 + 1.15)
      g.stroke()
    }
    g.strokeStyle = `rgba(79,155,208,${alpha * 0.65})`
    g.lineWidth = 1.2 + near * 1.8
    for (let k = 0; k < 4; k++) {
      const a0 = -spin * 1.6 + (k * Math.PI) / 2
      g.beginPath()
      g.arc(cx, cy, r * 0.92, a0, a0 + 0.5)
      g.stroke()
    }
    // tick marks on the nearer gates
    if (r > 70) {
      g.strokeStyle = `rgba(189,239,244,${alpha * 0.55})`
      g.lineWidth = 1.2
      g.beginPath()
      for (let k = 0; k < 48; k++) {
        const a = spin * 0.4 + (k * Math.PI * 2) / 48
        const r0 = r * (k % 4 === 0 ? 1.04 : 1.02)
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
    const real = performance.now() / 1000 - t0
    const now = opts.once ? (opts.still ? T_END : Math.min(real, T_END)) : opts.still ? 3.1 : real
    const cycle = opts.once ? 0 : Math.floor(now / T_CYCLE)
    const tt = now - cycle * T_CYCLE
    // 0 during the run, rising to 1 as the breakout settles (once mode only)
    const settle = opts.once ? clamp((tt - T_CYCLE) / T_SETTLE) : 0
    const scene = 1 - smooth(0, 0.6, settle)
    const rest = smooth(0.1, 1, settle)
    if (cycle !== lastCycle) {
      const span = progress(T_CYCLE) * (cycle - lastCycle)
      for (const s of streaks) s.z -= span
      lastCycle = cycle
      passed.fill(false)
    }
    const cz = progress(tt)
    const v = velocity(tt)
    const bursting = tt > T_RUN
    const burst = bursting ? Math.pow(clamp((tt - T_RUN) / T_BURST), 2) * Math.pow(1 - settle, 2.2) : 0
    const tail = opts.still ? 0 : Math.pow(Math.max(0, 1 - tt / TAIL), 2)
    const bloom = Math.max(burst, tail)

    px += (tx - px) * 0.06
    py += (ty - py) * 0.06
    const f = opts.focus(W, H)
    // parallax eases out with the scene so the still core lands dead on the focus
    const pxs = px * scene
    const pys = py * scene
    const vx = f.x * W + pxs * 14
    const vy = f.y * H + pys * 10
    const F = f.r1
    const diag = Math.hypot(W, H)
    // nearer things slide further with the pointer
    const par = (d: number) => clamp(1 / d, 0, 6)

    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.globalCompositeOperation = "source-over"
    g.clearRect(0, 0, W, H)
    g.globalCompositeOperation = "lighter"
    g.lineCap = "round"

    const energy = clamp(0.35 + v * 0.3 + bloom * 0.6, 0, 1.6) * (0.55 + 0.45 * scene)

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
      const x1 = vx + (F * cos) / dn - pxs * 26 * par(dn)
      const y1 = vy + (F * sin) / dn - pys * 18 * par(dn)
      const grad = g.createLinearGradient(x0, y0, x1, y1)
      grad.addColorStop(0, "rgba(80,196,210,0)")
      grad.addColorStop(0.06, `rgba(80,196,210,${0.3 * energy * scene})`)
      grad.addColorStop(0.45, `rgba(79,155,208,${0.1 * energy * scene})`)
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
      const ox = pxs * 26
      const oy = pys * 18
      const x1 = vx + cos / d - ox * par(d)
      const y1 = vy + sin / d - oy * par(d)
      if (x1 < -200 || x1 > W + 200 || y1 < -200 || y1 > H + 200) continue
      const x2 = vx + cos / d2 - ox * par(d2)
      const y2 = vy + sin / d2 - oy * par(d2)
      const alpha = smooth(FAR, FAR - 3.5, d) * smooth(0.03, 0.3, d) * s.w * clamp(0.42 + v * 0.32 + burst, 0, 1) * scene
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
          if (!opts.still) {
            shocks.push({ t0: now, power: 0.7 + i * 0.14 })
            land(i, real)
          }
        }
        continue
      }
      ahead = i
      if (d > FAR) continue
      const r = F / d
      const near = clamp(1 - d / 2.4)
      const alpha = smooth(FAR, 5.5, d) * smooth(0.05, 0.3, d) * (0.42 + 0.58 * near)
      const cx = vx - pxs * 26 * par(d)
      const cy = vy - pys * 18 * par(d)
      if (r < diag * 1.3) ring(cx, cy, r, alpha, tt * 0.35 + i * 1.3, near)

      // label
      const la = smooth(3.1, 2.3, d) * smooth(0.42, 0.8, d)
      if (la > 0.01) {
        const size = clamp(11 + 7.5 / d, 12, W < 700 ? 17 : 24)
        g.font = `600 ${size}px ${font}`
        g.letterSpacing = "0.14em"
        const text = `${String(i + 1).padStart(2, "0")}  ${opts.stages[i].toUpperCase()}`
        const tw = g.measureText(text).width
        const ang = -0.6
        let lx = cx + Math.cos(ang) * r * 1.13 + 14
        // a label that would slide under the header fades out instead of piling up there
        const top = W >= 1024 ? 104 : 26
        const rawY = cy + Math.sin(ang) * r * 1.13
        const ly = Math.max(rawY, top)
        lx = Math.min(lx, W - tw - 18)
        g.globalCompositeOperation = "source-over"
        g.fillStyle = `rgba(237,250,252,${la * smooth(top - 46, top, rawY)})`
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
      const a = Math.pow(1 - k, 2) * shocks[i].power * scene
      g.strokeStyle = `rgba(214,246,250,${clamp(a * 0.7)})`
      g.lineWidth = 2 + (1 - k) * 9
      g.beginPath()
      g.arc(vx, vy, F * 0.35 + k * diag * 0.75, 0, Math.PI * 2)
      g.stroke()
      glow(vx, vy, F * 2.2, [
        [0, `rgba(139,220,230,${clamp(a * 0.3 * (1 - k))})`],
        [1, "rgba(139,220,230,0)"],
      ])
    }

    // destination core and cross flare. In once mode they fade out as the
    // scene settles, handing the light over to the host's finale.
    const mix = (a: number, b: number) => a + (b - a) * rest
    const out = 1 - rest * rest
    const core = (0.55 + v * 0.22 + bloom * 1.2) * out
    const coreR = mix(F * 0.22 * (1 + bloom * 1.6), F * 0.05)
    glow(vx, vy, coreR, [
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

    // keep copy on the left readable: fade what is drawn so far, then put the
    // landing rings on top at full strength
    if (opts.veilLeft && W >= 1024) {
      const veil = g.createLinearGradient(0, 0, W, 0)
      veil.addColorStop(0, "rgba(0,0,0,0.16)")
      veil.addColorStop(0.3, "rgba(0,0,0,0.3)")
      veil.addColorStop(0.52, "rgba(0,0,0,1)")
      g.globalCompositeOperation = "destination-in"
      g.fillStyle = veil
      g.fillRect(0, 0, W, H)
      g.globalCompositeOperation = "lighter"
    }

    // crossed gates collapsing onto their slots
    for (let n = landers.length - 1; n >= 0; n--) {
      const l = landers[n]
      const k = (real - l.t0) / LAND
      if (k >= 1) {
        landers.splice(n, 1)
        impacts.push({ t0: real, x: l.x, y: l.y })
        opts.onLand?.(l.i)
        continue
      }
      for (let j = 5; j >= 0; j--) {
        const kk = k - j * 0.045
        if (kk < 0) continue
        const e = kk < 0.5 ? 4 * kk * kk * kk : 1 - Math.pow(-2 * kk + 2, 3) / 2
        const x = vx + (l.x - vx) * e
        const y = vy + (l.y - vy) * e - Math.sin(Math.PI * kk) * H * 0.07
        const r = 7 + (F * 0.5 - 7) * Math.pow(1 - e, 1.6)
        const a = (0.45 + 0.55 * kk) * (j === 0 ? 1 : (1 - j / 6) * 0.42)
        g.strokeStyle = `rgba(80,196,210,${a * 0.28})`
        g.lineWidth = 9
        g.beginPath()
        g.arc(x, y, r, 0, Math.PI * 2)
        g.stroke()
        g.strokeStyle = `rgba(214,246,250,${a})`
        g.lineWidth = j === 0 ? 2.4 : 1.4
        g.beginPath()
        g.arc(x, y, r, 0, Math.PI * 2)
        g.stroke()
      }
    }
    for (let n = impacts.length - 1; n >= 0; n--) {
      const k = (real - impacts[n].t0) / 0.6
      if (k >= 1) {
        impacts.splice(n, 1)
        continue
      }
      const a = Math.pow(1 - k, 2)
      g.strokeStyle = `rgba(214,246,250,${a * 0.9})`
      g.lineWidth = 1 + (1 - k) * 2.5
      g.beginPath()
      g.arc(impacts[n].x, impacts[n].y, 7 + k * 44, 0, Math.PI * 2)
      g.stroke()
      glow(impacts[n].x, impacts[n].y, 70, [
        [0, `rgba(139,220,230,${a * 0.6})`],
        [1, "rgba(139,220,230,0)"],
      ])
    }

    const stage = bursting ? N : Math.min(ahead, N)
    if (stage !== lastStage) {
      lastStage = stage
      opts.onStage?.(stage)
    }

    if (opts.once && !finaleSent && (opts.still || tt >= T_CYCLE + 0.2)) {
      finaleSent = true
      opts.onFinale?.()
      if (!opts.still) land(N, real)
    }
    if (opts.still && !stillSent) {
      // no motion: everything is already where it ends up
      stillSent = true
      const count = opts.once ? N + 1 : 0
      for (let i = 0; i < count; i++) opts.onLand?.(i)
    }
    if (opts.once && !opts.still && now >= T_END && landers.length === 0 && impacts.length === 0) {
      // nothing left to move: leave the last frame up and stop
      finished = true
      running = false
      return
    }
    if (running) raf = requestAnimationFrame(frame)
  }

  const sync = () => {
    const should = !opts.still && !finished && visible && !document.hidden && !disposed
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
