import {usesNeonPortal} from '@/lib/neon/session'
import {createNeonBrowserClient} from '@/lib/neon/browser-client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if(usesNeonPortal()) return createNeonBrowserClient()
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
