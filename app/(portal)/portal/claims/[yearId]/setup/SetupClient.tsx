'use client'

import { useState } from 'react'
import { createClient } from '@/lib/portal/supabase-client'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'

interface Contact {
  id: string
  contact_role: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  preparer_ern: string | null
}

interface SetupProps {
  yearId: string
  claimYear: {
    id: string
    fiscal_year: number
    status: string
    tax_year_start: string | null
    tax_year_end: string | null
    filing_deadline: string | null
    method_election: string
    associated_corp_flag: boolean
    taxable_capital_eoy: number | null
    companies: {
      name: string
      legal_name: string | null
      bn: string | null
      industry: string | null
      address: Record<string, string> | null
    }
  }
  contacts: Contact[]
}

const CONTACT_ROLES = [
  { value: 'claimant', label: 'Claimant' },
  { value: 'preparer', label: 'Preparer' },
  { value: 'technical', label: 'Technical Contact' },
  { value: 'financial', label: 'Financial Contact' },
]

export default function SetupClient({ yearId, claimYear, contacts }: SetupProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const [form, setForm] = useState({
    tax_year_start: claimYear.tax_year_start || '',
    tax_year_end: claimYear.tax_year_end || '',
    filing_deadline: claimYear.filing_deadline || '',
    method_election: claimYear.method_election || 'proxy',
    associated_corp_flag: claimYear.associated_corp_flag || false,
    taxable_capital_eoy: claimYear.taxable_capital_eoy?.toString() || '',
  })

  const [contactForm, setContactForm] = useState({
    contact_role: 'claimant',
    name: '',
    title: '',
    email: '',
    phone: '',
    preparer_ern: '',
  })

  const company = claimYear.companies
  const inputClass =
    'w-full border-[1.5px] border-[#E5E5E5] rounded-[4px] px-4 py-3 text-[15px] font-sans text-[#1A1A1A] focus:border-blue focus:shadow-[0_0_0_3px_rgba(25,94,142,0.12)] outline-none transition-all'
  const labelClass = 'block text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-2'

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('claim_years')
      .update({
        tax_year_start: form.tax_year_start || null,
        tax_year_end: form.tax_year_end || null,
        filing_deadline: form.filing_deadline || null,
        method_election: form.method_election,
        associated_corp_flag: form.associated_corp_flag,
        taxable_capital_eoy: form.taxable_capital_eoy ? parseFloat(form.taxable_capital_eoy) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', yearId)

    if (error) toast.error(error.message)
    else toast.success('Claim setup saved')
    setSaving(false)
    router.refresh()
  }

  async function handleAddContact() {
    if (!contactForm.name.trim()) return
    const supabase = createClient()
    const { error } = await supabase.from('claim_contacts').insert({
      claim_year_id: yearId,
      contact_role: contactForm.contact_role,
      name: contactForm.name.trim(),
      title: contactForm.title.trim() || null,
      email: contactForm.email.trim() || null,
      phone: contactForm.phone.trim() || null,
      preparer_ern: contactForm.preparer_ern.trim() || null,
    })

    if (error) toast.error(error.message)
    else {
      toast.success('Contact added')
      setContactForm({ contact_role: 'claimant', name: '', title: '', email: '', phone: '', preparer_ern: '' })
      setShowContactForm(false)
    }
    router.refresh()
  }

  async function handleDeleteContact(id: string) {
    const supabase = createClient()
    await supabase.from('claim_contacts').delete().eq('id', id)
    toast.success('Contact removed')
    router.refresh()
  }

  return (
    <div>
      <Toaster position="bottom-right" />

      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-3">Setup</p>
      <h2 className="text-[1.5rem] font-serif text-[#1A1A1A] mb-6">Claim Setup</h2>

      {/* Company Info (read-only) */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Company</p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Legal Name</p>
            <p className="text-[15px] text-[#1A1A1A]">{company.legal_name || company.name}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Business Number</p>
            <p className="text-[15px] text-[#1A1A1A]">{company.bn || 'Not set'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Industry</p>
            <p className="text-[15px] text-[#1A1A1A]">{company.industry || 'Not set'}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#5A5A5A] mb-1">Address</p>
            <p className="text-[15px] text-[#1A1A1A]">
              {company.address
                ? `${company.address.street || ''}, ${company.address.city || ''}, ${company.address.province || ''} ${company.address.postal || ''}`
                : 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Filing Details */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">Filing Details</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Tax Year Start</label>
            <input
              type="date"
              value={form.tax_year_start}
              onChange={(e) => setForm({ ...form, tax_year_start: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tax Year End</label>
            <input
              type="date"
              value={form.tax_year_end}
              onChange={(e) => setForm({ ...form, tax_year_end: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Filing Deadline</label>
            <input
              type="date"
              value={form.filing_deadline}
              onChange={(e) => setForm({ ...form, filing_deadline: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Method Election</label>
            <select
              value={form.method_election}
              onChange={(e) => setForm({ ...form, method_election: e.target.value })}
              className={inputClass + ' bg-white'}
            >
              <option value="proxy">Proxy (Prescribed Percentage)</option>
              <option value="traditional">Traditional</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Taxable Capital (EOY)</label>
            <input
              type="number"
              step="0.01"
              value={form.taxable_capital_eoy}
              onChange={(e) => setForm({ ...form, taxable_capital_eoy: e.target.value })}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.associated_corp_flag}
                onChange={(e) => setForm({ ...form, associated_corp_flag: e.target.checked })}
                className="w-4 h-4 rounded border-[#E5E5E5] text-blue"
              />
              <span className="text-[14px] text-[#1A1A1A]">Associated corporation</span>
            </label>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Filing Details'}
        </button>
      </div>

      {/* Contacts */}
      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
            Contacts ({contacts.length})
          </p>
          <button
            onClick={() => setShowContactForm(true)}
            className="text-[14px] text-blue border-[1.5px] border-blue px-4 py-2 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
          >
            Add Contact
          </button>
        </div>

        {contacts.length > 0 && (
          <div className="space-y-2 mb-4">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-[#E5E5E5] rounded-[6px] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{c.name}</p>
                  <p className="text-[12px] text-[#5A5A5A]">
                    {c.contact_role}{c.title ? `, ${c.title}` : ''}{c.email ? `, ${c.email}` : ''}
                    {c.preparer_ern ? `, ERN: ${c.preparer_ern}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="text-[12px] text-[#5A5A5A] hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {contacts.length === 0 && !showContactForm && (
          <p className="text-[14px] text-[#5A5A5A] mb-4">
            Add claimant and preparer contacts for this claim. At minimum, a claimant contact is required for filing.
          </p>
        )}

        {showContactForm && (
          <div className="border-t border-[#E5E5E5] pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={contactForm.contact_role}
                  onChange={(e) => setContactForm({ ...contactForm, contact_role: e.target.value })}
                  className={inputClass + ' bg-white'}
                >
                  {CONTACT_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  value={contactForm.title}
                  onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. CTO"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            {contactForm.contact_role === 'preparer' && (
              <div className="mb-4 max-w-[320px]">
                <label className={labelClass}>Preparer ERN</label>
                <input
                  value={contactForm.preparer_ern}
                  onChange={(e) => setContactForm({ ...contactForm, preparer_ern: e.target.value })}
                  className={inputClass}
                  placeholder="Electronic Registration Number"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAddContact}
                disabled={!contactForm.name.trim()}
                className="bg-blue text-white text-[14px] font-semibold py-2.5 px-6 rounded-[5px] hover:bg-blue-dark disabled:opacity-50 transition-colors"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-[14px] text-[#5A5A5A] py-2.5 px-4 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
