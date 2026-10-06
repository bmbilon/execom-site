import { intakeSchema } from '@/lib/executive-ai/validation'
import { body, endpoint, json, account } from '@/lib/executive-ai/http'
import { AdmissionError } from '@/lib/executive-ai/db'
import { rateLimit, submitIntake } from '@/lib/executive-ai/service'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  return endpoint(async () => {
    const user = await account(request)
    const input = await body(request, intakeSchema)
    if (input.email !== user.email.toLowerCase())
      throw new AdmissionError(
        422,
        'Use your verified account email for this application.',
      )
    await rateLimit(
      'intake-ip:' +
        (request.headers.get('x-forwarded-for')?.split(',')[0] || 'local'),
      30,
    )
    await rateLimit('intake-email:' + input.email, 8)
    return json(await submitIntake(input, user.id), 201)
  })
}
