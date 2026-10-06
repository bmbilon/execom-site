import { z } from 'zod'
import { body, endpoint, json, staff } from '@/lib/executive-ai/http'
import { db, tables, AdmissionError } from '@/lib/executive-ai/db'
import {
  courseSchema,
  courseVersions,
  defaultCourse,
  saveCourse,
} from '@/lib/executive-ai/workflows'
import { transaction } from '@/lib/executive-ai/service'
import { peakConcurrent } from '@/lib/executive-ai/capacity'
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('course'), input: courseSchema }).strict(),
  z
    .object({
      action: z.literal('settings'),
      maxActiveCohorts: z.number().int().min(1).max(5),
    })
    .strict(),
])
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return endpoint(async () => {
    await staff(request)
    return json({
      versions: await courseVersions(),
      defaults: defaultCourse,
      settings: (await db().query(`SELECT * FROM ${tables().settings}`))
        .rows[0],
    })
  })
}
export async function POST(request: Request) {
  return endpoint(async () => {
    const actor = await staff(request),
      input = await body(request, schema)
    if (input.action === 'course')
      return json(await saveCourse(input.input, actor))
    return json(
      await transaction(async (c) => {
        const t = tables()
        const scheduled = (
          await c.query(
            `SELECT starts_at,ends_at FROM ${t.cohorts} WHERE state IN ('open','closed') AND ends_at>now()`,
          )
        ).rows
        if (peakConcurrent(scheduled) > input.maxActiveCohorts)
          throw new AdmissionError(
            409,
            'Existing scheduled cohorts exceed this limit.',
          )
        await c.query(
          `UPDATE ${t.settings} SET max_active_cohorts=$1 WHERE id=true`,
          [input.maxActiveCohorts],
        )
        await c.query(
          `INSERT INTO ${t.audit}(actor_id,action,detail) VALUES($1,'planning_limit_changed',$2)`,
          [actor, JSON.stringify(input)],
        )
        return { saved: true }
      }),
    )
  })
}
