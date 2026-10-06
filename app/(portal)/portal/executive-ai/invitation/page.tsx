'use client'
import { useState } from 'react'
import Link from 'next/link'
export default function Invitation() {
  const [draftId, setDraftId] = useState('')
  const [state, setState] = useState(''),
    [busy, setBusy] = useState(false)
  async function claim() {
    setBusy(true)
    try {
      const r = await fetch('/api/executive-ai/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          token: window.location.hash.slice(1),
        }),
      })
      const data = await r.json()
      setState(r.ok ? 'claimed' : data.error)
      if (r.ok) setDraftId(data.draftId)
    } catch {
      setState('Unable to claim this invitation. Please retry.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="portal-card p-8">
      <h1 className="portal-title text-3xl">
        Your employer has nominated you.
      </h1>
      <p className="portal-body mt-4">
        Claim this invitation with the verified email it was addressed to. You
        will complete your own private application and project review. If you
        arrived here after signing in or verifying your email, open your
        workspace to claim the invitation addressed to your verified email.
      </p>
      <Link href="/portal/executive-ai" className="underline block mt-4">
        Open my workspace and invitations
      </Link>
      {state === 'claimed' ? (
        <Link
          className="portal-button mt-6 inline-flex"
          href={'/executive-ai/apply?draft=' + draftId}
        >
          Begin your application
        </Link>
      ) : (
        <button className="portal-button mt-6" disabled={busy} onClick={claim}>
          {busy ? 'Claiming…' : 'Claim invitation'}
        </button>
      )}
      {state && state !== 'claimed' && (
        <p role="alert" className="mt-4">
          {state}
        </p>
      )}
    </section>
  )
}
