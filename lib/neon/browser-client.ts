'use client'
import {createClient,type SupabaseClient,AuthError} from '@supabase/supabase-js'
import {toLegacySession,type PortalSessionPayload} from './session'
import {createBrowserStorage} from './storage-browser'

async function request(path:string,body?:unknown) {
  const response=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
  const data=await response.json().catch(()=>null)
  if(!response.ok) throw new AuthError(data?.message || data?.error || 'Authentication request failed',response.status)
  return data
}
async function session():Promise<PortalSessionPayload|null> { return request('/api/portal/session') }
function safeNext(value?:string) {
  if(!value)return '/portal/dashboard'
  const url=new URL(value,window.location.origin)
  const next=url.pathname==='/auth/callback'?url.searchParams.get('next'):url.pathname+url.search
  return url.origin===window.location.origin && next?.startsWith('/portal/') && !next.includes('\\')?next:'/portal/dashboard'
}
async function action(path:string,body:unknown) {
  try { const data=await request('/api/auth/'+path,body);return {data,error:null} }
  catch(error) {return {data:null,error:error instanceof AuthError?error:new AuthError('Authentication request failed')}}
}
export function createNeonBrowserClient():SupabaseClient {
  const url=process.env.NEXT_PUBLIC_NEON_DATA_API_URL
  if(!url || !url.startsWith('https://ep-late-dew-b79cr6v5.apirest.') || !new URL(url).hostname.endsWith('.neon.tech')) throw new Error('Unexpected portal data API')
  const client=createClient(url.replace(/\/rest\/v1$/,''),'browser',{accessToken:async()=>(await request('/api/portal/data-token')).token,auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})
  const auth={
    async getSession(){try{return {data:{session:toLegacySession(await session())},error:null}}catch(error){return {data:{session:null},error}}},
    async getUser(){const value=await this.getSession();return {data:{user:value.data.session?.user ?? null},error:value.error}},
    async signInWithPassword(input:{email:string;password:string}){const result=await action('sign-in/email',input);return result.error?result:{data:{session:toLegacySession(await session())},error:null}},
    signUp(input:{email:string;password:string;options?:{data?:{full_name?:string};emailRedirectTo?:string}}){return action('sign-up/email',{email:input.email,password:input.password,name:input.options?.data?.full_name || input.email.split('@')[0],callbackURL:safeNext(input.options?.emailRedirectTo)})},
    resetPasswordForEmail(email:string){return action('request-password-reset',{email,redirectTo:'/portal/set-password'})},
    signOut(){return action('sign-out',{})},
    admin:{async inviteUserByEmail(){return {data:null,error:new AuthError('Share the signup link with your team member.')}}},
  }
  const storage=createBrowserStorage()
  return new Proxy(client,{get(target,key){if(key==='auth')return auth;if(key==='storage')return storage;const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value}})
}
