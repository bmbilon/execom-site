import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Execom",
  description: "Structural decisions for founders.",
  robots: "index, follow",
  icons: {
    icon: "/favicon.svg",
  },
}

function ExecomLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* E mark */}
      <g fill="#50C4D2">
        <rect x="0" y="2" width="5" height="36" rx="1" />
        <rect x="5" y="2" width="20" height="6" rx="1" />
        <rect x="5" y="17" width="15" height="6" rx="1" />
        <rect x="5" y="32" width="20" height="6" rx="1" />
      </g>
      {/* wordmark */}
      <text
        x="34"
        y="31"
        fontFamily="Cambria, Georgia, serif"
        fontSize="26"
        fontWeight="400"
        fill="#50C4D2"
        letterSpacing="1"
      >
        execom
      </text>
    </svg>
  )
}

function ExecomMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#195E8E" />
      <g fill="#50C4D2">
        <rect x="7" y="5" width="4" height="22" rx="1" />
        <rect x="11" y="5" width="14" height="4" rx="1" />
        <rect x="11" y="14" width="10" height="4" rx="1" />
        <rect x="11" y="23" width="14" height="4" rx="1" />
      </g>
    </svg>
  )
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-wide mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <ExecomMark className="w-8 h-8" />
          <span className="text-teal font-serif text-lg tracking-wide">
            execom
          </span>
        </Link>
        <div className="flex items-center gap-10">
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
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-wide mx-auto px-8 py-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ExecomMark className="w-5 h-5 opacity-60" />
          <span className="text-caption uppercase tracking-widest text-muted">
            Execom
          </span>
        </div>
        <span className="text-caption text-muted/40">
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
        <main className="max-w-content mx-auto px-8 pt-28 pb-16 w-full flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
