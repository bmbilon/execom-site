import "./globals.css"
import type { Metadata } from "next"
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

function ExecomLogo({ className = "w-7 h-5", color = "white" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 579 396" fill={color} xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M0 0H579V148H195V280H360Q579 280 579 396H0Z"/>
    </svg>
  )
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1b2a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <ExecomLogo className="w-7 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
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
          <ExecomLogo className="w-6 h-4 opacity-60" />
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
