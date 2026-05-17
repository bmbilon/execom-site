'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ALL_FORMS } from '@/lib/corp-setup/forms'
import IntakeForm from '@/components/portal/corp-setup/IntakeForm'

export default function FormPage() {
  const params = useParams()
  const formId = params.formId as string
  const form = ALL_FORMS.find((f) => f.id === formId)

  if (!form) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
          Form not found
        </h2>
        <p className="text-[14px] text-[#5A5A5A] mb-6">
          The requested intake form does not exist.
        </p>
        <Link
          href="/portal/corp-setup"
          className="text-[14px] text-[#195E8E] hover:underline"
        >
          ← Back to Corporate Setup
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-[12px] text-[#b8b8b0] mb-6">
        <Link href="/portal/corp-setup" className="hover:text-[#195E8E] transition-colors">
          Corporate Setup
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">Phase {form.phase}: {form.phaseName}</span>
        <span className="mx-1.5">/</span>
        <span className="text-[#5A5A5A]">{form.shortTitle}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#195E8E] mb-1">
          Template {String(form.number).padStart(2, '0')}, {form.phaseName}
        </p>
        <h1 className="text-[22px] font-semibold text-[#1A1A1A]">
          {form.title}
        </h1>
        <p className="text-[14px] text-[#5A5A5A] mt-1 max-w-xl">
          {form.description}
        </p>
      </div>

      {/* Form */}
      <IntakeForm form={form} />
    </div>
  )
}
