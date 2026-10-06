import 'server-only'
import { getPortalPool } from '@/lib/neon/auth-server'
import { readFileSync } from 'node:fs'
import path from 'node:path'

export function schemaName() {
  const schema = process.env.PRACTICUM_SCHEMA
  if (schema !== 'executive_ai' && schema !== 'executive_ai_preview')
    throw new Error('Practicum storage is not configured')
  if (process.env.VERCEL_ENV === 'preview' && schema !== 'executive_ai_preview')
    throw new Error('Preview must use isolated admissions storage')
  if (process.env.VERCEL_ENV === 'production' && schema !== 'executive_ai')
    throw new Error('Production cannot use preview admissions storage')
  return schema
}
export const tables = () => {
  const s = schemaName()
  return {
    applications: `${s}.applications`,
    cohorts: `${s}.cohorts`,
    audit: `${s}.audit`,
    rates: `${s}.rate_limits`,
    drafts: `${s}.drafts`,
    nominations: `${s}.nominations`,
    settings: `${s}.settings`,
    versions: `${s}.course_versions`,
    offers: `${s}.offers`,
    messages: `${s}.messages`,
    grants: `${s}.grant_cases`,
    packages: `${s}.grant_packages`,
    prospects: `${s}.prospects`,
  }
}
export const db = getPortalPool

let initialization: Promise<void> | undefined
export async function ensurePreviewStore() {
  if (
    process.env.VERCEL_ENV !== 'preview' ||
    process.env.PRACTICUM_PREVIEW_MIGRATE !== '1'
  )
    return
  if (schemaName() !== 'executive_ai_preview')
    throw new Error('Unsafe preview migration target')
  initialization ??= (async () => {
    const client = await db().connect()
    try {
      await client.query('BEGIN')
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('executive_ai_preview:migration'))",
      )
      await client.query(
        readFileSync(
          path.join(process.cwd(), '029_executive_ai_practicum.sql'),
          'utf8',
        ).replaceAll('executive_ai', 'executive_ai_preview'),
      )
      await client.query(
        readFileSync(
          path.join(process.cwd(), '030_executive_ai_nomination_drafts.sql'),
          'utf8',
        ).replaceAll('executive_ai', 'executive_ai_preview'),
      )
      await client.query(
        readFileSync(
          path.join(process.cwd(), '031_executive_ai_initial_course.sql'),
          'utf8',
        ).replaceAll('executive_ai', 'executive_ai_preview'),
      )
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  })().catch((error) => {
    initialization = undefined
    throw error
  })
  await initialization
}

export class AdmissionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
