import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PrototypeReadinessThankYou() {
  return (
    <div className="max-w-[640px] mx-auto py-12 text-center">
      <div className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
      </div>
      <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
        Submission received
      </p>
      <h1 className="mt-2 text-[1.75rem] font-serif text-[#1A1A1A]">
        Thanks, we’ll be in touch.
      </h1>
      <p className="mt-4 text-[15px] text-[#5A5A5A] leading-relaxed">
        A member of the execom team will review your answers and reach out within
        two business days with the recommended next step. We typically respond
        with one of three paths: a Validation Sprint, a Prototype Blueprint, or a
        full Build &amp; Launch plan, whichever fits where your concept is today.
      </p>
      <p className="mt-4 text-[14px] text-[#5A5A5A] leading-relaxed">
        In the meantime, anything you think of after submitting, sketches,
        photos, supplier names, feel free to email{' '}
        <a className="text-blue hover:underline" href="mailto:action@execom.ca">
          action@execom.ca
        </a>{' '}
        and we’ll attach it to your file.
      </p>
      <div className="mt-8">
        <Link
          href="/portal/dashboard"
          className="inline-flex items-center gap-2 text-[14px] text-blue border-[1.5px] border-blue px-5 py-2.5 rounded-[5px] hover:bg-blue hover:text-white transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
