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
  // Official E-mark dimensions: 202x90 (aspect ratio 2.244:1)
  // For 32px height: width = 32 * 2.244 = 71.8 ≈ 72px
  const logoHeight = 32
  const logoWidth = 72

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/5"
      style={DEBUG_HEADER ? { outline: "2px solid red" } : undefined}
    >
      <nav
        className="max-w-[1200px] mx-auto px-6 md:px-8 h-14 md:h-16 flex items-center justify-between"
        style={{ overflow: "visible" }}
      >
        {/* Logo + Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 group h-full"
          style={{
            overflow: "visible",
            ...(DEBUG_HEADER ? { outline: "2px solid yellow" } : {}),
          }}
        >
          {/* Logo wrapper - flex container, explicit height, overflow visible */}
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
              src="/execom-e-mark-teal.png"
              alt="Execom E mark"
              width={logoWidth}
              height={logoHeight}
              className="opacity-90 group-hover:opacity-100 transition-opacity brightness-0 invert"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <span className="text-teal font-serif text-lg tracking-wide">
            execom
          </span>
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
  // Footer logo: smaller version, aspect ratio 2.244:1 (202x90)
  // For 20px height: width = 20 * 2.244 = 44.9 ≈ 45px
  const footerLogoHeight = 20
  const footerLogoWidth = 45

  return (
    <footer className="bg-[#0d1b2a] border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
              src="/execom-e-mark-teal.png"
              alt="Execom"
              width={footerLogoWidth}
              height={footerLogoHeight}
              style={{ objectFit: "contain" }}
              className="opacity-60 brightness-0 invert"
            />
          </div>
          <span className="text-caption uppercase tracking-widest text-white/40">
            Execom
          </span>
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
