// POST /api/sred/assess
//
// Anonymous. Takes the assessor answers, recalculates the result server-side
// and returns ONLY the applicant-safe half. Nothing is stored: at this point
// the visitor has not consented to anything and there is no reason to keep a
// record of them.
//
// The client sends answers. It does not send a lane, an estimate, or a score,
// and the strict schema rejects the request if it tries.

import { NextResponse } from 'next/server'
import { assess } from '@/lib/sred/engine'
import { getPurchasePolicy } from '@/lib/sred/config'
import { assessRequestSchema } from '@/lib/sred/schema'
import { guardPublicPost } from '@/lib/sred/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await guardPublicPost(request, 'assess')
  if (body.failure) return body.failure.response

  const parsed = assessRequestSchema.safeParse(body.data)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the highlighted answers.',
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const { publicResult } = assess(parsed.data.answers, getPurchasePolicy())

  return NextResponse.json(
    { result: publicResult },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
