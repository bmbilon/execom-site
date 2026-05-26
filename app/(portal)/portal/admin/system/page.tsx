import { createServerSupabaseClient } from '@/lib/portal/supabase-server'
import Link from 'next/link'
import { Users, FileText, Building2, ScrollText, Briefcase, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function count(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  table: string,
  filter?: { col: string; val: unknown },
): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filter) q = q.eq(filter.col, filter.val)
  const { count: c } = await q
  return c ?? 0
}

// Super-admin home / system overview. Staff can see it; super-admin tools
// (Users) are surfaced here too. The admin/ layout already gates staff.
export default async function AdminSystemPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: me } = await supabase
    .from('profiles')
    .select('full_name, email, role, is_execom_staff, is_super_admin')
    .eq('id', session?.user.id ?? '')
    .single()

  const [companies, users, staff, claimYears, matters, files, auditRows] =
    await Promise.all([
      count(supabase, 'companies'),
      count(supabase, 'profiles'),
      count(supabase, 'profiles', { col: 'is_execom_staff', val: true }),
      count(supabase, 'claim_years'),
      count(supabase, 'commercialization_matters'),
      count(supabase, 'files'),
      count(supabase, 'audit_log'),
    ])

  const stats = [
    { label: 'Client companies', value: companies, icon: Building2 },
    { label: 'Users', value: users, icon: Users },
    { label: 'Execom staff', value: staff, icon: ShieldCheck },
    { label: 'Claim years', value: claimYears, icon: ScrollText },
    { label: 'Matters', value: matters, icon: Briefcase },
    { label: 'Files', value: files, icon: FileText },
  ]

  const links = [
    { href: '/portal/admin/clients', label: 'Clients', desc: 'All client companies + impersonation' },
    { href: '/portal/admin/files', label: 'Files', desc: 'Every client document, with downloads' },
    { href: '/portal/admin/reviews', label: 'Review Queue', desc: 'Claims awaiting review' },
    { href: '/portal/admin/audit', label: 'Audit Log', desc: 'Logged actions across the portal' },
    ...(me?.is_super_admin
      ? [{ href: '/portal/admin/users', label: 'Users', desc: 'Manage staff + super-admin access' }]
      : []),
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · System
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">System Overview</h1>
        <p className="portal-body mt-2 text-[14px]">
          Signed in as <strong>{me?.full_name || me?.email}</strong> ·{' '}
          {me?.is_super_admin ? 'Super admin' : me?.is_execom_staff ? 'Execom staff' : me?.role}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="portal-card p-5">
              <div className="flex items-center gap-2 text-[#b8b8b0] mb-2">
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{s.label}</span>
              </div>
              <p className="font-serif text-[1.75rem] text-[#1A1A1A]">{s.value}</p>
            </div>
          )
        })}
      </div>

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Admin tools
      </p>
      <div className="space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="portal-card px-5 py-4 flex items-center justify-between hover:border-blue transition-colors"
          >
            <div>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{l.label}</p>
              <p className="text-[12px] text-[#5A5A5A]">{l.desc}</p>
            </div>
            <span className="text-[13px] text-blue">Open →</span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-[#b8b8b0]">
        {auditRows} total audit entries logged.
      </p>
    </div>
  )
}
