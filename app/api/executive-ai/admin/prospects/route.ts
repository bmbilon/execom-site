import { z } from 'zod'
import { body, endpoint, json, staff } from '@/lib/executive-ai/http'
import { db, tables, AdmissionError } from '@/lib/executive-ai/db'
import { transaction } from '@/lib/executive-ai/service'
const link = z
  .url()
  .max(2000)
  .refine((s) => /^https?:\/\//.test(s), 'Use a public HTTP(S) evidence URL.')
const row = z
  .object({
    sourceKey: z.string().trim().min(1).max(180),
    recordType: z.enum(['employer', 'channel']),
    name: z.string().trim().min(2).max(200),
    region: z.string().max(200).default(''),
    contactName: z.string().max(200).default(''),
    contactRole: z.string().max(250).default(''),
    contactRoute: z.string().max(1000).default(''),
    sourceUrl: link,
    processHypothesis: z.string().max(3000).default(''),
    evidence: z
      .array(z.object({ url: link, note: z.string().max(2000) }))
      .max(20)
      .default([]),
    researchNotes: z.string().max(4000).default(''),
  })
  .strict()
const schema = z.discriminatedUnion('action', [
  z
    .object({ action: z.literal('import'), rows: z.array(row).min(1).max(50) })
    .strict(),
  z
    .object({
      action: z.literal('update'),
      id: z.uuid(),
      stage: z.enum([
        'researched',
        'introduction_mapped',
        'conversation',
        'not_fit',
      ]),
      introductionNotes: z.string().trim().max(3000),
    })
    .strict(),
])
export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  return endpoint(async () => {
    await staff(request)
    return json({
      prospects: (
        await db().query(
          `SELECT * FROM ${tables().prospects} ORDER BY record_type,name`,
        )
      ).rows,
    })
  })
}
export async function POST(request: Request) {
  return endpoint(async () => {
    const actor = await staff(request),
      input = await body(request, schema),
      t = tables()
    return json(
      await transaction(async (c) => {
        if (input.action === 'update') {
          const r = await c.query(
            `UPDATE ${t.prospects} SET stage=$1,introduction_notes=$2,updated_at=now() WHERE id=$3 RETURNING id`,
            [input.stage, input.introductionNotes, input.id],
          )
          if (!r.rowCount) throw new AdmissionError(404, 'Prospect not found.')
          await c.query(
            `INSERT INTO ${t.audit}(actor_id,action,detail) VALUES($1,'prospect_updated',$2)`,
            [actor, JSON.stringify({ id: input.id, stage: input.stage })],
          )
          return { saved: true }
        }
        if (
          new Set(input.rows.map((r) => r.sourceKey)).size !== input.rows.length
        )
          throw new AdmissionError(422, 'Duplicate source keys in this import.')
        for (const r of input.rows)
          await c.query(
            `INSERT INTO ${t.prospects}(source_key,record_type,name,region,contact_name,contact_role,contact_route,source_url,process_hypothesis,evidence,research_notes,imported_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(source_key) DO UPDATE SET record_type=$2,name=$3,region=$4,contact_name=$5,contact_role=$6,contact_route=$7,source_url=$8,process_hypothesis=$9,evidence=$10,research_notes=$11,updated_at=now()`,
            [
              r.sourceKey,
              r.recordType,
              r.name,
              r.region,
              r.contactName,
              r.contactRole,
              r.contactRoute,
              r.sourceUrl,
              r.processHypothesis,
              JSON.stringify(r.evidence),
              r.researchNotes,
              actor,
            ],
          )
        await c.query(
          `INSERT INTO ${t.audit}(actor_id,action,detail) VALUES($1,'research_imported',$2)`,
          [actor, JSON.stringify({ rows: input.rows.length, consent: 'none' })],
        )
        return { imported: input.rows.length }
      }),
    )
  })
}
