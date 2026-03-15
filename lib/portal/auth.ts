import { createServerSupabaseClient } from './supabase-server'
import { redirect } from 'next/navigation'
import type { Profile } from './types'

export async function getSession() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return data
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/portal/login')
  return profile
}

export async function requireExecomStaff(): Promise<Profile> {
  const profile = await requireAuth()
  if (!profile.is_execom_staff) redirect('/portal/dashboard')
  return profile
}
