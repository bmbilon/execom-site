import Image from "next/image"
import Link from "next/link"

// Toggle to true to see debug outlines (header=red, logo-wrapper=yellow, logo=lime)
const DEBUG_HEADER = false

function Nav() {
  // Full logo dimensions: 202x194 (aspect ratio 1.04:1)
  // For 44px height: width = 44 * 1.04 = 45.8 ≈ 46px
  const logoHeight = 44
  const logoWidth = 46

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/5"
      style={DEBUG_HEADER ? { outline: "2px solid red" } : undefined}
    >
      <nav
        className="max-w-[1200px] mx-auto px-6 md:px-8 h-14 md:h-16 flex items-center justify-between"
        style={{ overflow: "visible" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center group h-full"
          style={{
            overflow: "visible",
            ...(DEBUG_HEADER ? { outline: "2px solid yellow" } : {}),
          }}
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

        {/* Nav links — advisory domain order follows capital journey */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 ml-10">
          <Link href="/vc-angel-capital" className="nav-link-desktop text-center">
            VC / Angel Capital
          </Link>
          <Link href="/grants" className="nav-link-desktop text-center">
            Grants
          </Link>
          <Link href="/non-dilutive-capital" className="nav-link-desktop text-center">
            Non-Dilutive Capital
          </Link>
          <Link href="/sred/" className="nav-link-desktop text-center">
            SR&ED
          </Link>
          <Link href="/market-entry" className="nav-link-desktop text-center">
            Market Entry
          </Link>
          <Link href="/distribution-access" className="nav-link-desktop text-center">
            Distribution Access
          </Link>
          <Link
            href="/engage"
            className="ml-1 inline-flex items-center px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] bg-[#50C4D2] text-[#0d1b2a] hover:bg-[#3db5c3] transition-colors duration-200 rounded-sm whitespace-nowrap"
          >
            Engage
          </Link>
          <Link
            href="/portal/login"
            className="nav-link-desktop text-center text-white/25 hover:text-teal"
          >
            Client Login
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
          Structure. Ownership. Capital. Risk.
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
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
