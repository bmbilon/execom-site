import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import AdminClientsClient from './AdminClientsClient'

export default async function AdminClientsPage() {
  const supabase = createServerSupabaseClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, claim_years(id, fiscal_year, status), profiles(id, full_name, email, role)')
    .order('name')

  return <AdminClientsClient companies={companies || []} />
}
