import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {mkdtempSync,readFileSync,rmSync,chmodSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {spawnSync} from 'node:child_process'
import {Pool} from 'pg'
import {hash} from 'bcryptjs'
async function main(){
 const origin=process.env.PORTAL_VERIFY_DEPLOYMENT || process.env.BETTER_AUTH_URL!
 if(!/^http:\/\/localhost:3120$|^https:\/\/(execom\.ca|execom-site-[a-z0-9-]+\.vercel\.app)$/.test(origin))throw new Error('Expected execom deployment')
 const pool=new Pool({connectionString:process.env.PORTAL_DATABASE_URL,max:2,connectionTimeoutMillis:15000})
 const id=randomUUID(),company=randomUUID(),otherCompany=randomUUID(),year=randomUUID(),otherYear=randomUUID(),email=`migration-${id}@example.invalid`,password=randomUUID()+randomUUID()
 const dir=mkdtempSync(join(tmpdir(),'execom-verify-'));chmodSync(dir,0o700)
 const cookie=join(dir,'cookie'),response=join(dir,'response'),key=`${company}/${year}/migration-${randomUUID()}.txt`
 function request(path:string,body?:unknown){
  const common=['-sS','-c',cookie,'-b',cookie,'-o',response,'-w','%{http_code}','-H',`Origin: ${origin}`,'--max-time','90']
  if(body)common.push('-H','Content-Type: application/json','--data-binary','@-')
  const local=origin.startsWith('http:')
  const result=spawnSync(local?'curl':'vercel',local?[origin+path,...common]:['curl',path,'--deployment',origin,'--scope','execom','--',...common],{input:body?JSON.stringify(body):undefined,encoding:'utf8'})
  if(result.status!==0)throw new Error('Deployment request failed '+path)
  return {status:Number(result.stdout.trim()),body:readFileSync(response,'utf8')}
 }
 const storage=(body:unknown)=>request('/api/portal/storage',body)
 try{
  const legacyHash=await hash(password,10)
  for(const companyId of [company,otherCompany])await pool.query('INSERT INTO public.companies(id,name) VALUES($1,$2)',[companyId,'Migration verification'])
  await pool.query(`INSERT INTO auth.users(id,email,aud,role,encrypted_password,email_confirmed_at,created_at,updated_at) VALUES($1,$2,'authenticated','authenticated',$3,now(),now(),now())`,[id,email,legacyHash])
  await pool.query(`INSERT INTO portal_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,'Migration verification',$2,true,now(),now())`,[id,email])
  await pool.query(`INSERT INTO portal_auth.account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES($1::uuid,$1::text,'credential',$1::uuid,$2,now(),now())`,[id,legacyHash])
  await pool.query('UPDATE public.profiles SET company_id=$1 WHERE id=$2',[company,id])
  await pool.query('INSERT INTO public.claim_years(id,company_id,fiscal_year) VALUES($1,$2,2026),($3,$4,2026)',[year,company,otherYear,otherCompany])
  assert.equal(request('/portal/dashboard').status,307,'guest protection')
  assert.equal(request('/portal/login').status,200,'login page')
  assert.equal(request('/portal/set-password?token=invalid').status,200,'reset form')
  assert.equal(request('/api/auth/sign-in/email',{email,password}).status,200,'login')
  const session=request('/api/portal/session');assert.equal(session.status,200);assert.equal(JSON.parse(session.body).user.id,id)
  assert.equal(request('/portal/dashboard').status,200,'dashboard')
  assert.equal(request('/portal/login').status,307,'signed-in redirect')
  const bytes=Buffer.from('Private migration verification '+randomUUID())
  const prepared=storage({operation:'upload',bucket:'sred-files',key,size:bytes.length,contentType:'text/plain'})
  assert.equal(prepared.status,200,'prepare upload');const upload=JSON.parse(prepared.body)
  assert((await fetch(upload.url,{method:'PUT',headers:upload.headers,body:bytes})).ok,'signed upload')
  assert.equal((await fetch(upload.url,{method:'PUT',headers:upload.headers,body:bytes})).status,412,'overwrite rejected')
  const download=storage({operation:'download',bucket:'sred-files',key});assert.equal(download.status,200)
  const signed=JSON.parse(download.body).signedUrl;assert.equal(await (await fetch(signed)).text(),bytes.toString())
  assert(!(await fetch(signed.split('?')[0])).ok,'private object')
  assert.equal(storage({operation:'download',bucket:'sred-files',key:`${otherCompany}/${otherYear}/private.txt`}).status,403,'tenant isolation')
  assert.equal(storage({operation:'upload',bucket:'sred-files',key,size:26*1024*1024}).status,400,'size bound')
  assert.equal(storage({operation:'remove',bucket:'sred-files',keys:[key]}).status,200,'remove')
  assert.equal(request('/api/auth/sign-out',{}).status,200)
  assert.equal(request('/portal/dashboard').status,307)
  console.log(JSON.stringify({deployment:origin,passed:['legacy bcrypt login and UUID','middleware guest/login redirects','dashboard','reset form','private upload/download/delete','overwrite and tenant denial','25 MB limit','sign-out'],emailsSent:0}))
 }finally{
  try{storage({operation:'remove',bucket:'sred-files',keys:[key]})}catch{}
  await pool.query('DELETE FROM public.claim_years WHERE id=ANY($1::uuid[])',[[year,otherYear]])
  await pool.query('DELETE FROM portal_auth."user" WHERE id=$1',[id]);await pool.query('DELETE FROM auth.users WHERE id=$1',[id])
  await pool.query('DELETE FROM public.companies WHERE id=ANY($1::uuid[])',[[company,otherCompany]])
  await pool.end();rmSync(dir,{recursive:true,force:true})
 }
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Deployment verification failed');process.exitCode=1})
