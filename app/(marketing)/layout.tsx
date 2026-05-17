"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"

// Toggle to true to see debug outlines (header=red, logo-wrapper=yellow, logo=lime)
const DEBUG_HEADER = false

// Nav structure — 5 primary groups. Groups with `items` render a
// dropdown panel; groups with `href` are direct links. Routes that
// don't yet exist as marketing pages point at /coming-soon?topic= so
// nothing 404s; swap to the real route when each page ships.
type NavItem = { href: string; label: string }
type NavGroup = { label: string; href?: string; items?: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Funding & SR&ED",
    items: [
      { href: "/sred", label: "SR&ED" },
      { href: "/non-dilutive-capital", label: "Non-Dilutive Capital" },
      { href: "/vc-angel-capital", label: "VC / Angel Capital" },
      { href: "/grants", label: "Grants" },
    ],
  },
  {
    label: "Product Development",
    items: [
      { href: "/prototyping", label: "Prototyping" },
      { href: "/industrial-design", label: "Industrial Design" },
      { href: "/coming-soon?topic=software-development", label: "Software Development" },
      { href: "/coming-soon?topic=web-development", label: "Web Development" },
      { href: "/coming-soon?topic=manufacturer-sourcing", label: "Manufacturer Sourcing" },
    ],
  },
  {
    label: "Market Entry",
    items: [
      { href: "/coming-soon?topic=business-planning", label: "Business Planning" },
      { href: "/coming-soon?topic=go-to-market-strategy", label: "Go To Market Strategy" },
      { href: "/coming-soon?topic=branding-identity", label: "Branding & Identity" },
      { href: "/coming-soon?topic=trademarks", label: "Trademarks" },
    ],
  },
  {
    label: "Distribution",
    items: [
      { href: "/coming-soon?topic=customer-acquisition", label: "Customer Acquisition" },
      { href: "/coming-soon?topic=b2b-selling", label: "B2B Selling" },
      { href: "/distribution-access", label: "Distribution" },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
]

function ChevronDown() {
  return (
    <svg
      className="chev"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 1.25 5 5l4-3.75" />
    </svg>
  )
}

function Nav() {
  // Full logo dimensions: 202x194 (aspect ratio 1.04:1)
  const logoHeight = 44
  const logoWidth = 46

  const pathname = usePathname()
  const isActive = (href: string) => {
    // Strip query string before matching — coming-soon items share a
    // route but distinguish via ?topic=.
    const base = href.split("?")[0]
    if (base === "/") return pathname === "/"
    return pathname === base || pathname.startsWith(base + "/")
  }
  const groupHasActiveChild = (g: NavGroup) =>
    g.items?.some((i) => isActive(i.href)) ?? false

  // Hover-with-grace dropdown UX. A short delay on close means the
  // pointer can travel from the trigger to the panel without snapping
  // shut. Click also toggles for touch / keyboard users.
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpenGroup(label)
  }
  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140)
  }

  return (
    <header
      className="sticky top-0 z-50 marketing-header"
      style={DEBUG_HEADER ? { outline: "2px solid red" } : undefined}
    >
      <nav
        className="relative max-w-[1320px] mx-auto px-6 md:px-8 min-h-[84px] flex items-center justify-between"
        style={{ overflow: "visible" }}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="execom home"
          className="header-logo group"
          style={DEBUG_HEADER ? { outline: "2px solid yellow" } : undefined}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: logoWidth,
              height: logoHeight,
              overflow: "visible",
              flexShrink: 0,
              ...(DEBUG_HEADER ? { outline: "2px solid lime" } : {}),
            }}
          >
            <Image
              src="/execom-logo-full.png"
              alt="execom"
              width={logoWidth}
              height={logoHeight}
              className="opacity-90 group-hover:opacity-100 transition-opacity brightness-0 invert"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>

        {/* Primary nav groups + end-of-rail CTAs */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-4 ml-10">
          {NAV_GROUPS.map((group) => {
            // Direct-link group (About)
            if (group.href) {
              const active = isActive(group.href)
              return (
                <Link
                  key={group.label}
                  href={group.href}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link-desktop text-center${active ? " active" : ""}`}
                >
                  {group.label}
                </Link>
              )
            }

            // Dropdown group
            const open = openGroup === group.label
            const childActive = groupHasActiveChild(group)
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => handleEnter(group.label)}
                onMouseLeave={handleLeave}
                onFocus={() => handleEnter(group.label)}
                onBlur={(e) => {
                  // Only close when focus leaves the wrapper entirely
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    handleLeave()
                  }
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  data-open={open ? "true" : undefined}
                  className={`nav-group-trigger${childActive ? " active" : ""}`}
                  onClick={() => setOpenGroup(open ? null : group.label)}
                >
                  {group.label}
                  <ChevronDown />
                </button>

                <div
                  className="dropdown-panel"
                  data-open={open ? "true" : undefined}
                  role="menu"
                >
                  {group.items?.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        role="menuitem"
                        aria-current={active ? "page" : undefined}
                        className={`dropdown-link${active ? " active" : ""}`}
                        onClick={() => setOpenGroup(null)}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <Link href="/portal/login" className="header-cta ml-3">
            Client Portal
          </Link>
          <Link href="/engage" className="header-cta-primary">
            Engage
          </Link>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  const footerLogoHeight = 32
  const footerLogoWidth = 33

  return (
    <footer className="site-footer">
      <div className="relative max-w-[1200px] mx-auto px-6 md:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand / positioning */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-5">
              <div
                className="flex items-center justify-center"
                style={{
                  width: footerLogoWidth,
                  height: footerLogoHeight,
                  overflow: "visible",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/execom-logo-full.png"
                  alt="execom"
                  width={footerLogoWidth}
                  height={footerLogoHeight}
                  style={{ objectFit: "contain" }}
                  className="opacity-90 brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-white/55 max-w-[260px]">
              The execution engine for starting a business.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="footer-heading">Platform</p>
            <ul className="flex flex-col">
              <li><Link href="/portal/company-setup" className="footer-link">Company Setup</Link></li>
              <li><Link href="/prototyping" className="footer-link">Prototyping</Link></li>
              <li><Link href="/portal/coming-soon?module=business-planning" className="footer-link">Business Planning</Link></li>
              <li><Link href="/market-entry" className="footer-link">Market Entry</Link></li>
              <li><Link href="/distribution-access" className="footer-link">Distribution Access</Link></li>
            </ul>
          </div>

          {/* Capital */}
          <div>
            <p className="footer-heading">Capital</p>
            <ul className="flex flex-col">
              <li><Link href="/sred" className="footer-link">SR&amp;ED</Link></li>
              <li><Link href="/grants" className="footer-link">Grants</Link></li>
              <li><Link href="/non-dilutive-capital" className="footer-link">Non-Dilutive Capital</Link></li>
              <li><Link href="/vc-angel-capital" className="footer-link">VC / Angel Capital</Link></li>
            </ul>
          </div>

          {/* Account / Legal */}
          <div>
            <p className="footer-heading">Account</p>
            <ul className="flex flex-col">
              <li><Link href="/portal/login" className="footer-link">Client Portal</Link></li>
              <li><Link href="/portal/matters" className="footer-link">Matters</Link></li>
              <li><Link href="/contact" className="footer-link">Contact</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>&copy; {year} execom. All rights reserved.</span>
          <span className="hidden md:inline text-white/30">
            Speed. Structure. Founder leverage.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
