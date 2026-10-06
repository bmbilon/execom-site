import { readFileSync } from 'node:fs'
import { Pool } from 'pg'

async function main() {
  const schema = process.env.PRACTICUM_SCHEMA
  if (schema !== 'executive_ai_preview')
    throw new Error(
      'This preview runner only accepts executive_ai_preview; production migration requires a separately reviewed release.',
    )
  const pool = new Pool({
    connectionString: process.env.PORTAL_DATABASE_URL,
    max: 1,
  })
  try {
    await pool.query('BEGIN')
    await pool.query(
      readFileSync('029_executive_ai_practicum.sql', 'utf8').replaceAll(
        'executive_ai',
        schema,
      ),
    )
    await pool.query(
      readFileSync('030_executive_ai_nomination_drafts.sql', 'utf8').replaceAll(
        'executive_ai',
        schema,
      ),
    )
    await pool.query(
      readFileSync('031_executive_ai_initial_course.sql', 'utf8').replaceAll(
        'executive_ai',
        schema,
      ),
    )
    await pool.query('COMMIT')
    console.log(
      'Private preview admissions schema is ready. No cohorts seeded.',
    )
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  } finally {
    await pool.end()
  }
}
main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
