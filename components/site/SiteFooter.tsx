import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ACCOUNT_LINKS, COMPANY_LINKS, NAV_GROUPS } from "@/lib/site/nav"

export function SiteFooter() {
  const year = new Date().getFullYear()
  const columns = [
    ...NAV_GROUPS.map((g) => ({
      title: g.label,
      links: g.items.filter((i) => i.href && !i.soon),
    })),
    { title: "Company", links: COMPANY_LINKS },
    { title: "Account", links: ACCOUNT_LINKS },
  ]

  return (
    <footer className="s-footer">
      <div className="s-container">
        {/* Top: statement + portal entry */}
        <div className="grid gap-10 border-b border-white/[0.07] py-16 md:grid-cols-[1.2fr_1fr] md:items-end md:py-20">
          <div>
            <Image
              src="/execom-logo-full.png"
              alt="execom"
              width={46}
              height={44}
              className="h-11 w-auto brightness-0 invert opacity-90"
            />
            <p className="mt-8 max-w-[18ch] font-display text-[2.1rem] leading-[1.08] tracking-[-0.018em] text-snow md:text-[2.5rem]">
              From concept to revenue.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link href="/engage" className="s-btn s-btn-primary">
              Engage execom
              <ArrowRight className="s-arrow h-4 w-4" aria-hidden />
            </Link>
            <Link href="/portal/login" className="s-btn s-btn-glass">
              Access the portal
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="s-eyebrow s-eyebrow-muted text-[10.5px]">{col.title}</p>
              <ul className="mt-4">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href!} className="s-footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.07] py-7 text-[13px] text-fog sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} execom. All rights reserved.</span>
          <span className="s-mono text-[11px] uppercase tracking-[0.16em] text-fog/80">
            Speed. Structure. Founder leverage.
          </span>
        </div>
      </div>
    </footer>
  )
}
