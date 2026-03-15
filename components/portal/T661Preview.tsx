const FIELDS = [
  { key: 'objective', label: 'Objective', ref: 'T661 Part 2, Line 242' },
  { key: 'uncertainty', label: 'Uncertainty', ref: 'T661 Part 2, Line 244' },
  { key: 'work_done', label: 'Work Performed', ref: 'T661 Part 2, Line 246' },
  { key: 'advancement', label: 'Advancement', ref: 'T661 Part 2, Line 248' },
] as const

interface T661PreviewProps {
  project: {
    name: string
    code: string | null
    objective: string | null
    uncertainty: string | null
    work_done: string | null
    advancement: string | null
  }
}

export default function T661Preview({ project }: T661PreviewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#E5E5E5] pb-4">
        <p className="text-[12px] font-mono text-[#5A5A5A]">{project.code}</p>
        <h3 className="text-[1rem] font-serif text-[#1A1A1A]">{project.name}</h3>
      </div>

      {FIELDS.map((field) => {
        const value = project[field.key]
        return (
          <div key={field.key}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-blue">
                {field.label}
              </p>
              <span className="text-[11px] text-[#5A5A5A]">{field.ref}</span>
            </div>
            {value ? (
              <p className="text-[14px] text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                {value}
              </p>
            ) : (
              <p className="text-[14px] text-[#5A5A5A] italic">Not yet provided</p>
            )}
            {value && (
              <p className="text-[11px] text-[#5A5A5A] mt-1">{value.length} characters</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
