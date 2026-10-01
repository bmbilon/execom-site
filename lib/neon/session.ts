import type {Session} from '@supabase/supabase-js'

export function usesNeonPortal() { return process.env.NEXT_PUBLIC_DATABASE_PROVIDER === 'neon' }
export interface PortalSessionPayload {
  user: {id:string;email:string;name:string;emailVerified:boolean;createdAt:Date|string}
  token:string
  profile: {company_id:string|null;is_execom_staff:boolean;role:string}
}
export function toLegacySession(payload:PortalSessionPayload|null):Session|null {
  if(!payload) return null
  return {access_token:payload.token,refresh_token:'',token_type:'bearer',expires_in:120,expires_at:Math.floor(Date.now()/1000)+120,user:{id:payload.user.id,email:payload.user.email,aud:'authenticated',role:'authenticated',created_at:new Date(payload.user.createdAt).toISOString(),app_metadata:{provider:'email',providers:['email']},user_metadata:{full_name:payload.user.name},...(payload.user.emailVerified?{email_confirmed_at:new Date(payload.user.createdAt).toISOString()}:{})}}
}
