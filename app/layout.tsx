import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "execom — The Efficiency Engine for Entrepreneurs",
  description:
    "execom helps founders execute company formation, incorporations, trademarks, SR&ED claims, cap tables, and corporate setup faster and at a fraction of the usual cost. Portal-based workflows, structured execution, and strategic capital advisory.",
  keywords:
    "founder workflows, company setup, SR&ED, trademark filing, incorporation, non-dilutive capital, startup execution, cap table, corporate setup, founder documents",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
