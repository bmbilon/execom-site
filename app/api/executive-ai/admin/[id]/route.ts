import { z } from 'zod'
import { endpoint, json, staff, body, validId } from '@/lib/executive-ai/http'
import { reviewSchema } from '@/lib/executive-ai/validation'
import { application, review, renewSponsor } from '@/lib/executive-ai/service'
import { db, tables } from '@/lib/executive-ai/db'
import {
  courseVersions,
  grantTriage,
  packageHistory,
} from '@/lib/executive-ai/workflows'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () => {
    await staff(request)
    const id = validId(params.id),
      a = await application(id),
      t = tables()
    const [messages, offers, versions, grant, packages] = await Promise.all([
      db().query(
        `SELECT * FROM ${t.messages} WHERE application_id=$1 ORDER BY created_at`,
        [id],
      ),
      db().query(
        `SELECT * FROM ${t.offers} WHERE application_id=$1 ORDER BY created_at DESC`,
        [id],
      ),
      courseVersions(),
      db().query(`SELECT * FROM ${t.grants} WHERE application_id=$1`, [id]),
      packageHistory(id),
    ])
    return json({
      ...a,
      messages: messages.rows,
      packages,
      offers: offers.rows,
      grant: grant.rows[0] ?? null,
      triage: grantTriage(a, versions[0]?.content ?? null),
    })
  })
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () => {
    const actor = await staff(request)
    return json(
      await review(
        validId(params.id),
        await body(request, reviewSchema),
        actor,
      ),
    )
  })
}
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  return endpoint(async () => {
    const actor = await staff(request)
    await body(
      request,
      z.object({ action: z.literal('renew_sponsor') }).strict(),
    )
    return json(await renewSponsor(validId(params.id), actor))
  })
}
