import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import AdminUsersClient, { type UserRow } from './AdminUsersClient'

export const dynamic = 'force-dynamic'

// Super-admin-only. The admin/ layout already gates on is_execom_staff;
// this page adds the second gate so ordinary staff can't manage access.
export default async function AdminUsersPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: me } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', session?.user.id ?? '')
    .single()

  if (!me?.is_super_admin) {
    return (
      <div className="max-w-[560px] mx-auto py-20">
        <div className="portal-card p-10 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[#b8b8b0] mb-4">
            403 · Super admin only
          </p>
          <h1 className="portal-title text-[1.5rem] font-serif mb-3">
            User management is restricted.
          </h1>
          <p className="portal-body text-[14px] mb-8">
            Only super admins can manage staff and access. Reach out to a
            super admin if you need this.
          </p>
          <Link href="/portal/dashboard" className="portal-button">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, role, is_execom_staff, is_super_admin, company:companies ( id, name, legal_name )',
    )
    .order('email')

  return (
    <AdminUsersClient
      currentUserId={session!.user.id}
      users={(profiles ?? []) as unknown as UserRow[]}
    />
  )
}
