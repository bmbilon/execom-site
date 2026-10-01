import {fileCapability} from '@/lib/neon/storage-server'
import {usesNeonPortal} from '@/lib/neon/session'

export const runtime='nodejs'
export async function POST(request:Request) {
  if(!usesNeonPortal())return new Response(null,{status:404})
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403})
  if(Number(request.headers.get('content-length') || 0)>16384)return new Response(null,{status:413})
  try {
    const text=await request.text();if(text.length>16384)return new Response(null,{status:413})
    return Response.json(await fileCapability(JSON.parse(text),request.headers),{headers:{'Cache-Control':'private, no-store'}})
  } catch(error) {
    const message=error instanceof Error?error.message:'File request failed'
    const known=['Unauthorized','Forbidden','Invalid file path','Invalid claim year','Invalid company path','Invalid file request','Invalid file operation','File exceeds the 25 MB limit']
    return Response.json({error:known.includes(message)?message:'File request failed'},{status:message==='Unauthorized'?401:message==='Forbidden'?403:400})
  }
}
