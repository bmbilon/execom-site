import { describe, expect, it } from "vitest"
import { ROI_DEFAULTS, computeRoi } from "./softwareIndependence"

// The model opens on the offer brief's illustrative case and must reproduce it:
// $600k platform, $250k build, $180k a year to own.
describe("software independence ROI model", () => {
  it("reproduces the illustrative case from the offer brief", () => {
    const r = computeRoi(ROI_DEFAULTS)
    expect(r.yearOneNet).toBe(170_000)
    expect(r.ongoingNet).toBe(420_000)
    expect(r.threeYearNet).toBe(1_010_000)
    expect(Math.round(r.paybackMonths)).toBe(7)
    expect(r.ratio).toBeCloseTo(1_800_000 / 790_000, 6)
    expect(r.verdict).toBe("replace")
  })

  it("keeps rent minus own equal to the three-year net", () => {
    const r = computeRoi({ platform: 300_000, admin: 80_000, retired: 0.7, build: 180_000, own: 90_000, stress: false })
    expect(r.rentThreeYears - r.ownThreeYears).toBeCloseTo(r.threeYearNet, 6)
  })

  it("applies the stress test to build and ownership only", () => {
    const base = computeRoi(ROI_DEFAULTS)
    const stressed = computeRoi({ ...ROI_DEFAULTS, stress: true })
    expect(stressed.build).toBeCloseTo(base.build * 1.3, 6)
    expect(stressed.own).toBeCloseTo(base.own * 1.3, 6)
    expect(stressed.avoidedAnnual).toBe(base.avoidedAnnual)
  })

  it("says keep when owning costs more than renting", () => {
    const r = computeRoi({ platform: 100_000, admin: 0, retired: 1, build: 200_000, own: 120_000, stress: false })
    expect(r.ongoingNet).toBeLessThan(0)
    expect(r.paybackMonths).toBe(Infinity)
    expect(r.verdict).toBe("keep")
  })

  it("flags a positive but thin case as marginal", () => {
    const r = computeRoi({ platform: 200_000, admin: 0, retired: 1, build: 200_000, own: 100_000, stress: false })
    expect(r.threeYearNet).toBeGreaterThan(0)
    expect(r.verdict).toBe("marginal")
  })
})
