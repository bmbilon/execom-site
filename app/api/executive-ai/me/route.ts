import { z } from 'zod'
import { account, body, endpoint, json } from '@/lib/executive-ai/http'
import { applicantHome, saveDraft } from '@/lib/executive-ai/applicant'
import { rateLimit } from '@/lib/executive-ai/service'
const answer = z.union([
  z.string().max(4000),
  z.boolean(),
  z.number().min(0).max(30),
  z.null(),
])
const draft = z
  .object({
    id: z.uuid(),
    kind: z.enum(['executive', 'employer']),
    answers: z.partialRecord(
      z.enum([
        'name',
        'email',
        'title',
        'employer',
        'phone',
        'province',
        'process',
        'outcome',
        'tools',
        'dataApproval',
        'sponsorName',
        'sponsorEmail',
        'employment',
        'grantInterest',
        'seats',
        'cohortId',
        'notes',
        'consent',
        'website',
      ]),
      answer,
    ),
  })
  .strict()
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return endpoint(async () => {
    const user = await account(request)
    return json({
      user: { name: user.name, email: user.email },
      ...(await applicantHome(user.id, user.email)),
    })
  })
}
export async function PUT(request: Request) {
  return endpoint(async () => {
    const user = await account(request)
    const input = await body(request, draft)
    await rateLimit('draft:' + user.id, 360)
    return json(await saveDraft(input.id, input.kind, input.answers, user.id))
  })
}
