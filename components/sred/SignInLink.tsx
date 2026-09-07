'use client'

// Secondary, understated path for existing clients. Present on the page at all
// times but never competing with the primary action.

import Link from 'next/link'
import { emitSredEvent, readAttribution } from '@/lib/sred/attribution'

export default function SignInLink({
  className,
  label = 'Existing client? Sign in',
}: {
  className?: string
  label?: string
}) {
  return (
    <Link
      href="/portal/login"
      prefetch={false}
      className={className}
      onClick={() => emitSredEvent('sred_existing_client_login', { attribution: readAttribution() })}
    >
      {label}
    </Link>
  )
}
