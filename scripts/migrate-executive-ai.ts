import { readFileSync } from 'node:fs'
import { Pool } from 'pg'

async function main() {
  const production = process.argv.includes('--production')
  const schema = process.env.PRACTICUM_SCHEMA
  if (production) {
    if (process.env.VERCEL_ENV !== 'production' || schema !== 'executive_ai')
      throw new Error('Production migration requires a production build and PRACTICUM_SCHEMA=executive_ai.')
  } else if (schema !== 'executive_ai_preview' || process.env.VERCEL_ENV === 'production') {
    throw new Error('Preview migration requires executive_ai_preview outside production. Use the explicit production release mode for production.')
  }
  if (!process.env.PORTAL_DATABASE_URL)
    throw new Error('Missing portal database configuration.')
  const url = new URL(process.env.PORTAL_DATABASE_URL)
  if (production) {
    if (!/^ep-late-dew-b79cr6v5(?:-pooler)?\./.test(url.hostname) || !url.hostname.endsWith('.neon.tech'))
      throw new Error('Unexpected production portal database.')
    url.searchParams.set('sslmode', 'verify-full')
  }
  const pool = new Pool({ connectionString: url.toString(), max: 1, connectionTimeoutMillis: 15000 })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${schema}:migration`])
    for (const file of [
      '029_executive_ai_practicum.sql',
      '030_executive_ai_nomination_drafts.sql',
      '031_executive_ai_initial_course.sql',
    ]) {
      await client.query(readFileSync(file, 'utf8').replaceAll('executive_ai', schema!))
    }
    await client.query('COMMIT')
    console.log(`Private ${production ? 'production' : 'preview'} admissions schema is ready. Migrations 029-031 applied; no cohorts or applicants seeded.`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
