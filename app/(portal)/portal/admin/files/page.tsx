import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import AdminFilesClient, { type AdminFileRow } from './AdminFilesClient'

export const dynamic = 'force-dynamic'

// Admin Files — a single cross-client view of every document held in the
// portal. RLS already lets execom_staff read across all companies (see
// files_access / generated_artifacts staff-select policies), so the
// queries below pull everyone's files in one shot. The admin/ layout is
// the access chokepoint; by the time this renders we know the viewer is
// staff.

// SR&ED uploads live in the `files` table and the `sred-files` bucket.
// The storage_key always exists, so these are always downloadable.
interface SredFileRow {
  id: string
  file_name: string
  category: string
  mime_type: string | null
  file_size: number | null
  uploaded_at: string
  storage_key: string
  claim_year: {
    id: string
    fiscal_year: number
    company: { id: string; name: string | null; legal_name: string | null } | null
  } | null
  uploader: { id: string; full_name: string | null; email: string | null } | null
}

// Commercialization documents (incorporation packages, trademark / IP
// outputs) are logged in generated_artifacts. The matter ties to a
// user_id (auth.users), not a company, so we resolve the owning client
// through the profiles lookup built below. storage_key can be null when
// the artifact has been recorded but the file isn't in storage yet.
interface ArtifactRow {
  id: string
  artifact_type: string
  version: number
  status: string
  generated_at: string
  storage_key: string | null
  matter: {
    id: string
    display_name: string | null
    matter_type: string
    user_id: string
  } | null
}

interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  company: { id: string; name: string | null; legal_name: string | null } | null
}

const ARTIFACT_LABELS: Record<string, string> = {
  alberta_incorporation_pdf: 'Alberta Incorporation Form (PDF)',
  incorporation_package_docx: 'Incorporation Package (DOCX)',
  organizational_resolutions_docx: 'Organizational Resolutions (DOCX)',
  founder_subscription_docx: 'Founder Subscription Agreement (DOCX)',
}

const MATTER_LABELS: Record<string, string> = {
  incorporation: 'Incorporation',
  ip_transfer: 'IP Assignment',
  trademark: 'Trademark',
  licensing: 'Licensing',
}

function companyLabel(
  company: { name: string | null; legal_name: string | null } | null | undefined,
): string {
  return company?.legal_name || company?.name || 'Unknown client'
}

export default async function AdminFilesPage() {
  const supabase = createServerSupabaseClient()

  const [filesRes, artifactsRes, profilesRes] = await Promise.all([
    supabase
      .from('files')
      .select(
        `
          id, file_name, category, mime_type, file_size, uploaded_at, storage_key,
          claim_year:claim_years ( id, fiscal_year, company:companies ( id, name, legal_name ) ),
          uploader:profiles!files_uploaded_by_fkey ( id, full_name, email )
        `,
      )
      .order('uploaded_at', { ascending: false })
      .limit(1000),
    supabase
      .from('generated_artifacts')
      .select(
        `
          id, artifact_type, version, status, generated_at, storage_key,
          matter:commercialization_matters ( id, display_name, matter_type, user_id )
        `,
      )
      .order('generated_at', { ascending: false })
      .limit(1000),
    supabase
      .from('profiles')
      .select('id, full_name, email, company:companies ( id, name, legal_name )'),
  ])

  const sredFiles = (filesRes.data ?? []) as unknown as SredFileRow[]
  const artifacts = (artifactsRes.data ?? []) as unknown as ArtifactRow[]
  const profiles = (profilesRes.data ?? []) as unknown as ProfileRow[]

  const profileById = new Map<string, ProfileRow>()
  for (const p of profiles) profileById.set(p.id, p)

  const rows: AdminFileRow[] = []

  for (const f of sredFiles) {
    rows.push({
      id: `sred-${f.id}`,
      source: 'sred',
      fileName: f.file_name,
      clientName: companyLabel(f.claim_year?.company),
      context: f.claim_year ? `FY${f.claim_year.fiscal_year}` : null,
      category: f.category,
      uploadedBy: f.uploader?.full_name || f.uploader?.email || null,
      date: f.uploaded_at,
      fileSize: f.file_size,
      bucket: 'sred-files',
      storageKey: f.storage_key,
    })
  }

  for (const a of artifacts) {
    const owner = a.matter ? profileById.get(a.matter.user_id) : undefined
    const resolvedCompany = companyLabel(owner?.company)
    rows.push({
      id: `artifact-${a.id}`,
      source: 'commercialization',
      fileName: ARTIFACT_LABELS[a.artifact_type] ?? a.artifact_type,
      clientName:
        resolvedCompany === 'Unknown client'
          ? owner?.full_name || owner?.email || 'Unknown client'
          : resolvedCompany,
      context: a.matter
        ? `${MATTER_LABELS[a.matter.matter_type] ?? a.matter.matter_type}${
            a.matter.display_name ? ` · ${a.matter.display_name}` : ''
          } · v${a.version}`
        : `v${a.version}`,
      category: a.status,
      uploadedBy: owner?.full_name || owner?.email || null,
      date: a.generated_at,
      fileSize: null,
      bucket: 'sred-files',
      storageKey: a.storage_key,
    })
  }

  rows.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())

  return <AdminFilesClient rows={rows} />
}
