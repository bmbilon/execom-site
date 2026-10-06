import { z } from 'zod'
import { account, body, endpoint, json, validId } from '@/lib/executive-ai/http'
import { AdmissionError } from '@/lib/executive-ai/db'
import {
  applicantDetail,
  applicationAccess,
  requestSponsorship,
  sponsorshipRequestSchema,
  addMessage,
  decideOffer,
  withdraw,
  packageSnapshot,
  reportGrant,
  grantReportSchema,
} from '@/lib/executive-ai/workflows'
const schema = z.discriminatedUnion('action', [
  z
    .object({ action: z.literal('sponsor'), input: sponsorshipRequestSchema })
    .strict(),
  z
    .object({
      action: z.literal('message'),
      text: z.string().trim().min(3).max(4000),
    })
    .strict(),
  z
    .object({
      action: z.literal('offer_decision'),
      offerId: z.uuid(),
      decision: z.enum(['accepted', 'declined']),
      acknowledged: z.literal(true),
    })
    .strict(),
  z
    .object({ action: z.literal('withdraw'), confirmed: z.literal(true) })
    .strict(),
  z.object({ action: z.literal('prepare_package') }).strict(),
  z
    .object({ action: z.literal('grant_report'), input: grantReportSchema })
    .strict(),
])
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () =>
    json(await applicantDetail(validId(params.id), await account(request))),
  )
}
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () => {
    const user = await account(request),
      id = validId(params.id),
      input = await body(request, schema)
    const { application: a, role } = await applicationAccess(id, user)
    if (
      role !== 'owner' &&
      !['prepare_package', 'grant_report'].includes(input.action)
    )
      throw new AdmissionError(403, 'This action belongs to the applicant.')
    switch (input.action) {
      case 'sponsor':
        return json(await requestSponsorship(id, input.input, user))
      case 'message':
        return json(await addMessage(id, input.text, user.id, false))
      case 'offer_decision':
        return json(
          await decideOffer(id, input.offerId, input.decision, user.id),
        )
      case 'withdraw':
        return json(await withdraw(id, user.id))
      case 'prepare_package':
        return json({ packageId: (await packageSnapshot(id, user.id)).id })
      case 'grant_report':
        if (role !== 'sponsor' && a.kind !== 'employer')
          throw new AdmissionError(
            403,
            'An authorized employer representative must report government status.',
          )
        return json(await reportGrant(id, input.input, user.id, false))
    }
  })
}
