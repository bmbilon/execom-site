import {
  programDocument,
  sponsorDocument,
  grantDocument,
} from '@/lib/executive-ai/documents'
import {
  endpoint,
  privateHeaders,
  account,
  validId,
} from '@/lib/executive-ai/http'
import { applicationAccess } from '@/lib/executive-ai/workflows'
import { db, tables, AdmissionError } from '@/lib/executive-ai/db'
export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: { type: string } },
) {
  return endpoint(async () => {
    let bytes: Uint8Array
    if (params.type === 'program') bytes = await programDocument()
    else if (params.type === 'sponsor') bytes = await sponsorDocument()
    else if (params.type === 'grant') {
      const user = await account(request),
        id = validId(new URL(request.url).searchParams.get('packageId') || '')
      const p = (
        await db().query(`SELECT * FROM ${tables().packages} WHERE id=$1`, [id])
      ).rows[0]
      if (!p) throw new AdmissionError(404, 'Package not found.')
      const isStaff = !!(
        await db().query(
          'SELECT is_execom_staff FROM public.profiles WHERE id=$1',
          [user.id],
        )
      ).rows[0]?.is_execom_staff
      await applicationAccess(p.application_id, user, isStaff)
      bytes = await grantDocument({ id: p.id, ...p.snapshot })
    } else throw new AdmissionError(404, 'Document not found.')
    return new Response(Buffer.from(bytes), {
      headers: {
        ...privateHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="execom-executive-ai-${params.type}.pdf"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  })
}
