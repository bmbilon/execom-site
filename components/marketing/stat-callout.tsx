interface StatCalloutProps {
  items: {
    label: string
    description: string
  }[]
  variant?: "light" | "dark"
}

export function StatCallout({ items, variant = "light" }: StatCalloutProps) {
  const isDark = variant === "dark"

  if (isDark) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <div key={i} className="stage-card p-6">
            <p className="card-index mb-3">
              {String(i + 1).padStart(2, "0")} / {item.label.toUpperCase()}
            </p>
            <p className="card-title text-[1.1rem] font-serif mb-2">
              {item.label}
            </p>
            <p className="card-body text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    )
  }

  // Light variant — editorial paper panels: "01 / SPEED" index, serif
  // title, soft body. Tactile premium card system.
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div key={i} className="light-card p-6">
          <p className="light-card-index mb-3">
            {String(i + 1).padStart(2, "0")} / {item.label.toUpperCase()}
          </p>
          <h3 className="text-[1.1rem] font-serif mb-2">{item.label}</h3>
          <p className="text-sm">{item.description}</p>
        </div>
      ))}
    </div>
  )
}


interface PullQuoteProps {
  children: React.ReactNode
  variant?: "light" | "dark"
}

export function PullQuote({ children, variant = "light" }: PullQuoteProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={`my-10 py-8 px-8 border-l-2 ${
        isDark
          ? "border-teal bg-white/[0.03]"
          : "border-blue bg-surface-raised"
      }`}
    >
      <p
        className={`text-[1.15rem] md:text-[1.25rem] font-serif leading-relaxed ${
          isDark ? "text-white/90" : "text-fg"
        }`}
      >
        {children}
      </p>
    </div>
  )
}
