'use client'
import {Suspense,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'

function PasswordForm() {
  const params=useSearchParams(),token=params.get('token')
  const [password,setPassword]=useState(''),[message,setMessage]=useState(''),[done,setDone]=useState(false)
  async function submit(event:React.FormEvent) {
    event.preventDefault();setMessage('')
    const response=await fetch('/api/auth/reset-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,newPassword:password})})
    if(response.ok)setDone(true)
    else setMessage('The password could not be set. Use at least eight characters, or request a new link.')
  }
  return <main className="min-h-screen flex items-center justify-center p-6"><section className="w-full max-w-sm space-y-4"><h1 className="text-2xl">Set your execom password</h1>{done?<p>Password saved. <Link href="/portal/login">Sign in</Link></p>:!token?<p>This link is incomplete. <Link href="/portal/forgot-password">Request a new link</Link></p>:<form onSubmit={submit} className="space-y-4"><label className="block">New password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="block w-full border p-3 text-black"/></label><button className="border px-4 py-2" type="submit">Save password</button>{message&&<p role="alert">{message}</p>}</form>}</section></main>
}
export default function SetPasswordPage(){return <Suspense fallback={<p>Loading…</p>}><PasswordForm/></Suspense>}
