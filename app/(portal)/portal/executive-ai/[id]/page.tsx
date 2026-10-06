import ApplicantDetail from '@/components/executive-ai/ApplicantDetail'
import '@/app/(marketing)/executive-ai/practicum.css'
export const metadata = {
  title: 'Executive AI application | execom',
  robots: { index: false, follow: false },
}
export default function Page({ params }: { params: { id: string } }) {
  return <ApplicantDetail id={params.id} />
}
