import {getPortalSession,portalToken} from '@/lib/neon/data-server'
import {usesNeonPortal} from '@/lib/neon/session'

export const runtime='nodejs'
export const dynamic='force-dynamic'
export async function GET(request:Request) {
  if(!usesNeonPortal())return new Response(null,{status:404})
  const session=await getPortalSession(request.headers)
  return Response.json({token:session?.token ?? await portalToken(null,'anonymous')},{headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}})
}
