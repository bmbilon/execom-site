'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  comment: string
  target_type: string | null
  target_id: string | null
  created_at: string
  profiles: { full_name: string } | null
}

interface ReviewCommentThreadProps {
  reviewId: string
  targetType: string
  targetId: string | null
  comments: Comment[]
}

export default function ReviewCommentThread({
  reviewId,
  targetType,
  targetId,
  comments,
}: ReviewCommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const router = useRouter()

  async function handlePost() {
    if (!newComment.trim()) return
    setPosting(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('review_comments').insert({
      review_id: reviewId,
      author_id: session?.user.id,
      target_type: targetType,
      target_id: targetId,
      comment: newComment.trim(),
    })

    setNewComment('')
    setPosting(false)
    router.refresh()
  }

  return (
    <div>
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-surface-raised rounded px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-[#1A1A1A]">
                  {c.profiles?.full_name || 'Unknown'}
                </span>
                <span className="text-[11px] text-[#5A5A5A]">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-[13px] text-[#1A1A1A]">{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border-[1.5px] border-[#E5E5E5] rounded px-4 py-2.5 text-[14px] text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="bg-blue text-white text-[13px] font-semibold px-4 py-2.5 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  )
}
