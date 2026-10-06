import { endpoint, json, staff, body } from '@/lib/executive-ai/http'
import { cohortSchema } from '@/lib/executive-ai/validation'
import { saveCohort } from '@/lib/executive-ai/service'
export async function POST(request: Request) {
  return endpoint(async () => {
    const actor = await staff(request)
    return json(await saveCohort(await body(request, cohortSchema), actor))
  })
}
