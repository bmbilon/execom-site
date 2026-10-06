import Link from 'next/link'
import { ArrowUpRight, Check, ArrowRight } from 'lucide-react'
import { PageHero, SectionHeader, CtaBand } from '@/components/site/Primitives'
import Availability from '@/components/executive-ai/Availability'
import { practicum, priceLabel } from '@/lib/executive-ai/config'

const outputs = [
  [
    'A working system',
    'One bounded process, built and tested with employer-approved tools and data.',
  ],
  [
    'A measured result',
    'A baseline, agreed acceptance criteria and a documented comparison with the starting process.',
  ],
  [
    'The ability to run it',
    'A process map, operating instructions, safeguards and a clear handoff to the person who owns it.',
  ],
  [
    'Employer acceptance',
    'A review with your sponsor to assess the result, its limitations and what happens next.',
  ],
]
const examples = [
  [
    '01',
    'The weekly project briefing',
    'Bring cost, schedule and resource updates into one reviewable management brief.',
    'Project services',
  ],
  [
    '02',
    'The portfolio operating report',
    'Turn approved property updates and exports into a consistent operating review.',
    'Real estate & operations',
  ],
  [
    '03',
    'The management-review pack',
    'Assemble an approved project-margin or service summary with traceable source information.',
    'Finance & delivery',
  ],
]
export default function ExecutiveAI() {
  return (
    <>
      <PageHero
        href="/executive-ai"
        crumb="Executive AI Practicum"
        eyebrow="Calgary · Executive AI Practicum"
        title="Bring one business process. Leave with a *working AI system*."
        lede="Develop the ability to put AI to work inside your business. Over ten weeks, work with Brett Bilon on a process you own, from the first scope decision to a tested system and an employer acceptance review."
        primary={{
          label: 'Apply as an executive',
          href: '/executive-ai/apply',
        }}
        secondary={{
          label: 'Sponsor an executive',
          href: '/executive-ai/employers',
        }}
        aside={
          <div className="eai-project-card">
            <div className="flex items-center justify-between">
              <p className="s-eyebrow">Your business, in practice</p>
              <span className="eai-small-tag">10 weeks</span>
            </div>
            <div className="eai-process">
              <p className="eai-process-label">BRING</p>
              <h2>
                One recurring process.
                <br />
                One meaningful improvement.
              </h2>
              <div className="eai-process-path" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="eai-process-label">BUILD & TEST</p>
                  <p>
                    Approved tools.
                    <br />
                    Real operating constraints.
                  </p>
                </div>
                <div>
                  <p className="eai-process-label">LEAVE WITH</p>
                  <p>
                    A working system.
                    <br />
                    The skill to use it.
                  </p>
                </div>
              </div>
            </div>
            <div className="eai-card-footer">
              <span>Employer-scoped. Personally led.</span>
              <ArrowUpRight size={18} />
            </div>
          </div>
        }
      >
        <div className="mt-8">
          <Availability />
        </div>
      </PageHero>

      <div className="eai-facts s-container">
        <div>
          <strong>{priceLabel}</strong>
          <span>Starting tuition, plus tax</span>
        </div>
        <div>
          <strong>4–6 executives</strong>
          <span>Maximum six per cohort</span>
        </div>
        <div>
          <strong>60 minutes</strong>
          <span>One working session each week</span>
        </div>
        <div>
          <strong>One process</strong>
          <span>Scoped before enrolment</span>
        </div>
      </div>

      <section className="s-section s-container" id="outcomes">
        <div className="eai-split">
          <SectionHeader
            eyebrow="The result"
            title="A useful system. *A more capable executive*."
            lede="The work and the learning happen together. You bring the judgment, context and business problem. We define a manageable project and work through it."
          />
          <div className="eai-output-list">
            {outputs.map(([title, copy], i) => (
              <article key={title}>
                <span className="s-mono text-cyan-300 text-xs">0{i + 1}</span>
                <div>
                  <h3 className="s-h3">{title}</h3>
                  <p className="s-body mt-2">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="s-section-tight eai-tinted" id="projects">
        <div className="s-container">
          <SectionHeader
            eyebrow="What to bring"
            title="Start where the work *repeats*."
            lede="A valuable, bounded process with a clear owner makes the best starting point. These are project examples to explore during admission, not guaranteed outcomes."
          />
          <div className="eai-example-grid mt-10">
            {examples.map(([num, title, copy, tag]) => (
              <article className="s-edge p-7" key={num}>
                <p className="s-mono text-xs text-cyan-300">
                  {num} / {tag}
                </p>
                <h3 className="s-h3 mt-12">{title}</h3>
                <p className="s-body mt-4">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="s-section s-container" id="format">
        <div className="eai-split">
          <SectionHeader
            eyebrow="Built around the executive calendar"
            title="Ten weeks. *A weekly working rhythm*."
            lede="Ten weekly 60-minute working sessions, with a target of 15–30 minutes of executive review or application between sessions."
          />
          <div>
            <div className="eai-timeline">
              {[
                [
                  'Scope',
                  'Define the process, baseline, permissions and acceptance criteria.',
                ],
                [
                  'Build',
                  'Develop and test a bounded system using approved tools and representative inputs.',
                ],
                [
                  'Evaluate',
                  'Review outputs, measure performance and improve the system against agreed criteria.',
                ],
                [
                  'Handoff',
                  'Document operation and limitations, demonstrate the result and complete the employer review.',
                ],
              ].map(([title, copy], i) => (
                <div key={title}>
                  <span>{i + 1}</span>
                  <div>
                    <h3 className="s-h3">{title}</h3>
                    <p className="s-body mt-2">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <details className="eai-disclosure mt-7">
              <summary>What the time commitment includes</summary>
              <p>
                The short weekly commitment is the executive’s time. Provider
                build effort, internal staff contributions, software costs,
                integrations and ongoing support are scoped separately before
                enrolment. Project complexity must fit the agreed allowance. A
                production rollout or an organization-wide transformation is not
                assumed.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="s-section-tight eai-tinted" id="instructor">
        <div className="s-container eai-split">
          <div>
            <p className="s-eyebrow">Personally led by</p>
            <h2 className="s-h2 mt-5">Brett Bilon</h2>
            <p className="s-lede mt-5">
              Calgary entrepreneur.
              <br />
              AI applied in the work of building businesses.
            </p>
            <Link href="/about" className="s-link mt-6 inline-flex">
              About Brett and execom <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            <p className="s-lede">
              Brett uses AI systems and agents across his own businesses. This
              practicum transfers that operating experience into one useful
              piece of work inside yours.
            </p>
            <p className="s-body mt-6">
              The engagement is built around the decisions executives actually
              need to make: where AI helps, what information it can use, how to
              judge its output and who remains accountable.
            </p>
          </div>
        </div>
      </section>

      <section className="s-section s-container" id="admissions">
        <div className="eai-split">
          <SectionHeader
            eyebrow="Admission by project fit"
            title="A small cohort. *A deliberate fit*."
            lede="We review the process, the executive’s role and the employer’s support before offering a place. The starting tuition is C$10,000 per participant, plus applicable tax."
          />
          <div>
            <ul className="eai-criteria">
              {[
                'You own a recurring project or operating process.',
                'You can identify a meaningful, measurable improvement.',
                'An employer sponsor can approve the work and its scope.',
                'The organization can approve the tools and data required.',
                'You can protect the weekly working time and review the result.',
              ].map((s) => (
                <li key={s}>
                  <Check size={17} aria-hidden />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="s-body mt-6">
              HR can begin with an organizational need before nominees are
              known. Each nominated executive completes an individual
              application and project review.
            </p>
            <details className="eai-disclosure mt-6">
              <summary>How an application becomes a place</summary>
              <p>
                Begin a private application. Agree a bounded project and confirm
                employer sponsorship. Admissions reviews fit, availability and
                scope, then issues a documented offer. Dates, delivery allowance
                and commercial terms must be agreed before enrolment.
                Applications and employer enquiries do not reserve seats.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="s-section-tight eai-tinted" id="funding">
        <div className="s-container eai-split">
          <SectionHeader
            eyebrow="Optional employer funding support"
            title="Prepare the paperwork. *Keep the decision honest*."
            lede="Employers considering the Canada-Alberta Productivity Grant can request a preparation package. execom’s provider and course eligibility still need confirmation."
          />
          <div>
            <p className="s-body">
              CAPG may reimburse 50% of eligible training costs for an eligible
              existing employee, up to C$5,000. Owners, shareholders and
              employer board members are ineligible trainees. Privately funded
              applicants can still be considered.
            </p>
            <p className="s-body mt-5">
              The employer submits through the government’s portal. execom
              prepares supporting information and tracks what remains
              unresolved. Funding is not guaranteed and does not reduce the
              stated tuition.
            </p>
            <a
              href={practicum.grantSource}
              target="_blank"
              rel="noreferrer"
              className="s-link mt-6 inline-flex"
            >
              Read the official CAPG requirements <ArrowUpRight size={16} />
            </a>
            <p className="text-xs text-fog mt-3">
              Government guidance checked {practicum.grantReviewed}. Confirm
              current requirements before applying.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                className="s-btn s-btn-glass"
                href="/api/executive-ai/documents/program"
              >
                Download program brief
              </a>
              <a
                className="s-btn s-btn-glass"
                href="/api/executive-ai/documents/sponsor"
              >
                Download sponsor brief
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="s-section-tight s-container">
        <details className="eai-disclosure">
          <summary>Comparing executive AI programs</summary>
          <p>
            Queen’s AI for Leaders is a 4.5-day residential program in Kingston,
            listed at C$11,000 plus applicable tax, including accommodation and
            meals. It includes practical activities and business use cases. The
            execom practicum starts at C$10,000 plus applicable tax and centres
            on one employer-scoped project over ten weekly sessions in Alberta.
            These are different formats; price alone does not establish value or
            superior outcomes.
          </p>
          <p>
            <a
              href="https://smith.queensu.ca/executiveeducation/programs/ai-for-leaders.php"
              target="_blank"
              rel="noreferrer"
              className="s-link"
            >
              Queen’s official program details ↗
            </a>{' '}
            · Checked 6 October 2026.
          </p>
        </details>
      </section>

      <CtaBand
        title="Which process would you *bring*?"
        body="Start with the work. We’ll review the fit, the employer’s requirements and the available cohort before you make a commitment."
        primary={{
          label: 'Apply as an executive',
          href: '/executive-ai/apply',
        }}
        secondary={{
          label: 'Start for your organization',
          href: '/executive-ai/employers',
        }}
      />
    </>
  )
}
