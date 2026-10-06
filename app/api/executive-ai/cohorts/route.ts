import { endpoint, json } from '@/lib/executive-ai/http'
import { cohorts } from '@/lib/executive-ai/service'
export const dynamic = 'force-dynamic'
export async function GET() {
  return endpoint(async () => json({ cohorts: await cohorts() }))
}
