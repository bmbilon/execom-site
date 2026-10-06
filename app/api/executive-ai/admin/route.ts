import { endpoint, json, staff } from '@/lib/executive-ai/http'
import { admissionsList, cohorts } from '@/lib/executive-ai/service'
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return endpoint(async () => {
    await staff(request)
    const search = new URL(request.url).searchParams
    const [applications, cohortList] = await Promise.all([
      admissionsList(
        search.get('status') || undefined,
        search.get('q') || undefined,
      ),
      cohorts(true),
    ])
    return json({ applications, cohorts: cohortList })
  })
}
