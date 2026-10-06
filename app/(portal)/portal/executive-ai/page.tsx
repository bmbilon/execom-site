import { redirect } from 'next/navigation'
import ApplicantHome from '@/components/executive-ai/ApplicantHome'
import '@/app/(marketing)/executive-ai/practicum.css'
export const metadata = {
  title: 'My executive AI applications | execom',
  robots: { index: false, follow: false },
}
export default function Page({
  searchParams,
}: {
  searchParams: { start?: string }
}) {
  if (searchParams.start === 'executive') redirect('/executive-ai/apply')
  if (searchParams.start === 'employer') redirect('/executive-ai/employers')
  return <ApplicantHome />
}
