import type { AdvisoryPageData } from "@/components/site/advisory/types"
import { FounderCard } from "@/components/site/about/FounderCard"

export const about: AdvisoryPageData = {
  href: "/about",
  crumb: "About",
  hero: {
    eyebrow: "About execom",
    title: "Structure. Ownership. Capital. *Risk*.",
    lede: "execom exists to help founders make the structural decisions that shape a company's trajectory, before the cost of getting them wrong compounds.",
    primary: { label: "Engage execom", href: "/engage" },
    secondary: { label: "Meet the founder", href: "#founder" },
    takeaways: [
      "Viable companies still fail when capital, ownership, and expansion decisions are made **too early or under the wrong incentives**.",
      "execom makes those decisions deliberate and moves routine execution into **portal-based workflows**.",
      "Founders work with execom directly. No committees, cohorts, or intermediaries.",
    ],
  },
  chapters: [
    {
      id: "why-execom-exists",
      nav: "Why it exists",
      eyebrow: "Why execom exists",
      title: "Viable companies still fail.",
      summary:
        "Once a company has a real idea or early traction, the failures come from structure rather than product.",
      blocks: [
        {
          kind: "list",
          numbered: true,
          items: [
            "Ownership diluted prematurely",
            "Capital raised before the business has negotiating power",
            "Expansion and distribution pursued before the operating foundation can support them",
          ],
        },
        {
          kind: "detail",
          label: "Read the full argument",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Most startups fail because they never reach product-market fit. No structure, capital strategy, or advisory support can solve a product nobody wants. The more interesting problem appears once a company actually has a viable idea or early traction: many of those companies still fail.",
                "They fail because the structural decisions surrounding capital, ownership, and expansion were made too early, under the wrong incentives, or without enough leverage. A viable company can still produce a poor outcome if ownership is diluted prematurely, if capital is raised before the business has negotiating power, or if expansion and distribution are pursued before the operating foundation is strong enough to support them.",
                "**execom exists to help founders make those structural decisions deliberately, and to remove much of the friction that normally surrounds them.** Through structured workflows and portal-based execution, founders can move faster on company formation, filings, documentation, capital preparation, and programs such as SR&ED without the cost and delay that typically accompany traditional professional intermediaries.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "the-pattern",
      nav: "The pattern",
      title: "The same mistakes, across companies and sectors.",
      summary:
        "Raising early, accepting weak terms, chasing grants, expanding before distribution is in place. The surrounding ecosystem often rewards all four.",
      blocks: [
        {
          kind: "quote",
          text: "Consultants are paid for applications and intermediaries are paid when capital changes hands. For founders, the cost of those decisions compounds over years.",
        },
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Across companies and sectors, the same mistakes appear repeatedly. Founders raise capital earlier than necessary, accept terms that weaken their position, pursue grants that distract from building the business itself, or expand into new markets before distribution and operational leverage are established.",
                "None of these errors are unusual. In many cases they are encouraged by the incentives of the surrounding ecosystem, where consultants are paid for applications and intermediaries are paid when capital changes hands. For founders, however, the cost of those decisions compounds over years.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "what-repetition-teaches",
      nav: "Repetition",
      eyebrow: "What repetition teaches",
      title: "Patterns only show up across *many companies*.",
      summary:
        "Some attractive opportunities weaken a company over time. Some urgent decisions turn out to be unnecessary. The difference lies in timing, structure, and incentives.",
      blocks: [
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "When a founder builds a single company, every major decision feels unprecedented. Seen across many companies, however, patterns emerge. Some opportunities that appear attractive weaken a company's position over time, while some decisions that feel urgent turn out to be unnecessary.",
                "Sometimes raising capital is the right step. Often the stronger move is delaying it until the business has achieved the leverage necessary to dictate better terms. The difference rarely lies in the idea itself; it lies in timing, structure, and incentives.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "canada-factor",
      nav: "The Canada factor",
      eyebrow: "Signature section",
      tone: "feature",
      title: "The *Canada* factor.",
      summary:
        "Smaller venture pools, slower fundraising, and less immediate domestic scale. Companies here operate longer before institutional capital arrives.",
      blocks: [
        {
          kind: "quote",
          text: "execom helps founders design strategies that reflect these realities rather than assumptions borrowed from larger venture ecosystems.",
        },
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Building companies in Canada introduces a set of structural realities that are frequently underestimated. Venture capital pools are smaller, fundraising cycles are slower, and domestic markets offer less immediate scale. Companies therefore operate longer before institutional capital becomes available.",
                "In this environment, capital efficiency, ownership discipline, and the intelligent use of programs such as SR&ED often matter more than headline fundraising milestones.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "how-execom-works",
      nav: "How it works",
      eyebrow: "How execom works",
      title: "Execution infrastructure, working *directly with founders*.",
      summary:
        "The work focuses on the structural decisions that shape a company's trajectory. The routine parts run through portal workflows built for speed and clarity.",
      blocks: [
        {
          kind: "cards",
          columns: 2,
          items: [
            { title: "Capital", text: "How capital is sequenced." },
            { title: "Ownership", text: "How ownership is preserved." },
            { title: "Markets", text: "How markets are entered." },
            { title: "Distribution", text: "How distribution is built to compound leverage over time." },
          ],
        },
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "execom does not operate as a capital broker, a grant-writing service, or a conventional consulting firm. The work focuses on the structural decisions that shape a company's trajectory, how capital is sequenced, how ownership is preserved, how markets are entered, and how distribution is built in a way that compounds leverage over time.",
                "Much of that work is executed through structured systems rather than ad-hoc advisory. Portal-based workflows allow founders to complete company formation, filings, documentation, and funding preparation in a format designed for speed and clarity rather than traditional professional friction.",
                "**Because those decisions ultimately belong to founders, execom works directly with them rather than through committees, cohorts, or intermediaries. execom is not an accelerator or incubator. It is execution infrastructure.** [Most founders do not need a program, they need faster execution](/accelerators-incubators).",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "founder",
      nav: "Founder",
      eyebrow: "Founder & CEO",
      title: "Lessons that were *expensive to learn*.",
      summary:
        "His work across product development, technical R&D, and company building led to one consistent observation: promising companies are frequently undermined by avoidable structural mistakes.",
      blocks: [
        { kind: "node", node: <FounderCard />, words: 70 },
        {
          kind: "detail",
          label: "Read the full bio",
          blocks: [
            {
              kind: "prose",
              paras: [
                "execom was founded by Brett Bilon, whose work across product development, technical R&D, and company building led to a consistent observation: promising companies are frequently undermined not by product failure but by avoidable structural mistakes in capital formation, market expansion, and distribution strategy.",
                "Brett has founded and scaled ventures across consumer products, beauty and personal care, digital technology, health and wellness, nanotech, and outdoor recreation. The range is deliberate. Every industry teaches a different version of the same structural problems.",
                "He built and launched Plume, a global beauty brand carried by Nordstrom, Sephora, Anthropologie, REVOLVE, and Loblaws. He raised capital across the full spectrum, from consumer crowdfunding to institutional debt, and navigated the regulatory, IP, and distribution complexity that comes with scaling a physical product internationally.",
                "Before execom, Brett spent time in enterprise sales and strategic partnerships at Lexmark, Iron Mountain, and DATA Communications Management. He also founded BMB Photographics, a luxury architectural photography firm whose work appeared in Architectural Digest.",
                "He holds a Bachelor of Commerce in Entrepreneurship and Innovation from the Haskayne School of Business at the University of Calgary.",
                "**Most of what execom understands about those mistakes was expensive to learn. The purpose of the firm is to transfer that pattern recognition to founders before those costs compound.**",
              ],
            },
          ],
        },
      ],
    },
  ],
  closing: {
    title: "Establish leverage early, and *retain it*.",
    body: "When capital, distribution, and growth are structured carefully and early, founders preserve ownership and strategic freedom. When they are not, the consequences follow the company for years.",
    primary: { label: "Engage execom", href: "/engage" },
    secondary: { label: "Explore SR&ED", href: "/sred" },
  },
}
