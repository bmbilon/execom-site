import type { AdvisoryPageData } from "@/components/site/advisory/types"
import { SredComparison } from "@/components/site/sred/SredComparison"

export const sred: AdvisoryPageData = {
  href: "/sred",
  crumb: "SR&ED",
  hero: {
    eyebrow: "SR&ED",
    title: "SR&ED claims should not require *full-service consultants*.",
    lede: "Most of the work in a typical claim already happens inside the company. execom removes the expensive middle layer and keeps the parts that matter.",
    primary: { label: "Access the SR&ED portal", href: "/portal/login" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
  chapters: [
    {
      id: "middle-layer",
      nav: "The middle layer",
      title: "Most of the claim is work you already do.",
      summary:
        "The specialist layer is real, and smaller than the fee model suggests. Consultants became translators between product development and tax policy, and priced the whole claim that way.",
      blocks: [
        {
          kind: "cards",
          columns: 3,
          items: [
            { title: "Technological uncertainty", text: "A clear description of what was not known at the start of the work." },
            { title: "Systematic investigation", text: "Evidence of how the team tested, iterated, and learned." },
            { title: "Classified expenditures", text: "Project costs organized the way the claim requires." },
          ],
        },
        {
          kind: "detail",
          label: "Read the full argument",
          blocks: [
            {
              kind: "prose",
              paras: [
                "For decades, accessing Canada's SR&ED program has usually meant hiring specialized firms that charge a large percentage of the credit recovered. But in most claims, much of the underlying work is already being done internally. The specialist layer is real, just not nearly as large as the fee model suggests.",
                "That fee model persisted because preparing a compliant claim required translating technical work into the specific format the CRA expects to see: a clear description of technological uncertainty, evidence of systematic investigation, and properly classified project expenditures.",
                "Most engineering teams do not write in that format, which left consultants acting as translators between product development and tax policy, and charging accordingly.",
                "**execom removes the expensive middle layer.**",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "how-it-works",
      nav: "How it works",
      title: "Build the claim *yourself*, with a guide.",
      summary:
        "The portal walks founders and technical teams through the information a properly structured filing needs. Work that took weeks with a consulting firm takes a few hours.",
      blocks: [
        {
          kind: "steps",
          items: [
            { title: "Setup", text: "Open the claim year and confirm company details." },
            { title: "Projects", text: "Describe each project in the format CRA reviewers expect." },
            { title: "Costs", text: "Organize and classify expenditures as the claim is assembled." },
            { title: "Federal and provincial", text: "Credits calculated for both levels of the claim." },
            { title: "Review", text: "Checks run before export, with supporting documentation captured along the way." },
            { title: "Export", text: "Output the claim for filing." },
          ],
        },
        {
          kind: "detail",
          label: "How it works in practice",
          blocks: [
            {
              kind: "prose",
              paras: [
                "The execom platform allows founders and technical teams to construct their claims directly by guiding them through the information required to produce a properly structured filing.",
                "Projects are described in the format CRA reviewers expect, expenditures are organized as the claim is assembled, and supporting documentation is captured in a way that reduces the likelihood of review.",
                "The process that traditionally required weeks of back-and-forth with a consulting firm can instead be completed in a few hours by the people who actually performed the work.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "pricing",
      nav: "Pricing",
      tone: "feature",
      eyebrow: "Why companies choose execom",
      title: "execom charges *5%*.",
      summary:
        "Most SR&ED consultants charge between fifteen and thirty percent of the credit they help recover. The lower fee is structural: the system removes the manual consulting layer.",
      blocks: [
        { kind: "node", node: <SredComparison />, words: 60 },
        {
          kind: "detail",
          label: "Why the fee is lower",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Most SR&ED consultants charge between fifteen and thirty percent of the credit they help recover.",
                "**execom charges 5%.**",
                "The difference is not a temporary promotion or a different fee structure; it reflects the fact that the system was designed to remove the manual consulting layer that historically made SR&ED preparation slow and expensive.",
                "Companies still receive the same credit from the CRA, but keep far more of it.",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "who-its-for",
      nav: "Who it's for",
      title: "Built for teams that *do the work*.",
      summary:
        "Founder-led and technical teams that understand their own work better than anyone else, and prefer straightforward tools to elaborate consulting processes.",
      blocks: [
        {
          kind: "quote",
          text: "Prepare SR&ED claims quickly, structure them correctly, and keep the overwhelming majority of the credit you earn.",
        },
        {
          kind: "detail",
          label: "Read more",
          blocks: [
            {
              kind: "prose",
              paras: [
                "Some organizations will always prefer the traditional consulting model, particularly large companies that already maintain advisory relationships with accounting firms and external specialists.",
                "execom is designed for a different group: companies capable of doing things themselves, discerning enough to recognize value when they see it, and uninterested in wasting time or money on layers of unnecessary intermediaries.",
                "These are typically founder-led teams and technical organizations that understand their own work better than anyone else and prefer straightforward tools over elaborate consulting processes.",
              ],
            },
          ],
        },
      ],
    },
  ],
  closing: {
    title: "Keep the credit *you earn*.",
    body: "In most claims, only a small portion of the process actually requires specialist input. Prepare yours in the portal for 5%.",
    primary: { label: "Access the SR&ED portal", href: "/portal/login" },
    secondary: { label: "Talk with execom", href: "/engage" },
  },
}
