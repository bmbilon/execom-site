import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Execom",
  description: "Structural decisions for founders.",
  robots: "index, follow",
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-sm">
      <div className="max-w-content mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-nav uppercase tracking-widest text-fg font-medium hover:text-muted transition-colors"
        >
          Execom
        </Link>
        <div className="flex gap-8">
          <Link
            href="/about"
            className="text-nav uppercase tracking-widest text-muted hover:text-fg transition-colors"
          >
            About
          </Link>
          <Link
            href="/engage"
            className="text-nav uppercase tracking-widest text-muted hover:text-fg transition-colors"
          >
            Engage
          </Link>
          <Link
            href="/contact"
            className="text-nav uppercase tracking-widest text-muted hover:text-fg transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="max-w-content mx-auto px-6 pb-16 pt-24">
      <div className="border-t border-border pt-8">
        <p className="text-nav uppercase tracking-widest text-muted">
          Execom
        </p>
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
      <body>
        <Nav />
        <main className="max-w-content mx-auto px-6 pt-32 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
