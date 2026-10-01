import {toNextJsHandler} from 'better-auth/next-js'
import {getPortalAuth} from '@/lib/neon/auth-server'
import {usesNeonPortal} from '@/lib/neon/session'

export const runtime='nodejs'
export async function GET(request:Request) { return usesNeonPortal()?toNextJsHandler(getPortalAuth()).GET(request):new Response(null,{status:404}) }
export async function POST(request:Request) { return usesNeonPortal()?toNextJsHandler(getPortalAuth()).POST(request):new Response(null,{status:404}) }
