'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { Toaster, toast } from 'sonner'
import { Search, ShieldCheck, Shield } from 'lucide-react'

export interface UserRow {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  is_execom_staff: boolean
  is_super_admin: boolean
  company: { id: string; name: string | null; legal_name: string | null } | null
}

function companyLabel(c: UserRow['company']): string {
  return c?.legal_name || c?.name || '—'
}

export default function AdminUsersClient({
  currentUserId,
  users,
}: {
  currentUserId: string
  users: UserRow[]
}) {
  const [rows, setRows] = useState<UserRow[]>(users)
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        (r.full_name?.toLowerCase().includes(q) ?? false) ||
        (r.email?.toLowerCase().includes(q) ?? false) ||
        companyLabel(r.company).toLowerCase().includes(q),
    )
  }, [rows, search])

  async function setFlag(
    row: UserRow,
    field: 'is_execom_staff' | 'is_super_admin',
    value: boolean,
  ) {
    setSavingId(row.id)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', row.id)

    if (error) {
      // The DB trigger rejects this if you're not a super admin.
      toast.error(error.message || 'Update blocked')
      setSavingId(null)
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      void supabase.from('audit_log').insert({
        user_id: session?.user.id,
        action: value ? `grant_${field}` : `revoke_${field}`,
        entity_type: 'profile',
        entity_id: row.id,
        new_value: { email: row.email, [field]: value },
      })
    } catch {
      // best-effort audit
    }

    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)),
    )
    setSavingId(null)
    toast.success(`${value ? 'Granted' : 'Revoked'} ${field === 'is_super_admin' ? 'super admin' : 'staff'} for ${row.email}`)
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      <div className="mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2">
          Admin · Users
        </p>
        <h1 className="portal-title text-[1.75rem] font-serif">User &amp; Staff Management</h1>
        <p className="portal-body mt-2 text-[14px]">
          Grant or revoke execom staff and super-admin access. {rows.length} user
          {rows.length === 1 ? '' : 's'}. Staff get full cross-client access; super
          admins additionally manage access here.
        </p>
      </div>

      <div className="relative max-w-[360px] mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8b8b0]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, company…"
          className="w-full border border-[#E5E5E5] rounded pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] focus:border-blue outline-none"
        />
      </div>

      <div className="portal-card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-surface-raised">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5A5A5A]">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-center">Staff</th>
              <th className="px-5 py-3 text-center">Super admin</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isSelf = row.id === currentUserId
              return (
                <tr
                  key={row.id}
                  className="border-t border-[#E5E5E5] hover:bg-surface-raised/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#1A1A1A] flex items-center gap-2">
                      {row.full_name || '—'}
                      {row.is_super_admin && (
                        <ShieldCheck className="h-3.5 w-3.5 text-blue" aria-label="super admin" />
                      )}
                    </p>
                    <p className="text-[12px] text-[#b8b8b0]">{row.email}</p>
                  </td>
                  <td className="px-5 py-4 text-[#1A1A1A]">{companyLabel(row.company)}</td>
                  <td className="px-5 py-4 text-[12px] text-[#5A5A5A] capitalize">{row.role || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <button
                      role="switch"
                      aria-checked={row.is_execom_staff}
                      disabled={savingId === row.id}
                      onClick={() => setFlag(row, 'is_execom_staff', !row.is_execom_staff)}
                      className={`inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
                        row.is_execom_staff ? 'bg-blue' : 'bg-[#D5D5D0]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          row.is_execom_staff ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      role="switch"
                      aria-checked={row.is_super_admin}
                      disabled={savingId === row.id || isSelf}
                      title={isSelf ? "You can't change your own super-admin flag" : undefined}
                      onClick={() => setFlag(row, 'is_super_admin', !row.is_super_admin)}
                      className={`inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-40 ${
                        row.is_super_admin ? 'bg-blue' : 'bg-[#D5D5D0]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          row.is_super_admin ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] text-[#b8b8b0] flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        Your own super-admin flag is locked to prevent accidental lockout. Another super admin can change it.
      </p>
    </div>
  )
}
