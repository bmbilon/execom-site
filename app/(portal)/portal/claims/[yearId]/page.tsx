import { redirect } from 'next/navigation'

export default async function ClaimYearIndexPage({
  params,
}: {
  params: { yearId: string }
}) {
  redirect(`/portal/claims/${params.yearId}/setup`)
}
