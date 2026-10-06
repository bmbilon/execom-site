import { PageHero } from '@/components/site/Primitives'
export const metadata = {
  title: 'Admissions privacy | execom',
  robots: { index: false, follow: false },
}
export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Admissions privacy"
        title="Your application stays *private*."
        lede="We collect contact details, your proposed process, employer sponsorship and funding-support preferences to assess and administer admission."
      />
      <section className="s-container max-w-[850px] pb-24 space-y-6 s-body">
        <p>
          Authorized execom staff can review your application and record
          admission decisions. An employer sponsor sees only the information
          needed to identify the sponsorship request, and the information you
          deliberately share for employer review. A sponsorship link is a
          private access capability; send it only to the intended recipient.
        </p>
        <p>
          Use descriptions and data types in the application. Do not upload
          confidential business records, credentials, health information or
          customer data. Your employer must approve any tools and data used
          during the project.
        </p>
        <p>
          Admissions records are stored in the existing execom portal database.
          Application responses are excluded from public pages and public
          exports. We keep records while the application or engagement is active
          and review closed records for deletion after 12 months, subject to
          required contractual and accounting retention. Contact{' '}
          <a className="underline" href="mailto:action@execom.ca">
            action@execom.ca
          </a>{' '}
          to request access, correction, withdrawal or deletion.
        </p>
        <p>
          Applying does not subscribe you to marketing. Grant support is
          optional. Only an authorized employer submits to the government
          portal; we do not request government credentials or submit
          automatically.
        </p>
      </section>
    </>
  )
}
