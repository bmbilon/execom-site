export function peakConcurrent(
  intervals: { starts_at: Date | string; ends_at: Date | string }[],
) {
  const events = intervals
    .flatMap((i) => [
      [new Date(i.starts_at).getTime(), 1],
      [new Date(i.ends_at).getTime(), -1],
    ])
    .filter(([time]) => Number.isFinite(time))
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let active = 0,
    peak = 0
  for (const [, delta] of events) {
    active += delta
    peak = Math.max(peak, active)
  }
  return peak
}
