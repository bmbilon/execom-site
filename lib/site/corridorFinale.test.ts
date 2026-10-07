import { afterEach, describe, expect, it, vi } from "vitest"
import { startCorridor } from "./corridor"
import { corridorFinale, T_END } from "./corridorFinale"

describe("hero nova sequence", () => {
  it("fully reveals the cyan logo and holds it on the expanded nova before shrinking", () => {
    const frames = Array.from({ length: 1501 }, (_, i) => corridorFinale(i / 100))
    const firstShrink = frames.findIndex((frame) => frame.collapse > 0)
    const readableHold = frames.slice(0, firstShrink).filter((frame) => frame.flat === 1 && frame.nova === 1)
    expect(readableHold.length).toBeGreaterThanOrEqual(100)
    expect(readableHold.every((frame) => frame.backlit === 0)).toBe(true)
    expect(frames.slice(0, firstShrink).every((frame) => frame.backlit === 0)).toBe(true)
    expect(frames.some((frame) => frame.flat > 0 && frame.flat < 1 && frame.collapse === 0)).toBe(true)
    expect(frames.some((frame) => frame.backlit > 0 && frame.backlit < 1 && frame.collapse > 0)).toBe(true)
  })

  it("keeps the reveal and contraction continuous without reversing or overshooting", () => {
    let previousCollapse = 0
    let previousBacklit = 0
    for (let time = 0; time <= T_END + 1; time += 1 / 60) {
      const frame = corridorFinale(time)
      for (const value of [frame.flat, frame.backlit, frame.collapse, frame.nova]) {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      }
      expect(frame.collapse).toBeGreaterThanOrEqual(previousCollapse)
      expect(frame.collapse - previousCollapse).toBeLessThan(0.02)
      expect(frame.backlit).toBeGreaterThanOrEqual(previousBacklit)
      previousCollapse = frame.collapse
      previousBacklit = frame.backlit
    }
  })

  it("resumes directly at the same final state after time spent in a hidden tab", () => {
    expect(corridorFinale(300)).toEqual(corridorFinale(T_END))
    expect(corridorFinale(T_END)).toMatchObject({ phase: "settled", collapse: 1, backlit: 1, flat: 0, nova: 0 })
  })
})

afterEach(() => vi.unstubAllGlobals())

it("renders the backlit end state and all stage labels immediately with reduced motion", () => {
  const requestFrame = vi.fn()
  const gradient = () => ({ addColorStop: vi.fn() })
  const context = new Proxy({ createRadialGradient: gradient, createLinearGradient: gradient }, {
    get: (target, key) => key in target ? target[key as keyof typeof target] : vi.fn(),
  })
  const canvas = {
    getContext: () => context,
    getBoundingClientRect: () => ({ width: 1440, height: 880 }),
  } as unknown as HTMLCanvasElement
  class Observer {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal("window", { devicePixelRatio: 1, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  vi.stubGlobal("document", { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  vi.stubGlobal("ResizeObserver", Observer)
  vi.stubGlobal("IntersectionObserver", Observer)
  vi.stubGlobal("requestAnimationFrame", requestFrame)
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
  const onFinaleFrame = vi.fn()
  const onLand = vi.fn()
  const stop = startCorridor(canvas, {
    stages: ["Validate", "Structure", "Build", "Launch", "Sell"],
    focus: () => ({ x: 0.715, y: 0.38, r1: 500 }),
    still: true,
    once: true,
    onFinaleFrame,
    onLand,
  })
  expect(onFinaleFrame).toHaveBeenCalledExactlyOnceWith(corridorFinale(T_END))
  expect(onLand.mock.calls.map(([index]) => index)).toEqual([0, 1, 2, 3, 4, 5])
  expect(requestFrame).not.toHaveBeenCalled()
  stop()
})
