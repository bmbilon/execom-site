import { PageHero } from '@/components/site/Primitives'
import IntakeForm from '@/components/executive-ai/IntakeForm'
export const metadata = {
  title: 'Apply | Executive AI Practicum | execom',
  robots: { index: false, follow: false },
}
export default function Apply() {
  return (
    <>
      <PageHero
        eyebrow="Executive application"
        title="Start with *your process*."
        lede="Tell us what you own, what could work better and what your employer can support."
      />
      <div className="s-container max-w-[900px] pb-24">
        <IntakeForm kind="executive" />
      </div>
    </>
  )
}
