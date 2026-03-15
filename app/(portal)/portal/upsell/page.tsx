import Link from 'next/link'

export default function UpsellPage() {
  return (
    <div className="max-w-[640px] mx-auto py-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
        Filing Service
      </p>
      <h1 className="text-[1.75rem] font-serif text-[#1A1A1A] mb-4">
        Want execom to file for you?
      </h1>
      <p className="text-[15px] text-[#5A5A5A] mb-8 leading-relaxed">
        Once your claim package is approved, execom can handle the full T661 filing with CRA on your behalf. This includes form preparation, electronic submission, and post-filing correspondence.
      </p>

      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8 mb-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue mb-4">
          What is included
        </p>
        <ul className="space-y-3 text-[15px] text-[#1A1A1A]">
          <li className="flex items-start gap-3">
            <span className="text-blue mt-0.5 text-[12px]">01</span>
            <span>T661 form preparation and validation against CRA requirements</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue mt-0.5 text-[12px]">02</span>
            <span>Schedule T2SCH31 expenditure mapping and ITC calculation</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue mt-0.5 text-[12px]">03</span>
            <span>Electronic filing with CRA</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue mt-0.5 text-[12px]">04</span>
            <span>Post-filing support for CRA correspondence or review requests</span>
          </li>
        </ul>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-[6px] p-8">
        <p className="text-[15px] text-[#1A1A1A] mb-6">
          To discuss filing services for your claim, reach out to the execom team.
        </p>
        <a
          href="mailto:sred@execom.ca?subject=SR%26ED%20Filing%20Service%20Inquiry"
          className="inline-block bg-blue text-white text-[14px] font-semibold py-3 px-7 rounded-[5px] hover:bg-blue-dark transition-colors"
        >
          Contact execom
        </a>
      </div>

      <Link
        href="/portal/dashboard"
        className="inline-block mt-6 text-[13px] text-blue hover:text-blue-dark transition-colors"
      >
        &larr; Back to Dashboard
      </Link>
    </div>
  )
}
