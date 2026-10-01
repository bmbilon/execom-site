import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import {Pool} from 'pg'
import {hash} from 'bcryptjs'
import {importJWK,SignJWT} from 'jose'
import {createPortalAuth} from '../lib/neon/auth-config'

async function main() {
  const pool=new Pool({connectionString:process.env.PORTAL_DATABASE_URL,options:'-c search_path=portal_auth',max:4,connectionTimeoutMillis:15000})
  const messages:string[]=[],auth=createPortalAuth(pool,async(_to,_subject,text)=>{messages.push(text)},false)
  const origin=process.env.BETTER_AUTH_URL!,ids=[randomUUID(),randomUUID(),randomUUID()],companies=[randomUUID(),randomUUID()]
  const password='Migration verification '+randomUUID(),emails=ids.map(id=>'migration-'+id+'@example.invalid')
  const jwk=JSON.parse(process.env.NEON_SERVICE_PRIVATE_JWK!),key=await importJWK(jwk,'RS256'),results:string[]=[]
  async function request(path:string,body?:unknown,cookie?:string) {return auth.handler(new Request(origin+'/api/auth/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}))}
  async function data(index:number|null,path:string,method='GET',body?:unknown) {
    const jwt=new SignJWT({role:index===null?'anonymous':'authenticated'}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setAudience('execom-portal').setIssuedAt().setExpirationTime('2m')
    if(index!==null)jwt.setSubject(ids[index])
    return fetch(process.env.NEON_DATA_API_URL+'/'+path,{method,headers:{Authorization:'Bearer '+await jwt.sign(key),'Content-Type':'application/json',Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})})
  }
  try {
    for(const id of companies)await pool.query('INSERT INTO public.companies(id,name) VALUES ($1,$2)',[id,'Migration verification'])
    const legacyHash=await hash(password,10)
    for(let i=0;i<3;i++) {
      await pool.query(`INSERT INTO auth.users(id,email,aud,role,encrypted_password,email_confirmed_at,created_at,updated_at) VALUES ($1,$2,'authenticated','authenticated',$3,now(),now(),now())`,[ids[i],emails[i],legacyHash])
      await pool.query('INSERT INTO portal_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES ($1,$2,$3,true,now(),now())',[ids[i],'Migration verification',emails[i]])
      await pool.query(`INSERT INTO portal_auth.account(id,"accountId","providerId","userId",password,"createdAt","updatedAt") VALUES ($1::uuid,$1::text,'credential',$1::uuid,$2,now(),now())`,[ids[i],legacyHash])
      await pool.query('UPDATE public.profiles SET company_id=$1,is_execom_staff=$2,is_super_admin=$2 WHERE id=$3',[companies[i===1?1:0],i===2,ids[i]])
    }
    const login=await request('sign-in/email',{email:emails[0],password});assert.equal(login.status,200)
    assert.equal((await login.json()).user.id,ids[0]);const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')
    assert.equal((await (await request('get-session',undefined,cookie)).json()).user.id,ids[0])
    assert.equal((await request('sign-in/email',{email:emails[0],password:'incorrect'})).status,401)
    results.push('Existing bcrypt login, original UUID, session restoration and incorrect-password rejection')
    const own=await data(0,'companies?id=eq.'+companies[0]);assert.equal(own.status,200);assert.equal((await own.json()).length,1)
    assert.deepEqual(await (await data(0,'companies?id=eq.'+companies[1])).json(),[])
    assert.deepEqual(await (await data(0,'profiles?id=eq.'+ids[1])).json(),[])
    assert.equal((await (await data(2,'profiles?id=eq.'+ids[1])).json()).length,1)
    assert(!(await data(0,'profiles?id=eq.'+ids[0],'PATCH',{is_super_admin:true,is_execom_staff:true})).ok)
    assert(!(await data(0,'rpc/galea_preview_commit','POST',{p_id:'no-such-workspace',p_expected:0,p_snapshot:'{}'})).ok)
    const publicRegions=await data(null,'regions?limit=1');assert.equal(publicRegions.status,200)
    const privateProfiles=await data(null,'profiles?limit=1');if(privateProfiles.ok)assert.deepEqual(await privateProfiles.json(),[])
    results.push('Client company isolation, staff access, privilege-escalation denial, private Galea RPC denial and public calculator access')
    assert.equal((await request('request-password-reset',{email:emails[0],redirectTo:'/portal/set-password'})).status,200)
    const resetURL=new URL(messages.at(-1)!.match(/https:\/\/\S+/)![0]),token=resetURL.pathname.split('/').at(-1)!
    assert.equal((await request('reset-password',{token,newPassword:password+' changed'})).status,200)
    assert.equal(await (await request('get-session',undefined,cookie)).json(),null)
    assert((await request('reset-password',{token,newPassword:password})).status>=400)
    assert.equal((await request('sign-in/email',{email:emails[0],password:password+' changed'})).status,200)
    results.push('Single-use password reset, old-session revocation and new-password login')
    const signupEmail='migration-signup-'+randomUUID()+'@example.invalid'
    const signup=await request('sign-up/email',{email:signupEmail,password,name:'Migration signup',callbackURL:'/portal/dashboard'})
    assert.equal(signup.status,200);const signupUser=(await signup.json()).user;ids.push(signupUser.id)
    assert.equal((await request('sign-in/email',{email:signupEmail,password})).status,403)
    const verifyURL=new URL(messages.at(-1)!.match(/https:\/\/\S+/)![0]);const verified=await auth.handler(new Request(verifyURL,{headers:{Origin:origin}}));assert([200,302].includes(verified.status))
    assert.equal((await request('sign-in/email',{email:signupEmail,password})).status,200)
    const profile=(await pool.query('SELECT role,is_execom_staff,is_super_admin FROM public.profiles WHERE id=$1',[signupUser.id])).rows[0]
    assert.deepEqual(profile,{role:'owner',is_execom_staff:false,is_super_admin:false})
    results.push('Signup sends an intercepted verification link, requires email confirmation and creates an unprivileged profile')
    await pool.query("UPDATE auth.users SET banned_until=now()+interval '1 day' WHERE id=$1",[ids[1]])
    assert((await request('sign-in/email',{email:emails[1],password})).status>=400)
    results.push('Banned accounts cannot sign in')
    console.log(JSON.stringify({passed:results,realEmailsSent:0}))
  } finally {
    await pool.query('DELETE FROM portal_auth."user" WHERE id=ANY($1::uuid[])',[ids])
    await pool.query('DELETE FROM auth.users WHERE id=ANY($1::uuid[])',[ids])
    await pool.query('DELETE FROM public.companies WHERE id=ANY($1::uuid[])',[companies])
    await pool.end()
  }
}
main().catch(error=>{console.error(error instanceof Error?error.message:'Verification failed');process.exitCode=1})
