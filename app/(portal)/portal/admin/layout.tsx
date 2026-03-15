import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/portal/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_execom_staff')
    .eq('id', session.user.id)
    .single()

  if (!profile?.is_execom_staff) redirect('/portal/dashboard')

  return <>{children}</>
}
