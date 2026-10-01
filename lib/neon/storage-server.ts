import 'server-only'
import {headers} from 'next/headers'
import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectsCommand} from '@aws-sdk/client-s3'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {getPortalAuth,getPortalPool} from './auth-server'

const MAX_BYTES=25*1024*1024
function storage() {
  if(!process.env.NEON_S3_ENDPOINT || !process.env.NEON_S3_ACCESS_KEY_ID || !process.env.NEON_S3_SECRET_ACCESS_KEY) throw new Error('Private file storage is not configured')
  return new S3Client({endpoint:process.env.NEON_S3_ENDPOINT,region:process.env.NEON_S3_REGION,forcePathStyle:true,credentials:{accessKeyId:process.env.NEON_S3_ACCESS_KEY_ID,secretAccessKey:process.env.NEON_S3_SECRET_ACCESS_KEY}})
}
async function authorize(bucket:string,key:string,write:boolean,requestHeaders:Headers) {
  if(!['sred-files','claim-exports'].includes(bucket) || key.length>1024 || /[\\\x00-\x1f]/.test(key) || key.split('/').some(part=>!part || part==='.' || part==='..')) throw new Error('Invalid file path')
  const session=await getPortalAuth().api.getSession({headers:requestHeaders})
  if(!session)throw new Error('Unauthorized')
  const parts=key.split('/'), year=parts[1]
  if(!/^[0-9a-f-]{36}$/i.test(year || ''))throw new Error('Invalid claim year')
  const result=await getPortalPool().query(`SELECT p.company_id,p.is_execom_staff,p.role,y.company_id AS year_company FROM public.profiles p JOIN auth.users u ON u.id=p.id CROSS JOIN public.claim_years y WHERE p.id=$1 AND y.id=$2 AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<now())`,[session.user.id,year])
  const row=result.rows[0]
  if(!row || (!row.is_execom_staff && (!row.company_id || row.company_id!==row.year_company || (write && row.role==='viewer')))) throw new Error('Forbidden')
  if(parts[0]!=='exports' && parts[0]!==row.year_company)throw new Error('Invalid company path')
}
export async function fileCapability(input:{operation:string;bucket:string;key?:string;keys?:string[];size?:number;contentType?:string;upsert?:boolean;expiresIn?:number},requestHeaders:Headers) {
  const write=input.operation==='upload' || input.operation==='remove'
  const keys=input.operation==='remove'?input.keys:[input.key]
  if(!keys?.length || keys.length>100 || keys.some(key=>typeof key!=='string'))throw new Error('Invalid file request')
  for(const key of keys)await authorize(input.bucket,key!,write,requestHeaders)
  const s3=storage(),Bucket=input.bucket,Key=keys[0]!
  if(input.operation==='upload') {
    if(!Number.isSafeInteger(input.size) || input.size!<0 || input.size!>MAX_BYTES)throw new Error('File exceeds the 25 MB limit')
    const contentType=input.contentType || 'application/octet-stream'
    const command=new PutObjectCommand({Bucket,Key,ContentType:contentType,ContentLength:input.size,CacheControl:'private, no-store',...(input.upsert?{}:{IfNoneMatch:'*'})})
    return {url:await getSignedUrl(s3,command,{expiresIn:60}),headers:{'Content-Type':contentType,...(input.upsert?{}:{'If-None-Match':'*'})}}
  }
  if(input.operation==='download') return {signedUrl:await getSignedUrl(s3,new GetObjectCommand({Bucket,Key,ResponseCacheControl:'private, no-store'}),{expiresIn:Math.min(3600,Math.max(1,input.expiresIn ?? 300))})}
  if(input.operation==='remove') {const result=await s3.send(new DeleteObjectsCommand({Bucket,Delete:{Objects:keys.map(Key=>({Key:Key!}))}}));if(result.Errors?.length)throw new Error('File removal failed');return {removed:keys.length}}
  throw new Error('Invalid file operation')
}
export function createServerStorage() {
  return {from(bucket:string){return {
    async upload(key:string,body:Uint8Array|Blob|ArrayBuffer|string,options?:{contentType?:string;upsert?:boolean}) {
      try {
        const bytes=typeof body==='string'?Buffer.from(body):body instanceof Blob?new Uint8Array(await body.arrayBuffer()):body instanceof ArrayBuffer?new Uint8Array(body):body
        await authorize(bucket,key,true,new Headers(headers()))
        if(bytes.byteLength>MAX_BYTES)throw new Error('File exceeds the 25 MB limit')
        await storage().send(new PutObjectCommand({Bucket:bucket,Key:key,Body:bytes,ContentType:options?.contentType || 'application/octet-stream',CacheControl:'private, no-store',...(options?.upsert?{}:{IfNoneMatch:'*'})}))
        return {data:{path:key},error:null}
      } catch(error){return {data:null,error:{message:error instanceof Error?error.message:'Upload failed'}}}
    },
    async createSignedUrl(key:string,expiresIn:number){try{return {data:await fileCapability({operation:'download',bucket,key,expiresIn},new Headers(headers())),error:null}}catch(error){return {data:null,error:{message:error instanceof Error?error.message:'File unavailable'}}}},
  }}}
}
