import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Placeholder admin queue — see ./concept-validation/page.tsx for the
// reasoning. Workflow doesn't have a founder-facing intake yet, but we
// render the queue so admin routing stays consistent. Replace with the
// real queue page when business-planning intake ships.

export default function AdminBusinessPlanningPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Business Planning
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">
          Business Planning Submissions
        </h1>
        <p className="portal-body mt-2 text-[14px]">
          Business planning workflow has not yet shipped to founders. Once
          founder-facing intake is live, submissions will appear here.
        </p>
      </div>

      <div className="portal-card p-10 text-center">
        <p className="portal-title text-[15px] font-medium mb-2">
          No submissions yet.
        </p>
        <p className="portal-body text-[13px] mb-6 max-w-[420px] mx-auto">
          The Business Planning module is on the roadmap. When it goes live,
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
