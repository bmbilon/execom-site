import { PageHero } from '@/components/site/Primitives'
import SponsorForm from '@/components/executive-ai/SponsorForm'
export const metadata = {
  title: 'Employer sponsorship | execom',
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
}
export default function Sponsor() {
  return (
    <>
      <PageHero
        eyebrow="Private employer handoff"
        title="Make the support *explicit*."
        lede="Confirm employer support, funding status and the permissions needed to explore the proposed process."
      />
      <div className="s-container max-w-[900px] pb-24">
        <SponsorForm />
      </div>
    </>
  )
}
