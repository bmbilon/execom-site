'use client'
import { useEffect, useState } from 'react'
import type { Cohort } from '@/lib/executive-ai/service'
export default function Availability() {
  const [items, setItems] = useState<Cohort[] | null>(null),
    [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    const update = () =>
      fetch('/api/executive-ai/cohorts', { cache: 'no-store' })
        .then(async (r) => {
          if (!r.ok) throw new Error()
          const data = await r.json()
          if (live) {
            setItems(data.cohorts)
            setError(false)
          }
        })
        .catch(() => {
          if (live) setError(true)
        })
    update()
    const interval = setInterval(update, 60_000)
    return () => {
      live = false
      clearInterval(interval)
    }
  }, [])
  return (
    <div className="eai-availability" aria-live="polite">
      <span className="eai-status-dot" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-snow">
          {error
            ? 'Availability is temporarily unavailable'
            : !items
              ? 'Checking cohort availability…'
              : !items.length
                ? 'Founding intake · dates to be confirmed'
                : items.some((c) => c.available > 0)
                  ? 'Applications open'
                  : 'Current cohorts full · waitlist open'}
        </p>
        <p className="text-sm text-haze mt-1">
          {error
            ? 'You can still begin an application. Admissions will confirm dates and places.'
            : items?.length
              ? items
                  .map(
                    (c) =>
                      `${c.name}: ${c.available} of ${c.capacity} places available · ${new Date(c.starts_at!).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Edmonton' })}`,
                  )
                  .join(' / ')
              : 'Apply for project review. Your start date is confirmed during admission.'}
        </p>
      </div>
    </div>
  )
}
