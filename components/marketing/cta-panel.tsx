import Link from "next/link"

interface CtaPanelProps {
  headline?: string
  body?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  /** "dark" renders on dark bg, "light" renders on light bg */
  variant?: "dark" | "light"
}

export function CtaPanel({
  headline = "Before you raise, know what game you are entering.",
  body = "The wrong capital at the wrong time can cost years. execom helps founders pressure-test their capital strategy before term sheets, dilution, and investor dynamics lock in.",
  primaryLabel = "Assess Your Capital Strategy",
  primaryHref = "/engage",
  secondaryLabel = "Engage Execom",
  secondaryHref = "/engage",
  variant = "light",
}: CtaPanelProps) {
  const isDark = variant === "dark"

  return (
    <div
      className={`py-16 md:py-20 ${
        isDark ? "" : "border-t border-b border-border"
      }`}
    >
      <div className="max-w-content mx-auto px-8 text-center">
        <h3
          className={`text-[1.5rem] md:text-[1.75rem] font-serif leading-snug mb-6 ${
            isDark ? "text-white" : "text-fg"
          }`}
        >
          {headline}
        </h3>
        {body && (
          <p
            className={`text-body leading-relaxed max-w-[540px] mx-auto mb-10 ${
              isDark ? "text-white/60" : "text-fg/60"
            }`}
          >
            {body}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest bg-teal text-[#0d1b2a] hover:bg-teal-dark transition-colors duration-200 rounded-sm"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className={`inline-flex items-center px-7 py-3 text-[13px] font-semibold uppercase tracking-widest border rounded-sm transition-colors duration-200 ${
              isDark
                ? "border-white/20 text-white/70 hover:border-teal hover:text-teal"
                : "border-border text-fg/60 hover:border-blue hover:text-blue"
            }`}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
