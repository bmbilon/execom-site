import AdminDetail from '@/components/executive-ai/AdminDetail'
import '@/app/(marketing)/executive-ai/practicum.css'
export const metadata = {
  title: 'Executive AI admissions review | execom',
  robots: { index: false, follow: false },
}
export default function Page({ params }: { params: { id: string } }) {
  return <AdminDetail id={params.id} />
}
