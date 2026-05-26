import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import AdminAuditClient, { type AuditRow } from './AdminAuditClient'

export const dynamic = 'force-dynamic'

// Visible to all execom staff (gated by the admin/ layout). Reads the
// audit_log and resolves the actor profile. audit_log.user_id references
// profiles(id), so the default FK embed name is audit_log_user_id_fkey.
export default async function AdminAuditPage() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from('audit_log')
    .select(
      `
        id, action, entity_type, entity_id, old_value, new_value, created_at,
        actor:profiles!audit_log_user_id_fkey ( full_name, email )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(500)

  return <AdminAuditClient rows={(data ?? []) as unknown as AuditRow[]} />
}
