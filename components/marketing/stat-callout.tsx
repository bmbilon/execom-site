interface StatCalloutProps {
  items: {
    label: string
    description: string
  }[]
  variant?: "light" | "dark"
}

export function StatCallout({ items, variant = "light" }: StatCalloutProps) {
  const isDark = variant === "dark"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <div
          key={i}
          className={`p-6 border rounded-sm ${
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-border bg-white/60"
          }`}
        >
          <p
            className={`text-[1.1rem] font-serif font-medium mb-2 ${
              isDark ? "text-teal" : "text-blue"
            }`}
          >
            {item.label}
          </p>
          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-white/50" : "text-fg/60"
            }`}
          >
            {item.description}
          </p>
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
