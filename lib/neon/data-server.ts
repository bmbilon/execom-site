import 'server-only'
import {headers} from 'next/headers'
import {createClient,type SupabaseClient} from '@supabase/supabase-js'
import {importJWK,SignJWT,type JWK} from 'jose'
import {getPortalAuth,getPortalPool} from './auth-server'
import {toLegacySession,type PortalSessionPayload} from './session'
import {createServerStorage} from './storage-server'

export async function portalToken(subject:string|null,role='authenticated') {
  const jwk=JSON.parse(process.env.NEON_SERVICE_PRIVATE_JWK!) as JWK
  const token=new SignJWT({role}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setAudience('execom-portal').setIssuedAt().setExpirationTime('2m')
  if(subject)token.setSubject(subject)
  return token.sign(await importJWK(jwk,'RS256'))
}
export async function getPortalSession(requestHeaders:Headers = new Headers(headers())):Promise<PortalSessionPayload|null> {
  const session=await getPortalAuth().api.getSession({headers:requestHeaders})
  if(!session) return null
  const result=await getPortalPool().query('SELECT p.company_id,p.is_execom_staff,p.role FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE p.id=$1 AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<now())',[session.user.id])
  if(!result.rowCount) return null
  return {user:session.user,token:await portalToken(session.user.id),profile:result.rows[0]}
}
export function dataApiURL() {
  const raw=process.env.NEON_DATA_API_URL
  if(!raw || !raw.startsWith('https://ep-late-dew-b79cr6v5.apirest.') || !new URL(raw).hostname.endsWith('.neon.tech')) throw new Error('Unexpected portal data API')
  return raw.replace(/\/rest\/v1$/,'')
}
export function createNeonServerClient():SupabaseClient {
  const client=createClient(dataApiURL(),'server-only',{accessToken:async()=>(await getPortalSession())?.token ?? await portalToken(null,'anonymous'),auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  const auth={getSession:async()=>({data:{session:toLegacySession(await getPortalSession())},error:null}),getUser:async()=>({data:{user:toLegacySession(await getPortalSession())?.user ?? null},error:null})}
  const storage=createServerStorage()
  return new Proxy(client,{get(target,key){if(key==='auth')return auth;if(key==='storage')return storage;const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value}})
}
export function createNeonAdminClient():SupabaseClient {
  return createClient(dataApiURL(),'server-only',{accessToken:()=>portalToken('execom-server','execom_service'),auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
}
