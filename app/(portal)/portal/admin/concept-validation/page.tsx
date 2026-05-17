import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Placeholder admin queue. The Concept Validation workflow itself hasn't
// shipped to founders yet — there's no underlying table to count from —
// but we render the queue so the staff sidebar / dashboard tile route
// somewhere coherent rather than 404'ing. When the workflow lands, swap
// this stub for the real queue page.

export default function AdminConceptValidationPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Concept Validation
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">
          Concept Validation Submissions
        </h1>
        <p className="portal-body mt-2 text-[14px]">
          Concept validation workflow has not yet shipped to founders. Once
          founder-facing intake is live, submissions will appear here.
        </p>
      </div>

      <div className="portal-card p-10 text-center">
        <p className="portal-title text-[15px] font-medium mb-2">
          No submissions yet.
        </p>
        <p className="portal-body text-[13px] mb-6 max-w-[420px] mx-auto">
          The Concept Validation module is on the roadmap. When it goes live,
          founder submissions will land in this queue for triage.
        </p>
        <Link
          href="/portal/dashboard"
          className="portal-button-ghost"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
