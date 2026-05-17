'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'

interface SettingsClientProps {
  profile: {
    id: string
    role: string
    full_name: string
    company_id: string
  }
  company: {
    id: string
    name: string
    legal_name: string | null
    bn: string | null
    fiscal_ye_month: number
    industry: string | null
    address: Record<string, string> | null
  }
  team: {
    id: string
    email: string
    full_name: string
    role: string
    created_at: string
  }[]
}

export default function SettingsClient({ profile, company, team }: SettingsClientProps) {
  const [saving, setSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('contributor')
  const [inviting, setInviting] = useState(false)
  const router = useRouter()
  const canManageTeam = profile.role === 'owner' || profile.role === 'admin'

  const [form, setForm] = useState({
    name: company.name,
    legal_name: company.legal_name || '',
    bn: company.bn || '',
    fiscal_ye_month: company.fiscal_ye_month,
    industry: company.industry || '',
    street: company.address?.street || '',
    city: company.address?.city || '',
    province: company.address?.province || '',
    postal: company.address?.postal || '',
  })

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('companies')
      .update({
        name: form.name,
        legal_name: form.legal_name || null,
        bn: form.bn || null,
        fiscal_ye_month: form.fiscal_ye_month,
        industry: form.industry || null,
        address: form.street
          ? { street: form.street, city: form.city, province: form.province, postal: form.postal }
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', company.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Company profile updated')
    }
    setSaving(false)
    router.refresh()
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviting(true)

    // In production, this would send an invite email via Supabase Auth
    // For now, create the auth user invite flow
    const supabase = createClient()
    const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
      data: { role: inviteRole, company_id: profile.company_id, invited_by: profile.id },
    })

    if (error) {
      // Fallback: just show the invite intent, admin.inviteUserByEmail requires service role
      toast.error('Invite requires server-side service role key. Share the signup link with your team member instead.')
    } else {
      toast.success(`Invitation sent to ${inviteEmail}`)
    }

    setInviteEmail('')
    setInviting(false)
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Role updated')
      router.refresh()
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (memberId === profile.id) return
    const supabase = createClient()
    const { error } = await supabase.from('profiles').delete().eq('id', memberId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Team member removed')
      router.refresh()
    }
  }

  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'

  return (
    <div>
      <Toaster position="bottom-right" />

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Settings
      </p>
      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-8">Company Profile</h1>

      {/* Company form */}
      <div className="settings-card p-8 mb-10">
        <div className="space-y-5 max-w-[600px]">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Legal Name</label>
            <input type="text" value={form.legal_name} onChange={(e) => update('legal_name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CRA Business Number</label>
            <input type="text" value={form.bn} onChange={(e) => update('bn', e.target.value)} className={inputClass} placeholder="123456789RC0001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fiscal Year End Month</label>
              <select value={form.fiscal_ye_month} onChange={(e) => update('fiscal_ye_month', parseInt(e.target.value))} className={inputClass}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input type="text" value={form.industry} onChange={(e) => update('industry', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Street Address</label>
            <input type="text" value={form.street} onChange={(e) => update('street', e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} placeholder="City" /></div>
            <div><input type="text" value={form.province} onChange={(e) => update('province', e.target.value)} className={inputClass} placeholder="Province" /></div>
            <div><input type="text" value={form.postal} onChange={(e) => update('postal', e.target.value)} className={inputClass} placeholder="Postal code" /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Team Management */}
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">
        Team
      </p>
      <h2 className="text-[1.25rem] font-serif text-[#1A1A1A] mb-6">Team Members</h2>

      <div className="settings-card p-8 mb-6">
        <div className="space-y-3">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3 border-b border-[#E5E5E5] last:border-0">
              <div>
                <p className="text-[14px] text-[#1A1A1A] font-medium">{member.full_name}</p>
                <p className="text-[12px] text-[#5A5A5A]">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {canManageTeam && member.id !== profile.id ? (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="border border-[#E5E5E5] rounded px-3 py-1.5 text-[13px]"
                    >
                      <option value="admin">Admin</option>
                      <option value="contributor">Contributor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button onClick={() => handleRemoveMember(member.id)} className="text-[12px] text-[#5A5A5A] hover:text-red-600">
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[#5A5A5A]">
                    {member.role}{member.id === profile.id ? ' (you)' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      {canManageTeam && (
        <div className="settings-card p-8">
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Invite Team Member</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className={labelClass}>Email</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={inputClass} placeholder="colleague@company.com" />
            </div>
            <div className="w-[160px]">
              <label className={labelClass}>Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={inputClass}>
                <option value="admin">Admin</option>
                <option value="contributor">Contributor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors">
              {inviting ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
