import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import { notFound } from 'next/navigation'
import UploadClient from './UploadClient'

export default async function UploadPage({
  params,
}: {
  params: { yearId: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: claimYear } = await supabase
    .from('claim_years')
    .select('id, company_id, status')
    .eq('id', params.yearId)
    .single()

  if (!claimYear) notFound()

  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('claim_year_id', params.yearId)
    .order('uploaded_at', { ascending: false })

  return (
    <UploadClient
      yearId={params.yearId}
      companyId={claimYear.company_id}
      initialFiles={files || []}
    />
  )
}
