import { z } from 'zod'
import { account, body, endpoint, json } from '@/lib/executive-ai/http'
import { nominate, claimNomination } from '@/lib/executive-ai/applicant'
import { rateLimit } from '@/lib/executive-ai/service'
const schema = z.union([
  z.object({ action: z.literal('claim_pending'), id: z.uuid() }).strict(),
  z
    .object({
      action: z.literal('nominate'),
      applicationId: z.uuid(),
      name: z.string().trim().min(2).max(160),
      email: z
        .email()
        .max(254)
        .transform((s) => s.toLowerCase()),
      permission: z.literal(true),
    })
    .strict(),
  z
    .object({
      action: z.literal('claim'),
      token: z.string().regex(/^[a-f0-9]{64}$/),
    })
    .strict(),
])
export async function POST(request: Request) {
  return endpoint(async () => {
    const user = await account(request)
    const input = await body(request, schema)
    await rateLimit('nominations:' + user.id, 40)
    return json(
      input.action === 'claim_pending'
        ? await claimNomination(input.id, user, true)
        : input.action === 'claim'
          ? await claimNomination(input.token, user)
          : await nominate(input.applicationId, input, user.id),
    )
  })
}
