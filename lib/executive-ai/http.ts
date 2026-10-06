import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPortalUser, getPortalPool } from '@/lib/neon/auth-server'
import { AdmissionError, ensurePreviewStore } from './db'

export const privateHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
}
export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: privateHeaders })
export async function body<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin)
    throw new AdmissionError(
      403,
      'Please submit this form from the execom website.',
    )
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    throw new AdmissionError(415, 'Expected a JSON form submission.')
  if (Number(request.headers.get('content-length') || 0) > 32_768)
    throw new AdmissionError(413, 'Submission is too large.')
  const reader = request.body?.getReader()
  if (!reader) throw new AdmissionError(400, 'Submission is empty.')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > 32_768) {
      await reader.cancel()
      throw new AdmissionError(413, 'Submission is too large.')
    }
    chunks.push(value)
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')))
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new AdmissionError(
        422,
        error.issues
          .map((i) => `${i.path.join('.') || 'Form'}: ${i.message}`)
          .join(' '),
      )
    throw new AdmissionError(400, 'Unable to read this submission.')
  }
}
export async function staff(request: Request) {
  const user = await account(request)
  const { rows } = await getPortalPool().query(
    'SELECT is_execom_staff FROM public.profiles WHERE id=$1',
    [user.id],
  )
  if (!rows[0]?.is_execom_staff)
    throw new AdmissionError(403, 'Admissions is restricted to execom staff.')
  return user.id
}
export async function account(request: Request) {
  const user = await getPortalUser(request.headers)
  if (!user)
    throw new AdmissionError(
      401,
      'Sign in to the execom portal to save and resume your application.',
    )
  if (!user.emailVerified)
    throw new AdmissionError(403, 'Verify your email before continuing.')
  return user
}
export async function endpoint(work: () => Promise<Response>) {
  try {
    await ensurePreviewStore()
    return await work()
  } catch (error) {
    if (error instanceof AdmissionError)
      return json({ error: error.message }, error.status)
    // Log only the error class/code; never application answers, email or tokens.
    console.error(
      'Practicum request failed',
      (error as { code?: string }).code || (error as Error).name,
    )
    return json(
      {
        error:
          'Admissions is temporarily unavailable. Your submission has not been confirmed; keep your answers and retry.',
      },
      503,
    )
  }
}
export function validId(id: string) {
  if (!z.uuid().safeParse(id).success)
    throw new AdmissionError(404, 'Application not found.')
  return id
}
