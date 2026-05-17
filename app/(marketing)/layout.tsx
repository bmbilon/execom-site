"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Toggle to true to see debug outlines (header=red, logo-wrapper=yellow, logo=lime)
const DEBUG_HEADER = false

const NAV_LINKS = [
  { href: "/sred", label: "SR&ED" },
  { href: "/non-dilutive-capital", label: "Non-Dilutive Capital" },
  { href: "/vc-angel-capital", label: "VC / Angel Capital" },
  { href: "/grants", label: "Grants" },
  { href: "/market-entry", label: "Market Entry" },
  { href: "/prototyping", label: "Prototyping" },
  { href: "/distribution-access", label: "Distribution Access" },
  { href: "/about", label: "About" },
]

function Nav() {
  // Full logo dimensions: 202x194 (aspect ratio 1.04:1)
  const logoHeight = 44
  const logoWidth = 46

  const pathname = usePathname()
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 marketing-header"
      style={DEBUG_HEADER ? { outline: "2px solid red" } : undefined}
    >
      <nav
        className="relative max-w-[1200px] mx-auto px-6 md:px-8 h-16 md:h-[72px] flex items-center justify-between"
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

        {/* Nav links + end-of-rail CTAs */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 ml-10">
          {NAV_LINKS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link-desktop text-center${active ? " active" : ""}`}
              >
                {item.label}
              </Link>
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
  // Full logo dimensions: 202x194 (aspect ratio 1.04:1)
  // For 36px height: width = 36 * 1.04 = 37.4 ≈ 37px
  const footerLogoHeight = 36
  const footerLogoWidth = 37

  return (
    <footer className="bg-[#0d1b2a] border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
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
              className="opacity-60 brightness-0 invert"
            />
          </div>
        </div>
        <span className="text-caption text-white/20 text-center md:text-right">
          Speed. Structure. Founder leverage.
        </span>
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
      <main className="flex-1 pt-16 md:pt-[72px]">{children}</main>
      <Footer />
    </div>
  )
}
