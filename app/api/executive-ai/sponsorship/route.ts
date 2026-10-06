import { z } from 'zod'
import { body, endpoint, json } from '@/lib/executive-ai/http'
import { sponsorSchema } from '@/lib/executive-ai/validation'
import {
  rateLimit,
  sponsorLookup,
  respondSponsor,
} from '@/lib/executive-ai/service'
const schema = z.union([
  z
    .object({
      action: z.literal('lookup'),
      token: z.string().regex(/^[a-f0-9]{64}$/),
    })
    .strict(),
  sponsorSchema,
])
export async function POST(request: Request) {
  return endpoint(async () => {
    const input = await body(request, schema)
    await rateLimit(
      'sponsor:' +
        (request.headers.get('x-forwarded-for')?.split(',')[0] || 'local'),
      60,
    )
    return json(
      'action' in input
        ? await sponsorLookup(input.token)
        : await respondSponsor(input),
    )
  })
}
