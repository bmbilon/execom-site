import { PageHero } from '@/components/site/Primitives'
import IntakeForm from '@/components/executive-ai/IntakeForm'
export const metadata = {
  title: 'For employers | Executive AI Practicum | execom',
  robots: { index: false, follow: false },
}
export default function Employers() {
  return (
    <>
      <PageHero
        eyebrow="For employers & HR"
        title="Build capability around *work that matters*."
        lede="Start with an organizational need. You can enquire before nominees are known; each eventual participant receives an individual project review."
      />
      <div className="s-container max-w-[900px] pb-24">
        <IntakeForm kind="employer" />
      </div>
    </>
  )
}
