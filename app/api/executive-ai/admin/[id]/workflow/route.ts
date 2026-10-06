import { z } from 'zod'
import { body, endpoint, json, staff, validId } from '@/lib/executive-ai/http'
import {
  addMessage,
  offerSchema,
  issueOffer,
  packageSnapshot,
  reportGrant,
  grantReportSchema,
} from '@/lib/executive-ai/workflows'
const schema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('message'),
      text: z.string().trim().min(3).max(4000),
    })
    .strict(),
  z.object({ action: z.literal('offer'), input: offerSchema }).strict(),
  z.object({ action: z.literal('prepare_package') }).strict(),
  z
    .object({ action: z.literal('grant_report'), input: grantReportSchema })
    .strict(),
])
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () => {
    const actor = await staff(request),
      id = validId(params.id),
      input = await body(request, schema)
    switch (input.action) {
      case 'message':
        return json(await addMessage(id, input.text, actor, true))
      case 'offer':
        return json(await issueOffer(id, input.input, actor))
      case 'prepare_package':
        return json({ packageId: (await packageSnapshot(id, actor)).id })
      case 'grant_report':
        return json(await reportGrant(id, input.input, actor, true))
    }
  })
}
