import "./globals.css"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Execom",
  description: "Structural decisions for founders.",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

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
        {/* Logo - full execom logo with E-mark and wordmark */}
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
              alt="Execom"
              width={logoWidth}
              height={logoHeight}
              className="opacity-90 group-hover:opacity-100 transition-opacity brightness-0 invert"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/engage" className="nav-link">
            Engage
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
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
              alt="Execom"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
