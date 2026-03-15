'use client'

interface ChecklistItem {
  label: string
  passed: boolean
  detail?: string
}

export default function CompletenessChecklist({ items }: { items: ChecklistItem[] }) {
  const allPassed = items.every((i) => i.passed)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 rounded border ${
            item.passed
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <span className={`text-[14px] font-semibold mt-0.5 ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
            {item.passed ? 'Pass' : 'Fail'}
          </span>
          <div>
            <p className={`text-[14px] ${item.passed ? 'text-green-800' : 'text-red-800'}`}>
              {item.label}
            </p>
            {item.detail && (
              <p className={`text-[12px] mt-0.5 ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
                {item.detail}
              </p>
            )}
          </div>
        </div>
      ))}
      {allPassed && (
        <p className="text-[13px] text-green-700 font-medium mt-3">
          All checks passed. This claim is ready for review.
        </p>
      )}
    </div>
  )
}
