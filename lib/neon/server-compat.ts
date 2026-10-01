import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import {createServerClient as createLegacyServerClient} from '@supabase/ssr'
import {createNeonServerClient} from './data-server'
import {usesNeonPortal} from './session'

export function createServerClient(...args:Parameters<typeof createLegacyServerClient<any, 'public'>>):SupabaseClient {
  return usesNeonPortal()?createNeonServerClient():createLegacyServerClient<any, 'public'>(...args)
}
