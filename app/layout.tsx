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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
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
    <footer className="bg-[#0d1b2a] border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-8 py-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ExecomMark className="w-6 h-6" />
          <span className="text-caption uppercase tracking-widest text-white/40">
            Execom
          </span>
        </div>
        <span className="text-caption text-white/20">
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
