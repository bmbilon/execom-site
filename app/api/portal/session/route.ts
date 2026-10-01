import {getPortalSession} from '@/lib/neon/data-server'
import {usesNeonPortal} from '@/lib/neon/session'

export const runtime='nodejs'
export const dynamic='force-dynamic'
export async function GET(request:Request) {
  if(!usesNeonPortal())return new Response(null,{status:404})
  return Response.json(await getPortalSession(request.headers),{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})
}
