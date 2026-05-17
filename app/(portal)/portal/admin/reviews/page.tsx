import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import StatusBadge from '@/components/portal/StatusBadge'

export default async function AdminReviewsPage() {
  const supabase = createServerSupabaseClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, claim_years(fiscal_year, companies(name)), profiles!reviews_requested_by_fkey(full_name)')
    .order('requested_at', { ascending: false })

  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Admin
      </p>
      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-8">Review Queue</h1>

      {(!reviews || reviews.length === 0) ? (
        <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 text-center">
          <p className="text-[15px] text-[#5A5A5A]">No reviews pending.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/portal/admin/reviews/${review.id}`}
              className="bg-white border border-[#E5E5E5] rounded-[6px] px-6 py-5 flex items-center justify-between hover:shadow-sm transition-shadow block"
            >
              <div>
                <p className="text-[14px] text-[#1A1A1A] font-medium">
                  {(review.claim_years as any)?.companies?.name}, FY {(review.claim_years as any)?.fiscal_year}
                </p>
                <p className="text-[12px] text-[#5A5A5A]">
                  Requested by {(review.profiles as any)?.full_name}, {new Date(review.requested_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={review.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
