import type { Metadata } from 'next'
import './practicum.css'
export const metadata: Metadata = {
  title: 'Executive AI Practicum | execom',
  description:
    'Bring one business process. Leave with a working AI system. A ten-week employer-project practicum with Brett Bilon, based in Calgary. Starting at C$10,000.',
  robots:
    process.env.VERCEL_ENV === 'preview'
      ? { index: false, follow: false }
      : undefined,
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
